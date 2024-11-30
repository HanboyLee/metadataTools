"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Stack,
} from "@mui/material";
import { CsvRequirements } from "./components/CsvRequirements";
import { FileUpload } from "./components/FileUpload";

const initialState = {
  csvFile: null as File | null,
  selectedFiles: [] as File[],
  processing: false,
  error: null as any,
  results: null as React.ReactElement | null,
};

export default function MetadataManagement() {
  const [state, setState] = useState(initialState);

  const handleCsvChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setState((prev) => ({
      ...prev,
      csvFile: file || null,
    }));
  };

  const handleFileSelect = (files: FileList) => {
    setState((prev) => ({
      ...prev,
      selectedFiles: Array.from(files),
    }));
  };

  const getImageFiles = async () => {
    if (!state.selectedFiles.length) {
      throw new Error("No files selected");
    }

    try {
      const imageFiles: { name: string; file: File }[] = [];

      for (const file of state.selectedFiles) {
        if (
          file.name.toLowerCase().endsWith(".jpg") ||
          file.name.toLowerCase().endsWith(".jpeg") ||
          file.name.toLowerCase().endsWith(".png")
        ) {
          console.log("Found image file:", file.name);
          imageFiles.push({ name: file.name, file });
        }
      }

      console.log("Total image files found:", imageFiles.length);
      console.log(
        "Image files:",
        imageFiles.map((f) => f.name)
      );

      return imageFiles;
    } catch (error) {
      console.error("Error getting image files:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!state.csvFile || !state.selectedFiles.length) {
      return;
    }

    setState((prev) => ({
      ...prev,
      processing: true,
      error: null,
      results: null,
    }));

    try {
      // Get all image files from the selected files
      const imageFiles = await getImageFiles();
      if (imageFiles.length === 0) {
        throw new Error("No image files found in the selected files");
      }

      const formData = new FormData();
      formData.append("file", state.csvFile);

      // Add all image files to the form data
      for (const { name, file } of imageFiles) {
        formData.append("images[]", file, name.toLowerCase()); // Use lowercase name
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("API Response:", {
        ok: response.ok,
        status: response.status,
        result,
      });

      if (!response.ok) {
        setState((prev) => ({
          ...prev,
          error:
            result.details && Array.isArray(result.details)
              ? `${result.error}\n${result.details.join("\n")}`
              : result.error ||
                "An error occurred while processing the request",
          results:
            result.processed && result.processed.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                <Typography color="success.main" sx={{ fontWeight: "medium" }}>
                  Partially processed files:
                </Typography>
                <Box
                  component="ul"
                  sx={{ mt: 1, listStyleType: "disc", pl: 4 }}
                >
                  {result.processed.map(
                    (
                      item: { filename: string; downloadUrl: string },
                      index: number
                    ) => (
                      <li key={index}>
                        <Typography variant="body2">
                          {item.filename} -{" "}
                          <a
                            href={item.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download
                          </a>
                        </Typography>
                      </li>
                    )
                  )}
                </Box>
              </Box>
            ) : null,
        }));
      } else if (result.processed && result.processed.length > 0) {
        setState((prev) => ({
          ...prev,
          results: (
            <Box sx={{ mt: 2 }}>
              <Typography color="success.main" sx={{ fontWeight: "medium" }}>
                Successfully processed files:
              </Typography>
              {result.summary && (
                <Typography color="success.main" variant="body2" sx={{ mt: 1 }}>
                  Total: {result.summary.total}, Succeeded:{" "}
                  {result.summary.succeeded}, Failed: {result.summary.failed}
                </Typography>
              )}
              {result.downloadUrl && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={async () => {
                    try {
                      // Trigger cleanup
                      const response = await fetch("/api/download", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ zipPath: result.downloadUrl }),
                      });

                      if (!response.ok) {
                        throw new Error("Failed to initiate cleanup");
                      }

                      // Start download after cleanup is scheduled
                      window.location.href = result.downloadUrl;
                    } catch (error) {
                      console.error("Error during download:", error);
                    }
                  }}
                  sx={{ mt: 2, mb: 2 }}
                >
                  Download All Processed Images (ZIP)
                </Button>
              )}
              <Box component="ul" sx={{ mt: 1, listStyleType: "disc", pl: 4 }}>
                {result.processed.map(
                  (item: { filename: string }, index: number) => (
                    <li key={index}>
                      <Typography variant="body2">{item.filename}</Typography>
                    </li>
                  )
                )}
              </Box>
              {result.failed && result.failed.length > 0 && (
                <>
                  <Typography
                    color="error.main"
                    sx={{ fontWeight: "medium", mt: 2 }}
                  >
                    Failed files:
                  </Typography>
                  <Box
                    component="ul"
                    sx={{ mt: 1, listStyleType: "disc", pl: 4 }}
                  >
                    {result.failed.map((error: string, index: number) => (
                      <li key={index}>
                        <Typography variant="body2" color="error">
                          {error}
                        </Typography>
                      </li>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          ),
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: "No files were processed successfully.",
        }));
      }
    } catch (error) {
      console.error("Error processing files:", error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while processing the files",
      }));
    } finally {
      setState((prev) => ({ ...prev, processing: false }));
    }
  };

  const handleReset = () => {
    setState(initialState);
    // Reset the file input by clearing its value
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Image Metadata Management Tool
      </Typography>

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Configuration
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FileUpload
              csvFile={state.csvFile}
              onFileChange={handleCsvChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Upload Files
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e.target.files!)}
            />
          </Grid>

          <Grid item xs={12}>
            <CsvRequirements />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={state.processing}
              >
                {state.processing ? "Processing..." : "Upload and Process"}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={handleReset}
                disabled={state.processing}
              >
                Reset
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {state.error && (
        <Paper sx={{ mt: 3, p: 2, bgcolor: "error.light" }}>
          <Typography color="error.dark" sx={{ whiteSpace: "pre-line" }}>
            {state.error}
          </Typography>
        </Paper>
      )}

      {state.results && (
        <Paper sx={{ mt: 3, p: 2, bgcolor: "success.light" }}>
          {state.results}
        </Paper>
      )}
    </Container>
  );
}
