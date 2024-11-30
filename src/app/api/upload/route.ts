import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { processMetadataFile } from '@/utils/metadata';
import { promises as fs } from 'fs';
import path from 'path';
import JSZip from 'jszip';


// Define directories
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const PROCESSED_DIR = path.join(process.cwd(), 'public', 'processed');
const TEMP_DIR = path.join(process.cwd(), 'public', 'temp');

function normalizeRecords(records: any[], headers: string[]) {
  const normalizedHeaders = headers.map(h => h.toLowerCase());
  const expectedHeaders = ['filename', 'title', 'description', 'keywords'];

  console.log('Validating headers:', headers);
  console.log('Normalized headers:', normalizedHeaders);
  console.log('Expected headers:', expectedHeaders);

  // Check if we have all required headers
  const missingHeaders = expectedHeaders.filter(h => !normalizedHeaders.includes(h));
  if (missingHeaders.length > 0) {
    return {
      valid: false,
      error: `Missing required headers: ${missingHeaders.join(', ')}`,
      normalizedRecords: null
    };
  }

  // Normalize records
  const normalizedRecords = records.map(record => {
    const normalizedRecord: any = {};
    Object.keys(record).forEach(key => {
      const normalizedKey = key.toLowerCase();
      if (expectedHeaders.includes(normalizedKey)) {
        normalizedRecord[normalizedKey] = record[key];
      }
    });
    return normalizedRecord;
  });

  console.log('Normalized records:', normalizedRecords);
  return { valid: true, error: null, normalizedRecords };
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  record: any;
}

