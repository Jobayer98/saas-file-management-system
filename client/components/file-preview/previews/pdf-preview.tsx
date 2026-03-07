"use client";

import { FileItem } from "@/types";
import { ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfPreviewProps {
  file: FileItem;
  previewUrl: string;
}

export function PdfPreview({ file, previewUrl }: PdfPreviewProps) {
  // For Cloudinary PDFs, we need to use Google Docs Viewer or direct link
  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`;

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center">
      <iframe
        src={googleDocsUrl}
        className="w-full h-full border-none"
        title={file.originalName}
      />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(previewUrl, '_blank')}
          className="bg-black/60 backdrop-blur-sm text-white border-white/20 hover:bg-black/80"
        >
          <ExternalLinkIcon className="h-4 w-4 mr-2" />
          Open in New Tab
        </Button>
      </div>
    </div>
  );
}
