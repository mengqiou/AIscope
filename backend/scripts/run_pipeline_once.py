from __future__ import annotations

"""
One-shot pipeline runner to pull in fresh data and extract events.

Usage (from project root, with .venv activated):

    python -m backend.scripts.run_pipeline_once

Steps:
  1. Fetch RSS documents according to backend/ingestion/sources.yaml.
  2. Run LLM-based event extraction for new documents.
"""

from backend.ingestion.fetcher import fetch_rss_documents
from backend.pipeline.extract_events import run_extraction_for_unprocessed_documents


def main() -> None:
  new_docs = fetch_rss_documents()
  print(f"Fetched {new_docs} new documents")

  new_events = run_extraction_for_unprocessed_documents()
  print(f"Created {new_events} events from new documents")


if __name__ == "__main__":
  main()

