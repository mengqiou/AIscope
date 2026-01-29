import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider
} from "@mui/material";
import { EventDto } from "./api";

interface EventModalProps {
  open: boolean;
  event: EventDto | null;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  open,
  event,
  onClose
}) => {
  if (!event) return null;

  const occurredDate =
    event.occurred_at &&
    new Date(event.occurred_at).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

  const recordedDate =
    event.recorded_at &&
    new Date(event.recorded_at).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

  let attributes: Record<string, any> = {};
  let summary: string | undefined;
  let amountUsd: number | undefined;

  if (event.attributes) {
    try {
      attributes = JSON.parse(event.attributes);
      summary = attributes.summary;
      amountUsd = attributes.amount_usd;
    } catch {
      // ignore parse errors
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "background.paper",
          backgroundImage: "none"
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="h6" sx={{ textTransform: "capitalize" }}>
            {event.type} Event
          </Typography>
          {event.confidence && (
            <Chip
              label={`${Math.round(event.confidence * 100)}% confidence`}
              size="small"
              color={event.confidence > 0.8 ? "success" : "warning"}
            />
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        {occurredDate && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Occurred: {occurredDate}
            </Typography>
            {recordedDate && occurredDate !== recordedDate && (
              <Typography variant="caption" sx={{ color: "text.secondary", ml: 2 }}>
                Recorded: {recordedDate}
              </Typography>
            )}
          </Box>
        )}

        {amountUsd && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ color: "primary.main" }}>
              ${(amountUsd / 1_000_000_000).toFixed(1)}B
            </Typography>
          </Box>
        )}

        {summary && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" sx={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {summary}
            </Typography>
          </>
        )}

        {!summary && (
          <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
            No detailed summary available for this event.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventModal;
