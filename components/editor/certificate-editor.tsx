"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stage, Layer, Text, Image as KonvaImage, Transformer, Line } from "react-konva";
import type Konva from "konva";
import useImage from "use-image";
import Papa from "papaparse";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import {
  AlertCircle,
  AlignCenter,
  AlignHorizontalJustifyCenter,
  AlignLeft,
  AlignRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileSpreadsheet,
  ImageUp,
  Loader2,
  Maximize,
  Minus,
  Plus,
  QrCode,
  Save,
  Trash2,
  Type,
  Upload,
  Users,
  X,
} from "lucide-react";

// Self-hosted faces for every font offered in the editor, so the canvas and exports render them.
import "@fontsource/great-vibes";
import "@fontsource/pacifico";
import "@fontsource/dancing-script";
import "@fontsource/playfair-display";
import "@fontsource/montserrat";
import "@fontsource/poppins";
import "@fontsource/raleway";
import "@fontsource/lora";
import "@fontsource/oswald";
import "@fontsource/cinzel";
import "@fontsource/cormorant-garamond";
import "@fontsource/merriweather";
import "@fontsource/josefin-sans";
import "@fontsource/bebas-neue";
import "@fontsource/abril-fatface";
import "@fontsource/lobster";
import "@fontsource/allura";
import "@fontsource/alex-brush";
import "@fontsource/sacramento";
import "@fontsource/parisienne";
import "@fontsource/satisfy";
import "@fontsource/tangerine";
import "@fontsource/kaushan-script";
import "@fontsource/courgette";
import "@fontsource/marck-script";

import { useTheme } from "@/components/theme-provider";
import {
  FONT_OPTIONS,
  MIN_FONT_SIZE,
  canvasToBlob,
  createExportRenderer,
  createQrField,
  createTextField,
  ensureFonts,
  fillPlaceholders,
  isQr,
  loadImage,
  makeFileNamer,
  qrImage,
  recipientName,
  textAttrs,
  unmatchedPlaceholders,
  type Alignment,
  type Field,
  type Row,
} from "@/lib/editor/certificate";

const CATEGORIES = ["Custom", "Participation", "Achievement", "Workshop", "Appreciation"];
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_ROWS = 5000;
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 4;

type Notice = { tone: "ok" | "error"; text: string };
type ExportState = { done: number; total: number; label: string } | null;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const isTyping = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
};

/** Parses a CSV (with headers) or a plain list with one name per line. */
function parseRecipients(text: string, fileName = ""): { rows: Row[]; error?: string } {
  const cleaned = text.replace(/^﻿/, "").trim();
  if (!cleaned) return { rows: [], error: "That file is empty." };

  const lines = cleaned.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const looksLikeList = !/[,;\t]/.test(lines[0]) && !fileName.toLowerCase().endsWith(".csv");

  let rows: Row[];
  if (looksLikeList) {
    // A header line such as "name" is dropped; everything else is a recipient.
    const body = /^(full\s*)?names?$/i.test(lines[0]) ? lines.slice(1) : lines;
    rows = body.map((name) => ({ name }));
  } else {
    const result = Papa.parse<Row>(cleaned, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.replace(/^﻿/, "").trim(),
    });
    rows = result.data
      .map((row) => {
        const out: Row = {};
        for (const [key, value] of Object.entries(row)) {
          if (key && key !== "__parsed_extra") out[key] = value == null ? "" : String(value).trim();
        }
        return out;
      })
      .filter((row) => Object.values(row).some(Boolean));
  }

  if (rows.length === 0) return { rows: [], error: "No recipients were found in that file." };
  if (rows.length > MAX_ROWS) {
    return { rows: [], error: `That list has ${rows.length.toLocaleString("en-US")} rows. The limit is ${MAX_ROWS.toLocaleString("en-US")} per batch — split it into parts.` };
  }
  return { rows };
}

/* ───────────────────────── small UI pieces ───────────────────────── */

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Labeled({ label, htmlFor, children, aside }: { label: string; htmlFor?: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
          {label}
        </label>
        {aside}
      </div>
      {children}
    </div>
  );
}

const inputClass =
  "h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20";

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

/* ───────────────────────── editor ───────────────────────── */

