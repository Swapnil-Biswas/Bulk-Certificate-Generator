// Import Konva piecewise (as react-konva does): the package's Node entry point needs the native
// `canvas` module, which would break server rendering of the editor page.
import { Stage } from "konva/lib/Stage";
import { Layer } from "konva/lib/Layer";
import { Text as KonvaText } from "konva/lib/shapes/Text";
import { Image as KonvaImage } from "konva/lib/shapes/Image";
import QRCode from "qrcode";

/**
 * Shared certificate logic for the editor canvas and the exporter.
 * Both go through the same helpers so what is exported matches what is on screen.
 */

export type Alignment = "left" | "center" | "right";

/** Positions and sizes are stored in the background image's own pixels. */
export type Field = {
  id: string;
  type?: "text" | "qr";
  label: string;
  x: number;
  y: number;
  width: number;
  /** Text: font size (the maximum when auto-fit is on). QR: edge length. */
  fontSize: number;
  fontFamily: string;
  fill: string;
  align: Alignment;
  /** Shrink the text on one line so it never overflows the field's width. */
  autoFit: boolean;
};

export type Row = Record<string, string>;

export const FONT_OPTIONS = [
  "Inter",
  "Great Vibes",
  "Pacifico",
  "Dancing Script",
  "Playfair Display",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Lora",
  "Oswald",
  "Cinzel",
  "Cormorant Garamond",
  "Merriweather",
  "Josefin Sans",
  "Bebas Neue",
  "Abril Fatface",
  "Lobster",
  "Allura",
  "Alex Brush",
  "Sacramento",
  "Parisienne",
  "Satisfy",
  "Tangerine",
  "Kaushan Script",
  "Courgette",
  "Marck Script",
];

export const MIN_FONT_SIZE = 8;

const uid = () => Math.random().toString(36).slice(2, 11);

export function createTextField(image: { width: number; height: number }, label = "{{name}}"): Field {
  // Sized relative to the artwork so a new field looks right on a 800px or a 4000px design.
  const width = Math.round(image.width * 0.6);
  const fontSize = Math.max(16, Math.round(image.height * 0.08));
  return {
    id: `field-${uid()}`,
    type: "text",
    label,
    x: Math.round((image.width - width) / 2),
    y: Math.round(image.height * 0.45 - fontSize / 2),
    width,
    fontSize,
    fontFamily: "Great Vibes",
    fill: "#111827",
    align: "center",
    autoFit: true,
  };
}

export function createQrField(image: { width: number; height: number }): Field {
  const size = Math.max(60, Math.round(Math.min(image.width, image.height) * 0.14));
  const margin = Math.round(size * 0.4);
  return {
    id: `qr-${uid()}`,
    type: "qr",
    label: "Verification QR",
    x: image.width - size - margin,
    y: image.height - size - margin,
    width: size,
    fontSize: size,
    fontFamily: "Inter",
    fill: "#000000",
    align: "left",
    autoFit: false,
  };
}

export const isQr = (field: Field) => field.type === "qr";

/* ───────────── placeholders ───────────── */

const PLACEHOLDER = /\{\{\s*([^{}]+?)\s*\}\}/g;

const normalise = (key: string) => key.trim().toLowerCase();

/** Placeholder names used across all text fields, e.g. ["name", "course"]. */
export function placeholdersIn(fields: Field[]): string[] {
  const found = new Set<string>();
  for (const field of fields) {
    if (isQr(field)) continue;
    for (const match of field.label.matchAll(PLACEHOLDER)) found.add(match[1].trim());
  }
  return [...found];
}

/** Replaces {{column}} with the row's value. Matching ignores case and surrounding spaces. */
export function fillPlaceholders(text: string, row: Row | null | undefined): string {
  if (!row) return text;
  const lookup = new Map(Object.entries(row).map(([key, value]) => [normalise(key), value ?? ""]));
  return text.replace(PLACEHOLDER, (whole, key: string) => {
    const value = lookup.get(normalise(key));
    return value === undefined ? whole : String(value).trim();
  });
}

/** Placeholders in the design that no column of the recipient list can fill. */
export function unmatchedPlaceholders(fields: Field[], columns: string[]): string[] {
  const available = new Set(columns.map(normalise));
  return placeholdersIn(fields).filter((p) => !available.has(normalise(p)));
}

/* ───────────── text fitting ───────────── */

let measurer: KonvaText | null = null;

/**
 * Largest font size (up to the field's own size) at which `text` fits the field's width on one line.
 * Call again once the font has loaded — before that the browser measures a fallback face.
 */