function validateCSVRow(record: any, index: number): ValidationResult {
  const errors: string[] = [];
  const validatedRecord = { ...record };

  // Helper function to validate a field
  function validateField({ value, required = true, maxLength = 0, fieldName = '' }: { 
    value: string | undefined, 
    required?: boolean, 
    maxLength?: number, 
    fieldName?: string 
  }) {
    console.log(`Validating field ${fieldName}:`, { value, required });

    if (required && (!value || value.trim() === '')) {
      errors.push(`Row ${index + 1}: ${fieldName} is required`);
      return false;
    }

    if (maxLength > 0 && value && value.length > maxLength) {
      errors.push(`Row ${index + 1}: ${fieldName} exceeds maximum length of ${maxLength} characters`);
      return false;
    }

    return true;
  }

  // Validate FileName
  validateField({
    value: record.filename,
    required: true,
    fieldName: 'FileName'
  });

  // Validate Title
  validateField({
    value: record.title,
    required: true,
    maxLength: 100,
    fieldName: 'Title'
  });

  // Validate Description
  validateField({
    value: record.description,
    required: true,
    maxLength: 2000,
    fieldName: 'Description'
  });

  // Validate Keywords
  validateField({
    value: record.keywords,
    required: true,
    fieldName: 'Keywords'
  });

  // Additional keyword validation
  if (record.keywords) {
    const keywords = record.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
    if (keywords.length === 0) {
      errors.push(`Row ${index + 1}: At least one keyword is required`);
    } else if (keywords.length > 50) {
      errors.push(`Row ${index + 1}: Maximum 50 keywords allowed`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    record: validatedRecord
  };
}

export async function POST(request: NextRequest) {
  try {
    // Create necessary directories
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    await fs.mkdir(PROCESSED_DIR, { recursive: true });
    await fs.mkdir(TEMP_DIR, { recursive: true });

    const formData = await request.formData();
    const csvFile = formData.get('file') as File;
    const imageFiles = formData.getAll('images[]') as File[];

    console.log('Received files:', {
      csvFile: csvFile?.name,
      imageFiles: imageFiles.map(f => f.name)
    });

    if (!csvFile || !imageFiles.length) {
      console.error('Missing required files:', { csvFile: !!csvFile, imageCount: imageFiles.length });
      return NextResponse.json(
        { error: 'Missing required files' },
        { status: 400 }
      );
    }

    // Save uploaded images to public/images directory
    console.log('Saving images to:', IMAGES_DIR);
    for (const file of imageFiles) {
      const buffer = await file.arrayBuffer();
      const imagePath = path.join(IMAGES_DIR, file.name);
      await fs.writeFile(imagePath, Buffer.from(buffer));
      console.log('Saved image:', imagePath);
    }

    // Create a case-insensitive map of image files
    const imageFileMap = new Map<string, File>();
    imageFiles.forEach(file => {
      imageFileMap.set(file.name.toLowerCase(), file);
    });

    // Read CSV file content
    const csvContent = await csvFile.text();
    console.log('CSV Content:', csvContent);

    // Parse CSV content
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      skip_records_with_error: true
    });

    console.log('Parsed CSV records:', records);

    // Validate and normalize records
    const { valid, error, normalizedRecords } = normalizeRecords(records, Object.keys(records[0] || {}));
    if (!valid || !normalizedRecords) {
      console.error('CSV validation failed:', error);
      return NextResponse.json(
        { error: error || 'Invalid CSV format' },
        { status: 400 }
      );
    }

    console.log('Normalized records:', normalizedRecords);

    const results = {
      processed: [] as { filename: string }[],
      failed: [] as string[],
      summary: {
        total: normalizedRecords.length,
        succeeded: 0,
        failed: 0,
      },
      downloadUrl: '',
    };

    // Process each record
    for (const record of normalizedRecords) {
      console.log('Processing record:', record);
      
      const { valid, errors, record: validatedRecord } = validateCSVRow(record, normalizedRecords.indexOf(record));
      if (!valid || !validatedRecord) {
        console.error('Record validation failed:', errors);
        results.failed.push(...errors);
        results.summary.failed++;
        continue;
      }

      console.log('Validated record:', validatedRecord);

      // Get the filename from the record (case-insensitive)
      const filename = validatedRecord.filename;
      if (!filename) {
        const error = `Missing filename in record: ${JSON.stringify(validatedRecord)}`;
        console.error(error);
        results.failed.push(error);
        results.summary.failed++;
        continue;
      }

      // Find the corresponding image file
      const imageFile = imageFileMap.get(filename.toLowerCase());
      if (!imageFile) {
        const error = `Image file not found: ${filename}`;
        console.error(error);
        console.log('Available files:', Array.from(imageFileMap.keys()));
        results.failed.push(error);
        results.summary.failed++;
        continue;
      }

      try {
        console.log('Processing record with metadata:', {
          filename: filename,
          title: validatedRecord.title,
          description: validatedRecord.description,
          keywords: validatedRecord.keywords
        });
        
        // Format keywords exactly like the test script
        const keywords = validatedRecord.keywords
          .split(/[,;]/)  // Split on comma or semicolon
          .map((k:string )=> k.trim())
          .filter(Boolean)
          .join(', ');  // Join with comma and space
        
        await processMetadataFile(imageFile, {
          title: validatedRecord.title.trim(),
          description: validatedRecord.description.trim(),
          keywords: keywords
        });

        results.processed.push({ filename });
        results.summary.succeeded++;
      } catch (error) {
        const errorMessage = `Error processing ${filename}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMessage);
        results.failed.push(errorMessage);
        results.summary.failed++;
      }
    }

    // Create ZIP file if there are processed files
    if (results.processed.length > 0) {
      const zip = new JSZip();
      
      // Create a folder in the ZIP file
      const processedFolder = zip.folder('processed_images');
      
      if (!processedFolder) {
        throw new Error('Failed to create folder in ZIP');
      }

      // Add processed files to ZIP folder
      for (const { filename } of results.processed) {
        const filePath = path.join(PROCESSED_DIR, filename);
        const fileContent = await fs.readFile(filePath);
        processedFolder.file(filename, fileContent);
      }

      // Generate ZIP file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const zipFileName = `processed_images_${timestamp}.zip`;
      const zipPath = path.join(TEMP_DIR, zipFileName);
      const zipContent = await zip.generateAsync({ type: "nodebuffer" });
      await fs.writeFile(zipPath, zipContent);

      // Set download URL for the ZIP file
      results.downloadUrl = `/temp/${zipFileName}`;
    }

    console.log('Final results:', results);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error processing files' },
      { status: 500 }
    );
  }
}
