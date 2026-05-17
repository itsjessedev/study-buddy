"""Current course catalog helpers."""

import json
from functools import lru_cache
from pathlib import Path
from typing import List, Set


@lru_cache
def get_current_course_slugs() -> Set[str]:
    """Return the course slugs currently exposed by content/skills.json."""
    return set(get_current_course_order())


@lru_cache
def get_current_course_order() -> List[str]:
    """Return current course slugs in the intended learning order."""
    skills_file = Path(__file__).resolve().parents[2] / "content" / "skills.json"
    with open(skills_file, "r") as f:
        data = json.load(f)
    return [skill["slug"] for skill in data["skills"]]
