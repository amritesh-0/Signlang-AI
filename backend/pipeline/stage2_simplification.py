from transformers import pipeline
import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

# Configuration
# Using google/flan-t5-small for better instruction following capabilities 
# compared to vanilla t5-small, while maintaining speed.
MODEL_NAME = "google/flan-t5-small"

# Initialize the summarization pipeline globally
try:
    logger.info(f"Loading simplification model: {MODEL_NAME}...")
    # 'text2text-generation' is often more flexible for T5, but 'summarization' pipeline works well too.
    # explicit instantiation ensures we get the right behavior.
    summarizer = pipeline("summarization", model=MODEL_NAME)
    logger.info("Simplification model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load simplification model: {e}")
    summarizer = None

def simplify_text(text: str) -> str:
    """
    Simplifies complex text into shorter, sign-friendly sentences.
    Input: Complex text string
    Output: Simplified text string
    """
    if not text or not text.strip():
        return ""
    
    if not summarizer:
        logger.warning("Summarizer model not loaded, returning original text.")
        return text 
        
    try:
        # T5-style prefixing is good practice, though FLAN handles prompts well.
        input_text = "simplify: " + text
        
        # Adjust max_length dynamically
        input_len = len(input_text.split())
        # Heuristics for summary length
        max_len = max(10, int(input_len * 0.7)) 
        min_len = max(3, int(input_len * 0.2))
        
        summary = summarizer(
            input_text, 
            max_new_tokens=max_len, 
            min_new_tokens=min_len, 
            do_sample=False,
            truncation=True
        )
        return summary[0]['summary_text']
        
    except Exception as e:
        logger.error(f"Error simplifying text: {e}")
        return text

def process_stage2(stage1_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process extracted content from Stage 1.
    Input: Output from stage1_processing (Dict with 'chapters')
    Output: Dict with 'simplified_chapters'
    """
    simplified_chapters = []
    
    logger.info(f"Processing Stage 2 for file: {stage1_data.get('filename', 'unknown')}")
    
    for chapter in stage1_data.get("chapters", []):
        simplified_chapter = {
            "title": chapter.get("title", "Untitled"),
            "original_text": chapter.get("raw_text", ""),
            "simplified_paragraphs": []
        }

        # Process individual paragraphs if available (preferred)
        if "paragraphs" in chapter and chapter["paragraphs"]:
            for p in chapter["paragraphs"]:
                # specific filter to avoid simplifying very short snippets multiple times
                if len(p.split()) > 5:
                    simple_p = simplify_text(p)
                    simplified_chapter["simplified_paragraphs"].append(simple_p)
                else:
                    simplified_chapter["simplified_paragraphs"].append(p)
        else:
            # Fallback if no paragraph structure
            full_text = chapter.get("raw_text", "")
            simple_text = simplify_text(full_text)
            simplified_chapter["simplified_paragraphs"].append(simple_text)

        # Create a joined simplified text for convenience
        simplified_chapter["simplified_text"] = "\n".join(simplified_chapter["simplified_paragraphs"])
        simplified_chapters.append(simplified_chapter)
        
    return {"simplified_chapters": simplified_chapters}