export default function CertificateEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateIdFromUrl = searchParams.get("id");
  const { resolvedTheme } = useTheme();

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const guideRef = useRef<Konva.Line>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const loadedIdRef = useRef<string | null>(null);
  const cancelExportRef = useRef(false);
  const savedImageRef = useRef<string | null>(null);

  const [backgroundSrc, setBackgroundSrc] = useState<string | null>(null);
  const [backgroundImage] = useImage(backgroundSrc || "");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("Untitled template");
  const [category, setCategory] = useState("Custom");
  const [savedSignature, setSavedSignature] = useState<string | null>(null);

  const [rows, setRows] = useState<Row[]>([]);
  const [listName, setListName] = useState("");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [pasted, setPasted] = useState("");

  const [tab, setTab] = useState<"design" | "recipients">("design");
  const [zoom, setZoom] = useState({ scale: 1, fit: true });
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [loadingTemplate, setLoadingTemplate] = useState(!!templateIdFromUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [exporting, setExporting] = useState<ExportState>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [samplePng, setSamplePng] = useState<string | null>(null);
  const [sampleQr] = useImage(samplePng || "");

  const { open: saveOpen, setOpen: setSaveOpen, ref: saveMenuRef } = useDropdown();
  const { open: exportOpen, setOpen: setExportOpen, ref: exportMenuRef } = useDropdown();

  const scale = zoom.scale;
  const hasBackground = !!backgroundSrc && imageSize.width > 0;
  const selected = useMemo(() => fields.find((f) => f.id === selectedId) ?? null, [fields, selectedId]);
  const columns = useMemo(() => (rows[0] ? Object.keys(rows[0]) : []), [rows]);
  const previewRow = previewIndex !== null ? rows[previewIndex] ?? null : null;
  const unmatched = useMemo(() => (rows.length ? unmatchedPlaceholders(fields, columns) : []), [fields, columns, rows.length]);
  const hasQrField = fields.some(isQr);

  // Cheap fingerprint of everything that gets saved, to show "unsaved changes".
  const signature = useMemo(
    () => JSON.stringify([templateName, category, fields, backgroundSrc ? backgroundSrc.length : 0]),
    [templateName, category, fields, backgroundSrc]
  );
  const dirty = hasBackground && savedSignature !== signature;

  const notify = useCallback((tone: Notice["tone"], text: string) => setNotice({ tone, text }), []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), notice.tone === "error" ? 6000 : 3000);
    return () => clearTimeout(t);
  }, [notice]);

  /* ── fonts: canvas text uses a fallback face until the web font is ready ── */
  useEffect(() => {
    let cancelled = false;
    FONT_OPTIONS.forEach((family) => {
      document.fonts
        .load(`16px "${family}"`)
        .then(() => {
          if (!cancelled) setLoadedFonts((prev) => (prev.has(family) ? prev : new Set(prev).add(family)));
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    QRCode.toDataURL("https://www.certificategenerator.space/verify/sample", { margin: 1, width: 400 })
      .then(setSamplePng)
      .catch(() => {});
  }, []);

  /* ── zoom ── */
  const fitScale = useCallback((width: number, height: number) => {
    const workspace = workspaceRef.current;
    if (!workspace || !width || !height) return 1;
    const availW = Math.max(160, workspace.clientWidth - 80);
    const availH = Math.max(160, workspace.clientHeight - 80);
    return clamp(Math.min(availW / width, availH / height), MIN_ZOOM, 2);
  }, []);

  const fitToScreen = useCallback(() => {
    setZoom({ scale: fitScale(imageSize.width, imageSize.height), fit: true });
  }, [fitScale, imageSize.width, imageSize.height]);

  const zoomBy = useCallback((factor: number) => {
    setZoom((prev) => ({ scale: clamp(Math.round(prev.scale * factor * 100) / 100, MIN_ZOOM, MAX_ZOOM), fit: false }));
  }, []);

  // Keep the certificate fitted as the window or side panel changes size — until the user zooms manually.
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace || !hasBackground) return;
    const refit = () => {
      setZoom((prev) => {
        if (!prev.fit) return prev;
        const next = fitScale(imageSize.width, imageSize.height);
        return Math.abs(next - prev.scale) < 0.001 ? prev : { scale: next, fit: true };
      });
    };
    refit();
    const observer = new ResizeObserver(refit);
    observer.observe(workspace);
    return () => observer.disconnect();
  }, [hasBackground, imageSize.width, imageSize.height, fitScale, rows.length]);

  // Ctrl/⌘ + scroll zooms the canvas.
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 1.1 : 1 / 1.1);
    };
    workspace.addEventListener("wheel", onWheel, { passive: false });
    return () => workspace.removeEventListener("wheel", onWheel);
  }, [zoomBy]);

  /* ── load a saved template ── */
  useEffect(() => {
    if (!templateIdFromUrl || loadedIdRef.current === templateIdFromUrl) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/templates/${templateIdFromUrl}`);
        if (!res.ok) throw new Error(res.status === 404 ? "That template no longer exists." : "The template could not be loaded.");
        const data = await res.json();
        if (cancelled) return;

        const name: string = data.name || "Untitled template";
        const cat: string = CATEGORIES.includes(data.category) ? data.category : "Custom";
        const loadedFields: Field[] = Array.isArray(data.fields) ? data.fields : [];

        loadedIdRef.current = data.id;
        setTemplateId(data.id);
        setTemplateName(name);
        setCategory(cat);
        setFields(loadedFields);
        setSelectedId(null);

        const usable = typeof data.imagePath === "string" && !data.imagePath.startsWith("blob:") && data.imagePath !== "/placeholder.png";
        if (usable) {
          const img = await loadImage(data.imagePath);
          if (cancelled) return;
          setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
          savedImageRef.current = data.imagePath;
          setBackgroundSrc(data.imagePath);
          setZoom({ scale: 1, fit: true });
          setSavedSignature(JSON.stringify([name, cat, loadedFields, data.imagePath.length]));
        } else {
          // Older templates stored a temporary image link that no longer works.
          const w = Number(data.canvasMeta?.originalWidth) || 0;
          const h = Number(data.canvasMeta?.originalHeight) || 0;
          setBackgroundSrc(null);
          setImageSize({ width: w > 1 ? w : 0, height: h > 1 ? h : 0 });
          notify("error", "This template's background image was not saved. Upload it again — your fields are still in place.");
        }
      } catch (err) {
        if (!cancelled) notify("error", err instanceof Error ? err.message : "The template could not be loaded.");
      } finally {
        if (!cancelled) setLoadingTemplate(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [templateIdFromUrl, notify]);

  // Warn before leaving with unsaved work.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /* ── background ── */
  const loadBackgroundFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) return notify("error", "Choose an image file — PNG or JPG.");
      if (file.size > MAX_IMAGE_BYTES) return notify("error", "That image is larger than 12 MB. Export a smaller version and try again.");

      // Stored as a data URL so the background is saved with the template.
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const src = reader.result as string;
          const img = await loadImage(src);
          const size = { width: img.naturalWidth, height: img.naturalHeight };
          setFields((prev) => {
            if (prev.length === 0) return [createTextField(size)];
            // Keep existing fields in the same relative place when the artwork's size changes.
            if (!imageSize.width || (imageSize.width === size.width && imageSize.height === size.height)) return prev;
            const kx = size.width / imageSize.width;
            const ky = size.height / imageSize.height;
            return prev.map((f) => ({
              ...f,
              x: Math.round(f.x * kx),
              y: Math.round(f.y * ky),
              width: Math.round(f.width * kx),
              fontSize: Math.max(MIN_FONT_SIZE, Math.round(f.fontSize * (isQr(f) ? kx : ky))),
            }));
          });
          setImageSize(size);
          setBackgroundSrc(src);
          setZoom({ scale: 1, fit: true });
          if (templateName === "Untitled template" && file.name) {
            setTemplateName(file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 80) || "Untitled template");
          }
        } catch {
          notify("error", "That file could not be read as an image.");
        }
      };
      reader.onerror = () => notify("error", "That file could not be read.");
      reader.readAsDataURL(file);
    },
    [imageSize.width, imageSize.height, notify, templateName]
  );

  /* ── fields ── */
  const updateField = useCallback((id: string, updates: Partial<Field> | ((field: Field) => Partial<Field>)) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...(typeof updates === "function" ? updates(f) : updates) } : f)));
  }, []);

  const addTextField = () => {
    const field = createTextField(imageSize, columns.length ? `{{${columns[0]}}}` : "{{name}}");
    // Stagger new fields so they don't land exactly on top of each other.
    const existing = fields.filter((f) => !isQr(f)).length;
    field.y = Math.min(Math.max(0, imageSize.height - field.fontSize), field.y + existing * Math.round(field.fontSize * 1.2));
    setFields((prev) => [...prev, field]);
    setSelectedId(field.id);
    setTab("design");
  };

  const addQr = () => {
    const field = createQrField(imageSize);
    setFields((prev) => [...prev, field]);
    setSelectedId(field.id);
    setTab("design");
  };

  const removeField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }, []);

  const duplicateField = useCallback(
    (id: string) => {
      const source = fields.find((f) => f.id === id);
      if (!source || isQr(source)) return;
      const copy: Field = {
        ...source,
        id: `field-${Math.random().toString(36).slice(2, 11)}`,
        y: source.y + Math.round(source.fontSize * 1.1),
      };
      setFields((prev) => [...prev, copy]);
      setSelectedId(copy.id);
    },
    [fields]
  );

  const insertPlaceholder = (column: string) => {
    const token = `{{${column}}}`;
    if (selected && !isQr(selected)) {
      updateField(selected.id, (f) => ({ label: f.label.includes(token) ? f.label : f.label.trim() ? `${f.label} ${token}` : token }));
    } else {
      const field = createTextField(imageSize, token);
      setFields((prev) => [...prev, field]);
      setSelectedId(field.id);
    }
    setTab("design");
  };

  /* ── recipients ── */
  const applyRecipients = (text: string, name: string) => {
    const { rows: parsed, error } = parseRecipients(text, name);
    if (error) return notify("error", error);
    setRows(parsed);
    setListName(name);
    setPreviewIndex(0);
    setPasted("");
    notify("ok", `${parsed.length.toLocaleString("en-US")} recipient${parsed.length === 1 ? "" : "s"} loaded.`);
  };

  const loadRecipientsFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => applyRecipients(String(reader.result ?? ""), file.name);
    reader.onerror = () => notify("error", "That file could not be read.");
    reader.readAsText(file);
  };

  const clearRecipients = () => {
    setRows([]);
    setListName("");
    setPreviewIndex(null);
  };

  /* ── save ── */
  const saveTemplate = useCallback(
    async (asCopy = false) => {
      if (!backgroundSrc) return notify("error", "Upload a certificate image before saving.");
      const name = (asCopy ? `${templateName} (copy)` : templateName).trim() || "Untitled template";
      const updating = !!templateId && !asCopy;
      const payload = {
        name,
        // The image can be several megabytes — only upload it when it has actually changed.
        ...((!updating || savedImageRef.current !== backgroundSrc) && { imagePath: backgroundSrc }),
        fields,
        category,
        canvasMeta: {
          originalWidth: imageSize.width,
          originalHeight: imageSize.height,
          scaledWidth: imageSize.width * scale,
          scaledHeight: imageSize.height * scale,
          scale,
        },
      };

      setIsSaving(true);
      try {
        const res = await fetch(updating ? `/api/templates/${templateId}` : "/api/templates", {
          method: updating ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(res.status === 413 ? "The background image is too large to save." : typeof data.error === "string" ? data.error : "The template could not be saved.");
        }

        savedImageRef.current = backgroundSrc;
        setTemplateName(name);
        setSavedSignature(JSON.stringify([name, category, fields, backgroundSrc.length]));
        if (!updating && data.id) {
          loadedIdRef.current = data.id;
          setTemplateId(data.id);
          router.replace(`/dashboard/certificates?id=${data.id}`, { scroll: false });
        }
        notify("ok", asCopy ? "Saved as a new template." : "Template saved.");
      } catch (err) {
        notify("error", err instanceof Error && err.message ? err.message : "The template could not be saved.");
      } finally {
        setIsSaving(false);
      }
    },
    [backgroundSrc, templateName, fields, category, imageSize, scale, templateId, router, notify]
  );

  /* ── export ── */
  const runExport = async (format: "PNG" | "PDF", scope: "single" | "all") => {
    if (!backgroundSrc || exporting) return;
    setExportOpen(false);
    cancelExportRef.current = false;

    const exportRows: (Row | null)[] = scope === "all" ? rows : [previewRow];
    const total = exportRows.length;
    setExporting({ done: 0, total, label: "Preparing…" });

    let renderer: ReturnType<typeof createExportRenderer> | null = null;
    try {
      await ensureFonts(fields);
      const background = await loadImage(backgroundSrc);
      renderer = createExportRenderer(background, fields);

      // Verification records are created first, so each QR code can point at its certificate.
      const needsRecords = scope === "all" || renderer.hasQr;
      let certificateIds: (string | undefined)[] = [];
      if (needsRecords) {
        const firstText = fields.find((f) => !isQr(f));
        const recordRows = exportRows.map((row) => row ?? { name: firstText ? firstText.label : templateName });
        const listLabel = listName.replace(/\.[^.]+$/, "") || `${total} recipients`;
        const res = await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: scope === "all" ? `${templateName} — ${listLabel}` : templateName,
            templateName,
            format,
            rows: recordRows,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !Array.isArray(data.certificates) || data.certificates.length !== total) {
          throw new Error(typeof data.error === "string" ? data.error : "The certificates could not be registered, so nothing was exported. Please try again.");
        }
        certificateIds = data.certificates.map((c: { id: string }) => c.id);
      }

      const fileName = makeFileNamer();
      const baseName = templateName.trim() || "certificate";
      const zip = total > 1 ? new JSZip() : null;
      const ext = format === "PDF" ? "pdf" : "png";
      let single: { blob: Blob; name: string } | null = null;

      for (let i = 0; i < total; i++) {
        if (cancelExportRef.current) throw new Error("__cancelled__");
        const row = exportRows[i];
        const qr = renderer.hasQr && certificateIds[i] ? await qrImage(`${window.location.origin}/verify/${certificateIds[i]}`) : null;
        const canvas = renderer.render(row, qr);

        let blob: Blob;
        if (format === "PDF") {
          const pdf = new jsPDF({
            orientation: renderer.width > renderer.height ? "landscape" : "portrait",
            unit: "px",
            format: [renderer.width, renderer.height],
            compress: true,
          });
          pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, renderer.width, renderer.height, undefined, "FAST");
          blob = pdf.output("blob");
        } else {
          blob = await canvasToBlob(canvas, "image/png");
        }

        const name = `${fileName(row, i, baseName)}.${ext}`;
        if (zip) zip.file(name, blob);
        else single = { blob, name };

        setExporting({ done: i + 1, total, label: row ? recipientName(row) : baseName });
        // Let the browser paint progress and stay responsive on long batches.
        if (i % 3 === 2) await new Promise((resolve) => setTimeout(resolve, 0));
      }

      if (zip) {
        setExporting({ done: total, total, label: "Building ZIP…" });
        saveAs(await zip.generateAsync({ type: "blob" }), `${fileName(null, 0, baseName)}_${ext}.zip`);
      } else if (single) {
        saveAs(single.blob, single.name);
      }

      if (!needsRecords) {
        // Single export without a QR code: just note it in History.
        fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: templateName, templateName, format, count: 1 }),
        }).catch(() => {});
      }

      notify("ok", total > 1 ? `${total.toLocaleString("en-US")} certificates exported.` : "Certificate exported.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message === "__cancelled__") notify("error", "Export cancelled. Nothing was downloaded.");
      else notify("error", message || "The export failed. Please try again.");
    } finally {
      renderer?.destroy();
      setExporting(null);
    }
  };

  /* ── keyboard ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!isSaving) saveTemplate(false);
        return;
      }
      if (isTyping(e.target)) return;

      if (mod && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        zoomBy(1.2);
        return;
      }
      if (mod && e.key === "-") {
        e.preventDefault();
        zoomBy(1 / 1.2);
        return;
      }
      if (mod && e.key === "0") {
        e.preventDefault();
        fitToScreen();
        return;
      }

      if (!selectedId) return;
      if (e.key === "Escape") {
        setSelectedId(null);
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeField(selectedId);
        return;
      }
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateField(selectedId);
        return;
      }

      const step = e.shiftKey ? 10 : 1;
      const move: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      const delta = move[e.key];
      if (delta) {
        e.preventDefault();
        updateField(selectedId, (f) => ({ x: f.x + delta[0], y: f.y + delta[1] }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, isSaving, saveTemplate, removeField, duplicateField, updateField, zoomBy, fitToScreen]);

  /* ── selection handles ── */
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;
    const node = selectedId ? stage.findOne(`#${selectedId}`) : null;
    transformer.nodes(node ? [node] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedId, fields, scale, loadedFonts, previewIndex, backgroundImage]);

  const stageWidth = imageSize.width * scale;
  const stageHeight = imageSize.height * scale;
  const selectedIsQr = !!selected && isQr(selected);
  const backgroundInput = (
    <input
      type="file"
      accept="image/png,image/jpeg,image/webp"
      className="sr-only"
      onChange={(e) => {
        loadBackgroundFile(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );

  /* ───────────────────────── render ───────────────────────── */

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background font-sans text-foreground antialiased">
      {/* Top bar */}
      <header className="z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => router.push("/dashboard/templates")}
            title="Back to templates"
            aria-label="Back to templates"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            maxLength={80}
            aria-label="Template name"
            placeholder="Template name"
            className="h-9 w-[150px] min-w-0 truncate rounded-lg border border-transparent bg-transparent px-2 text-sm font-semibold outline-none transition hover:border-border focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 sm:w-[240px]"
          />
          {hasBackground && (
            <span className={`hidden items-center gap-1.5 whitespace-nowrap text-xs md:inline-flex ${dirty ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${dirty ? "bg-amber-500" : "bg-emerald-500"}`} />
              {dirty ? "Unsaved changes" : "Saved"}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {hasBackground && (
            <div className="hidden items-center rounded-lg border border-border sm:flex">
              <button onClick={() => zoomBy(1 / 1.2)} title="Zoom out" aria-label="Zoom out" className="rounded-l-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-12 text-center text-xs font-medium tabular-nums" aria-live="polite">
                {Math.round(scale * 100)}%
              </span>
              <button onClick={() => zoomBy(1.2)} title="Zoom in" aria-label="Zoom in" className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={fitToScreen}
                title="Fit to screen"
                aria-label="Fit to screen"
                aria-pressed={zoom.fit}
                className={`rounded-r-lg border-l border-border p-2 hover:bg-muted ${zoom.fit ? "text-violet-600 dark:text-violet-300" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Maximize className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div ref={saveMenuRef} className="relative flex">
            <button
              onClick={() => saveTemplate(false)}
              disabled={!hasBackground || isSaving}
              className="inline-flex h-9 items-center gap-1.5 rounded-l-lg border border-border bg-card px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={() => setSaveOpen(!saveOpen)}
              disabled={!hasBackground || isSaving}
              aria-label="More save options"
              aria-haspopup="menu"
              aria-expanded={saveOpen}
              className="inline-flex h-9 items-center rounded-r-lg border border-l-0 border-border bg-card px-1.5 transition hover:bg-muted disabled:opacity-50"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {saveOpen && (
              <div role="menu" className="absolute right-0 top-full z-40 mt-1.5 w-56 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <button
                  role="menuitem"
                  onClick={() => {
                    setSaveOpen(false);
                    saveTemplate(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                  Save as a new template
                </button>
              </div>
            )}
          </div>

          <div ref={exportMenuRef} className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              disabled={!hasBackground || !!exporting}
              aria-haspopup="menu"
              aria-expanded={exportOpen}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition hover:bg-violet-500 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {exportOpen && (
              <div role="menu" className="absolute right-0 top-full z-40 mt-1.5 w-72 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                {rows.length > 0 && (
                  <>
                    <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">
                      All {rows.length.toLocaleString("en-US")} certificates
                    </p>
                    <button role="menuitem" onClick={() => runExport("PDF", "all")} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
                      Export all as PDF <span className="text-xs text-muted-foreground">.zip</span>
                    </button>
                    <button role="menuitem" onClick={() => runExport("PNG", "all")} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
                      Export all as PNG <span className="text-xs text-muted-foreground">.zip</span>
                    </button>
                    <div className="my-1 h-px bg-border" />
                  </>
                )}
                <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">
                  {previewRow ? `Only ${recipientName(previewRow) || "this recipient"}` : "This certificate"}
                </p>
                <button role="menuitem" onClick={() => runExport("PDF", "single")} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
                  Download PDF <span className="text-xs text-muted-foreground">.pdf</span>
                </button>
                <button role="menuitem" onClick={() => runExport("PNG", "single")} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
                  Download PNG <span className="text-xs text-muted-foreground">.png</span>
                </button>
                {rows.length === 0 && (
                  <p className="mt-1 border-t border-border px-3 pb-1.5 pt-2.5 text-xs leading-relaxed text-muted-foreground">
                    Add a recipient list to export one certificate per person.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Side panel */}
        <aside className="z-10 flex w-[300px] shrink-0 flex-col border-r border-border bg-card xl:w-[330px]">
          <div className="grid grid-cols-2 gap-1 border-b border-border p-2" role="tablist" aria-label="Editor panels">
            {(
              [
                { key: "design", label: "Design", icon: Type },
                { key: "recipients", label: rows.length ? `Recipients (${rows.length.toLocaleString("en-US")})` : "Recipients", icon: Users },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`flex h-9 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.key ? "bg-violet-500/10 text-violet-600 dark:text-violet-300" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <t.icon className="h-4 w-4" />
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-7 overflow-y-auto p-4 no-scrollbar">
            {tab === "design" && (
              <>
                <Section title="Background">
                  <label className="group flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border p-3 transition-colors hover:border-violet-500/50 hover:bg-muted/50">
                    <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground">
                      {backgroundSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element -- data URL preview
                        <img src={backgroundSrc} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImageUp className="h-5 w-5" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{backgroundSrc ? "Replace image" : "Upload certificate image"}</span>
                      <span className="block text-xs text-muted-foreground">
                        {hasBackground ? `${imageSize.width} × ${imageSize.height} px` : "PNG or JPG, up to 12 MB"}
                      </span>
                    </span>
                    {backgroundInput}
                  </label>
                </Section>

                <Section title="Fields">
                  {fields.length > 0 ? (
                    <ul className="space-y-1">
                      {fields.map((f) => {
                        const active = f.id === selectedId;
                        return (
                          <li key={f.id} className={`group flex items-center rounded-lg border transition-colors ${active ? "border-violet-500/50 bg-violet-500/10" : "border-transparent hover:bg-muted"}`}>
                            <button onClick={() => setSelectedId(f.id)} className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-2 text-left" aria-pressed={active}>
                              {isQr(f) ? <QrCode className="h-4 w-4 shrink-0 text-violet-500" /> : <Type className="h-4 w-4 shrink-0 text-violet-500" />}
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium">{isQr(f) ? "Verification QR" : f.label || "Empty text"}</span>
                                {!isQr(f) && <span className="block truncate text-xs text-muted-foreground">{f.fontFamily}</span>}
                              </span>
                            </button>
                            <button
                              onClick={() => removeField(f.id)}
                              title="Delete field"
                              aria-label={`Delete ${isQr(f) ? "QR code" : f.label || "text field"}`}
                              className="mr-1 rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-rose-500/10 hover:text-rose-500 focus:opacity-100 group-hover:opacity-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="rounded-lg bg-muted/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                      {hasBackground ? "No fields yet. Add a text field for the recipient's name." : "Upload a certificate image to start adding fields."}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={addTextField} disabled={!hasBackground} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border text-sm font-medium transition hover:bg-muted disabled:opacity-50">
                      <Plus className="h-4 w-4" /> Text
                    </button>
                    <button
                      onClick={addQr}
                      disabled={!hasBackground || hasQrField}
                      title={hasQrField ? "This design already has a QR code" : undefined}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                    >
                      <QrCode className="h-4 w-4" /> QR code
                    </button>
                  </div>
                </Section>

                {selected && !selectedIsQr && (
                  <Section
                    title="Text"
                    action={
                      <button onClick={() => duplicateField(selected.id)} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                        <Copy className="h-3 w-3" /> Duplicate
                      </button>
                    }
                  >
                    <Labeled label="Content" htmlFor="field-content">
                      <input id="field-content" value={selected.label} onChange={(e) => updateField(selected.id, { label: e.target.value })} className={inputClass} placeholder="Text or {{placeholder}}" />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(columns.length ? columns : ["name"]).slice(0, 8).map((c) => (
                          <button
                            key={c}
                            onClick={() => insertPlaceholder(c)}
                            title={`Insert {{${c}}}`}
                            className="rounded-md border border-violet-500/25 bg-violet-500/10 px-1.5 py-0.5 font-mono text-[11px] text-violet-600 hover:bg-violet-500/20 dark:text-violet-300"
                          >
                            {`{{${c}}}`}
                          </button>
                        ))}
                      </div>
                    </Labeled>

                    <Labeled label="Font" htmlFor="field-font">
                      <select
                        id="field-font"
                        value={selected.fontFamily}
                        onChange={(e) => updateField(selected.id, { fontFamily: e.target.value })}
                        className={`${inputClass} cursor-pointer`}
                        style={{ fontFamily: `"${selected.fontFamily}"` }}
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f} value={f} style={{ fontFamily: `"${f}"` }}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </Labeled>

                    <Labeled
                      label={selected.autoFit ? "Maximum size" : "Size"}
                      htmlFor="field-size"
                      aside={<span className="text-xs tabular-nums text-muted-foreground">{Math.round(selected.fontSize)} px</span>}
                    >
                      <input
                        id="field-size"
                        type="range"
                        min={MIN_FONT_SIZE}
                        max={Math.max(120, Math.round(imageSize.height * 0.3))}
                        value={Math.round(selected.fontSize)}
                        onChange={(e) => updateField(selected.id, { fontSize: Number(e.target.value) })}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-violet-600"
                      />
                    </Labeled>

                    <div className="grid grid-cols-2 gap-3">
                      <Labeled label="Colour" htmlFor="field-colour">
                        <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-2">
                          <input
                            id="field-colour"
                            type="color"
                            value={/^#[0-9a-f]{6}$/i.test(selected.fill) ? selected.fill : "#000000"}
                            onChange={(e) => updateField(selected.id, { fill: e.target.value })}
                            className="h-5 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                          />
                          <span className="font-mono text-xs uppercase text-muted-foreground">{selected.fill}</span>
                        </div>
                      </Labeled>
                      <Labeled label="Align">
                        <div className="flex h-9 rounded-lg border border-border bg-background p-0.5" role="radiogroup" aria-label="Text alignment">
                          {(["left", "center", "right"] as Alignment[]).map((a) => {
                            const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
                            return (
                              <button
                                key={a}
                                role="radio"
                                aria-checked={selected.align === a}
                                aria-label={`Align ${a}`}
                                onClick={() => updateField(selected.id, { align: a })}
                                className={`flex flex-1 items-center justify-center rounded-md transition ${selected.align === a ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </button>
                            );
                          })}
                        </div>
                      </Labeled>
                    </div>

                    <div className="flex items-start justify-between gap-3 rounded-xl border border-border p-3">
                      <div>
                        <p id="autofit-label" className="text-sm font-medium">
                          Shrink long text to fit
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {selected.autoFit ? "Stays on one line; long names get smaller so they never overflow the box." : "Fixed size; long text wraps onto more lines."}
                        </p>
                      </div>
                      <button
                        role="switch"
                        aria-checked={selected.autoFit}
                        aria-labelledby="autofit-label"
                        onClick={() => updateField(selected.id, { autoFit: !selected.autoFit })}
                        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${selected.autoFit ? "bg-violet-600" : "bg-muted-foreground/30"}`}
                      >
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${selected.autoFit ? "left-[18px]" : "left-0.5"}`} />
                      </button>
                    </div>

                    <button
                      onClick={() => updateField(selected.id, (f) => ({ x: Math.round((imageSize.width - f.width) / 2), align: "center" }))}
                      className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium transition hover:bg-muted"
                    >
                      <AlignHorizontalJustifyCenter className="h-4 w-4" />
                      Centre on the page
                    </button>
                  </Section>
                )}

                {selected && selectedIsQr && (
                  <Section title="QR code">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      On export, every certificate gets its own code linking to its public verification page. The code shown here is a sample.
                    </p>
                    <Labeled label="Size" htmlFor="qr-size" aside={<span className="text-xs tabular-nums text-muted-foreground">{Math.round(selected.width)} px</span>}>
                      <input
                        id="qr-size"
                        type="range"
                        min={40}
                        max={Math.max(200, Math.round(Math.min(imageSize.width, imageSize.height) * 0.5))}
                        value={Math.round(selected.width)}
                        onChange={(e) => updateField(selected.id, { width: Number(e.target.value), fontSize: Number(e.target.value) })}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-violet-600"
                      />
                    </Labeled>
                  </Section>
                )}

                {hasBackground && (
                  <Section title="Template">
                    <Labeled label="Category" htmlFor="template-category">
                      <select id="template-category" value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputClass} cursor-pointer`}>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Labeled>
                  </Section>
                )}
              </>
            )}

            {tab === "recipients" &&
              (rows.length === 0 ? (
                <>
                  <Section title="Import a list">
                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-7 text-center transition-colors hover:border-violet-500/50 hover:bg-muted/50">
                      <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm font-medium">Choose a CSV or TXT file</span>
                      <span className="text-xs leading-relaxed text-muted-foreground">CSV with a header row, or a text file with one name per line.</span>
                      <input
                        type="file"
                        accept=".csv,.txt,text/csv,text/plain"
                        className="sr-only"
                        onChange={(e) => {
                          loadRecipientsFile(e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </Section>
                  <Section title="Or paste names">
                    <textarea
                      value={pasted}
                      onChange={(e) => setPasted(e.target.value)}
                      rows={6}
                      placeholder={"Aarav Sharma\nSofia Martinez\nMei Tanaka"}
                      aria-label="Names, one per line"
                      className="w-full resize-y rounded-lg border border-border bg-background p-2.5 text-sm outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                    />
                    <button
                      onClick={() => applyRecipients(pasted, "Pasted list")}
                      disabled={!pasted.trim()}
                      className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-40"
                    >
                      Use this list
                    </button>
                  </Section>
                  <p className="rounded-lg bg-muted/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                    Column headers become placeholders: a <code className="font-mono text-violet-600 dark:text-violet-300">name</code> column fills every{" "}
                    <code className="font-mono text-violet-600 dark:text-violet-300">{"{{name}}"}</code> in your design. One certificate is made per row.
                  </p>
                </>
              ) : (
                <>
                  <Section
                    title="Recipient list"
                    action={
                      <button onClick={clearRecipients} className="text-xs font-medium text-rose-500 hover:underline">
                        Remove list
                      </button>
                    }
                  >
                    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <FileSpreadsheet className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{listName || "Recipient list"}</span>
                        <span className="block text-xs text-muted-foreground">
                          {rows.length.toLocaleString("en-US")} recipient{rows.length === 1 ? "" : "s"} · {columns.length} column{columns.length === 1 ? "" : "s"}
                        </span>
                      </span>
                    </div>
                  </Section>

                  {unmatched.length > 0 && (
                    <div role="alert" className="flex gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        {unmatched.map((p) => `{{${p}}}`).join(", ")} {unmatched.length === 1 ? "has" : "have"} no matching column, so {unmatched.length === 1 ? "it" : "they"} will appear as-is on every certificate.
                      </span>
                    </div>
                  )}

                  <Section title="Placeholders">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Click one to add it to {selected && !selectedIsQr ? "the selected text field" : "the design as a new field"}.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {columns.map((c) => (
                        <button
                          key={c}
                          onClick={() => insertPlaceholder(c)}
                          disabled={!hasBackground}
                          className="rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-1 font-mono text-xs text-violet-600 hover:bg-violet-500/20 disabled:opacity-50 dark:text-violet-300"
                        >
                          {`{{${c}}}`}
                        </button>
                      ))}
                    </div>
                  </Section>

                  <Section title="Preview">
                    <div className="overflow-hidden rounded-xl border border-border">
                      <div className="max-h-72 overflow-auto no-scrollbar">
                        <table className="w-full text-left text-xs">
                          <thead className="sticky top-0 bg-muted text-muted-foreground">
                            <tr>
                              <th className="w-8 px-2 py-1.5 font-medium">#</th>
                              {columns.slice(0, 3).map((c) => (
                                <th key={c} className="px-2 py-1.5 font-medium">
                                  {c}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.slice(0, 200).map((row, i) => (
                              <tr
                                key={i}
                                onClick={() => setPreviewIndex(i)}
                                aria-selected={previewIndex === i}
                                className={`cursor-pointer border-t border-border transition-colors ${previewIndex === i ? "bg-violet-500/15 text-foreground" : "text-muted-foreground hover:bg-muted/60"}`}
                              >
                                <td className="px-2 py-1.5 tabular-nums">{i + 1}</td>
                                {columns.slice(0, 3).map((c) => (
                                  <td key={c} className="max-w-[120px] truncate px-2 py-1.5">
                                    {row[c]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {rows.length > 200 && <p className="border-t border-border px-2.5 py-1.5 text-xs text-muted-foreground">Showing the first 200 rows.</p>}
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">Click a row to see that person&apos;s certificate on the canvas.</p>
                  </Section>
                </>
              ))}
          </div>
        </aside>

        {/* Workspace */}
        <main className="relative flex min-w-0 flex-1 flex-col">
          {notice && (
            <div
              role={notice.tone === "error" ? "alert" : "status"}
              className={`absolute left-1/2 top-4 z-30 flex max-w-[min(90%,520px)] -translate-x-1/2 items-start gap-2 rounded-xl border bg-card px-4 py-2.5 text-sm shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 ${
                notice.tone === "ok" ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "border-rose-500/30 text-rose-600 dark:text-rose-400"
              }`}
            >
              {notice.tone === "ok" ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
              <span>{notice.text}</span>
              <button onClick={() => setNotice(null)} aria-label="Dismiss" className="-mr-1 ml-1 rounded p-0.5 opacity-60 hover:opacity-100">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div
            ref={workspaceRef}
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes("Files")) {
                e.preventDefault();
                setDragOver(true);
              }
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (!file) return;
              if (file.type.startsWith("image/")) loadBackgroundFile(file);
              else {
                loadRecipientsFile(file);
                setTab("recipients");
              }
            }}
            className={`relative flex-1 overflow-auto transition-colors ${dragOver ? "bg-violet-500/10" : "bg-muted/40"}`}
            style={{
              backgroundImage: `radial-gradient(${resolvedTheme === "dark" ? "#1e293b" : "#cbd5e1"} 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          >
            <div className="flex min-h-full min-w-full items-center justify-center p-10" style={{ width: "max-content" }}>
              {loadingTemplate ? (
                <div className="flex flex-col items-center gap-3 text-muted-foreground" role="status">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm">Opening template…</span>
                </div>
              ) : !hasBackground || !backgroundImage ? (
                <div className="w-[min(28rem,80vw)] rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
                    <Upload className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-xl font-semibold tracking-tight">
                    {fields.length > 0 && !backgroundSrc ? "Upload the background again" : "Start with your certificate"}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Upload the finished design as an image, with the space for the name left empty. You&apos;ll place the name and other fields on top.
                  </p>
                  <label className="mt-6 inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition hover:bg-violet-500">
                    <ImageUp className="h-4 w-4" />
                    Choose image
                    {backgroundInput}
                  </label>
                  <p className="mt-3 text-xs text-muted-foreground">or drag and drop it here · PNG or JPG</p>
                </div>
              ) : (
                <div className="relative select-none rounded-sm bg-white shadow-[0_20px_70px_rgba(0,0,0,0.25)] ring-1 ring-black/10 dark:shadow-[0_20px_70px_rgba(0,0,0,0.6)]">
                  <Stage
                    ref={stageRef}
                    width={stageWidth}
                    height={stageHeight}
                    onMouseDown={(e) => {
                      if (e.target === e.target.getStage() || e.target.name() === "background") setSelectedId(null);
                    }}
                    onTouchStart={(e) => {
                      if (e.target === e.target.getStage() || e.target.name() === "background") setSelectedId(null);
                    }}
                  >
                    <Layer>
                      <KonvaImage name="background" image={backgroundImage} width={stageWidth} height={stageHeight} />

                      {fields.map((field) =>
                        isQr(field) ? (
                          <KonvaImage
                            key={field.id}
                            id={field.id}
                            image={sampleQr}
                            x={field.x * scale}
                            y={field.y * scale}
                            width={field.width * scale}
                            height={field.width * scale}
                            draggable
                            onMouseDown={() => setSelectedId(field.id)}
                            onTap={() => setSelectedId(field.id)}
                            onDragEnd={(e) => updateField(field.id, { x: Math.round(e.target.x() / scale), y: Math.round(e.target.y() / scale) })}
                            onTransform={(e) => {
                              const node = e.target;
                              const size = Math.max(40, (node.width() * node.scaleX()) / scale);
                              node.scaleX(1);
                              node.scaleY(1);
                              updateField(field.id, { x: node.x() / scale, y: node.y() / scale, width: size, fontSize: size });
                            }}
                            onTransformEnd={() => updateField(field.id, (f) => ({ x: Math.round(f.x), y: Math.round(f.y), width: Math.round(f.width), fontSize: Math.round(f.width) }))}
                          />
                        ) : (
                          <Text
                            // Re-created when its font finishes loading so Konva re-measures the glyphs.
                            key={`${field.id}:${loadedFonts.has(field.fontFamily) ? "ready" : "loading"}`}
                            id={field.id}
                            {...textAttrs(field, fillPlaceholders(field.label, previewRow) || " ", scale)}
                            draggable
                            onMouseDown={() => setSelectedId(field.id)}
                            onTap={() => setSelectedId(field.id)}
                            onDragMove={(e) => {
                              // Snap to the horizontal centre of the page and show a guide.
                              const node = e.target;
                              const centre = node.x() + node.width() / 2;
                              const snap = Math.abs(centre - stageWidth / 2) < 6;
                              if (snap) node.x(stageWidth / 2 - node.width() / 2);
                              guideRef.current?.visible(snap);
                            }}
                            onDragEnd={(e) => {
                              guideRef.current?.visible(false);
                              updateField(field.id, { x: Math.round(e.target.x() / scale), y: Math.round(e.target.y() / scale) });
                            }}
                            onTransform={(e) => {
                              const node = e.target;
                              const sx = node.scaleX();
                              const sy = node.scaleY();
                              node.scaleX(1);
                              node.scaleY(1);
                              const anchor = transformerRef.current?.getActiveAnchor() ?? "";
                              const corner = anchor.startsWith("top-") || anchor.startsWith("bottom-");
                              updateField(field.id, (f) => ({
                                x: node.x() / scale,
                                y: node.y() / scale,
                                width: Math.max(40, (node.width() * sx) / scale),
                                // Corner handles scale the text; side handles only change the box width.
                                ...(corner && { fontSize: clamp(f.fontSize * sy, MIN_FONT_SIZE, 2000) }),
                              }));
                            }}
                            onTransformEnd={() => updateField(field.id, (f) => ({ x: Math.round(f.x), y: Math.round(f.y), width: Math.round(f.width), fontSize: Math.round(f.fontSize) }))}
                          />
                        )
                      )}

                      <Line ref={guideRef} points={[stageWidth / 2, 0, stageWidth / 2, stageHeight]} stroke="#8b5cf6" strokeWidth={1} dash={[6, 4]} visible={false} listening={false} />

                      <Transformer
                        ref={transformerRef}
                        rotateEnabled={false}
                        keepRatio
                        flipEnabled={false}
                        anchorSize={9}
                        anchorCornerRadius={2}
                        anchorStroke="#7c3aed"
                        borderStroke="#7c3aed"
                        enabledAnchors={
                          selectedIsQr
                            ? ["top-left", "top-right", "bottom-left", "bottom-right"]
                            : ["middle-left", "middle-right", "top-left", "top-right", "bottom-left", "bottom-right"]
                        }
                        boundBoxFunc={(oldBox, newBox) => (newBox.width < 30 || newBox.height < 8 ? oldBox : newBox)}
                      />
                    </Layer>
                  </Stage>
                </div>
              )}
            </div>
          </div>

          {/* Recipient preview bar */}
          {hasBackground && rows.length > 0 && (
            <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-t border-border bg-card px-4">
              <div className="flex min-w-0 items-center gap-2">
                <span className="hidden text-xs text-muted-foreground sm:inline">Previewing</span>
                <button
                  onClick={() => setPreviewIndex((i) => (i === null ? 0 : (i - 1 + rows.length) % rows.length))}
                  aria-label="Previous recipient"
                  className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-0 truncate text-sm font-medium" aria-live="polite">
                  {previewRow ? recipientName(previewRow) || `Row ${(previewIndex ?? 0) + 1}` : "Placeholders"}
                  {previewRow && (
                    <span className="ml-2 text-xs font-normal tabular-nums text-muted-foreground">
                      {(previewIndex ?? 0) + 1} of {rows.length.toLocaleString("en-US")}
                    </span>
                  )}
                </span>
                <button
                  onClick={() => setPreviewIndex((i) => (i === null ? 0 : (i + 1) % rows.length))}
                  aria-label="Next recipient"
                  className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <button onClick={() => setPreviewIndex((i) => (i === null ? 0 : null))} className="whitespace-nowrap text-xs font-medium text-violet-600 hover:underline dark:text-violet-300">
                {previewRow ? "Show placeholders" : "Show real names"}
              </button>
            </div>
          )}

          {/* Export progress */}
          {exporting && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Exporting certificates">
              <div className="w-[min(90%,380px)] rounded-2xl border border-border bg-card p-6 shadow-2xl">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Exporting…</span>
                  <span className="tabular-nums text-muted-foreground">
                    {exporting.done.toLocaleString("en-US")} / {exporting.total.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={exporting.total} aria-valuenow={exporting.done}>
                  <div className="h-full rounded-full bg-violet-600 transition-[width] duration-150" style={{ width: `${(exporting.done / Math.max(1, exporting.total)) * 100}%` }} />
                </div>
                <p className="mt-3 truncate text-xs text-muted-foreground">{exporting.label}</p>
                {exporting.total > 1 && (
                  <button
                    onClick={() => {
                      cancelExportRef.current = true;
                    }}
                    className="mt-4 h-9 w-full rounded-lg border border-border text-sm font-medium transition hover:bg-muted"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
