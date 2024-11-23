# Image Metadata Management Tool

A Next.js application that allows users to select a folder of images and a CSV file containing metadata, which will then be written into the corresponding image metadata fields.

## Features

- Direct folder selection for images (PNG, JPG, JPEG)
- Upload CSV files with metadata information
- Automatic metadata writing using exiftool
- Real-time progress and error reporting
- Modern, responsive UI built with Tailwind CSS

## CSV Format Requirements

The CSV file should contain the following columns in this exact order:
- `Filename`: The name of the image file (including extension)
- `Title`: The title of the image
- `Description`: A brief text description of the image
- `Keywords`: Comma-separated list of keywords

Example CSV format:
```csv
Filename,Title,Description,Keywords
image1.jpg,"Beautiful Sunset","A sunset photo over the ocean","nature,sunset,beach"
image2.png,"Forest Path","Forest scene with autumn leaves","forest,trees,nature"
```

## Prerequisites

- Node.js 18.x or later
- ExifTool installed on your system

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd image-metadata-tool
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Dependencies

- Next.js
- React
- TypeScript
- Tailwind CSS
- exiftool-vendored
- csv-parser

## Usage

1. Click "Choose Files" in the Image Folder section to select your folder containing images
2. Create a CSV file with the required columns (Filename, Title, Description, Keywords)
3. Upload the CSV file
4. Click "Upload and Process" to start processing
5. Check the results for any errors or success messages

## Error Handling

The application handles various error cases:
- Missing or incorrect CSV columns
- Non-matching filenames
- Invalid image formats
- Network errors
- Processing errors

## License

MIT
