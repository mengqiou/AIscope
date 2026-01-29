import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { EventDto, fetchEvents } from "./api";

interface WeeklySidebarProps {
  anchor?: "right" | "left";
  onEventClick?: (event: EventDto) => void;
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const WeeklySidebar: React.FC<WeeklySidebarProps> = ({
  anchor = "right",
  onEventClick
}) => {
  const [open, setOpen] = useState(true);
  const [events, setEvents] = useState<EventDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await fetchEvents();
        const now = Date.now();
        const thisWeek = all.filter((ev) => {
          if (!ev.occurred_at) return false;
          const t = Date.parse(ev.occurred_at);
          if (Number.isNaN(t)) return false;
          return now - t <= ONE_WEEK_MS;
        });
        setEvents(thisWeek);
      } catch (e) {
        console.error(e);
        setError("Failed to load weekly events");
      }
    })();
  }, []);

  const width = open ? "40%" : "52px";

  const sorted = [...events].sort((a, b) => {
    const ta = a.occurred_at ? Date.parse(a.occurred_at) : 0;
    const tb = b.occurred_at ? Date.parse(b.occurred_at) : 0;
    return tb - ta;
  });

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        flexShrink: 0,
        width,
        transition: "width 0.25s ease",
        borderLeft: anchor === "right" ? "1px solid rgba(255,255,255,0.06)" : 0,
        borderRight: anchor === "left" ? "1px solid rgba(255,255,255,0.06)" : 0,
        backgroundColor: "background.paper",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1,
          py: 0.5
        }}
      >
        {open && (
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            What&apos;s new this week
          </Typography>
        )}
        <IconButton
          size="small"
          onClick={() => setOpen((v) => !v)}
          sx={{ ml: "auto" }}
        >
          {anchor === "right" ? (
            open ? (
              <ChevronRightIcon fontSize="small" />
            ) : (
              <ChevronLeftIcon fontSize="small" />
            )
          ) : open ? (
            <ChevronLeftIcon fontSize="small" />
          ) : (
            <ChevronRightIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
      <Divider />
      {open && (
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {error && (
            <Typography
              color="error"
              variant="body2"
              sx={{ px: 2, py: 1.5 }}
            >
              {error}
            </Typography>
          )}
          {!error && sorted.length === 0 && (
            <Typography variant="body2" sx={{ px: 2, py: 1.5 }}>
              No events detected in the last 7 days yet.
            </Typography>
          )}
          {!error && sorted.length > 0 && (
            <List dense>
              {sorted.map((ev) => {
                const occurred =
                  ev.occurred_at &&
                  new Date(ev.occurred_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric"
                  });
                let summary: string | undefined;
                if (ev.attributes) {
                  try {
                    const attrs = JSON.parse(ev.attributes);
                    summary = attrs.summary ?? undefined;
                  } catch {
                    // ignore parse errors
                  }
                }
                return (
                  <ListItem
                    key={ev.id}
                    alignItems="flex-start"
                    disablePadding
                    sx={{ cursor: onEventClick ? "pointer" : "default" }}
                  >
                    <ListItemButton
                      onClick={() => onEventClick?.(ev)}
                      sx={{ py: 1 }}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 1
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ textTransform: "capitalize", fontWeight: 500 }}
                            >
                              {ev.type}
                            </Typography>
                            {occurred && (
                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                {occurred}
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={
                          summary && (
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary", mt: 0.5 }}
                            >
                              {summary}
                            </Typography>
                          )
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      )}
    </Box>
  );
};

export default WeeklySidebar;

