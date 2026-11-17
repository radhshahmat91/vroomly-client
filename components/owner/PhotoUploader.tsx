"use client";

import { ImagePlus, Link2, Star, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { SmartImage } from "@/components/ui/SmartImage";
import { useUploadImages } from "@/hooks/useOwner";
import { cn } from "@/lib/utils";
import type { CarImage } from "@/types";

const MAX = 10;

export function PhotoUploader({ value, onChange, error }: { value: CarImage[]; onChange: (v: CarImage[]) => void; error?: string }) {
  const upload = useUploadImages();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX - value.length;
    if (room <= 0) return toast.error(`You can add up to ${MAX} photos.`);
    const uploaded = await upload.mutateAsync(Array.from(files).slice(0, room));
    onChange([...value, ...uploaded]);
    toast.success(`${uploaded.length} photo${uploaded.length > 1 ? "s" : ""} uploaded.`);
  };

  const addUrl = () => {
    const u = url.trim();
    if (!/^https?:\/\/\S+\.\S+/i.test(u)) return toast.error("Paste a full image link that starts with http:// or https://");
    if (value.length >= MAX) return toast.error(`You can add up to ${MAX} photos.`);
    onChange([...value, { url: u }]);
    setUrl("");
  };

  const makeCover = (i: number) => onChange([value[i], ...value.filter((_, idx) => idx !== i)]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((img, i) => (
          <div key={`${img.url}-${i}`} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-base-200">
            <SmartImage src={img.url} alt={`Car photo ${i + 1}`} className="size-full object-cover" />
            {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-content">Cover</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              {i !== 0 && <button type="button" className="btn btn-xs btn-circle border-0 bg-white/90 text-neutral" onClick={() => makeCover(i)} aria-label="Make this the cover photo" title="Make cover"><Star size={13} /></button>}
              <button type="button" className="btn btn-xs btn-circle border-0 bg-white/90 text-error" onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label="Remove photo" title="Remove"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
        {value.length < MAX && (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={upload.isPending} className={cn("flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-base-300 text-sm font-semibold text-base-content/65 transition-colors hover:border-secondary hover:text-secondary", upload.isPending && "opacity-60")}>
            {upload.isPending ? <span className="loading loading-spinner" /> : <ImagePlus size={26} />}
            {upload.isPending ? "Uploading…" : "Upload photos"}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />

      <div className="mt-4 flex gap-2">
        <label className="input input-bordered flex min-w-0 flex-1 items-center gap-2">
          <Link2 size={16} className="shrink-0 text-base-content/50" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }} placeholder="…or paste an image link" className="grow" aria-label="Image link" />
        </label>
        <button type="button" className="btn btn-outline" onClick={addUrl}>Add link</button>
      </div>
      <p className="mt-2 text-xs text-base-content/55">Up to {MAX} photos, 6 MB each. The first photo is the cover shown in search results.</p>
      {error && <p role="alert" className="mt-2 text-sm font-medium text-error">{error}</p>}
    </div>
  );
}
