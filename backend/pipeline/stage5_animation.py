import logging
import os
import json
import uuid
import numpy as np
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

class NumpyEncoder(json.JSONEncoder):
    """Custom encoder for numpy data types."""
    def default(self, obj):
        if isinstance(obj, (np.integer, np.floating, int, float)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NumpyEncoder, self).default(obj)

def save_animation_json(pose_data: List[Dict], output_path: str, fps: int = 30):
    """
    Saves the pose data sequence to a standardized JSON animation file.
    """
    animation_structure = {
        "metadata": {
            "version": "1.0",
            "fps": fps,
            "total_frames": len(pose_data),
            "generated_at": str(uuid.uuid4()) # Traceability
        },
        "timeline": pose_data
    }
    
    with open(output_path, 'w') as f:
        json.dump(animation_structure, f, indent=2, cls=NumpyEncoder)
    
    return output_path

def process_stage5(pose_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process Pose content from Stage 4 and finalize into Animation artifacts.
    """
    # Ensure outputs directory exists
    output_dir = "outputs"
    os.makedirs(output_dir, exist_ok=True)
    
    video_chapters = []
    
    logger.info("Processing Stage 5: Finalizing Animation Files...")
    
    for i, chapter in enumerate(pose_data.get("pose_chapters", [])):
        title = chapter.get("title", "unknown").replace(" ", "_").lower()
        sentences_poses = chapter.get("sentences_poses", [])
        
        # Flatten all sentence poses into one continuous chapter animation
        chapter_timeline = []
        current_frame_idx = 0
        
        for sentence_block in sentences_poses:
            sentence_frames = sentence_block.get("pose_data", [])
            
            # Re-index frames to ensure continuity across the chapter
            for frame in sentence_frames:
                # Create a fresh copy to avoid mutating the original reference if needed
                new_frame = frame.copy()
                new_frame["frame_idx"] = current_frame_idx
                chapter_timeline.append(new_frame)
                current_frame_idx += 1
        
        # Generate unique filename
        unique_id = uuid.uuid4().hex[:8]
        filename = f"{output_dir}/chapter_{i}_{title}_{unique_id}.json"
        
        # Save the file
        save_animation_json(chapter_timeline, filename)
        
        logger.info(f"Saved animation chapter to {filename}")
        
        video_chapters.append({
            "chapter_title": chapter.get("title", "Untitled"),
            "video_url": f"/outputs/{os.path.basename(filename)}", # Virtual path for API
            "duration_seconds": len(chapter_timeline) / 30.0, # Assuming 30 FPS
            "status": "ready"
        })
        
    # Calculate total duration
    total_duration = sum(ch["duration_seconds"] for ch in video_chapters)
        
    return {
        "video_chapters": video_chapters,
        "metadata": {
            "total_duration_seconds": total_duration,
            "total_chapters": len(video_chapters)
        }
    }
