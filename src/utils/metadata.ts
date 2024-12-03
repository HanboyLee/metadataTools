import { ExifTool, Tags } from 'exiftool-vendored';
import { parse } from 'csv-parse/sync';
import { promises as fs } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface MetadataInput {
  title: string;
  description: string;
  keywords: string;
}

async function runExifTool(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const escapedArgs = args.map(arg => {
      if (arg.includes('=')) {
        const [tag, ...valueParts] = arg.split('=');
        const value = valueParts.join('=');
        return `${tag}="${value}"`;
      } else if (arg.includes('/') && arg.includes(' ')) {
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

export async function processMetadataFile(file: File, metadata: MetadataInput): Promise<string> {
  try {
    console.log('Starting metadata processing...');
    console.log('File:', file.name);
    console.log('Metadata:', metadata);

    const originalImagesDir = join(process.cwd(), 'public', 'images');
    const processedImagesDir = join(process.cwd(), 'public', 'processed');

    // Ensure directories exist
    await fs.mkdir(processedImagesDir, { recursive: true });

    const originalImagePath = join(originalImagesDir, file.name);
    const processedImagePath = join(processedImagesDir, file.name);

    // Verify source file exists
    try {
      await fs.access(originalImagePath);
    } catch (error) {
      throw new Error(`Original image not found: ${file.name}`);
    }

    // Process keywords
    const keywordsList = metadata.keywords
      .split(/[,;]/)
      .map(k => k.trim())
      .filter(Boolean);

    // Clean metadata
    const cleanArgs = [
      '-all=',
      '-tagsfromfile', '@',
      '-orientation',
      '-overwrite_original',
      originalImagePath
    ];

    try {
      await runExifTool(cleanArgs);
    } catch (error) {
      throw new Error(`Failed to clean metadata: ${error}`);
    }

    // Write new metadata
    const writeArgs = [
      '-overwrite_original',
      '-codedcharacterset=UTF8',
      '-charset', 'iptc=UTF8',
      '-m',
      `-IPTC:ObjectName=${metadata.title}`,
      `-IPTC:Caption-Abstract=${metadata.description}`,
      ...keywordsList.map(k => `-IPTC:Keywords=${k}`),
      `-XMP-dc:Title=${metadata.title}`,
      `-XMP-dc:Description=${metadata.description}`,
      ...keywordsList.map(k => `-XMP-dc:Subject=${k}`),
      `-IFD0:ImageDescription=${metadata.description}`,
      `-IFD0:DocumentName=${metadata.title}`,
      originalImagePath
    ];

    try {
      await runExifTool(writeArgs);
    } catch (error) {
      throw new Error(`Failed to write metadata: ${error}`);
    }

    // Copy to processed directory
    await fs.copyFile(originalImagePath, processedImagePath);

    return join('/processed', file.name);
  } catch (error) {
    console.error('Error processing metadata:', error);
    throw error;
  }
}

export async function verifyMetadata(
  imagePath: string,
  expectedMetadata: MetadataInput,
  exiftool: ExifTool
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  try {
    const readResult = await exiftool.read(imagePath);

    // Verify IPTC metadata
    if (readResult['IPTC:ObjectName'] !== expectedMetadata.title) {
      errors.push('IPTC:ObjectName mismatch');
    }
    if (readResult['IPTC:Caption-Abstract'] !== expectedMetadata.description) {
      errors.push('IPTC:Caption-Abstract mismatch');
    }

    const expectedKeywords = expectedMetadata.keywords.split(',').map(k => k.trim());
    if (!Array.isArray(readResult['IPTC:Keywords']) || 
        !expectedKeywords.every(k => readResult['IPTC:Keywords'].includes(k))) {
      errors.push('IPTC:Keywords mismatch');
    }

    // Verify XMP metadata
    const xmpTitle = readResult['XMP-dc:Title'];
    if (!xmpTitle || xmpTitle['x-default'] !== expectedMetadata.title) {
      errors.push('XMP-dc:Title mismatch');
    }

    const xmpDescription = readResult['XMP-dc:Description'];
    if (!xmpDescription || xmpDescription['x-default'] !== expectedMetadata.description) {
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
