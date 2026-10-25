"use client";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

const MAX_SIDE = 1600;

/** Shrink big phone photos in the browser so uploads are fast and small. */
async function resize(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
  return {
    blob:
      blob ??
      (await new Promise<Blob>((r, j) =>
        canvas.toBlob((b) => (b ? r(b) : j(new Error("Could not read that photo."))), "image/jpeg", 0.85),
      )),
    width: canvas.width,
    height: canvas.height,
  };
}

export function ImageField({
  id,
  value,
  onChange,
  onBusy,
  onDimensions,
  shape = "wide",
}: {
  id: string;
  value?: string;
  onChange: (url: string | undefined) => void;
  onBusy?: (busy: boolean) => void;
  onDimensions?: (width: number, height: number) => void;
  shape?: "wide" | "portrait";
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);

  async function upload(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose a photo (JPG or PNG).");
      return;
    }
    setBusy(true);
    onBusy?.(true);
    setError("");
    try {
      const body = new FormData();
      const small = await resize(file);
      onDimensions?.(small.width, small.height);
      body.append("file", new File([small.blob], "photo", { type: small.blob.type }));
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed.");
      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
      onBusy?.(false);
      if (input.current) input.current.value = "";
    }
  }

  const aspect = shape === "portrait" ? "aspect-[4/5] max-w-[220px]" : "aspect-[16/9]";
  return (
    <div>
      <input
        ref={input}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => upload(e.target.files?.[0])}
      />
      {value ? (
        <div className="flex items-end gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            data-testid="photo-preview"
            className={`${aspect} w-full rounded-xl object-cover ring-1 ring-black/10`}
          />
          <div className="flex shrink-0 flex-col gap-2">
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-black/15 hover:bg-[#faf8f2]"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-[#b3261e] hover:bg-[#fdf0ef]"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            upload(e.dataTransfer.files?.[0]);
          }}
          className={`grid w-full place-items-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${over ? "border-[#c7a54f] bg-[#c7a54f]/10" : "border-black/15 bg-white hover:border-black/30"}`}
        >
          {busy ? (
            <Loader2 className="h-7 w-7 animate-spin text-[#7a5f1c]" />
          ) : (
            <ImagePlus className="h-7 w-7 text-[#7a5f1c]" />
          )}
          <span className="mt-2 text-[15px] font-semibold text-[#1d1d1b]">
            {busy ? "Uploading photo…" : "Click to add a photo"}
          </span>
          <span className="text-sm text-black/50">
            or drag one here. Big photos are shrunk automatically.
          </span>
        </button>
      )}
      {error && <p className="mt-2 text-sm font-medium text-[#b3261e]">{error}</p>}
    </div>
  );
}
