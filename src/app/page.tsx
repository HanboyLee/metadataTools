'use client';

import { useState } from 'react';

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<React.ReactNode | null>(null);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<{path: string, file: File}[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const imageFiles = Array.from(files)
        .filter(file => /\.(jpg|jpeg|png)$/i.test(file.name))
        .map(file => ({
          path: file.webkitRelativePath || file.name,
          file: file
        }));
      setSelectedFiles(imageFiles);
    }
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    if (csvFile) {
      formData.append('csvFile', csvFile);
    }

    selectedFiles.forEach(({file}) => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error);
        if (result.details) {
          setError(`${result.error}\n${result.details.map((d: any) => d.file).join('\n')}`);
        }
      } else {
        setResults(
          <div className="space-y-2">
            <p className="font-medium text-green-600">{result.message}</p>
            <ul className="list-disc list-inside">
              {result.success.map((file: string, index: number) => (
                <li key={index} className="text-sm">{file}</li>
              ))}
            </ul>
          </div>
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Image Metadata Management Tool</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="imageFolder" className="block text-sm font-medium mb-2">
                Image Folder
              </label>
              <input
                id="imageFolder"
                name="imageFolder"
                type="file"
                webkitdirectory=""
                directory=""
                multiple
                required
                onChange={handleFolderSelect}
                className="block w-full text-sm border border-gray-300 rounded-lg p-2"
              />
              <p className="mt-1 text-sm text-gray-500">
                Select a folder containing your images (PNG, JPG, JPEG)
              </p>
              {selectedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Selected {selectedFiles.length} image(s):</p>
                  <ul className="mt-1 text-sm text-gray-500 max-h-32 overflow-y-auto">
                    {selectedFiles.map(({path}, index) => (
                      <li key={index}>{path}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="csvFile" className="block text-sm font-medium mb-2">
                CSV File
              </label>
              <input
                id="csvFile"
                name="csvFile"
                type="file"
                accept=".csv"
                required
                onChange={handleCsvFileChange}
                className="block w-full text-sm border border-gray-300 rounded-lg p-2"
              />
              <div className="mt-2">
                <p className="text-sm text-gray-600 font-medium">Required CSV Format:</p>
                <div className="mt-1 text-sm text-gray-500 bg-gray-50 p-3 rounded border">
                  <p className="font-medium">Headers (in exact order):</p>
                  <p className="ml-4">FileName,Title,Description,Keywords</p>
                  
                  <p className="font-medium mt-2">Example Row:</p>
                  <pre className="ml-4 whitespace-pre-wrap text-xs">
                    <code>
                      FileName: example.jpg
                      Title: Sample Image Title
                      Description: A sample image description
                      Keywords: keyword1,keyword2,keyword3
                    </code>
                  </pre>
                  
                  <p className="font-medium mt-2">Requirements:</p>
                  <ul className="ml-4 list-disc list-inside">
                    <li>CSV must use comma (,) as delimiter</li>
                    <li>Headers must be exactly as shown above</li>
                    <li>FileName must match your image file name</li>
                    <li>Title and Description can contain spaces and special characters</li>
                    <li>Keywords should be comma-separated without spaces after commas</li>
                  </ul>
                  
                  <a
                    href="/example.csv"
                    download="metadata-template.csv"
                    className="inline-flex items-center mt-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Template CSV
                  </a>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isUploading ? 'Processing...' : 'Upload and Process'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {results && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            {results}
          </div>
        )}
      </div>
    </main>
  );
}
