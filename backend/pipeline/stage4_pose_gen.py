import logging
import random
import numpy as np
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class SkeletalPoseGenerator:
    """
    Generates Bone Rotations (Euler Radians) for Mixamo-based rigs.
    """
    def __init__(self):
        # Bone names matching Mixamo standard
        self.bone_names = {
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
            "l_hand": "mixamorigLeftHand"
        }
        self.pose_dictionary = self._load_mock_dictionary()
        
    def _load_mock_dictionary(self) -> Dict[str, List[Dict[str, Any]]]:
        return {
            "HELLO": self._generate_wave_sequence(),
            "WORLD": self._generate_circle_sequence(),
            "NAME": self._generate_neutral_sequence(15), # Placeholder
            "IS": self._generate_neutral_sequence(10)
        }

    def _get_base_pose(self) -> Dict[str, List[float]]:
        """Returns the 'Neutral' Sign Language pose (Arms down, hands forward)."""
        return {
            self.bone_names["r_arm"]: [0, 0, -1.2], # Drop right arm
            self.bone_names["l_arm"]: [0, 0, 1.2],  # Drop left arm
            self.bone_names["r_forearm"]: [0, 0.8, 0], # Bring right hand forward
            self.bone_names["l_forearm"]: [0, -0.8, 0], # Bring left hand forward
            self.bone_names["r_hand"]: [0, 0, 0],
            self.bone_names["l_hand"]: [0, 0, 0],
            self.bone_names["spine"]: [0.1, 0, 0] # Slight forward lean
        }

    def _generate_neutral_sequence(self, length: int) -> List[Dict[str, Any]]:
        frames = []
        base = self._get_base_pose()
        for _ in range(length):
            frames.append({
                "bones": base,
                "face": {"head_pitch": 0}
            })
        return frames

    def _generate_wave_sequence(self) -> List[Dict[str, Any]]:
        """Generates rotations for a 'Hello' wave while keeping the left hand neutral."""
        frames = []
        base = self._get_base_pose()
        for i in range(25):
            # Oscillate the forearm and hand for a wave
            wave_angle = 0.5 * np.sin(i * 0.4)
            current_bones = base.copy()
            current_bones.update({
                self.bone_names["r_arm"]: [0.2, 0, -1.3], # Raised slightly more
                self.bone_names["r_forearm"]: [0, 1.2 + wave_angle, 0],
                self.bone_names["r_hand"]: [0, 0, wave_angle * 0.4],
                self.bone_names["head"]: [0, wave_angle * 0.1, 0] 
            })
            frames.append({
                "bones": current_bones,
                "face": {"head_pitch": 0.05}
            })
        return frames

    def _generate_circle_sequence(self) -> List[Dict[str, Any]]:
        """Generates rotations for a 'World' circle motion using both hands."""
        frames = []
        base = self._get_base_pose()
        for i in range(30):
            theta = (i / 30) * 2 * np.pi
            current_bones = base.copy()
            # Move both hands in a synchronized circle
            current_bones.update({
                self.bone_names["r_arm"]: [0.3, 0.2 * np.cos(theta), -1.0],
                self.bone_names["l_arm"]: [0.3, -0.2 * np.cos(theta), 1.0],
                self.bone_names["r_forearm"]: [0, 1.0 + 0.3 * np.sin(theta), 0],
                self.bone_names["l_forearm"]: [0, -1.0 - 0.3 * np.sin(theta), 0],
            })
            frames.append({
                "bones": current_bones,
                "face": {"head_pitch": 0.1}
            })
        return frames

    def get_pose_for_gloss(self, gloss: str) -> List[Dict[str, Any]]:
        gloss = gloss.upper().strip()
        if gloss in self.pose_dictionary:
            return self.pose_dictionary[gloss]
        
        return self._generate_random_rotations(gloss)

    def _generate_random_rotations(self, text: str) -> List[Dict[str, Any]]:
        frames = []
        base = self._get_base_pose()
        for char in text:
            random.seed(ord(char))
            target_rot = [random.uniform(-0.3, 0.3) for _ in range(3)]
            for _ in range(10): 
                current_bones = base.copy()
                current_bones[self.bone_names["r_hand"]] = target_rot
                current_bones[self.bone_names["l_hand"]] = [-r for r in target_rot]
                frames.append({"bones": current_bones})
        return frames

    def interpolate_sequences(self, seq1: List[Dict], seq2: List[Dict], steps: int = 10) -> List[Dict]:
        """Interpolates bone rotations between sequences."""
        if not seq1 or not seq2: return []
        
        start_bones = seq1[-1].get("bones", {})
        end_bones = seq2[0].get("bones", {})
        
        transition_frames = []
        all_bone_keys = set(start_bones.keys()) | set(end_bones.keys())
        
        for i in range(1, steps + 1):
            alpha = i / (steps + 1)
            interp_bones = {}
            for bone in all_bone_keys:
                b1 = start_bones.get(bone, [0, 0, 0])
                b2 = end_bones.get(bone, [0, 0, 0])
                interp_bones[bone] = [
                    b1[0] * (1 - alpha) + b2[0] * alpha,
                    b1[1] * (1 - alpha) + b2[1] * alpha,
                    b1[2] * (1 - alpha) + b2[2] * alpha
                ]
            transition_frames.append({"bones": interp_bones, "type": "transition"})
            
        return transition_frames

# Singleton instance
generator = SkeletalPoseGenerator()

def process_stage4(gloss_data: Dict[str, Any]) -> Dict[str, Any]:
    pose_chapters = []
    logger.info("Processing Stage 4: Gloss to Skeletal Pose...")
    
    for chapter in gloss_data.get("gloss_chapters", []):
        chapter_title = chapter.get("title", "Untitled")
        gloss_paragraphs = chapter.get("glossed_paragraphs", [])
        
        chapter_poses = []
        for para_idx, gloss_paragraph in enumerate(gloss_paragraphs):
            words = gloss_paragraph.split()
            full_sequence = []
            
            for word in words:
                word_seq = generator.get_pose_for_gloss(word)
                if full_sequence:
                    transition = generator.interpolate_sequences(full_sequence, word_seq)
                    full_sequence.extend(transition)
                full_sequence.extend(word_seq)
            
            chapter_poses.append({
                "paragraph_index": para_idx,
                "original_gloss": gloss_paragraph,
                "pose_data": full_sequence
            })
            
        pose_chapters.append({
            "title": chapter_title,
            "sentences_poses": chapter_poses
        })
        
    return {"pose_chapters": pose_chapters}

