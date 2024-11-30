# Image Metadata Tool

A Next.js web application that uses OpenAI's GPT Vision API to analyze images and extract meaningful metadata, which can then be exported to CSV format.

## Features

- Multi-image upload support
- AI-powered image analysis using OpenAI GPT Vision API
- Automatic metadata generation:
  - Title (up to 70 characters)
  - Description (up to 200 characters)
  - Keywords (comma-separated)
- Real-time analysis progress tracking
- CSV export functionality
- Modern, responsive UI built with Material-UI

## Prerequisites

- Node.js 18.x or later
- OpenAI API key

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

3. Create a `.env.local` file and add your OpenAI API key:
```env
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Dependencies

- Next.js 15.0.3
- React 19.0.0-rc
- Material-UI (latest)
- OpenAI SDK (latest)
- TypeScript
- ESLint

## Usage

1. Enter your OpenAI API key (if not configured in .env.local)
2. Upload one or multiple images (supported formats: JPEG, PNG)
3. Wait for the AI analysis to complete
4. Review the generated metadata for each image
5. Export results to CSV format

## CSV Export Format

The exported CSV file contains the following columns:
- Filename: Original image filename
- Title: AI-generated title
- Description: AI-generated description
- Keywords: AI-generated keywords (comma-separated)

## Error Handling

The application handles various scenarios:
- API authentication errors
- Network connectivity issues
- Invalid file formats
- Processing failures
- Rate limiting

## Documentation

- [Requirements Specification (English)](./REQUIREMENTS.md)
- [需求规格说明书 (中文)](./REQUIREMENTS_CN.md)

## Security Considerations

- API keys are stored temporarily in session only
- Client-side image processing
- No permanent data storage
- Secure data transmission

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
