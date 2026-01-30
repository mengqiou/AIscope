import type {
  EventDto,
  EventEntity,
  AcquisitionInfo,
  RelatedEvent,
  EntitySearchResult
} from "./types";

export type { EventDto, EventEntity, AcquisitionInfo, RelatedEvent, EntitySearchResult };

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function fetchEvents(): Promise<EventDto[]> {
  const res = await fetch(`${API_BASE_URL}/events`);
  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status}`);
  }
  const data = await res.json();
  const first = Array.isArray(data) && data.length > 0 ? data[0] : null;
  if (first) {
    fetch("http://127.0.0.1:7243/ingest/cc63c749-2879-44b3-a692-dea83a3ad204", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "api:fetchEvents",
        message: "first event from API",
        data: { id: first.id, keys: Object.keys(first), hasAttributes: "attributes" in first, hasSourceUrl: "source_url" in first, sourceUrl: first.source_url },
        timestamp: Date.now(),
        sessionId: "debug-session"
      })
    }).catch(() => {});
  }
  return data;
}

export async function searchAndAddEntity(
  searchTerm: string
): Promise<EntitySearchResult | null> {
  const res = await fetch(`${API_BASE_URL}/entities/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: searchTerm })
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Search failed" }));
    throw new Error(error.detail || `Failed to search entity: ${res.status}`);
  }

  return res.json();
}

