import React, { useState } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
  Typography,
  Chip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { searchAndAddEntity, EntitySearchResult } from "./api";

interface EntitySearchBoxProps {
  onEntityAdded?: (entity: EntitySearchResult) => void;
}

export const EntitySearchBox: React.FC<EntitySearchBoxProps> = ({
  onEntityAdded
}) => {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<EntitySearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await searchAndAddEntity(searchTerm);
      if (result) {
        setOptions([result]);
        if (onEntityAdded) {
          onEntityAdded(result);
        }
      } else {
        setError("Entity not found or could not be added");
        setOptions([]);
      }
    } catch (e: any) {
      console.error("Search error:", e);
      setError(e.message || "Failed to search entity");
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 400 }}>
      <Autocomplete
        freeSolo
        options={options}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.name
        }
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={(_, value) => {
          if (value && typeof value !== "string") {
            // Entity was selected
            setInputValue("");
            setOptions([]);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            handleSearch(inputValue.trim());
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search and add AI company or person..."
            variant="outlined"
            size="small"
            InputProps={{
              ...params.InputProps,
              startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "background.paper",
                "&:hover": {
                  backgroundColor: "background.paper"
                }
              }
            }}
          />
        )}
        renderOption={(props, option) => {
          const entity = option as EntitySearchResult;
          return (
            <Box component="li" {...props} key={entity.id}>
              <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {entity.name}
                  </Typography>
                  <Chip
                    label={entity.type}
                    size="small"
                    color={
                      entity.type.includes("company")
                        ? "primary"
                        : entity.type.includes("scholar")
                        ? "info"
                        : "secondary"
                    }
                  />
                </Box>
                {entity.description && (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  >
                    {entity.description.substring(0, 100)}
                    {entity.description.length > 100 ? "..." : ""}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        }}
        noOptionsText={
          error || (inputValue.length >= 2 ? "Press Enter to search" : "Type to search...")
        }
        loading={loading}
      />
    </Box>
  );
};

export default EntitySearchBox;
