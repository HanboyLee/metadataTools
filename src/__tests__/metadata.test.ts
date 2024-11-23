import { ExifTool } from 'exiftool-vendored';
import { writeMetadataToImages, verifyMetadata, MetadataRecord } from '../utils/metadata';
import { join } from 'path';
import { promises as fs } from 'fs';
import { createCanvas } from 'canvas';

describe('Metadata Writing Tests', () => {
  let exiftool: ExifTool;
  const TEST_DIR = join(process.cwd(), 'test-output');
  const IMAGES_DIR = join(TEST_DIR, 'images');
  const CSV_PATH = join(TEST_DIR, 'metadata.csv');

  beforeAll(async () => {
    exiftool = new ExifTool();
    await fs.mkdir(TEST_DIR, { recursive: true });
    await fs.mkdir(IMAGES_DIR, { recursive: true });
  });

  afterAll(async () => {
    await exiftool.end();
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  beforeEach(async () => {
    // Create a test image using canvas
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 100, 100);
    const buffer = canvas.toBuffer('image/jpeg');
    await fs.writeFile(join(IMAGES_DIR, 'test.jpg'), buffer);

    // Create test CSV file
    const csvContent = `FileName,Title,Description,Keywords
test.jpg,Test Title,Test Description,keyword1,keyword2,keyword3`;
    await fs.writeFile(CSV_PATH, csvContent);
  });

  afterEach(async () => {
    await fs.rm(join(IMAGES_DIR, 'test.jpg'), { force: true });
    await fs.rm(CSV_PATH, { force: true });
  });

  test('should write and verify metadata successfully', async () => {
    const results = await writeMetadataToImages(CSV_PATH, IMAGES_DIR, exiftool);
    expect(results.success).toHaveLength(1);
    expect(results.errors).toHaveLength(0);

    const expectedMetadata: MetadataRecord = {
      FileName: 'test.jpg',
      Title: 'Test Title',
      Description: 'Test Description',
      Keywords: 'keyword1,keyword2,keyword3'
    };

    const verification = await verifyMetadata(
      join(IMAGES_DIR, 'test.jpg'),
      expectedMetadata,
      exiftool
    );

    expect(verification.success).toBe(true);
    expect(verification.errors).toHaveLength(0);
  });

  test('should handle special characters in metadata', async () => {
    const specialCharsCSV = `FileName,Title,Description,Keywords
test.jpg,Title with 特殊字符,Description with 特殊字符 & symbols,keyword1,特殊字符,symbols`;
    await fs.writeFile(CSV_PATH, specialCharsCSV);

    const results = await writeMetadataToImages(CSV_PATH, IMAGES_DIR, exiftool);
    expect(results.success).toHaveLength(1);
    expect(results.errors).toHaveLength(0);

    const expectedMetadata: MetadataRecord = {
      FileName: 'test.jpg',
      Title: 'Title with 特殊字符',
      Description: 'Description with 特殊字符 & symbols',
      Keywords: 'keyword1,特殊字符,symbols'
    };

    const verification = await verifyMetadata(
      join(IMAGES_DIR, 'test.jpg'),
      expectedMetadata,
      exiftool
    );

    expect(verification.success).toBe(true);
    expect(verification.errors).toHaveLength(0);
  });

  test('should handle empty metadata fields', async () => {
    const emptyFieldsCSV = `FileName,Title,Description,Keywords
test.jpg,,Test Description,keyword1`;
    await fs.writeFile(CSV_PATH, emptyFieldsCSV);

    const results = await writeMetadataToImages(CSV_PATH, IMAGES_DIR, exiftool);
    expect(results.success).toHaveLength(1);
    expect(results.errors).toHaveLength(0);

    const expectedMetadata: MetadataRecord = {
      FileName: 'test.jpg',
      Title: '',
      Description: 'Test Description',
      Keywords: 'keyword1'
    };

    const verification = await verifyMetadata(
      join(IMAGES_DIR, 'test.jpg'),
      expectedMetadata,
      exiftool
    );

    expect(verification.success).toBe(true);
    expect(verification.errors).toHaveLength(0);
  });

  test('should handle missing image files', async () => {
    const missingImageCSV = `FileName,Title,Description,Keywords
missing.jpg,Test Title,Test Description,keyword1`;
    await fs.writeFile(CSV_PATH, missingImageCSV);

    const results = await writeMetadataToImages(CSV_PATH, IMAGES_DIR, exiftool);
    expect(results.success).toHaveLength(0);
    expect(results.errors).toHaveLength(1);
    expect(results.errors[0].file).toBe('missing.jpg');
  });
});
