#!/bin/bash

# Test image path
IMAGE_DIR="/Users/douzi/Documents/產品文檔/csv寫入圖片metadata/WriteDurectiry"
CSV_FILE="/Users/douzi/Documents/產品文檔/csv寫入圖片metadata/test.csv"

# Read CSV file (skip header)
tail -n +2 "$CSV_FILE" | while IFS=, read -r filename title description keywords; do
  # Remove quotes if present
  filename=$(echo "$filename" | tr -d '"')
  title=$(echo "$title" | tr -d '"')
  description=$(echo "$description" | tr -d '"')
  keywords=$(echo "$keywords" | tr -d '"')
  
  image_path="$IMAGE_DIR/$filename"
  
  echo "Processing: $filename"
  echo "Title: $title"
  echo "Description: $description"
  echo "Keywords: $keywords"
  echo "Image path: $image_path"
  
  # Write metadata
  exiftool -overwrite_original \
    -codedcharacterset=utf8 \
    -charset iptc=utf8 \
    -charset filename=utf8 \
    -IPTC:CodedCharacterSet=utf8 \
    "-IPTC:ObjectName=$title" \
    "-IPTC:Caption-Abstract=$description" \
    "-IPTC:Keywords=$keywords" \
    "-XMP-dc:Title=$title" \
    "-XMP-dc:Description=$description" \
    "-XMP-dc:Subject=$keywords" \
    "-EXIF:ImageDescription=$description" \
    "-EXIF:DocumentName=$title" \
    "$image_path"
    
  # Verify metadata
  echo "Verifying metadata:"
  exiftool -G -j -n -a "$image_path"
  echo "-----------------------------------"
done
