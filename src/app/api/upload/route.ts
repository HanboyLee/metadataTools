import { NextResponse, NextRequest } from 'next/server';
import { join, dirname } from 'path';
import * as csv from 'csv-parse';
import processMetadataFile from '../../../utils/metadata';
import * as fs from 'fs/promises';
import { paths } from '../../../config/paths';

// Define expected CSV format based on test.csv
const CSV_FORMAT = {
  headers: ['FileName', 'Title', 'Description', 'Keywords'],
  example: {
    FileName: 'example.jpg',
    Title: 'Sample Image Title',
    Description: 'A sample image description',
    Keywords: 'keyword1,keyword2,keyword3'
  }
};

// Validation rules for each field
const CSV_VALIDATION = {
  FileName: {
    required: true,
    validate: (value: string) => !!value && /\.(jpg|jpeg|png)$/i.test(value),
    error: 'must be a .jpg, .jpeg, or .png file',
    example: CSV_FORMAT.example.FileName
  },
  Title: {
    required: true,
    validate: (value: string) => !!value && value.length <= 100,
    error: 'must not be empty and should be less than 100 characters',
    example: CSV_FORMAT.example.Title
  },
  Description: {
    required: true,
    validate: (value: string) => !!value && value.length <= 2000,
    error: 'must not be empty and should be less than 2000 characters',
    example: CSV_FORMAT.example.Description
  },
  Keywords: {
    required: true,
    validate: (value: string) => {
      const keywords = value.split(',').map(k => k.trim()).filter(Boolean);
      return keywords.length > 0 && keywords.length <= 50;
    },
    error: 'must contain at least one keyword and no more than 50 keywords',
    example: CSV_FORMAT.example.Keywords
  }
};

// Generate format guidance message
function getFormatGuidance(): string {
  return `
CSV Format Requirements:

1. Headers (in exact order):
   ${CSV_FORMAT.headers.join(', ')}

2. Example Row:
   FileName: ${CSV_VALIDATION.FileName.example}
   Title: ${CSV_VALIDATION.Title.example}
   Description: ${CSV_VALIDATION.Description.example}
   Keywords: ${CSV_VALIDATION.Keywords.example}

3. Field Requirements:
   - FileName: ${CSV_VALIDATION.FileName.error}
   - Title: ${CSV_VALIDATION.Title.error}
   - Description: ${CSV_VALIDATION.Description.error}
   - Keywords: ${CSV_VALIDATION.Keywords.error}

Please ensure your CSV follows this format exactly. Keywords should be comma-separated.
`;
}

// Find the actual header row in CSV content
async function findHeaderRow(csvPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    let rowIndex = 0;
    let headerFound = false;

    createReadStream(csvPath)
      .pipe(csv.parse({ 
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true
      }))
      .on('data', (row) => {
        if (!headerFound && row.length >= 4) {
          const potentialHeaders = row.map((col: string) => col.trim());
          if (potentialHeaders.join(',') === CSV_FORMAT.headers.join(',')) {
            headerFound = true;
            resolve(rowIndex);
          }
        }
        rowIndex++;
      })
      .on('end', () => {
        if (!headerFound) {
          reject(new Error('Could not find valid header row'));
        }
      })
      .on('error', reject);
  });
}

// Validate CSV headers
function validateCSVHeaders(headers: string[]): { valid: boolean; error?: string } {
  const expectedHeaders = CSV_FORMAT.headers;
  
  if (headers.length !== expectedHeaders.length) {
    return {
      valid: false,
      error: `CSV must have exactly ${expectedHeaders.length} columns: ${expectedHeaders.join(', ')}\n\n${getFormatGuidance()}`
    };
  }

  for (let i = 0; i < expectedHeaders.length; i++) {
    if (headers[i] !== expectedHeaders[i]) {
      return {
        valid: false,
        error: `Invalid column order. Expected: ${expectedHeaders.join(', ')}, Found: ${headers.join(', ')}\n\n${getFormatGuidance()}`
      };
    }
  }

  return { valid: true };
}