export function fittedFontSize(text: string, field: Field): number {
  if (!field.autoFit || !text) return field.fontSize;
  measurer ??= new KonvaText({ wrap: "none" });
  measurer.setAttrs({ text, fontFamily: field.fontFamily, fontSize: 100 });
  const widthAt100 = measurer.getTextWidth();
  if (!widthAt100) return field.fontSize;
  // Small safety margin: Konva drops characters that overflow a no-wrap box.
  const fits = (field.width / widthAt100) * 100 * 0.96;
  return Math.max(MIN_FONT_SIZE, Math.min(field.fontSize, fits));
}

/** Konva attributes for a text field at the given zoom, shared by the editor and the exporter. */
export function textAttrs(field: Field, text: string, scale: number) {
  const size = fittedFontSize(text, field);
  const base = {
    text,
    x: field.x * scale,
    y: field.y * scale,
    width: field.width * scale,
    fontSize: size * scale,
    fontFamily: field.fontFamily,
    fill: field.fill,
    align: field.align,
    lineHeight: 1,
    padding: 0,
  };
  return field.autoFit
    ? // One line, vertically centred in the line box of the full-size text, so shrinking keeps it in place.
      { ...base, wrap: "none" as const, height: field.fontSize * scale, verticalAlign: "middle" as const }
    : { ...base, wrap: "word" as const, height: undefined, verticalAlign: "top" as const };
}

/* ───────────── recipients ───────────── */

const NAME_KEYS = ["name", "names", "full name", "fullname", "full_name", "recipient", "participant", "student"];

export function recipientName(row: Row): string {
  const lookup = new Map(Object.entries(row).map(([key, value]) => [normalise(key), value]));
  for (const key of NAME_KEYS) {
    const value = lookup.get(key);
    if (value && value.trim()) return value.trim();
  }
  const first = Object.values(row).find((value) => value && String(value).trim());
  return first ? String(first).trim() : "";
}

/** Safe, readable file names that stay unique within one export — two "Alex Kim" rows don't overwrite each other. */
export function makeFileNamer() {
  const used = new Map<string, number>();
  return (row: Row | null, index: number, fallback: string): string => {
    const raw = (row && recipientName(row)) || fallback || `certificate_${index + 1}`;
    const base =
      raw
        .normalize("NFC")
        .replace(/[\\/:*?"<>|\u0000-\u001f]/g, " ")
        .replace(/\s+/g, "_")
        .replace(/^[._]+|[._]+$/g, "")
        .slice(0, 80) || `certificate_${index + 1}`;
    const seen = used.get(base.toLowerCase()) ?? 0;
    used.set(base.toLowerCase(), seen + 1);
    return seen === 0 ? base : `${base}_${seen + 1}`;
  };
}

/* ───────────── rendering for export ───────────── */

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed to load"));
    img.src = src;
  });
}

export async function qrImage(url: string): Promise<HTMLImageElement> {
  return loadImage(await QRCode.toDataURL(url, { margin: 1, width: 600, errorCorrectionLevel: "M" }));
}

export async function ensureFonts(fields: Field[]) {
  const families = [...new Set(fields.filter((f) => !isQr(f)).map((f) => f.fontFamily))];
  await Promise.all(families.map((family) => document.fonts.load(`16px "${family}"`).catch(() => undefined)));
}

/**
 * An off-screen stage at the artwork's full resolution. Rendering here, rather than
 * capturing the on-screen canvas, keeps exports independent of zoom and selection.
 */
export function createExportRenderer(background: HTMLImageElement, fields: Field[]) {
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;left:-99999px;top:0;pointer-events:none;";
  document.body.appendChild(container);

  const width = background.naturalWidth || background.width;
  const height = background.naturalHeight || background.height;
  const stage = new Stage({ container, width, height });
  const layer = new Layer({ listening: false });
  stage.add(layer);
  layer.add(new KonvaImage({ image: background, width, height }));

  const textNodes = new Map<string, KonvaText>();
  const qrNodes = new Map<string, KonvaImage>();
  for (const field of fields) {
    if (isQr(field)) {
      const node = new KonvaImage({ image: undefined, x: field.x, y: field.y, width: field.width, height: field.width });
      qrNodes.set(field.id, node);
      layer.add(node);
    } else {
      const node = new KonvaText(textAttrs(field, field.label, 1));
      textNodes.set(field.id, node);
      layer.add(node);
    }
  }

  return {
    width,
    height,
    hasQr: qrNodes.size > 0,
    /** Draws one certificate and returns its canvas (reused between calls). */
    render(row: Row | null, qr: HTMLImageElement | null): HTMLCanvasElement {
      for (const field of fields) {
        const text = textNodes.get(field.id);
        if (text) text.setAttrs(textAttrs(field, fillPlaceholders(field.label, row), 1));
        const code = qrNodes.get(field.id);
        if (code) code.image(qr ?? undefined);
      }
      layer.draw();
      return stage.toCanvas({ pixelRatio: 1 });
    },
    destroy() {
      stage.destroy();
      container.remove();
    },
  };
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: "image/png" | "image/jpeg", quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the image"))), type, quality)
  );
}
