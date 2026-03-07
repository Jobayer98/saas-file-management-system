"use client";

import { useState, useEffect, useRef } from "react";
import { FileItem } from "@/types";
import { Button } from "@/components/ui/button";
import {
  ZoomInIcon,
  ZoomOutIcon,
  DownloadIcon,
  ExternalLinkIcon,
  AlertCircleIcon,
  LoaderIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

interface PdfPreviewAdvancedProps {
  file: FileItem;
  previewUrl: string;
}

export function PdfPreviewAdvanced({
  file,
  previewUrl,
}: PdfPreviewAdvancedProps) {
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  useEffect(() => {
    loadPdf();
  }, [previewUrl]);

  const loadPdf = async () => {
    try {
      setLoading(true);
      setError(false);

      // Check if PDF.js is available
      if (typeof window !== "undefined" && (window as any).pdfjsLib) {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        const pdf = await pdfjsLib.getDocument(previewUrl).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        renderPage(1, pdf);
      } else {
        // Fallback to iframe if PDF.js is not available
        setError(true);
      }
    } catch (err) {
      console.error("Error loading PDF:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (pageNum: number, pdf?: any) => {
    const pdfDocument = pdf || pdfDoc;
    if (!pdfDocument || !canvasRef.current) return;

    try {
      const page = await pdfDocument.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      const viewport = page.getViewport({ scale: zoom });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      setCurrentPage(pageNum);
    } catch (err) {
      console.error("Error rendering page:", err);
      setError(true);
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 3);
    setZoom(newZoom);
    if (pdfDoc) renderPage(currentPage);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.5);
    setZoom(newZoom);
    if (pdfDoc) renderPage(currentPage);
  };

  const handleReset = () => {
    setZoom(1);
    if (pdfDoc) renderPage(currentPage);
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages && pdfDoc) {
      renderPage(pageNum);
    }
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

  // Load PDF.js script if not already loaded
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).pdfjsLib) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => loadPdf();
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="h-full bg-gray-100">
      {/* Toolbar - Cloudinary Style */}
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

          {/* Page Navigation */}
          {totalPages > 0 && (
            <>
              <div className="w-px h-6 bg-border" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[80px] text-center">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </>
          )}
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
      <div className="h-full overflow-auto relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <LoaderIcon className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
              <span className="text-sm text-gray-500">Loading PDF...</span>
            </div>
          </div>
        )}

        {error ? (
          // Error/Fallback View with iframe
          <div className="h-full">
            <div className="flex justify-center p-4 h-full">
              <div className="w-full max-w-4xl">
                <iframe
                  src={`${previewUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                  className="w-full h-full border border-gray-300 shadow-lg rounded-lg"
                  title={file.originalName}
                  onError={() => {
                    // If iframe also fails, show the fallback message
                  }}
                />
              </div>
            </div>

            {/* Fallback message if iframe also fails */}
            <div
              className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm"
              style={{ display: "none" }}
            >
              <div className="text-center max-w-md p-8">
                <AlertCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  PDF Preview Not Available
                </h3>
                <p className="text-gray-600 mb-6">
                  This PDF cannot be previewed in the browser. You can download
                  it or open it in a new tab to view the content.
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
          </div>
        ) : (
          // Canvas PDF Viewer
          <div className="flex justify-center p-4">
            <div className="border border-gray-300 shadow-lg rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto"
                style={{
                  display: pdfDoc ? "block" : "none",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
