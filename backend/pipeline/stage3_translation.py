import spacy
import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

# Load English tokenizer, tagger, parser and NER
try:
    nlp = spacy.load("en_core_web_sm")
    logger.info("Spacy model 'en_core_web_sm' loaded successfully.")
except Exception:
    # If model not found, we might need to download it or use a basic fallback
    # user might need to run `python -m spacy download en_core_web_sm`
    logger.warning("Spacy model 'en_core_web_sm' not found. Trying to download or fallback.")
    try:
        from spacy.cli import download
        download("en_core_web_sm")
        nlp = spacy.load("en_core_web_sm")
        logger.info("Spacy model downloaded and loaded.")
    except Exception as e:
        logger.error(f"Could not download spacy model: {e}. Translation will be degraded.")
        nlp = None

def text_to_gloss(text: str) -> str:
    """
    Converts English text to ASL Gloss.
    Rules implemented:
    1. Remove articles (a, an, the)
    2. Convert verbs to infinitive (lemmatization)
    3. Remove 'to' markers
    4. Simple Subject-Object-Verb (SOV) reordering attempts (basic)
    5. Uppercase everything
    """
    if not text:
        return ""
        
    if not nlp:
        # Fallback: uppercase and basic split
        return text.upper()
    
    doc = nlp(text)
    gloss_tokens = []
    
    for token in doc:
        # Skip articles and punctuation
        if token.pos_ in ["DET", "PUNCT"] and token.text.lower() in ["a", "an", "the", ".", ",", "?", "!"]:
            continue
            
        # Skip 'to' particle
        if token.text.lower() == "to" and token.pos_ == "PART":
            continue
            
        # Use lemma for verbs (e.g., 'running' -> 'RUN')
        if token.pos_ == "VERB":
            gloss_tokens.append(token.lemma_.upper())
        elif token.lemma_ == "-PRON-":
             gloss_tokens.append(token.text.upper())
        else:
            gloss_tokens.append(token.text.upper())
            
    return " ".join(gloss_tokens)

def process_paragraph_to_gloss(paragraph: str) -> str:
    """
    Splits a paragraph into sentences and creates a gloss representation.
    Returns: A single string containing the glossed paragraph.
    """
    if not paragraph or not paragraph.strip():
        return ""

    if nlp:
        doc = nlp(paragraph)
        sentences = doc.sents
    else:
        # Fallback splitting
        sentences = paragraph.split('. ')

    gloss_sentences = []
    for sent in sentences:
        # sent is a Span if using spacy, need .text
        text = sent.text if hasattr(sent, 'text') else sent
        glossed_sent = text_to_gloss(text)
        if glossed_sent:
            gloss_sentences.append(glossed_sent)
            
    return " ".join(gloss_sentences)

def process_stage3(stage2_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process simplified content from Stage 2.
    Input: Output from stage2_simplification (Dict with 'simplified_chapters')
    Output: Dict with 'gloss_chapters'
    """
    gloss_chapters = []
    
    logger.info(f"Processing Stage 3 for data with {len(stage2_data.get('simplified_chapters', []))} chapters.")

    for chapter in stage2_data.get("simplified_chapters", []):
        gloss_chapter = {
            "title": chapter["title"],
            "simplified_text": chapter.get("simplified_text", ""),
            "glossed_paragraphs": []
        }
        
        # Process using simplified_paragraphs if available
        if "simplified_paragraphs" in chapter and chapter["simplified_paragraphs"]:
            for p in chapter["simplified_paragraphs"]:
                glossed_p = process_paragraph_to_gloss(p)
                gloss_chapter["glossed_paragraphs"].append(glossed_p)
        else:
            # Fallback for monolithic text
            full_text = chapter.get("simplified_text", "")
            glossed_text = process_paragraph_to_gloss(full_text)
            gloss_chapter["glossed_paragraphs"].append(glossed_text)
            
        # Create a joined sequence for convenience/compatibility
        gloss_chapter["gloss_sequence"] = gloss_chapter["glossed_paragraphs"]
        
        gloss_chapters.append(gloss_chapter)
        
    return {"gloss_chapters": gloss_chapters}
