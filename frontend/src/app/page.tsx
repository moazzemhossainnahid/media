'use client'

import { useEffect, useState } from 'react';
import FormattedDateTime from "@/components/FormattedDateTime";
import { Separator } from "@/components/separator";
import { convertFileSize, formatBytes, getFileType } from "@/utils/utils";
import Image from "next/image";
import Link from "next/link";
import useSWR from 'swr';
import axios from "axios";
import Thumbnail from '@/components/Thumbnail';

// Define the type for the response data from the API
interface FileData {
  fileType: string;
  filename: string;
  path: string;
  fileSize: number;
  createdAt: string;
}

interface FileItem {
  fileSize: number;
  createdAt: string;  // assuming createdAt is a string date (e.g., ISO date format)
  fileType: string;   // assuming it's a mime type like 'image/png', 'audio/mp3', etc.
}

interface RoutingData {
  title: string;
  size: number;
  latestDate: string;
  icon: string;
  url: string;
}

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function Home() {
  const { data } = useSWR('https://media-storage.taqiy.com/api/v1/media', fetcher);

  // Define file extensions for each category
  const documentExtensions = ["doc", "docx", "xls", "xlsx", "pdf"];
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
  const mediaExtensions = ["mp4", "m4a", "avi", "mov", "mkv", "mp3", "wav", "aac"]; // Combining audio and video

  // Categorize the data based on file type
  const allDocs = data?.data?.filter((item: FileData) => documentExtensions.includes(item.fileType.split("/")[1])) || [];
  const allImages = data?.data?.filter((item: FileData) => imageExtensions.includes(item.fileType.split("/")[1])) || [];
  const allMedia = data?.data?.filter((item: FileData) => mediaExtensions.includes(item.fileType.split("/")[1])) || [];
  const allOthers = data?.data?.filter((item: FileData) => {
    const fileExtension = item.fileType.split("/")[1];
    return (
      !documentExtensions.includes(fileExtension) &&
      !imageExtensions.includes(fileExtension) &&
      !mediaExtensions.includes(fileExtension)
    );
  }) || [];

  const [routingData, setRoutingData] = useState<RoutingData[]>([]);

  useEffect(() => {
    const totalSpace = {
      document: { size: 0, latestDate: "" },
      image: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
    };

    // Calculate document size and latest date
    allDocs.forEach((doc: FileItem) => {
      totalSpace.document.size += doc.fileSize; // Add file size
      if (!totalSpace.document.latestDate || doc.createdAt > totalSpace.document.latestDate) {
        totalSpace.document.latestDate = doc.createdAt; // Get the latest date
      }
    });

    // Calculate image size and latest date
    allImages.forEach((img: FileItem) => {
      totalSpace.image.size += img.fileSize;
      if (!totalSpace.image.latestDate || img.createdAt > totalSpace.image.latestDate) {
        totalSpace.image.latestDate = img.createdAt;
      }
    });

    // Calculate media (audio and video) size and latest date
    allMedia.forEach((media: FileItem) => {
      totalSpace.video.size += media.fileSize; // Assuming video files
      if (media.fileType.includes("video")) {
        if (!totalSpace.video.latestDate || media.createdAt > totalSpace.video.latestDate) {
          totalSpace.video.latestDate = media.createdAt;
        }
      }
      if (media.fileType.includes("audio")) {
        totalSpace.audio.size += media.fileSize;
        if (!totalSpace.audio.latestDate || media.createdAt > totalSpace.audio.latestDate) {
          totalSpace.audio.latestDate = media.createdAt;
        }
      }
    });

    // Calculate other files size and latest date
    allOthers.forEach((other: FileItem) => {
      totalSpace.other.size += other.fileSize;
      if (!totalSpace.other.latestDate || other.createdAt > totalSpace.other.latestDate) {
        totalSpace.other.latestDate = other.createdAt;
      }
    });

    // Update routingData with dynamic values
    setRoutingData([
      {
        title: "Documents",
        size: totalSpace.document.size,
        latestDate: totalSpace.document.latestDate,
        icon: "/assets/icons/file-document-light.svg",
        url: "/documents",
      },
      {
        title: "Images",
        size: totalSpace.image.size,
        latestDate: totalSpace.image.latestDate,
        icon: "/assets/icons/file-image-light.svg",
        url: "/images",
      },
      {
        title: "Media",
        size: totalSpace.video.size + totalSpace.audio.size,
        latestDate:
          totalSpace.video.latestDate > totalSpace.audio.latestDate
            ? totalSpace.video.latestDate
            : totalSpace.audio.latestDate,
        icon: "/assets/icons/file-video-light.svg",
        url: "/media",
      },
      {
        title: "Others",
        size: totalSpace.other.size,
        latestDate: totalSpace.other.latestDate,
        icon: "/assets/icons/file-other-light.svg",
        url: "/others",
      },
    ]);
  }, [data]);

  return (
    <div className="dashboard-container bg-[#F2F4F8] w-full rounded-3xl text-black my-10">
      <section>
        {/* Uploaded file type summaries */}
        <ul className="dashboard-summary-list w-full py-10 p-5">
          {routingData?.map((summary) => (
            <Link
              href={summary.url}
              key={summary.title}
              className="dashboard-summary-card min-h-40"
            >
              <div className="space-y-4">
                <div className="flex justify-between gap-3">
                  <Image
                    src={summary.icon}
                    width={100}
                    height={100}
                    alt="uploaded image"
                    className="summary-type-icon"
                  />
                  <h4 className="summary-type-size">
                    {convertFileSize(summary.size) || 0}
                  </h4>
                </div>

                <h5 className="summary-type-title">{summary.title || "nothing"}</h5>
                <Separator className="bg-black/30" />
                <FormattedDateTime
                  date={summary.latestDate}
                  className="text-center"
                />
              </div>
            </Link>
          ))}
        </ul>
      </section>

      {/* Recent files uploaded */}
      <section className="dashboard-recent-files">
        <h2 className="h3 xl:h2 text-light-100">Recent files uploaded</h2>
        {data?.data?.length > 0 ? (
          <div className="space-y-4 mt-6 overflow-y-auto max-h-[400px]"> {/* Adjust max height as needed */}
            {data?.data
              .slice()
              .reverse()
              .map((file: FileData, index: number) => {
                const { extension } = getFileType(file?.filename);
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-4 border-b border-light-300 pb-4"
                  >
                    {/* Left side icon or image */}
                    <div className="w-12 h-12 bg-gray-200 flex items-center justify-center">
                      {/* Display icon or image based on file type */}
                      {file?.fileType?.startsWith("image") ? (
                        <Image
                          src={file.path || "/assets/icons/file-image.svg"} // Fallback icon if thumbnail is not available
                          alt={file.filename}
                          className="w-8 h-8"
                          height={300}
                          width={300}
                        />

                      ) : (
                        <Thumbnail url={file?.path} type={file?.fileType} extension={extension} />
                      )}
                    </div>

                    {/* Filename */}
                    <div>
                      <p className="text-black text-xs">{file?.filename}</p>
                      <span className="text-sm text-light-200">
                        {/* Optionally, show the file size or upload date */}
                        {formatBytes(file?.fileSize)} {/* Format size if needed */}
                      </span>
                    </div>
                  </div>
                )
              }

              )}
          </div>
        ) : (
          <p className="mt-10 text-center text-light-200">No files uploaded</p>
        )}
      </section>


    </div>
  );
}
