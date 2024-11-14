"use client";

import React, { useState, useRef } from "react";
import { cn, convertFileToUrl, getFileType, MAX_FILE_SIZE } from "@/utils/utils";
import Image from "next/image";
import { toast } from "sonner";
import Thumbnail from "./Thumbnail";

interface FileWithProgress {
  name: string;
  type: string;
  extension: string;
  url: string;
}

const FileUploader = ({ className }: { className?: string }) => {
  const [file, setFile] = useState<FileWithProgress | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // Ref to hold the XMLHttpRequest instance
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;

    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error(`${selectedFile.name} is too large. Max file size is 50MB.`);
      return;
    }

    const { type, extension } = getFileType(selectedFile.name);
    const fileMetadata: FileWithProgress = {
      name: selectedFile.name,
      type,
      extension,
      url: convertFileToUrl(selectedFile),
    };

    setFile(fileMetadata);
    setProgress(0);

    await uploadFileWithProgress(selectedFile);
  };

  const uploadFileWithProgress = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    // Create a new XMLHttpRequest instance and store it in ref
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.open("POST", "https://media-storage.taqiy.com/api/v1/media/add-media", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        setFile(null);
        setProgress(0);
        toast.success(`Successfully uploaded ${file.name}!`);
      } else {
        toast.error(`Failed to upload ${file.name}. Please try again.`);
      }
      xhrRef.current = null; // Clear xhr reference on completion
    };

    xhr.onerror = () => {
      toast.error(`Failed to upload ${file.name}. Please try again.`);
      xhrRef.current = null; // Clear xhr reference on error
    };

    xhr.send(formData);
  };

  const handleRemoveFile = () => {
    // If there's an ongoing upload, abort it
    if (xhrRef.current) {
      xhrRef.current.abort();
      toast.info(`Upload of ${file?.name} canceled.`);
    }
    setFile(null);
    setProgress(0);
  };

  return (
    <div className={cn("file-uploader", className)}>
      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="fileInput"
      />
      <label
        htmlFor="fileInput"
        className="uploader-button flex items-center gap-2 cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        <Image
          src="/assets/icons/upload.svg"
          alt="upload"
          width={24}
          height={24}
        />
        <p>Upload</p>
      </label>

      {file && (
        <div className="uploader-preview-list mt-4 p-4 border rounded-lg bg-cyan-950 text-white shadow-md">
          <h4 className="text-gray-100 font-semibold mb-2">Uploading</h4>
          <div className="uploader-preview-item flex items-center gap-3">
            <Thumbnail type={file.type} extension={file.extension} url={file.url} />
            <div className="flex flex-col min-w-[300px] max-w-[350px]">
              <span className="text-gray-200 font-medium">{file.name.slice(0, 30)}</span>
              <div className="relative w-full h-2 mt-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full ${progress === 100 ? "bg-green-500" : "bg-blue-500"
                    } transition-all duration-300`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {progress === 100 && (
                <div className="flex items-center gap-2 text-green-600 mt-1">
                  <Image
                    src="/assets/icons/success.svg"
                    width={16}
                    height={16}
                    alt="Uploaded"
                  />
                  <span className="text-sm">Upload Complete</span>
                </div>
              )}
            </div>
            <button onClick={handleRemoveFile} className="ml-auto">
              <Image
                src="/assets/icons/close.svg"
                width={24}
                height={24}
                alt="Remove"
                className="cursor-pointer hover:text-red-500 transition-all"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
