"use client";

import { useState, useEffect } from "react";
import { FileItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CopyIcon,
  DownloadIcon,
  WrapTextIcon,
  TypeIcon,
  HashIcon,
} from "lucide-react";
import { toast } from "sonner";

interface CodePreviewProps {
  file: FileItem;
  previewUrl: string;
  type: string;
}

export function CodePreview({ file, previewUrl, type }: CodePreviewProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wordWrap, setWordWrap] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
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
      toast.success("Code copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  const toggleWordWrap = () => {
    setWordWrap(!wordWrap);
  };

  const toggleLineNumbers = () => {
    setShowLineNumbers(!showLineNumbers);
  };

  const adjustFontSize = (delta: number) => {
    setFontSize((prev) => Math.max(10, Math.min(24, prev + delta)));
  };

  const getLanguageFromFileName = (fileName: string) => {
    const extension = fileName.toLowerCase().split(".").pop();
    const languageMap: Record<string, string> = {
      js: "JavaScript",
      jsx: "React JSX",
      ts: "TypeScript",
      tsx: "React TSX",
      py: "Python",
      java: "Java",
      cpp: "C++",
      c: "C",
      h: "C Header",
      css: "CSS",
      scss: "SCSS",
      sass: "Sass",
      less: "Less",
      html: "HTML",
      htm: "HTML",
      xml: "XML",
      json: "JSON",
      yaml: "YAML",
      yml: "YAML",
      md: "Markdown",
      sql: "SQL",
      sh: "Shell Script",
      bat: "Batch",
      ps1: "PowerShell",
      php: "PHP",
      rb: "Ruby",
      go: "Go",
      rs: "Rust",
      swift: "Swift",
      kt: "Kotlin",
      scala: "Scala",
      r: "R",
      m: "Objective-C",
    };

    return languageMap[extension || ""] || "Code";
  };

  const language = getLanguageFromFileName(file.originalName);
  const lines = content.split("\n");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading code...</span>
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
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            {language}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {lines.length} lines • {content.length} characters
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
            onClick={toggleLineNumbers}
            className={showLineNumbers ? "bg-muted" : ""}
          >
            <HashIcon className="h-4 w-4" />
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

      {/* Code Content */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Line Numbers */}
          {showLineNumbers && (
            <div className="bg-gray-100 dark:bg-gray-800 border-r px-3 py-4 text-right select-none">
              <div
                className="font-mono text-xs leading-relaxed text-muted-foreground"
                style={{ fontSize: `${fontSize}px` }}
              >
                {lines.map((_, index) => (
                  <div key={index} className="h-6">
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code */}
          <div className="flex-1">
            <pre
              className={`p-4 font-mono leading-relaxed ${
                wordWrap ? "whitespace-pre-wrap" : "whitespace-pre"
              }`}
              style={{ fontSize: `${fontSize}px` }}
            >
              <code className="text-gray-800 dark:text-gray-200">
                {content}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50 dark:bg-gray-800 text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Encoding: UTF-8</span>
          <span>Size: {formatFileSize(file.size)}</span>
          <span>Language: {language}</span>
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
