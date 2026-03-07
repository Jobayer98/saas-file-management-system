"use client";

import { useState, useEffect } from "react";
import { FileItem } from "@/types";
import { Button } from "@/components/ui/button";
import {
  ZoomInIcon,
  ZoomOutIcon,
  DownloadIcon,
  ExternalLinkIcon,
  AlertCircleIcon,
  LoaderIcon,
} from "lucide-react";

interface PdfPreviewSimpleProps {
  file: FileItem;
  previewUrl: string;
}

export function PdfPreviewSimple({ file, previewUrl }: PdfPreviewSimpleProps) {
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    console.log("PDF Preview URL:", previewUrl);

    // Set a timeout to hide loading state
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [previewUrl]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
  };

  const openInNewTab = () => {
    window.open(previewUrl, "_blank");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = file.originalName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="h-full bg-gray-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 w-8 p-0"
          >
            <ZoomOutIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 w-8 p-0"
          >
            <ZoomInIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-3 text-xs"
          >
            Reset
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-8 px-3 text-xs"
          >
            <DownloadIcon className="h-3 w-3 mr-1.5" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            className="h-8 px-3 text-xs"
          >
            <ExternalLinkIcon className="h-3 w-3 mr-1.5" />
            Open in New Tab
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="h-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <LoaderIcon className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
              <span className="text-sm text-gray-500">Loading PDF...</span>
            </div>
          </div>
        )}

        {/* Primary PDF Viewer - Object Embed */}
        <div
          className="h-full"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
          }}
        >
          <object
            data={previewUrl}
            type="application/pdf"
            className="w-full h-full"
            onLoad={() => {
              console.log("PDF object loaded");
              setLoading(false);
            }}
            onError={() => {
              console.log("PDF object failed to load");
              setError(true);
              setLoading(false);
            }}
          >
            {/* Fallback iframe */}
            <iframe
              src={`${previewUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              className="w-full h-full border-0"
              title={file.originalName}
              onLoad={() => {
                console.log("PDF iframe fallback loaded");
                setLoading(false);
              }}
              onError={() => {
                console.log("PDF iframe fallback failed");
                setError(true);
                setLoading(false);
              }}
            />

            {/* Final fallback message */}
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md p-8">
                <AlertCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  PDF Preview Not Available
                </h3>
                <p className="text-gray-600 mb-6">
                  Your browser doesn't support PDF preview. You can download the
                  file or open it in a new tab.
                </p>

                <div className="space-y-3">
                  <Button onClick={handleDownload} className="w-full">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>

                  <Button
                    variant="outline"
                    onClick={openInNewTab}
                    className="w-full"
                  >
                    <ExternalLinkIcon className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2 text-gray-900">
                    PDF Information:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• File: {file.originalName}</li>
                    <li>• Size: {formatFileSize(file.size)}</li>
                    <li>• Type: {file.mimeType}</li>
                  </ul>
                </div>
              </div>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
}
