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
  Divider,
  Link,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
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
  let round: string | undefined;
  let productName: string | undefined;

  if (event.attributes) {
    try {
      attributes = JSON.parse(event.attributes);
      summary = attributes.summary;
      amountUsd = attributes.amount_usd;
      round = attributes.round;
      productName = attributes.product_name;
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

        {/* Key Details */}
        <Box sx={{ mb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          {amountUsd && (
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase" }}>
                Amount
              </Typography>
              <Typography variant="h6" sx={{ color: "primary.main" }}>
                ${(amountUsd / 1_000_000_000).toFixed(1)}B
              </Typography>
            </Box>
          )}
          {round && (
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase" }}>
                Round
              </Typography>
              <Typography variant="body1">{round}</Typography>
            </Box>
          )}
          {productName && (
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase" }}>
                Product
              </Typography>
              <Typography variant="body1">{productName}</Typography>
            </Box>
          )}
        </Box>

        {/* Entities Involved */}
        {event.entities && event.entities.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Entities Involved
            </Typography>
            <List dense>
              {event.entities.map((entity, idx) => (
                <ListItem key={idx} sx={{ px: 0 }}>
                  <ListItemText
                    primary={entity.name}
                    secondary={
                      <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                        <Chip label={entity.type} size="small" variant="outlined" />
                        {entity.role && (
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {entity.role}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Summary */}
        {summary && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Summary
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {summary}
            </Typography>
          </>
        )}

        {/* Source URL */}
        {event.source_url && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Source
              </Typography>
              <Link
                href={event.source_url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "primary.main",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" }
                }}
              >
                {event.source_url}
                <LaunchIcon fontSize="small" />
              </Link>
            </Box>
          </>
        )}

        {!summary && !event.entities?.length && !event.source_url && (
          <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
            No detailed information available for this event.
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
