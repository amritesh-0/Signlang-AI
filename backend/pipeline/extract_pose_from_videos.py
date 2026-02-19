import argparse
import json
import math
import os
from pathlib import Path
from typing import Dict, List, Tuple, Optional

import cv2
import numpy as np
import mediapipe as mp


MIXAMO_BONES = {
    "head": "mixamorigHead",
    "neck": "mixamorigNeck",
    "spine": "mixamorigSpine",
    "r_shoulder": "mixamorigRightShoulder",
    "r_arm": "mixamorigRightArm",
    "r_forearm": "mixamorigRightForeArm",
    "r_hand": "mixamorigRightHand",
    "l_shoulder": "mixamorigLeftShoulder",
    "l_arm": "mixamorigLeftArm",
    "l_forearm": "mixamorigLeftForeArm",
    "l_hand": "mixamorigLeftHand",
}


def load_missing_ids(missing_path: Optional[Path]) -> set:
    if not missing_path or not missing_path.exists():
        return set()
    missing = set()
    with missing_path.open() as f:
        for line in f:
            line = line.strip()
            if line:
                missing.add(line)
    return missing


def load_wlasl_gloss_video_pairs(
    wlasl_path: Path,
    videos_dir: Path,
    missing_path: Optional[Path],
    limit: int,
    exclude_glosses: Optional[set] = None,
) -> List[Tuple[str, Path]]:
    missing = load_missing_ids(missing_path)
    exclude_glosses = exclude_glosses or set()
    with wlasl_path.open() as f:
        data = json.load(f)

    pairs: List[Tuple[str, Path]] = []
    for entry in data:
        gloss = entry.get("gloss")
        if not gloss:
            continue
        gloss_upper = gloss.upper()
        if gloss_upper in exclude_glosses:
            continue
        for inst in entry.get("instances", []):
            video_id = str(inst.get("video_id")).zfill(5)
            if video_id in missing:
                continue
            video_path = videos_dir / f"{video_id}.mp4"
            if video_path.exists():
                pairs.append((gloss_upper, video_path))
                break
        if limit and len(pairs) >= limit:
            break
    return pairs


