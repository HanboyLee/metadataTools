"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMetadataFile = processMetadataFile;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const exiftool_vendored_1 = require("exiftool-vendored");
async function processMetadataFile(file, metadata) {
    try {
        console.log('Processing file:', file.name);
        console.log('Received metadata:', JSON.stringify(metadata, null, 2));
        // Get the directory paths
        const originalImagesDir = path_1.default.join(process.cwd(), 'public', 'images');
        const processedImagesDir = path_1.default.join(process.cwd(), 'public', 'processed');
        // Ensure processed directory exists
        await fs_1.promises.mkdir(processedImagesDir, { recursive: true });
        const originalImagePath = path_1.default.join(originalImagesDir, file.name);
        const processedImagePath = path_1.default.join(processedImagesDir, file.name);
        // Check if original image exists
        try {
            await fs_1.promises.access(originalImagePath);
            console.log('Found original image at:', originalImagePath);
        }
        catch (error) {
            console.error('Original image not found:', originalImagePath);
            throw new Error(`Original image not found: ${file.name}`);
        }
        // Copy the original image to processed directory
        await fs_1.promises.copyFile(originalImagePath, processedImagePath);
        console.log('Copied image to:', processedImagePath);
        // Process keywords
        const keywords = metadata.keywords
            .split(/[,;]/)
            .map(k => k.trim())
            .filter(Boolean);
        // Prepare metadata using correct IPTC tags
        const tags = {
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
        await exiftool_vendored_1.exiftool.write(processedImagePath, tags, [
            '-overwrite_original',
            '-codedcharacterset=utf8',
            '-charset',
            'iptc=utf8'
        ]);
        // Verify metadata
        console.log('Verifying metadata...');
        const verifyData = await exiftool_vendored_1.exiftool.read(processedImagePath);
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
        console.log('EXIF DocumentName:', verifyData.DocumentName);
        console.log('EXIF ImageDescription:', verifyData.ImageDescription);
        // Return the relative path for download URL
        return path_1.default.join('/processed', file.name);
    }
    catch (error) {
        console.error('Error processing metadata:', error);
        throw error;
    }
}
