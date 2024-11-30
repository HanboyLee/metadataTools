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
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  Divider,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import { CsvRequirements } from "./components/CsvRequirements";
import { FileUpload } from "./components/FileUpload";

const initialState = {
  csvFile: null as File | null,
  selectedFiles: [] as File[],
  processing: false,
  error: null as any,
  results: null as React.ReactElement | null,
  uploadResult: null as any,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.csvFile || !state.selectedFiles.length) return;

    try {
      setState((prev) => ({ ...prev, processing: true, error: null }));

      const formData = new FormData();
      formData.append("file", state.csvFile);
      state.selectedFiles.forEach((file) => {
        formData.append("images[]", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Upload error:', errorData);
        throw new Error(errorData || "處理過程中發生錯誤");
      }

      const result = await response.json();

      setState((prev) => ({
        ...prev,
        uploadResult: result,
        processing: false,
      }));

    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "未知錯誤",
        processing: false,
      }));
    }
  };

  const handleReset = async () => {
    try {
      setState({ ...state, processing: true });

      // 調用重置 API
      const response = await fetch("/api/reset", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reset directories");
      }

      // 重置表單狀態
      setState({
        csvFile: null,
        selectedFiles: [],
        processing: false,
        error: null,
        results: null,
        uploadResult: null,
      });

      // 清除文件輸入
      const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Reset error:", error);
      setState({
        ...state,
        processing: false,
        error: "Failed to reset. Please try again.",
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
     胡豆豆的專屬吃飯工具
      </Typography>

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              檔案上傳
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <InfoIcon color="primary" fontSize="small" />
                  CSV 檔案格式說明
                </Typography>
                <CsvRequirements />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  上傳檔案
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <FileUpload csvFile={state.csvFile} onFileChange={handleCsvChange} />
                </Box>
                <Box
                  sx={{
                    border: "2px dashed",
                    borderColor: "primary.light",
                    borderRadius: 1,
                    p: 3,
                    textAlign: "center",
                  }}
                >
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files!)}
                    style={{ display: "none" }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      component="span"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 2 }}
                    >
                      選擇圖片
                    </Button>
                  </label>
                  {state.selectedFiles.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      已選擇 {state.selectedFiles.length} 個檔案
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={state.processing || !state.csvFile || !state.selectedFiles.length}
                startIcon={state.processing ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              >
                {state.processing ? "處理中..." : "開始處理"}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={handleReset}
                disabled={state.processing}
              >
                重置
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {state.error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {state.error}
        </Alert>
      )}

      {state.uploadResult && (
        <Paper elevation={3} sx={{ mt: 4, overflow: 'hidden' }}>
          <Box
            sx={{
              p: 2,
              bgcolor: state.uploadResult.success ? 'success.light' : 'error.light',
              color: 'white'
            }}
          >
            <Typography variant="h6">
              {state.uploadResult.success ? '處理完成' : '處理失敗'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {state.uploadResult.message}
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            {state.uploadResult.successDetails?.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="success" />
                  成功處理的文件
                </Typography>
                <List>
                  {state.uploadResult.successDetails.map((item: { filename: string; path: string }, index: number) => (
                    <ListItem key={index} divider>
                      <ListItemText primary={item.filename} />
                      <Button
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<VisibilityIcon />}
                        size="small"
                        variant="outlined"
                        color="primary"
                      >
                        查看
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {state.uploadResult.failureDetails?.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ErrorIcon color="error" />
                  處理失敗的文件
                </Typography>
                <List>
                  {state.uploadResult.failureDetails.map((error: string, index: number) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <ErrorIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={error} 
                        primaryTypographyProps={{ color: 'error' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {state.uploadResult.success && state.uploadResult.downloadUrl && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  href={state.uploadResult.downloadUrl}
                  download="processed_images.zip"
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  size="large"
                >
                  下載處理後的圖片
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      )}
    </Container>
  );
}