def _vec(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    v = b - a
    n = np.linalg.norm(v)
    if n < 1e-6:
        return np.zeros(3)
    return v / n


def _quat_from_to(v_from: np.ndarray, v_to: np.ndarray) -> np.ndarray:
    v_from = v_from / (np.linalg.norm(v_from) + 1e-9)
    v_to = v_to / (np.linalg.norm(v_to) + 1e-9)
    dot = np.clip(np.dot(v_from, v_to), -1.0, 1.0)
    if dot > 0.9999:
        return np.array([0.0, 0.0, 0.0, 1.0])
    if dot < -0.9999:
        axis = np.cross(v_from, np.array([1.0, 0.0, 0.0]))
        if np.linalg.norm(axis) < 1e-6:
            axis = np.cross(v_from, np.array([0.0, 1.0, 0.0]))
        axis = axis / (np.linalg.norm(axis) + 1e-9)
        return np.array([axis[0], axis[1], axis[2], 0.0])
    axis = np.cross(v_from, v_to)
    s = math.sqrt((1.0 + dot) * 2.0)
    invs = 1.0 / s
    return np.array([axis[0] * invs, axis[1] * invs, axis[2] * invs, s * 0.5])


def _quat_to_euler(q: np.ndarray) -> List[float]:
    x, y, z, w = q
    t0 = +2.0 * (w * x + y * z)
    t1 = +1.0 - 2.0 * (x * x + y * y)
    roll_x = math.atan2(t0, t1)
    t2 = +2.0 * (w * y - z * x)
    t2 = 1.0 if t2 > 1.0 else t2
    t2 = -1.0 if t2 < -1.0 else t2
    pitch_y = math.asin(t2)
    t3 = +2.0 * (w * z + x * y)
    t4 = +1.0 - 2.0 * (y * y + z * z)
    yaw_z = math.atan2(t3, t4)
    return [roll_x, pitch_y, yaw_z]


def _landmark_to_vec(landmarks, idx) -> np.ndarray:
    lm = landmarks[idx]
    return np.array([lm.x, lm.y, lm.z], dtype=np.float32)


def extract_pose_sequence(video_path: Path, max_frames: int = 300) -> List[Dict]:
    mp_holistic = mp.solutions.holistic
    cap = cv2.VideoCapture(str(video_path))
    frames = []
    with mp_holistic.Holistic(
        static_image_mode=False,
        model_complexity=1,
        smooth_landmarks=True,
        enable_segmentation=False,
        refine_face_landmarks=False,
    ) as holistic:
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame_count += 1
            if max_frames and frame_count > max_frames:
                break
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = holistic.process(image)

            if results.pose_landmarks is None:
                continue
            lm = results.pose_landmarks.landmark

            # MediaPipe pose landmark indices
            left_shoulder = _landmark_to_vec(lm, 11)
            right_shoulder = _landmark_to_vec(lm, 12)
            left_elbow = _landmark_to_vec(lm, 13)
            right_elbow = _landmark_to_vec(lm, 14)
            left_wrist = _landmark_to_vec(lm, 15)
            right_wrist = _landmark_to_vec(lm, 16)
            left_hip = _landmark_to_vec(lm, 23)
            right_hip = _landmark_to_vec(lm, 24)
            nose = _landmark_to_vec(lm, 0)

            spine_mid = (left_hip + right_hip) * 0.5
            shoulder_mid = (left_shoulder + right_shoulder) * 0.5

            # Base axes assumptions for Mixamo T-pose
            left_arm_base = np.array([-1.0, 0.0, 0.0])
            right_arm_base = np.array([1.0, 0.0, 0.0])
            forearm_base = np.array([1.0, 0.0, 0.0])

            l_arm_dir = _vec(left_shoulder, left_elbow)
            r_arm_dir = _vec(right_shoulder, right_elbow)
            l_fore_dir = _vec(left_elbow, left_wrist)
            r_fore_dir = _vec(right_elbow, right_wrist)

            q_l_arm = _quat_from_to(left_arm_base, l_arm_dir)
            q_r_arm = _quat_from_to(right_arm_base, r_arm_dir)
            q_l_fore = _quat_from_to(forearm_base, l_fore_dir)
            q_r_fore = _quat_from_to(forearm_base, r_fore_dir)

            spine_dir = _vec(spine_mid, shoulder_mid)
            q_spine = _quat_from_to(np.array([0.0, 1.0, 0.0]), spine_dir)
            neck_dir = _vec(shoulder_mid, nose)
            q_head = _quat_from_to(np.array([0.0, 1.0, 0.0]), neck_dir)

            bones = {
                MIXAMO_BONES["l_arm"]: _quat_to_euler(q_l_arm),
                MIXAMO_BONES["r_arm"]: _quat_to_euler(q_r_arm),
                MIXAMO_BONES["l_forearm"]: _quat_to_euler(q_l_fore),
                MIXAMO_BONES["r_forearm"]: _quat_to_euler(q_r_fore),
                MIXAMO_BONES["spine"]: _quat_to_euler(q_spine),
                MIXAMO_BONES["head"]: _quat_to_euler(q_head),
            }
            frames.append({"bones": bones, "face": {"head_pitch": 0.0}})
    cap.release()
    return frames


def build_pose_cache(
    wlasl_path: Path,
    videos_dir: Path,
    output_path: Path,
    missing_path: Optional[Path],
    limit: int,
    max_frames: int,
    append: bool,
) -> Dict[str, List[Dict]]:
    cache: Dict[str, List[Dict]] = {}
    if append and output_path.exists():
        with output_path.open() as f:
            existing = json.load(f)
            if isinstance(existing, dict):
                cache.update({k.upper(): v for k, v in existing.items() if isinstance(v, list)})

    pairs = load_wlasl_gloss_video_pairs(
        wlasl_path,
        videos_dir,
        missing_path,
        limit,
        exclude_glosses=set(cache.keys()),
    )
    for gloss, video_path in pairs:
        seq = extract_pose_sequence(video_path, max_frames=max_frames)
        if seq:
            cache[gloss] = seq
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w") as f:
        json.dump(cache, f)
    return cache


def main():
    parser = argparse.ArgumentParser(description="Extract pose sequences from sign videos.")
    parser.add_argument("--wlasl", default="backend/dataset/WLASL_v0.3.json")
    parser.add_argument("--videos", default="backend/dataset/videos")
    parser.add_argument("--missing", default="backend/dataset/missing.txt")
    parser.add_argument("--output", default="backend/dataset/pose_cache.json")
    parser.add_argument("--limit", type=int, default=100, help="Number of NEW glosses to extract.")
    parser.add_argument("--max-frames", type=int, default=300)
    parser.add_argument("--append", action="store_true", help="Append to existing cache and skip known glosses.")
    args = parser.parse_args()

    build_pose_cache(
        wlasl_path=Path(args.wlasl),
        videos_dir=Path(args.videos),
        output_path=Path(args.output),
        missing_path=Path(args.missing),
        limit=args.limit,
        max_frames=args.max_frames,
        append=args.append,
    )


if __name__ == "__main__":
    main()
