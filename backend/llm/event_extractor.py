from __future__ import annotations

import json
from textwrap import dedent
from typing import List

from backend.llm.bedrock_client import BedrockClient
from backend.schemas.events import ExtractionResult


EXTRACTION_SYSTEM_PROMPT = dedent(
    """
    You are an expert analyst of the AI startup ecosystem. Extract discrete, structured events
    about a small set of AI companies from the given article.

    Return STRICT JSON with the following schema (no additional text):

    {
      "events": [
        {
          "type": "funding" | "launch" | "hire" | "partnership" | "acquisition",
          "occurred_at": "ISO 8601 date or null",
          "entities": [
            {
              "name": "string",
              "type": "company" | "person" | "product" | "investor",
              "role": "string or null"
            }
          ],
          "attributes": {
            "amount_usd": number or null,
            "round": "string or null",
            "role": "string or null",
            "product_name": "string or null",
            "summary": "short natural language summary of the event or null"
          },
          "confidence": number between 0 and 1 or null,
          "source_urls": ["string"],
          "evidence_quotes": ["short quoted spans from the article"]
        }
      ]
    }

    Only include high-confidence, material events related to AI companies.
    """
)


class EventExtractor:
    def __init__(self) -> None:
        self.client = BedrockClient()

    def extract(self, content: str, url: str | None = None) -> ExtractionResult:
        prompt = f"{EXTRACTION_SYSTEM_PROMPT}\n\nARTICLE:\n{content}\n"
        raw = self.client.invoke_json(prompt)

        # Basic repair if model wrapped JSON in a field
        if "events" not in raw and "data" in raw:
            raw = raw["data"]

        # Ensure source_urls are populated
        events = raw.get("events", [])
        if url:
            for ev in events:
                urls = ev.get("source_urls") or []
                if url not in urls:
                    urls.append(url)
                ev["source_urls"] = urls

        return ExtractionResult.model_validate(raw)