// Validate CSV row data
function validateCSVRow(row: any, rowIndex: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const [field, rules] of Object.entries(CSV_VALIDATION)) {
    const value = row[field];
    
    if (rules.required && !value) {
      errors.push(`Row ${rowIndex + 1}: ${field} is required`);
    } else if (value && !rules.validate(value)) {
      errors.push(`Row ${rowIndex + 1}: ${field} ${rules.error}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const csvFile = formData.get('csvFile') as File;
    
    if (!csvFile) {
      return NextResponse.json(
        { error: 'No CSV file provided' },
        { status: 400 }
      );
    }

    console.log('Received CSV file:', csvFile.name);

    // Save CSV file to temp directory
    const csvBuffer = Buffer.from(await csvFile.arrayBuffer());
    await fs.writeFile(paths.csvTemp, csvBuffer);

    // Process metadata
    const result = await processMetadataFile(paths.csvTemp, paths.imagesDir);

    if (result.errors.length > 0) {
      return NextResponse.json(
        { 
          error: `${result.summary.failed} files failed to process`,
          details: result.errors,
          success: result.success,
          summary: result.summary
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: `Successfully processed ${result.summary.succeeded} files`,
      success: result.success,
      summary: result.summary
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process files', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Verify IPTC metadata was written correctly
async function verifyIPTCMetadata(imagePath: string, metadata: any): Promise<{ success: boolean; errors: string[] }> {
  try {
    const readResult = await new ExifTool().read(imagePath);
    const errors: string[] = [];
    
    // Helper function to compare arrays
    const arraysEqual = (a: string[], b: string[]) => {
      if (!Array.isArray(a) || !Array.isArray(b)) return false;
      return a.length === b.length && 
             a.every((val, index) => val === b[index]);
    };

    // Verify Title
    const titleMatches = [
      readResult['IPTC:ObjectName'] === metadata['IPTC:ObjectName'],
      readResult['XMP-dc:Title'] === metadata['XMP-dc:Title'],
      readResult['XMP-photoshop:Headline'] === metadata['XMP-photoshop:Headline']
    ];
    
    if (!titleMatches.every(match => match)) {
      errors.push('Title was not written correctly to IPTC/XMP metadata');
    }

    // Verify Description
    const descriptionMatches = [
      readResult['IPTC:Caption-Abstract'] === metadata['IPTC:Caption-Abstract'],
      readResult['XMP-dc:Description'] === metadata['XMP-dc:Description']
    ];
    
    if (!descriptionMatches.every(match => match)) {
      errors.push('Description was not written correctly to IPTC/XMP metadata');
    }

    // Verify Keywords
    const expectedKeywords = metadata['IPTC:Keywords'];
    const iptcKeywords = Array.isArray(readResult['IPTC:Keywords']) 
      ? readResult['IPTC:Keywords'] 
      : [];
    const xmpKeywords = Array.isArray(readResult['XMP-dc:Subject']) 
      ? readResult['XMP-dc:Subject'] 
      : [];

    if (!arraysEqual(iptcKeywords, expectedKeywords) || 
        !arraysEqual(xmpKeywords, expectedKeywords)) {
      errors.push('Keywords were not written correctly to IPTC/XMP metadata');
    }

    // Log the actual metadata for debugging
    console.log('Written Metadata:', {
      title: {
        iptcObjectName: readResult['IPTC:ObjectName'],
        xmpTitle: readResult['XMP-dc:Title'],
        xmpHeadline: readResult['XMP-photoshop:Headline']
      },
      description: {
        iptcCaption: readResult['IPTC:Caption-Abstract'],
        xmpDescription: readResult['XMP-dc:Description']
      },
      keywords: {
        iptcKeywords,
        xmpKeywords
      }
    });

    return {
      success: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('Metadata verification error:', error);
    return {
      success: false,
      errors: ['Failed to verify metadata: ' + (error as Error).message]
    };
  }
}
