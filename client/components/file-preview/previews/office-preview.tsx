"use client";

import { useState } from "react";
import { FileItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
  AlertCircleIcon,
} from "lucide-react";

interface OfficePreviewProps {
  file: FileItem;
  previewUrl: string;
}

export function OfficePreview({ file, previewUrl }: OfficePreviewProps) {
  const [viewerError, setViewerError] = useState(false);

  const getOfficeType = (mimeType: string, fileName: string) => {
    if (
      mimeType.includes("word") ||
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc")
    ) {
      return { type: "Word Document", icon: "📄", color: "blue" };
    }
    if (
      mimeType.includes("excel") ||
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls")
    ) {
      return { type: "Excel Spreadsheet", icon: "📊", color: "green" };
    }
    if (
      mimeType.includes("powerpoint") ||
      fileName.endsWith(".pptx") ||
      fileName.endsWith(".ppt")
    ) {
      return { type: "PowerPoint Presentation", icon: "📽️", color: "orange" };
    }
    return { type: "Office Document", icon: "📁", color: "gray" };
  };

  const officeInfo = getOfficeType(file.mimeType, file.originalName);

  const openInNewTab = () => {
    window.open(previewUrl, "_blank");
  };

  const downloadFile = () => {
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Office 365 Online Viewer URL
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`;

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{officeInfo.icon}</div>
          <div>
            <h3 className="font-semibold">{file.originalName}</h3>
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className={`bg-${officeInfo.color}-100 text-${officeInfo.color}-800 dark:bg-${officeInfo.color}-900 dark:text-${officeInfo.color}-200`}
              >
                {officeInfo.type}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={openInNewTab}>
            <ExternalLinkIcon className="h-4 w-4 mr-1" />
            Open in New Tab
          </Button>
          <Button variant="outline" size="sm" onClick={downloadFile}>
            <DownloadIcon className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="h-full">
        {!viewerError ? (
          <iframe
            src={officeViewerUrl}
            className="w-full h-full border-0"
            title={file.originalName}
            onError={() => setViewerError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <AlertCircleIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Preview Not Available
              </h3>
              <p className="text-muted-foreground mb-6">
                This Office document cannot be previewed in the browser. You can
                download it to view with Microsoft Office or compatible
                applications.
              </p>

              <div className="space-y-3">
                <Button onClick={downloadFile} className="w-full">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download {officeInfo.type}
                </Button>

                <Button
                  variant="outline"
                  onClick={openInNewTab}
                  className="w-full"
                >
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  Try Opening in New Tab
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium mb-2">Supported Applications:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Microsoft Office (Word, Excel, PowerPoint)</li>
                  <li>• LibreOffice / OpenOffice</li>
                  <li>• Google Workspace (Docs, Sheets, Slides)</li>
                  <li>• Apple iWork (Pages, Numbers, Keynote)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
