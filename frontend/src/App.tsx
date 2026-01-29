import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import GraphView from "./GraphView";
import WeeklySidebar from "./WeeklySidebar";

const App: React.FC = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AIscope
          </Typography>
          <Typography
            variant="body2"
            sx={{ ml: 2, color: "text.secondary", display: { xs: "none", md: "block" } }}
          >
            Fact graph of core AI entities
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          minHeight: 0
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            p: 2,
            background:
              "radial-gradient(circle at top left, #1f2937 0, #020617 55%, #000 100%)"
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ mb: 1.5, fontWeight: 500, color: "text.secondary" }}
          >
            Core AI ecosystem graph
          </Typography>
          <Box
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              height: isSmall ? "calc(100vh - 140px)" : "100%"
            }}
          >
            <GraphView />
          </Box>
        </Box>

        {!isSmall && <WeeklySidebar anchor="right" />}
      </Box>

      {isSmall && (
        <Box sx={{ height: 260, borderTop: "1px solid rgba(148,163,184,0.25)" }}>
          <WeeklySidebar anchor="right" />
        </Box>
      )}
    </Box>
  );
};

export default App;

