from __future__ import annotations

from datetime import datetime, timedelta
from textwrap import dedent

from sqlalchemy import and_

from backend.db.base import SessionLocal
from backend.llm.bedrock_client import BedrockClient
from backend.models.briefings import Briefing
from backend.models.events import Event


SUMMARY_PROMPT_TEMPLATE = dedent(
    """
    You are generating a concise daily briefing about developments in the AI startup ecosystem.

    Given the following structured events, write 5-10 bullet points in Markdown.
    Each bullet should:
      - Describe what happened.
      - Explain briefly why it matters in system-level terms (trajectory, strategy, ecosystem impact).
      - Mention the companies involved.

    EVENTS (JSON):
    {events_json}
    """
)


def generate_daily_briefing(hours: int = 24) -> Briefing | None:
    session = SessionLocal()
    try:
        window_end = datetime.utcnow()
        window_start = window_end - timedelta(hours=hours)

        # Select events recorded in the given time window.
        # We do not rely on any mutable status field; the briefing is a
        # derived view over the immutable event ledger.
        events = (
            session.query(Event)
            .filter(
                and_(
                    Event.recorded_at >= window_start,
                    Event.recorded_at <= window_end,
                )
            )
            .all()
        )
        if not events:
            return None

        serializable_events = [
            {
                "id": ev.id,
                "type": ev.type,
                "occurred_at": ev.occurred_at.isoformat() if ev.occurred_at else None,
                "attributes": ev.attributes,
                "confidence": ev.confidence,
            }
            for ev in events
        ]

        import json

        prompt = SUMMARY_PROMPT_TEMPLATE.format(
            events_json=json.dumps(serializable_events, indent=2)
        )

        client = BedrockClient()
        raw_json = client.invoke_json(prompt, max_tokens=1024)

        content_markdown = raw_json.get("briefing_markdown")
        if not content_markdown and "text" in raw_json:
            content_markdown = raw_json["text"]
        if not content_markdown:
            # As a fallback, treat the entire JSON as a string
            content_markdown = json.dumps(raw_json, indent=2)

        briefing = Briefing(
            generated_at=window_end,
            time_window_start=window_start,
            time_window_end=window_end,
            content_markdown=content_markdown,
            raw_model_output=json.dumps(raw_json),
        )
        session.add(briefing)
        session.commit()
        session.refresh(briefing)
        return briefing
    finally:
        session.close()

