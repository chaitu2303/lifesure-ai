import os
import re
from typing import List, Optional, Dict, Any
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query
from app.schemas import (
    ChatMessageRequest,
    ChatMessageResponse,
    AdvisorItem,
    AvailableSlot,
)
from app.services.advisory_service import AdvisoryService

router = APIRouter(prefix="", tags=["Advisory & Education"])

# ---------------------------------------------------------------------------
# Glossary helpers – parse the authoritative docs/glossary.md into
# structured JSON so the frontend can surface contextual tooltips and
# education panels without shipping the raw Markdown file.
# ---------------------------------------------------------------------------

_GLOSSARY_CACHE: Optional[List[Dict[str, Any]]] = None


def _find_glossary_path() -> Optional[Path]:
    """Locate glossary.md in the Datasets directory."""
    candidates = [
        Path(__file__).resolve().parents[4] / "Datasets" / "B2_Life_Insurance_Needs_Finder" / "docs" / "glossary.md",
        Path(__file__).resolve().parents[3] / "Datasets" / "B2_Life_Insurance_Needs_Finder" / "docs" / "glossary.md",
        Path("E:/001191_B2/Datasets/B2_Life_Insurance_Needs_Finder/docs/glossary.md"),
        Path("E:/TalentAP/Datasets/B2_Life_Insurance_Needs_Finder/docs/glossary.md"),
    ]
    for p in candidates:
        if p.exists():
            return p
    return None


def _parse_glossary() -> List[Dict[str, Any]]:
    """
    Parse glossary.md into a list of term entries.
    Each entry: {term, definition, irdai_regulated, section, tags}
    """
    global _GLOSSARY_CACHE
    if _GLOSSARY_CACHE is not None:
        return _GLOSSARY_CACHE

    path = _find_glossary_path()
    if path is None:
        _GLOSSARY_CACHE = []
        return _GLOSSARY_CACHE

    content = path.read_text(encoding="utf-8", errors="replace")
    entries: List[Dict[str, Any]] = []
    current_section = "General"

    for line in content.splitlines():
        # Section heading
        if line.startswith("## "):
            current_section = line[3:].strip()
            continue

        # Glossary item lines: "- **Term:** definition text"
        m = re.match(r"^-\s+\*\*(.+?)\*\*[:\s]*(.*)", line)
        if not m:
            continue

        raw_term = m.group(1).strip()
        raw_def = m.group(2).strip()
        irdai = "[IRDAI]" in raw_def or "[IRDAI]" in raw_term
        # Clean markup
        term = re.sub(r"\[IRDAI\]\s*", "", raw_term).strip(" :")
        definition = re.sub(r"\*\*", "", raw_def).replace("[IRDAI]", "").strip()
        # Derive simple tags from section + term text
        tags = [current_section.lower().replace(" ", "_")]
        if irdai:
            tags.append("irdai_regulation")
        entries.append({
            "term": term,
            "definition": definition,
            "section": current_section,
            "irdai_regulated": irdai,
            "tags": tags,
        })

    _GLOSSARY_CACHE = entries
    return _GLOSSARY_CACHE

@router.post("/chat", response_model=ChatMessageResponse)
def handle_chat_message(req: ChatMessageRequest):
    """
    Educational AI Advisory Chatbot.
    Answers user questions on insurance categories, calculation logic, riders, and inflation.
    Strictly educational: does not fabricate rates, terms, or insurer guarantees.
    """
    response = AdvisoryService.answer_chat_query(req.message)
    return response

@router.get("/advisors", response_model=List[AdvisorItem])
def get_advisors(
    language: Optional[str] = Query(None, description="Filter by spoken language (e.g. Hindi, English, Tamil)"),
    specialisation: Optional[str] = Query(None, description="Filter by specialisation (e.g. term_protection, child_planning)"),
    consultation_mode: Optional[str] = Query(None, description="Filter by consultation mode (video, chat, phone)"),
    search: Optional[str] = Query(None, description="Search by advisor name, language, or specialty"),
):
    """
    List certified financial planners and protection advisors available for consultation
    from the 15 synthetic advisors in advisors.csv.
    """
    return AdvisoryService.get_advisors(
        language=language,
        specialisation=specialisation,
        consultation_mode=consultation_mode,
        search_query=search,
    )

@router.get("/advisors/{advisor_id}/slots", response_model=List[AvailableSlot])
def get_advisor_slots(advisor_id: str):
    """
    Retrieve available consultation appointment slots for a specific advisor from advisor_slots.csv.
    Past slots are automatically marked expired.
    """
    slots = AdvisoryService.get_available_slots(advisor_id)
    return slots


@router.get("/glossary", tags=["Advisory & Education"])
def get_glossary(
    section: Optional[str] = Query(None, description="Filter by section (e.g. 'Money words', 'Types of life insurance')"),
    search: Optional[str] = Query(None, description="Search term/definition text (case-insensitive)"),
    irdai_only: bool = Query(False, description="Return only IRDAI-regulated terms"),
):
    """
    Returns parsed glossary terms from the authoritative
    `Datasets/B2_Life_Insurance_Needs_Finder/docs/glossary.md`.

    Each entry exposes: term, definition, section, irdai_regulated, tags.
    Supports filtering by section, keyword search, and IRDAI-regulation flag.
    Used by the frontend Education Panel and Advisory Chatbot for contextual tooltips.
    """
    entries = _parse_glossary()
    if not entries:
        raise HTTPException(
            status_code=503,
            detail="Glossary not available — ensure Datasets/ directory is present."
        )

    if irdai_only:
        entries = [e for e in entries if e["irdai_regulated"]]
    if section:
        sec_lower = section.lower()
        entries = [e for e in entries if sec_lower in e["section"].lower()]
    if search:
        q = search.lower()
        entries = [
            e for e in entries
            if q in e["term"].lower() or q in e["definition"].lower()
        ]

    return {
        "total": len(entries),
        "source": "Datasets/B2_Life_Insurance_Needs_Finder/docs/glossary.md",
        "entries": entries,
    }


@router.get("/glossary/sections", tags=["Advisory & Education"])
def get_glossary_sections():
    """
    Returns the list of section names available in the glossary,
    for use as filter chips in the frontend Education Panel.
    """
    entries = _parse_glossary()
    seen = []
    for e in entries:
        if e["section"] not in seen:
            seen.append(e["section"])
    return {"sections": seen}
