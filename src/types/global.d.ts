interface HTMLInputElement {
  webkitdirectory?: boolean;
  directory?: boolean;
}

interface Window {
  showDirectoryPicker?: () => Promise<any>;
}
