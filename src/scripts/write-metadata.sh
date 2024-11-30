#!/bin/bash

IMAGE_PATH="$1"
TITLE="$2"
DESCRIPTION="$3"
KEYWORDS="$4"

# Set character encoding
exiftool -overwrite_original \
  -codedcharacterset=utf8 \
  -charset iptc=utf8 \
  -charset filename=utf8 \
  "$IMAGE_PATH"

# Write metadata
exiftool -overwrite_original \
  -m \
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
