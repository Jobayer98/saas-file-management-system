"use client";

import { useState, useEffect } from "react";
import { FileItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyIcon, DownloadIcon, WrapTextIcon, TypeIcon } from "lucide-react";
import { toast } from "sonner";

interface TextPreviewProps {
  file: FileItem;
  previewUrl: string;
  type: string;
}

export function TextPreview({ file, previewUrl, type }: TextPreviewProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wordWrap, setWordWrap] = useState(true);
  const [fontSize, setFontSize] = useState(14);

  useEffect(() => {
    loadContent();
  }, [previewUrl]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(previewUrl);
      if (!response.ok) {
        throw new Error("Failed to load file content");
      }
      const text = await response.text();
      setContent(text);
    } catch (err: any) {
      setError(err.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Content copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy content");
    }
  };

  const toggleWordWrap = () => {
    setWordWrap(!wordWrap);
  };

  const adjustFontSize = (delta: number) => {
    setFontSize((prev) => Math.max(10, Math.min(24, prev + delta)));
  };

  const getLanguageFromMimeType = (mimeType: string, fileName: string) => {
    if (mimeType.includes("json")) return "json";
    if (mimeType.includes("xml")) return "xml";
    if (mimeType.includes("html")) return "html";
    if (mimeType.includes("css")) return "css";
    if (mimeType.includes("javascript")) return "javascript";

    const extension = fileName.toLowerCase().split(".").pop();
    switch (extension) {
      case "md":
        return "markdown";
      case "py":
        return "python";
      case "js":
        return "javascript";
      case "ts":
        return "typescript";
      case "jsx":
        return "jsx";
      case "tsx":
        return "tsx";
      case "css":
        return "css";
      case "html":
        return "html";
      case "json":
        return "json";
      case "xml":
        return "xml";
      case "yaml":
      case "yml":
        return "yaml";
      case "sql":
        return "sql";
      default:
        return "text";
    }
  };

  const language = getLanguageFromMimeType(file.mimeType, file.originalName);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading content...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadContent} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{language}</Badge>
          <span className="text-sm text-muted-foreground">
            {content.split("\n").length} lines • {content.length} characters
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => adjustFontSize(-2)}>
            A-
          </Button>
          <span className="text-sm font-medium min-w-[40px] text-center">
            {fontSize}px
          </span>
          <Button variant="ghost" size="sm" onClick={() => adjustFontSize(2)}>
            A+
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleWordWrap}
            className={wordWrap ? "bg-muted" : ""}
          >
            <WrapTextIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <CopyIcon className="h-4 w-4 mr-1" />
            Copy
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <pre
          className={`p-4 text-sm font-mono leading-relaxed ${
            wordWrap ? "whitespace-pre-wrap" : "whitespace-pre"
          }`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {content}
        </pre>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50 dark:bg-gray-800 text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Encoding: UTF-8</span>
          <span>Size: {formatFileSize(file.size)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <TypeIcon className="h-3 w-3" />
          <span>{file.mimeType}</span>
        </div>
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
