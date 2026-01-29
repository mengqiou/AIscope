export interface EventEntity {
  name: string;
  type: string;
  role: string | null;
}

export interface EventDto {
  id: number;
  type: string;
  occurred_at: string | null;
  recorded_at: string;
  attributes: string | null;
  confidence: number | null;
  entities?: EventEntity[];
  source_url?: string | null;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function fetchEvents(): Promise<EventDto[]> {
  const res = await fetch(`${API_BASE_URL}/events`);
  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status}`);
  }
  return res.json();
}

