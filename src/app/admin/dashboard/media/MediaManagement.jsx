
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Upload,
  Copy,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";

export default function MediaManagement() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  // Load media
  useEffect(() => {
    const controller = new AbortController();

    async function fetchMedia() {
      try {
        const response = await fetch(
          `/api/admin/media?page=${page}&limit=20`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load media");
        }

        if (controller.signal.aborted) return;

        setMedia(data.media || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setError("");
      } catch (err) {
        if (!controller.signal.aborted && err.name !== "AbortError") {
          setError(err.message || "Failed to load media");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchMedia();

    return () => controller.abort();
  }, [page, reloadKey]);

  // Refresh media
  function refreshMedia() {
    setLoading(true);
    setError("");
    setReloadKey((current) => current + 1);
  }

  // Upload images
  async function handleUpload(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) return;

    setUploading(true);
    setError("");

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name}: Only images are allowed`);
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name}: Maximum file size is 5 MB`);
        }

        const signatureResponse = await fetch(
          "/api/admin/media/signature",
          { method: "POST" }
        );

        const signatureData = await signatureResponse.json();

        if (!signatureResponse.ok) {
          throw new Error(signatureData.message || "Signature failed");
        }

        const uploadData = new FormData();

        uploadData.append("file", file);
        uploadData.append("api_key", signatureData.apiKey);
        uploadData.append("timestamp", signatureData.timestamp);
        uploadData.append("folder", signatureData.folder);
        uploadData.append("signature", signatureData.signature);

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
          {
            method: "POST",
            body: uploadData,
          }
        );

        const uploaded = await cloudinaryResponse.json();

        if (!cloudinaryResponse.ok) {
          throw new Error(
            uploaded.error?.message || "Cloudinary upload failed"
          );
        }

        const registerResponse = await fetch("/api/admin/media", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicId: uploaded.public_id,
            secureUrl: uploaded.secure_url,
            format: uploaded.format,
            resourceType: uploaded.resource_type,
            width: uploaded.width,
            height: uploaded.height,
            bytes: uploaded.bytes,
          }),
        });

        const registered = await registerResponse.json();

        if (!registerResponse.ok) {
          throw new Error(
            registered.message || "Media registration failed"
          );
        }
      }

      setPage(1);
      setLoading(true);
      setReloadKey((current) => current + 1);

      alert("Image upload completed successfully");
    } catch (err) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  // Delete image
  async function handleDelete(item) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/media/${item._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      alert(data.message || "Image deleted successfully");

      // If the current page becomes empty, go to previous page.
      if (media.length === 1 && page > 1) {
        setLoading(true);
        setPage((current) => current - 1);
      } else {
        refreshMedia();
      }
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  }

  // Copy image URL
  async function copyUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      alert("Image URL copied");
    } catch {
      alert("Unable to copy image URL");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Media Library
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Upload and manage your website images.
          </p>
        </div>

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800">
          <Upload size={18} />
          {uploading ? "Uploading..." : "Upload Images"}

          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Media Library */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Supported: Images up to 5 MB each.
          </p>

          <button
            type="button"
            onClick={refreshMedia}
            disabled={loading}
            className="rounded-lg border border-slate-300 p-2 dark:border-slate-700"
            title="Refresh"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-12 text-center text-slate-500">
            Loading media...
          </p>
        ) : media.length === 0 ? (
          <div className="py-12 text-center">
            <ImageIcon
              size={40}
              className="mx-auto mb-3 text-slate-400"
            />
            <p className="text-slate-500">
              No images uploaded yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {media.map((item) => (
              <div
                key={item._id}
                className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={item.secureUrl}
                    alt={item.publicId || "Uploaded image"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover"
                  />
                </div>

                <div className="space-y-2 p-3">
                  <p className="truncate text-xs text-slate-500">
                    {item.publicId}
                  </p>

                  <p className="text-xs text-slate-500">
                    {item.width} × {item.height}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => copyUrl(item.secureUrl)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-100 py-2 text-xs dark:bg-slate-800"
                    >
                      <Copy size={14} />
                      Copy URL
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="rounded-lg bg-red-50 px-3 text-red-600 dark:bg-red-950/40"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
            <span className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  setLoading(true);
                  setPage((prev) => prev - 1);
                }}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 dark:border-slate-700"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => {
                  setLoading(true);
                  setPage((prev) => prev + 1);
                }}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 dark:border-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
