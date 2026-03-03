"use client";

import { useState } from "react";
import { FileUploadZone } from "@/components/file-upload/file-upload-zone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

export default function UploadPage() {
  const [uploadCount, setUploadCount] = useState(0);
  const router = useRouter();

  const handleUploadComplete = (files: any[]) => {
    setUploadCount((prev) => prev + files.length);
  };

  const handleUploadStart = () => {
    // Optional: Show upload started notification
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Upload Files</h1>
          <p className="text-muted-foreground">
            Upload files to your storage space
          </p>
        </div>
      </div>

      {uploadCount > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-800">
              Successfully uploaded {uploadCount} file(s)!
              <Button
                variant="link"
                className="p-0 ml-2 text-green-600"
                onClick={() => router.push("/dashboard/files")}
              >
                View files
              </Button>
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploadZone
            onUploadComplete={handleUploadComplete}
            onUploadStart={handleUploadStart}
            maxFiles={20}
            maxFileSize={100 * 1024 * 1024} // 100MB
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Supported File Types</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Documents: PDF, DOC, DOCX, TXT, RTF</li>
                <li>• Images: JPG, PNG, GIF, SVG, WEBP</li>
                <li>• Videos: MP4, AVI, MOV, WMV</li>
                <li>• Audio: MP3, WAV, FLAC, AAC</li>
                <li>• Archives: ZIP, RAR, 7Z, TAR</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Upload Limits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Maximum file size: 100MB</li>
                <li>• Maximum files per upload: 20</li>
                <li>• Large files (&gt;10MB) use chunked upload</li>
                <li>• Upload progress is tracked in real-time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
