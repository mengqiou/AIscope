from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


EventType = Literal["funding", "launch", "hire", "partnership", "acquisition"]


class EventEntityRef(BaseModel):
    name: str
    type: Literal["company", "person", "product", "investor"]
    role: str | None = None


class EventAttributes(BaseModel):
    amount_usd: float | None = None
    round: str | None = None
    role: str | None = None
    product_name: str | None = None
    summary: str | None = None


class ExtractedEvent(BaseModel):
    type: EventType
    occurred_at: datetime | None = None
    entities: list[EventEntityRef] = Field(default_factory=list)
    attributes: EventAttributes = Field(default_factory=EventAttributes)
    confidence: float | None = None
    source_urls: list[str] = Field(default_factory=list)
    evidence_quotes: list[str] = Field(default_factory=list)


class ExtractionResult(BaseModel):
    events: list[ExtractedEvent] = Field(default_factory=list)

