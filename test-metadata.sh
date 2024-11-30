#!/bin/bash

# Test image path
IMAGE_PATH="/Users/douzi/Documents/產品文檔/csv寫入圖片metadata/WriteDurectiry/70_24-1122-074.jpg"

# Test metadata
TITLE="Festive Red Holiday Display"
DESCRIPTION="A vibrant red holiday scene featuring two decorated Christmas trees"
KEYWORDS="Christmas, holiday, decorations, red, trees"

# Write metadata
exiftool -overwrite_original \
  -codedcharacterset=utf8 \
  -charset iptc=utf8 \
  -charset filename=utf8 \
  -IPTC:CodedCharacterSet=utf8 \
  "-IPTC:ObjectName=$TITLE" \
  "-IPTC:Caption-Abstract=$DESCRIPTION" \
  "-IPTC:Keywords=$KEYWORDS" \
  "-XMP-dc:Title=$TITLE" \
  "-XMP-dc:Description=$DESCRIPTION" \
  "-XMP-dc:Subject=$KEYWORDS" \
  "-EXIF:ImageDescription=$DESCRIPTION" \
  "-EXIF:DocumentName=$TITLE" \
  "$IMAGE_PATH"

# Verify metadata
exiftool -G -j -n -a "$IMAGE_PATH"
