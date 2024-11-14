"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/separator";
import axios from "axios";
import useSWR from "swr";
import Thumbnail from "@/components/Thumbnail";
import Image from "next/image";
import { formatBytes, getFileType } from "@/utils/utils";
import { toast } from "sonner";

// Define the file data type
interface FileData {
  _id: string;
  fileType: string;
  filename: string;
  path: string;
  fileSize: number;
  createdAt: string;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const Page = () => {
  const pathname = usePathname();
  const { data, mutate } = useSWR("https://media-storage.taqiy.com/api/v1/media", fetcher);

  const documentExtensions = ["doc", "docx", "xls", "xlsx", "pdf"];
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
  const mediaExtensions = ["mp4", "m4a", "avi", "mov", "mkv", "mp3", "wav", "aac"];

  const [filteredData, setFilteredData] = useState<FileData[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null); // For file preview modal

  useEffect(() => {
    if (!data?.data) return;

    const filterDataByPath = () => {
      switch (pathname) {
        case "/documents":
          return data.data.filter(
            (item: FileData) => documentExtensions.includes(item.fileType.split("/")[1])
          );
        case "/images":
          return data.data.filter(
            (item: FileData) => imageExtensions.includes(item.fileType.split("/")[1])
          );
        case "/media":
          return data.data.filter(
            (item: FileData) => mediaExtensions.includes(item.fileType.split("/")[1])
          );
        case "/others":
          return data.data.filter((item: FileData) => {
            const fileExtension = item.fileType.split("/")[1];
            return (
              !documentExtensions.includes(fileExtension) &&
              !imageExtensions.includes(fileExtension) &&
              !mediaExtensions.includes(fileExtension)
            );
          });
        default:
          return [];
      }
    };

    setFilteredData(filterDataByPath());
  }, [pathname, data]);

  const handlePreview = (file: FileData) => {
    setSelectedFile(file);
  };

  const handleFileLoad = () => {
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this file?");
    if (isConfirmed) {
      try {
        await axios.delete(`https://media-storage.taqiy.com/api/v1/media/${id}`);
        mutate(); // Re-fetch data after deletion
        toast.success("File deleted successfully!");
      } catch (error) {
        toast.error(`"Failed to delete file:", ${error}`);
      }
    }
  };

  const closeModal = () => {
    setSelectedFile(null);
  };

  return (
    <div className="page-container">
      <section className="w-full py-7">
        <div className="total-size-section">
          <h1 className="h1 capitalize pb-2">{pathname.slice(1)}</h1>
          <p className="body-1 text-xl">
            Total Files: <span className="h5">{filteredData.length}</span>
          </p>
        </div>
        <Separator className="bg-white/30" />
      </section>

      {/* Render filtered files */}
      {filteredData.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-10">
          {filteredData?.map((file: FileData) => {
            const { extension } = getFileType(file?.filename);
            return (
              <div key={file._id} className="flex justify-start gap-2 items-center">
                {file?.fileType?.startsWith("image") ? (
                  <Image
                    src={file.path || "/assets/icons/file-image.svg"}
                    alt={file.filename}
                    className="w-8 h-8"
                    height={300}
                    width={300}
                    onClick={() => handlePreview(file)} // Open preview when clicked
                  />
                ) : (
                  <Thumbnail url={file?.path} type={file?.fileType} extension={extension} />
                )}
                <div>
                  <p className="text-white text-xs">{file?.filename}</p>
                  <div className="flex items-end justify-start gap-3">
                    <span className="text-sm text-light-200">
                      {formatBytes(file?.fileSize)} {/* Format size if needed */}
                    </span>
                    <div className="flex items-end justify-end gap-3">
                      <button onClick={() => handlePreview(file)}>
                        <Image
                          src={"/assets/icons/file-image.svg"}
                          alt={`view`}
                          className="w-4 h-4"
                          height={300}
                          width={300}
                        />
                      </button>
                      <button onClick={() => handleDelete(file._id)}>
                        <Image
                          src={"/assets/icons/delete.svg"}
                          alt={`delete`}
                          className="w-6 h-6 mt-2"
                          height={300}
                          width={300}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <p className="empty-list">No files found in this category</p>
      )}

      {/* Modal for previewing the file */}
      {selectedFile && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center"
          onClick={closeModal} // Close modal if clicked outside the modal content
        >
          <div
            className="bg-white p-5 rounded-md"
            onClick={(e) => e.stopPropagation()} // Prevent the click event from bubbling to the backdrop
          >

            {/* Conditional Rendering based on File Type */}
            {selectedFile.fileType.startsWith("image") ? (
              <Image
                src={selectedFile.path}
                alt={selectedFile.filename}
                className="max-w-full max-h-[80vh]"
                height={500}
                width={500}
                onLoadingComplete={handleFileLoad}
              />
            ) : selectedFile.fileType.startsWith("video") || selectedFile.fileType.startsWith("audio") ? (
              <div className="flex justify-center">
                {selectedFile.fileType.startsWith("video") ? (
                  <video controls className="max-w-full max-h-[80vh]">
                    <source src={selectedFile.path} />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <audio controls className="max-w-full">
                    <source src={selectedFile.path} />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
            ) : documentExtensions.includes(selectedFile.fileType.split("/")[1]) ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <Image
                  src="/assets/icons/file-doc.svg"
                  alt="Document"
                  className="w-16 h-16"
                  height={64}
                  width={64}
                />
                <a
                  href={selectedFile.path}
                  download
                  className="btn bg-blue-500 text-white py-2 px-4 rounded"
                >
                  Download
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4">
                <Image
                  src="/assets/icons/file-other.svg"
                  alt="Other File"
                  className="w-16 h-16"
                  height={64}
                  width={64}
                />
                <a
                  href={selectedFile.path}
                  download
                  className="btn bg-blue-500 text-white py-2 px-4 rounded"
                >
                  Download
                </a>
              </div>
            )}

            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-black bg-white p-2 rounded-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
