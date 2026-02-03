from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.pipeline import (
    stage1_processing,
    stage2_simplification,
    stage3_translation,
    stage4_pose_gen,
    stage5_animation
)

router = APIRouter()

@router.post("/process/stage1")
async def process_document(file: UploadFile = File(...)):
    """Stage 1: Document Processing Only."""
    try:
        result = await stage1_processing.process_file(file)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process/full")
async def process_pipeline(file: UploadFile = File(...)):
    """
    Full End-to-End Pipeline:
    Doc -> Text -> Simplified -> Gloss -> Pose -> Animation Metadata
    """
    try:
        # Stage 1
        s1_result = await stage1_processing.process_file(file)
        
        # Stage 2
        s2_result = stage2_simplification.process_stage2(s1_result)
        
        # Stage 3
        s3_result = stage3_translation.process_stage3(s2_result)
        
        # Stage 4
        s4_result = stage4_pose_gen.process_stage4(s3_result)
        
        # Stage 5
        s5_result = stage5_animation.process_stage5(s4_result)
        
        return {
            "status": "success",
            "pipeline_summary": {
                "original_filename": file.filename,
                "stages_completed": ["processing", "simplification", "translation", "pose_gen", "animation"],
                "final_output": s5_result
            },
            "debug_data": {
                "stage1_extract": s1_result,
                "stage2_simple": s2_result,
                "stage3_gloss": s3_result
                # omitting stage 4 huge pose data
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
