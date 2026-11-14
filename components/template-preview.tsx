import { ImageOff } from "lucide-react";

/** Thumbnail of a template background, with a quiet fallback when the image is missing. */
export function TemplatePreview({
  src,
  name,
  className = "",
}: {
  src?: string | null;
  name: string;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- served by an authenticated API route
      <img src={src} alt={`${name} preview`} loading="lazy" className={`h-full w-full object-cover ${className}`} />
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground/60">
      <ImageOff className="h-6 w-6" />
      <span className="text-[11px] font-medium">No preview — open to re-upload the background</span>
    </div>
  );
}
