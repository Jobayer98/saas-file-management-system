"use client";

import { useState } from "react";
import { FileItem } from "@/types";
import { Button } from "@/components/ui/button";
import { ZoomInIcon, ZoomOutIcon, RotateCwIcon } from "lucide-react";

interface ImagePreviewProps {
  file: FileItem;
  previewUrl: string;
}

export function ImagePreview({ file, previewUrl }: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      {/* Controls Overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/60 backdrop-blur-sm rounded-lg p-2 flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={handleZoomOut} className="text-white hover:bg-white/20">
          <ZoomOutIcon className="h-4 w-4" />
        </Button>
        <span className="text-sm text-white min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button variant="ghost" size="icon" onClick={handleZoomIn} className="text-white hover:bg-white/20">
          <ZoomInIcon className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-white/20" />
        <Button variant="ghost" size="icon" onClick={handleRotate} className="text-white hover:bg-white/20">
          <RotateCwIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-white hover:bg-white/20">
          Reset
        </Button>
      </div>

      {/* Image */}
      <img
        src={previewUrl}
        alt={file.originalName}
        className="max-w-full max-h-full object-contain select-none"
        style={{
          transform: `scale(${zoom}) rotate(${rotation}deg)`,
          transition: "transform 0.2s ease-out",
        }}
        draggable={false}
      />
    </div>
  );
}
