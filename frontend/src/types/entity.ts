export interface AcquisitionInfo {
  acquired_by: string;
  date: string | null;
  amount_usd?: number | null;
}

export interface RelatedEvent {
  type: string;
  occurred_at: string | null;
  summary?: string | null;
  amount_usd?: number | null;
}

export interface EntitySearchResult {
  id: string;
  name: string;
  type: string;
  description?: string;
  founded?: number;
  founders?: string[];
  acquisitions?: AcquisitionInfo[];
  related_events?: RelatedEvent[];
}
