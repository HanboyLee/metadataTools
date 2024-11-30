import { promises as fs } from 'fs';
import path from 'path';
import { exiftool, Tags } from 'exiftool-vendored';

// Define XMPLangAlt type
type XMPLangAlt = {
  'x-default': string;
  [key: string]: string;
};

interface MetadataInput {
  title: string;
  description: string;
  keywords: string;
}

// 定義我們需要的標籤類型
interface MetadataTags extends Tags {
  Headline?: string;
  ObjectName?: string;
  Caption?: string;
  Keywords?: string[];
  'XMP-dc:Title'?: any;
  'XMP-dc:Description'?: any;
  'XMP-dc:Subject'?: string[];
  'EXIF:DocumentName'?: string;
  'EXIF:ImageDescription'?: string;
}

export async function processMetadataFile(file: File, metadata: MetadataInput): Promise<string> {
  try {
    console.log('Processing file:', file.name);
    console.log('Received metadata:', JSON.stringify(metadata, null, 2));

    // Get the directory paths
    const originalImagesDir = path.join(process.cwd(), 'public', 'images');
    const processedImagesDir = path.join(process.cwd(), 'public', 'processed');
    
    // Ensure processed directory exists
    await fs.mkdir(processedImagesDir, { recursive: true });

    const originalImagePath = path.join(originalImagesDir, file.name);
    const processedImagePath = path.join(processedImagesDir, file.name);

    // Check if original image exists
    try {
      await fs.access(originalImagePath);
      console.log('Found original image at:', originalImagePath);
    } catch (error) {
      console.error('Original image not found:', originalImagePath);
      throw new Error(`Original image not found: ${file.name}`);
    }

    // Copy the original image to processed directory
    await fs.copyFile(originalImagePath, processedImagePath);
    console.log('Copied image to:', processedImagePath);

    // Process keywords
    const keywords = metadata.keywords
      .split(/[,;]/)
      .map(k => k.trim())
      .filter(Boolean);

    // Prepare metadata using correct IPTC tags
    const tags: Partial<MetadataTags> = {
      // IPTC Core
      Headline: metadata.title,
      ObjectName: metadata.title,
      Caption: metadata.description,
      Keywords: keywords,
      
      // XMP Dublin Core
      'XMP-dc:Title': metadata.title,
      'XMP-dc:Description': metadata.description,
      'XMP-dc:Subject': keywords,

      // EXIF
      'EXIF:DocumentName': metadata.title,
      'EXIF:ImageDescription': metadata.description,
    };

    // Write metadata to the processed image
    console.log('Writing metadata to:', processedImagePath);
    console.log('Metadata to write:', tags);
    
    await exiftool.write(processedImagePath, tags, [
      '-overwrite_original',
      '-codedcharacterset=utf8',
      '-charset', 
      'iptc=utf8',
      '-P',  // Preserve file modification date/time
      '-m'   // Ignore minor errors
    ]);

    // Verify metadata
    console.log('Verifying metadata...');
    const verifyData = await exiftool.read(processedImagePath) as MetadataTags;
    console.log('Verification result:', JSON.stringify(verifyData, null, 2));

    // Log specific fields for verification
    console.log('Verifying written metadata:');
    console.log('IPTC Title (ObjectName):', verifyData.ObjectName);
    console.log('IPTC Headline:', verifyData.Headline);
    console.log('IPTC Description (Caption):', verifyData.Caption);
    console.log('IPTC Keywords:', verifyData.Keywords);
    console.log('XMP Title:', verifyData['XMP-dc:Title']);
    console.log('XMP Description:', verifyData['XMP-dc:Description']);
    console.log('XMP Subject:', verifyData['XMP-dc:Subject']);
    console.log('EXIF DocumentName:', verifyData['EXIF:DocumentName']);
    console.log('EXIF ImageDescription:', verifyData['EXIF:ImageDescription']);

    // Return the relative path for download URL
    return path.join('/processed', file.name);

  } catch (error) {
    console.error('Error processing metadata:', error);
    throw error;
  }
}
