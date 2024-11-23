import { ExifTool, Tags } from 'exiftool-vendored';
import { parse } from 'csv-parse/sync';
import { promises as fs } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runExifTool(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    // Escape paths and values that contain spaces
    const escapedArgs = args.map(arg => {
      if (arg.includes('=')) {
        // For metadata values (format: -tag=value)
        const [tag, ...valueParts] = arg.split('=');
        const value = valueParts.join('='); // Rejoin in case value contains =
        return `${tag}="${value}"`;
      } else if (arg.includes('/') && arg.includes(' ')) {
        // For file paths
        return `"${arg}"`;
      }
      return arg;
    });
    
    const command = `exiftool ${escapedArgs.join(' ')}`;
    console.log('Running ExifTool command:', command);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('ExifTool error:', error);
        reject(error);
        return;
      }
      if (stderr) {
        console.warn('ExifTool stderr:', stderr);
      }
      resolve(stdout);
    });
  });
}

async function findImageInDirectory(baseDir: string, fileName: string): Promise<string | null> {
  try {
    // First try direct path
    const directPath = join(baseDir, fileName);
    try {
      await fs.access(directPath);
      return directPath;
    } catch {
      // File not found in direct path, continue searching
    }

    // Search in subdirectories
    const entries = await fs.readdir(baseDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subPath = await findImageInDirectory(join(baseDir, entry.name), fileName);
        if (subPath) {
          return subPath;
        }
      } else if (entry.name === fileName) {
        return join(baseDir, fileName);
      }
    }
    return null;
  } catch (err) {
    console.error('Error searching for file:', err);
    return null;
  }
}

interface MetadataRecord {
  Filename: string;
  Title: string;
  Description: string;
  Keywords: string;
}

export interface ProcessResult {
  success: string[];
  errors: string[];
  summary: {
    total: number;
    succeeded: number;
    failed: number;
  };
}

const processMetadataFile = async (
  csvPath: string = '/Users/douzi/Documents/產品文檔/csv寫入圖片metadata/metadata-template.csv',
  imagesDir: string = '/Users/douzi/Documents/產品文檔/csv寫入圖片metadata/test 3'
): Promise<ProcessResult> => {
  const results: ProcessResult = {
    success: [],
    errors: [],
    summary: {
      total: 0,
      succeeded: 0,
      failed: 0
    }
  };

  try {
    // Read and parse CSV file
    console.log('Reading CSV from:', csvPath);
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    console.log('CSV Content:', csvContent);
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    console.log('Parsed records:', records);
    results.summary.total = records.length;

    for (const record of records) {
      try {
        // Validate record
        if (!record.Filename?.trim()) {
          throw new Error('Filename is required');
        }
        if (!record.Title?.trim()) {
          throw new Error('Title is required');
        }
        if (!record.Description?.trim()) {
          throw new Error('Description is required');
        }
        if (!record.Keywords?.trim()) {
          throw new Error('Keywords are required');
        }

        // Find image file
        const imagePath = join(imagesDir, record.Filename);
        const fileExists = await fs.access(imagePath).then(() => true).catch(() => false);
        
        if (!fileExists) {
          console.error('Image file not found:', record.Filename);
          results.errors.push(record.Filename);
          results.summary.failed++;
          continue;
        }

        // Prepare metadata
        const keywords = record.Keywords.split(',').map(k => k.trim()).filter(k => k);

        try {
          // Read current metadata
          console.log('Reading current metadata...');
          const beforeMetadata = await runExifTool(['-j', '-G', imagePath]);
          console.log('Current metadata:', beforeMetadata);

          // Prepare the command arguments
          const args = [
            '-overwrite_original',
            '-codedcharacterset=UTF8',
            '-charset', 'iptc=UTF8',
            '-m',
            `-IPTC:ObjectName=${record.Title.trim()}`,
            `-IPTC:Caption-Abstract=${record.Description.trim()}`,
            ...keywords.map(k => `-IPTC:Keywords=${k}`),
            `-XMP-dc:Title=${record.Title.trim()}`,
            `-XMP-dc:Description=${record.Description.trim()}`,
            ...keywords.map(k => `-XMP-dc:Subject=${k}`),
            `-IFD0:ImageDescription=${record.Description.trim()}`,
            `-IFD0:DocumentName=${record.Title.trim()}`,
            imagePath
          ];

          // Write metadata
          console.log('Writing metadata with command:', args.join(' '));
          const writeResult = await runExifTool(args);
          console.log('Write result:', writeResult);

          results.success.push(record.Filename);
          results.summary.succeeded++;
          console.log('Successfully processed:', record.Filename);
        } catch (err) {
          console.error('Error processing file:', record.Filename, err);
          results.errors.push(record.Filename);
          results.summary.failed++;
        }
      } catch (err) {
        console.error('Error processing record:', record, err);
        results.errors.push(record.Filename);
        results.summary.failed++;
      }
    }

    return results;
  } catch (err) {
    console.error('Error processing CSV:', err);
    throw new Error('Failed to process CSV file: ' + (err instanceof Error ? err.message : 'Unknown error'));
  }
};

export default processMetadataFile;

export async function verifyMetadata(
  imagePath: string,
  expectedMetadata: MetadataRecord,
  exiftool: ExifTool
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  try {
    const readResult = await exiftool.read(imagePath);

    // Verify IPTC metadata
    if (readResult['IPTC:ObjectName'] !== expectedMetadata.Title) {
      errors.push('IPTC:ObjectName mismatch');
    }
    if (readResult['IPTC:Caption-Abstract'] !== expectedMetadata.Description) {
      errors.push('IPTC:Caption-Abstract mismatch');
    }

    const expectedKeywords = expectedMetadata.Keywords.split(',').map(k => k.trim());
    if (!Array.isArray(readResult['IPTC:Keywords']) || 
        !expectedKeywords.every(k => readResult['IPTC:Keywords'].includes(k))) {
      errors.push('IPTC:Keywords mismatch');
    }

    // Verify XMP metadata
    const xmpTitle = readResult['XMP-dc:Title'];
    if (!xmpTitle || xmpTitle['x-default'] !== expectedMetadata.Title) {
      errors.push('XMP-dc:Title mismatch');
    }

    const xmpDescription = readResult['XMP-dc:Description'];
    if (!xmpDescription || xmpDescription['x-default'] !== expectedMetadata.Description) {
      errors.push('XMP-dc:Description mismatch');
    }

    if (!Array.isArray(readResult['XMP-dc:Subject']) || 
        !expectedKeywords.every(k => readResult['XMP-dc:Subject'].includes(k))) {
      errors.push('XMP-dc:Subject mismatch');
    }

  } catch (error) {
    errors.push(`Failed to verify metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    success: errors.length === 0,
    errors
  };
}
