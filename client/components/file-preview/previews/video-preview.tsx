"use client";

import { useRef } from "react";
import { FileItem } from "@/types";

interface VideoPreviewProps {
  file: FileItem;
  previewUrl: string;
}

export function VideoPreview({ file, previewUrl }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={previewUrl}
        controls
        className="max-w-full max-h-full"
        style={{ outline: "none" }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
