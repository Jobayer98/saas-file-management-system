/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format file types array for display
 */
export function formatFileTypes(allowedTypes: string[]): string[] {
  if (allowedTypes.includes('*')) {
    return [
      'Documents: PDF, DOC, DOCX, TXT, RTF, XLS, XLSX, PPT, PPTX',
      'Images: JPG, JPEG, PNG, GIF, SVG, WEBP, BMP, TIFF',
      'Videos: MP4, AVI, MOV, WMV, FLV, MKV, WEBM',
      'Audio: MP3, WAV, FLAC, AAC, OGG, M4A',
      'Archives: ZIP, RAR, 7Z, TAR, GZ',
      'Code: JS, TS, HTML, CSS, JSON, XML, SQL',
      'And many more file types...'
    ];
  }

  // Group common file types
  const typeGroups: Record<string, string[]> = {
    'Documents': ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'],
    'Images': ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'tiff'],
    'Videos': ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
    'Audio': ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
    'Archives': ['zip', 'rar', '7z', 'tar', 'gz'],
    'Code': ['js', 'ts', 'html', 'css', 'json', 'xml', 'sql']
  };

  const result: string[] = [];
  const normalizedTypes = allowedTypes.map(type => type.toLowerCase().replace('.', ''));

  Object.entries(typeGroups).forEach(([groupName, extensions]) => {
    const matchedTypes = extensions.filter(ext => normalizedTypes.includes(ext));
    if (matchedTypes.length > 0) {
      result.push(`${groupName}: ${matchedTypes.map(ext => ext.toUpperCase()).join(', ')}`);
    }
  });

  // Add any remaining types that don't fit in groups
  const ungroupedTypes = normalizedTypes.filter(type => 
    !Object.values(typeGroups).flat().includes(type)
  );
  if (ungroupedTypes.length > 0) {
    result.push(`Other: ${ungroupedTypes.map(ext => ext.toUpperCase()).join(', ')}`);
  }

  return result.length > 0 ? result : ['No file type restrictions'];
}

/**
 * Calculate remaining storage
 */
export function calculateRemainingStorage(totalLimit: string | number, currentUsage: string | number): number {
  const total = typeof totalLimit === 'string' ? parseInt(totalLimit) : totalLimit;
  const used = typeof currentUsage === 'string' ? parseInt(currentUsage) : currentUsage;
  return Math.max(0, total - used);
}