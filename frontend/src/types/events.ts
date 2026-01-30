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
  /** JSON string from API, or pre-parsed object in some responses */
  attributes: string | Record<string, unknown> | null;
  confidence: number | null;
  entities?: EventEntity[];
  source_url?: string | null;
}
