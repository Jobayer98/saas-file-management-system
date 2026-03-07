"use client";

import { FileItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DownloadIcon,
  FileIcon,
  InfoIcon,
  ExternalLinkIcon,
} from "lucide-react";

interface DefaultPreviewProps {
  file: FileItem;
}

export function DefaultPreview({ file }: DefaultPreviewProps) {
  const downloadFile = () => {
    // This would typically trigger the download
    const link = document.createElement("a");
    link.href = `/api/files/${file.id}/download`;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileTypeInfo = (mimeType: string, fileName: string) => {
    const extension = fileName.toLowerCase().split(".").pop() || "";

    const fileTypes: Record<
      string,
      { name: string; icon: string; color: string; description: string }
    > = {
      // Documents
      pdf: {
        name: "PDF Document",
        icon: "📄",
        color: "red",
        description: "Portable Document Format",
      },
      doc: {
        name: "Word Document",
        icon: "📝",
        color: "blue",
        description: "Microsoft Word Document",
      },
      docx: {
        name: "Word Document",
        icon: "📝",
        color: "blue",
        description: "Microsoft Word Document",
      },
      xls: {
        name: "Excel Spreadsheet",
        icon: "📊",
        color: "green",
        description: "Microsoft Excel Spreadsheet",
      },
      xlsx: {
        name: "Excel Spreadsheet",
        icon: "📊",
        color: "green",
        description: "Microsoft Excel Spreadsheet",
      },
      ppt: {
        name: "PowerPoint",
        icon: "📽️",
        color: "orange",
        description: "Microsoft PowerPoint Presentation",
      },
      pptx: {
        name: "PowerPoint",
        icon: "📽️",
        color: "orange",
        description: "Microsoft PowerPoint Presentation",
      },

      // Images
      jpg: {
        name: "JPEG Image",
        icon: "🖼️",
        color: "purple",
        description: "Joint Photographic Experts Group",
      },
      jpeg: {
        name: "JPEG Image",
        icon: "🖼️",
        color: "purple",
        description: "Joint Photographic Experts Group",
      },
      png: {
        name: "PNG Image",
        icon: "🖼️",
        color: "purple",
        description: "Portable Network Graphics",
      },
      gif: {
        name: "GIF Image",
        icon: "🎞️",
        color: "purple",
        description: "Graphics Interchange Format",
      },
      svg: {
        name: "SVG Image",
        icon: "🎨",
        color: "purple",
        description: "Scalable Vector Graphics",
      },
      webp: {
        name: "WebP Image",
        icon: "🖼️",
        color: "purple",
        description: "Web Picture Format",
      },

      // Videos
      mp4: {
        name: "MP4 Video",
        icon: "🎬",
        color: "red",
        description: "MPEG-4 Video",
      },
      avi: {
        name: "AVI Video",
        icon: "🎬",
        color: "red",
        description: "Audio Video Interleave",
      },
      mov: {
        name: "QuickTime Video",
        icon: "🎬",
        color: "red",
        description: "QuickTime Movie",
      },
      wmv: {
        name: "WMV Video",
        icon: "🎬",
        color: "red",
        description: "Windows Media Video",
      },

      // Audio
      mp3: {
        name: "MP3 Audio",
        icon: "🎵",
        color: "green",
        description: "MPEG Audio Layer III",
      },
      wav: {
        name: "WAV Audio",
        icon: "🎵",
        color: "green",
        description: "Waveform Audio File",
      },
      flac: {
        name: "FLAC Audio",
        icon: "🎵",
        color: "green",
        description: "Free Lossless Audio Codec",
      },
      aac: {
        name: "AAC Audio",
        icon: "🎵",
        color: "green",
        description: "Advanced Audio Coding",
      },

      // Archives
      zip: {
        name: "ZIP Archive",
        icon: "🗜️",
        color: "yellow",
        description: "ZIP Compressed Archive",
      },
      rar: {
        name: "RAR Archive",
        icon: "📦",
        color: "yellow",
        description: "RAR Compressed Archive",
      },
      "7z": {
        name: "7-Zip Archive",
        icon: "📚",
        color: "yellow",
        description: "7-Zip Compressed Archive",
      },
      tar: {
        name: "TAR Archive",
        icon: "📋",
        color: "yellow",
        description: "Tape Archive",
      },

      // Code
      js: {
        name: "JavaScript",
        icon: "⚡",
        color: "yellow",
        description: "JavaScript Source Code",
      },
      ts: {
        name: "TypeScript",
        icon: "🔷",
        color: "blue",
        description: "TypeScript Source Code",
      },
      py: {
        name: "Python",
        icon: "🐍",
        color: "green",
        description: "Python Source Code",
      },
      java: {
        name: "Java",
        icon: "☕",
        color: "orange",
        description: "Java Source Code",
      },
      cpp: {
        name: "C++",
        icon: "⚙️",
        color: "blue",
        description: "C++ Source Code",
      },
      css: {
        name: "CSS",
        icon: "🎨",
        color: "blue",
        description: "Cascading Style Sheets",
      },
      html: {
        name: "HTML",
        icon: "🌐",
        color: "orange",
        description: "HyperText Markup Language",
      },

      // Text
      txt: {
        name: "Text File",
        icon: "📄",
        color: "gray",
        description: "Plain Text File",
      },
      md: {
        name: "Markdown",
        icon: "📝",
        color: "gray",
        description: "Markdown Document",
      },
      json: {
        name: "JSON",
        icon: "📋",
        color: "green",
        description: "JavaScript Object Notation",
      },
      xml: {
        name: "XML",
        icon: "📋",
        color: "orange",
        description: "Extensible Markup Language",
      },
    };

    return (
      fileTypes[extension] || {
        name: "Unknown File",
        icon: "📄",
        color: "gray",
        description: mimeType || "Unknown file type",
      }
    );
  };

  const fileInfo = getFileTypeInfo(file.mimeType, file.originalName);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-auto p-8">
        {/* File Icon */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">{fileInfo.icon}</div>
          <h2 className="text-2xl font-bold mb-2">{file.originalName}</h2>
          <Badge
            variant="secondary"
            className={`bg-${fileInfo.color}-100 text-${fileInfo.color}-800 dark:bg-${fileInfo.color}-900 dark:text-${fileInfo.color}-200 mb-2`}
          >
            {fileInfo.name}
          </Badge>
          <p className="text-muted-foreground text-sm">
            {fileInfo.description}
          </p>
        </div>

        {/* File Details */}
        <div className="space-y-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <h3 className="font-semibold mb-3 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2" />
              File Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium">{formatFileSize(file.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{file.mimeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {formatDate(file.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modified:</span>
                <span className="font-medium">
                  {formatDate(file.updatedAt)}
                </span>
              </div>
              {file.version > 1 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-medium">v{file.version}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={downloadFile} className="w-full" size="lg">
            <DownloadIcon className="h-5 w-5 mr-2" />
            Download File
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              window.open(`/api/files/${file.id}/download`, "_blank")
            }
          >
            <ExternalLinkIcon className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
        </div>

        {/* Preview Note */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Preview not available:</strong> This file type cannot be
            previewed in the browser. Download the file to view it with the
            appropriate application.
          </p>
        </div>
      </div>
    </div>
  );
}
