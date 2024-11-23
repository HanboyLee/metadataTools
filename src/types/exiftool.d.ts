import { Tags as ExifToolTags } from 'exiftool-vendored';

type XMPLangAlt = {
  'x-default': string;
};

declare module 'exiftool-vendored' {
  interface Tags extends ExifToolTags {
    'IFD0:DocumentName'?: string;
    'IPTC:ObjectName'?: string;
    'IPTC:Caption-Abstract'?: string;
    'IPTC:Keywords'?: string[];
    'IPTC:CodedCharacterSet'?: string;
    'XMP-dc:Title'?: XMPLangAlt;
    'XMP-dc:Description'?: XMPLangAlt;
    'XMP-dc:Subject'?: string[];
  }
}
