export interface MetadataState {
  isUploading: boolean;
  results: React.ReactNode | null;
  error: React.ReactNode | null;
  csvFile: File | null;
  imagesDir: string;
}

export interface CsvRequirementsProps {
  sx?: React.CSSProperties;
}

export interface FileUploadProps {
  csvFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface DirectoryInputProps {
  imagesDir: string;
  onDirectoryChange: (value: string) => void;
}
