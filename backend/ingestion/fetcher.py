from __future__ import annotations

import hashlib
from datetime import datetime
from typing import Iterable

import feedparser
import requests
import yaml
from requests import Response

from backend.core.config import settings
from backend.db.base import SessionLocal
from backend.models.documents import Document


def _hash_content(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _request(url: str) -> Response:
    headers = {"User-Agent": settings.user_agent}
    resp = requests.get(url, headers=headers, timeout=15)
    resp.raise_for_status()
    return resp


def load_sources(config_path: str = "backend/ingestion/sources.yaml") -> dict:
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def fetch_rss_documents() -> int:
    """Fetch RSS feeds and store new documents. Returns count of new documents."""
    sources = load_sources()
    rss_feeds: Iterable[dict] = sources.get("rss_feeds", [])
    session = SessionLocal()
    new_count = 0

    try:
        for feed_cfg in rss_feeds:
            parsed = feedparser.parse(feed_cfg["url"])
            for entry in parsed.entries:
                link = entry.get("link")
                if not link:
                    continue
                if session.query(Document).filter_by(url=link).first():
                    continue

                title = entry.get("title", "")
                summary = entry.get("summary", "")
                published_parsed = entry.get("published_parsed") or entry.get(
                    "updated_parsed"
                )
                published_at = (
                    datetime(*published_parsed[:6]) if published_parsed else None
                )

                content = f"{title}\n\n{summary}"
                content_hash = _hash_content(content)

                if (
                    session.query(Document)
                    .filter_by(content_hash=content_hash)
                    .first()
                    is not None
                ):
                    continue

                doc = Document(
                    url=link,
                    title=title,
                    source_name=feed_cfg.get("name"),
                    published_at=published_at,
                    fetched_at=datetime.utcnow(),
                    content=content,
                    content_hash=content_hash,
                )
                session.add(doc)
                new_count += 1

        session.commit()
        return new_count
    finally:
        session.close()


def fetch_full_article(document_id: int) -> None:
    """Optional: expand a document from RSS summary to full article body."""
    session = SessionLocal()
    try:
        doc = session.get(Document, document_id)
        if not doc:
            return
        resp = _request(doc.url)
        text = resp.text
        doc.content = text
        doc.content_hash = _hash_content(text)
        doc.fetched_at = datetime.utcnow()
        session.commit()
    finally:
        session.close()

