"use client";

import { useState, useEffect } from "react";
import { FileItem } from "@/types";
import { fileService } from "@/lib/api/services";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DownloadIcon,
  ShareIcon,
  StarIcon,
  XIcon,
  AlertCircleIcon,
  LoaderIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ImagePreview,
  VideoPreview,
  PdfPreview,
  DefaultPreview,
} from "./previews";

interface FilePreviewModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onFileUpdate?: (file: FileItem) => void;
}

export function FilePreviewModal({
  file,
  isOpen,
  onClose,
  onFileUpdate,
}: FilePreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file && isOpen) {
      loadPreview();
    } else {
      setPreviewUrl("");
      setError(null);
    }
  }, [file, isOpen]);

  const loadPreview = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      const preview = await fileService.getPreviewUrl(file.id);
      setPreviewUrl(preview.previewUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preview");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file) return;
    try {
      const blob = await fileService.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("File downloaded");
    } catch {
      toast.error("Download failed");
    }
  };

  const handleToggleFavorite = async () => {
    if (!file) return;
    try {
      await fileService.toggleFavorite(file.id, !file.isFavorite);
      onFileUpdate?.({ ...file, isFavorite: !file.isFavorite });
      toast.success(file.isFavorite ? "Removed from favorites" : "Added to favorites");
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleShare = async () => {
    if (!file) return;
    try {
      const shareLink = await fileService.shareFile(file.id);
      await navigator.clipboard.writeText(shareLink.shareLink);
      toast.success("Link copied");
    } catch {
      toast.error("Share failed");
    }
  };

  const renderPreview = () => {
    if (!file || !previewUrl) return null;

    if (file.mimeType.startsWith("image/")) {
      return <ImagePreview file={file} previewUrl={previewUrl} />;
    }
    if (file.mimeType.startsWith("video/")) {
      return <VideoPreview file={file} previewUrl={previewUrl} />;
    }
    if (file.mimeType === "application/pdf") {
      return <PdfPreview file={file} previewUrl={previewUrl} />;
    }
    return <DefaultPreview file={file} />;
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-[98vw] w-full h-[90vh] p-0 bg-black border-none">
        <div className="absolute top-0 left-0 right-0 z-50 bg-linear-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-white">
              <h2 className="text-lg font-medium truncate max-w-md">{file.originalName}</h2>
              {file.isFavorite && <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={handleToggleFavorite} className="text-white hover:bg-white/20">
                <StarIcon className={cn("h-5 w-5", file.isFavorite && "text-yellow-400 fill-current")} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare} className="text-white hover:bg-white/20">
                <ShareIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDownload} className="text-white hover:bg-white/20">
                <DownloadIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                <XIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full h-full">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <LoaderIcon className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircleIcon className="h-12 w-12 text-white/70 mx-auto mb-4" />
                <p className="text-white/70 mb-4">{error}</p>
                <Button onClick={loadPreview} variant="outline" className="text-white border-white/20">
                  Try Again
                </Button>
              </div>
            </div>
          )}
          {!loading && !error && renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
