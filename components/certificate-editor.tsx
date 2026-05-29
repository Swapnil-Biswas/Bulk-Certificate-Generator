"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ChangeEvent,
} from "react";

import {
  Stage,
  Layer,
  Text,
  Image as KonvaImage,
  Transformer,
} from "react-konva";

import useImage from "use-image";
import Papa from "papaparse";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import {
  Upload,
  Plus,
  Minus,
  Copy,
  Trash2,
  Type,
  Layers3,
  FileSpreadsheet,
  Download,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  ChevronLeft,
  Check,
} from "lucide-react";

import { useRouter } from "next/navigation";

type Alignment = "left" | "center" | "right";

type TextField = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  align: Alignment;
  autoFit: boolean;
};

const FONT_OPTIONS = [
  "Arial",
  "Georgia",
  "Times New Roman",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Segoe UI",
  "Roboto",
  "Inter",
  "Poppins",
  "Montserrat",
  "Raleway",
  "Lato",
  "Nunito",
  "Open Sans",
  "Playfair Display",
  "Merriweather",
  "Cormorant Garamond",
  "Cinzel",
  "Great Vibes",
  "Pacifico",
  "Dancing Script",
  "Satisfy",
  "Lobster",
  "Sacramento",
  "Parisienne",
  "Allura",
  "Alex Brush",
];

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function measureAutoFont(
  text: string,
  width: number,
  fontFamily: string
) {
  if (typeof window === "undefined") return 42;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return 42;

  for (let size = 160; size >= 10; size--) {
    ctx.font = `${size}px ${fontFamily}`;
    const measured = ctx.measureText(text).width;

    if (measured <= width - 12) {
      return size;
    }
  }

  return 10;
}

function replacePlaceholders(
  text: string,
  row: Record<string, string>
) {
  return text.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const cleanedKey = key.trim();
    return row[cleanedKey] ?? "";
  });
}


function createField(
  label = "{{name}}"
): TextField {
  return {
    id: generateId(),
    label,
    x: 400,
    y: 300,
    width: 420,
    fontSize: 72,
    fontFamily: "Great Vibes",
    fill: "#111827",
    align: "center",
    autoFit: true,
  };
}

export default function CertificateEditor() {
  const router = useRouter();
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const previousTemplateUrlRef = useRef<string | null>(null);

  const [backgroundSrc, setBackgroundSrc] =
    useState<string | null>(null);

  const [backgroundImage] =
    useImage(backgroundSrc || "");

  const [fields, setFields] = useState<
    TextField[]
  >([createField()]);

  const [selectedFieldId, setSelectedFieldId] =
    useState<string | null>(null);

  const [rows, setRows] = useState<Record<string, string>[]>([]);

  const [canvasMeta, setCanvasMeta] =
    useState({
      originalWidth: 1,
      originalHeight: 1,
      scaledWidth: 1,
      scaledHeight: 1,
      scale: 1,
    });

  const selectedField = useMemo(() => {
    return (
      fields.find(
        (field) =>
          field.id === selectedFieldId
      ) || null
    );
  }, [fields, selectedFieldId]);

  const fitCanvasToViewport =
    useCallback(() => {
      if (
        !workspaceRef.current ||
        !backgroundImage
      )
        return;

      const rect =
        workspaceRef.current.getBoundingClientRect();

      const margin = 24;
      const availableWidth = Math.max(100, rect.width - margin);
      const availableHeight = Math.max(100, rect.height - margin);

      const imgWidth =
        backgroundImage.width;

      const imgHeight =
        backgroundImage.height;

      if (!imgWidth || !imgHeight) return;

      const scale = Math.min(
        availableWidth / imgWidth,
        availableHeight / imgHeight,
        1
      );

      setCanvasMeta({
        originalWidth: imgWidth,
        originalHeight: imgHeight,
        scaledWidth: imgWidth * scale,
        scaledHeight: imgHeight * scale,
        scale,
      });
    }, [backgroundImage]);

  useEffect(() => {
    if (backgroundImage) {
      fitCanvasToViewport();
    }
  }, [backgroundImage, fitCanvasToViewport]);

  useEffect(() => {
    if (!workspaceRef.current) return;

    const observer = new ResizeObserver(() => {
      fitCanvasToViewport();
    });

    observer.observe(workspaceRef.current);

    return () => {
      observer.disconnect();
    };
  }, [fitCanvasToViewport]);

  useEffect(() => {
    if (!stageRef.current || !transformerRef.current) return;

    if (!selectedFieldId) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
      return;
    }

    const node = stageRef.current.findOne(
      `#${selectedFieldId}`
    );

    if (node) {
      transformerRef.current.nodes([node]);
      transformerRef.current
        .getLayer()
        ?.batchDraw();
    }
  }, [selectedFieldId]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previousTemplateUrlRef.current) {
        URL.revokeObjectURL(previousTemplateUrlRef.current);
      }
    };
  }, []);

  const updateField = (
    id: string,
    updates: Partial<TextField>
  ) => {
    setFields((prev) =>
      prev.map((field) => {
        if (field.id !== id) return field;

        const next = {
          ...field,
          ...updates,
        };

        if (
          next.autoFit &&
          (
            updates.label !== undefined ||
            updates.width !== undefined ||
            updates.fontFamily !== undefined
          )
        ) {
          next.fontSize = measureAutoFont(
            next.label,
            next.width,
            next.fontFamily
          );
        }

        return next;
      })
    );
  };

  const addField = () => {
    const field = createField("{{field}}");

    setFields((prev) => [...prev, field]);
    setSelectedFieldId(field.id);
  };

  const duplicateField = () => {
    if (!selectedField) return;

    const copy = {
      ...selectedField,
      id: generateId(),
      x: selectedField.x + 20,
      y: selectedField.y + 20,
    };

    setFields((prev) => [...prev, copy]);
    setSelectedFieldId(copy.id);
  };

  const deleteField = () => {
    if (!selectedFieldId) return;

    setFields((prev) =>
      prev.filter(
        (field) =>
          field.id !== selectedFieldId
      )
    );

    setSelectedFieldId(null);
  };

  const handleTemplateUpload = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previousTemplateUrlRef.current) {
      URL.revokeObjectURL(previousTemplateUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    previousTemplateUrlRef.current = url;
    setBackgroundSrc(url);
  };

  const handleDataUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      if (file.name.endsWith(".csv")) {
        // PapaParse CSV parser
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const cleanedRows = (results.data as any[])
              .filter(Boolean)
              .filter((row) => typeof row === "object");
            setRows(cleanedRows as Record<string, string>[]);
          },
          error: (error: any) => {
            console.error("CSV parsing error:", error);
          }
        });
      } else {
        // TXT parsing: one name per line, create rows array
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        const parsedRows = lines.map(line => ({
          name: line.trim()
        }));
        setRows(parsedRows);
      }
    };
    reader.readAsText(file);
  };

  const handleExportPNG = async () => {
    if (!stageRef.current) return;

    const previousSelection = selectedFieldId;
    setSelectedFieldId(null);

    await new Promise((resolve) => setTimeout(resolve, 80));

    const pixelRatio =
      canvasMeta.scale > 0 ? 1 / canvasMeta.scale : 1;

    // normal single export
    if (rows.length === 0) {
      const dataUrl = stageRef.current.toDataURL({
        pixelRatio,
      });

      const link = document.createElement("a");
      link.download = "certificate.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSelectedFieldId(previousSelection);
      return;
    }

    // bulk export
    const zip = new JSZip();
    const stage = stageRef.current;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Update Konva nodes directly for high-speed capture
      fields.forEach((field) => {
        const node = stage.findOne(`#${field.id}`);
        if (node) {
          node.text(replacePlaceholders(field.label, row));
        }
      });

      // Force a redraw of the layer
      stage.getLayers()[0].batchDraw();

      // Brief pause to ensure the browser has processed the redraw before capture
      await new Promise((resolve) => setTimeout(resolve, 50));

      const dataUrl = stage.toDataURL({
        pixelRatio,
      });

      const base64Data = dataUrl.split(",")[1];
      const baseName = row.name || row.Name || row.email || "certificate";
      const fileName = `${baseName.replace(/[^a-z0-9]/gi, "_")}_${i + 1}`;

      zip.file(
        `${fileName}.png`,
        base64Data,
        { base64: true }
      );
    }

    // Restore original text in the view by triggering a React re-render
    setFields([...fields]);
    setSelectedFieldId(previousSelection);

    const blob = await zip.generateAsync({
      type: "blob",
    });

    saveAs(blob, "certificates.zip");
  };

  const handleExportPDF = async () => {
    if (!stageRef.current) return;

    const previousSelection = selectedFieldId;
    setSelectedFieldId(null);

    await new Promise((resolve) => setTimeout(resolve, 60));

    const pixelRatio =
      canvasMeta.scale > 0 ? 1 / canvasMeta.scale : 1;

    const dataUrl = stageRef.current.toDataURL({
      pixelRatio,
    });

    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: canvasMeta.originalWidth > canvasMeta.originalHeight ? "landscape" : "portrait",
        unit: "px",
        format: [canvasMeta.originalWidth, canvasMeta.originalHeight]
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, canvasMeta.originalWidth, canvasMeta.originalHeight);
      pdf.save("certificate.pdf");
    } catch (err) {
      console.warn("jsPDF dynamic import failed, printing instead:", err);
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`<img src="${dataUrl}" style="width:100%; height:auto;" onload="window.print();window.close();" />`);
        win.document.close();
      }
    }

    setSelectedFieldId(previousSelection);
  };

  const handleStageMouseDown = (e: any) => {
    if (!e?.target) return;

    const clickedOnTransformer =
      e.target.getParent?.()?.className === "Transformer";

    const clickedOnField =
      fields.some((field) => field.id === e.target.id?.());

    if (!clickedOnTransformer && !clickedOnField) {
      setSelectedFieldId(null);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800">
      {/* LEFT TOOLS */}
      <aside className="w-[280px] shrink-0 h-full border-r border-slate-200/80 bg-white flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-10">
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-600 rounded-lg text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-slate-900 tracking-tight leading-tight">CertGen Studio</h1>
              <p className="text-[10px] text-slate-500 font-medium">Certificate Editor</p>
            </div>
          </div>
          <span className="text-[9px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-bold">
            v2.0
          </span>
        </div>

        {/* Scrollable Tools Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans">
          {/* Template Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Template Upload</label>
              {backgroundSrc && (
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                  <Check className="h-3 w-3" /> Ready
                </span>
              )}
            </div>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-violet-400 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50/20 cursor-pointer transition duration-150 group">
              <Upload className="h-5 w-5 text-slate-400 group-hover:text-violet-600 transition-colors mb-1.5" />
              <span className="text-xs font-bold text-slate-700 group-hover:text-slate-950">
                {backgroundSrc ? 'Change Template' : 'Choose Background'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 10MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleTemplateUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Canvas Actions</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={addField}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white py-1.5 px-3 text-xs font-semibold shadow-sm transition duration-150"
              >
                <Plus className="h-3.5 w-3.5" /> Add Text
              </button>

              <button
                onClick={duplicateField}
                disabled={!selectedField}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 py-1.5 px-3 text-xs font-semibold transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </button>

              <button
                onClick={deleteField}
                disabled={!selectedFieldId}
                className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 py-1.5 px-3 text-xs font-semibold transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Selected
              </button>
            </div>
          </div>

          {/* Layers */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Layers ({fields.length})</label>
            {fields.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No text layers yet.</p>
            ) : (
              <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                {fields.map((field) => (
                  <button
                    key={field.id}
                    onClick={() => setSelectedFieldId(field.id)}
                    className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition duration-150 border ${selectedFieldId === field.id
                      ? "bg-violet-50/70 border-violet-200 text-violet-700 font-semibold shadow-sm"
                      : "bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                  >
                    <Type className={`h-3.5 w-3.5 shrink-0 ${selectedFieldId === field.id ? "text-violet-600" : "text-slate-400"}`} />
                    <span className="truncate flex-1">{field.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Typography */}
          {selectedField && (
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Typography</label>

              <div className="space-y-2.5 bg-slate-50/60 rounded-xl p-3 border border-slate-100">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Text Content</label>
                  <input
                    type="text"
                    value={selectedField.label}
                    onChange={(e) =>
                      updateField(selectedField.id, {
                        label: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 bg-white font-medium transition"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Font Family</label>
                  <select
                    value={selectedField.fontFamily}
                    onChange={(e) => {
                      updateField(selectedField.id, {
                        fontFamily: e.target.value,
                      });

                      setTimeout(() => {
                        transformerRef.current?.forceUpdate();
                        stageRef.current?.batchDraw();
                      }, 50);
                    }}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 bg-white font-medium transition cursor-pointer"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Color</label>
                    <div className="flex items-center gap-1.5">
                      <div className="relative h-7 w-7 rounded border border-slate-200 overflow-hidden shrink-0 cursor-pointer shadow-sm">
                        <input
                          type="color"
                          value={selectedField.fill}
                          onChange={(e) =>
                            updateField(selectedField.id, {
                              fill: e.target.value,
                            })
                          }
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                        <div className="h-full w-full" style={{ backgroundColor: selectedField.fill }} />
                      </div>
                      <input
                        type="text"
                        value={selectedField.fill.toUpperCase()}
                        onChange={(e) =>
                          updateField(selectedField.id, {
                            fill: e.target.value,
                          })
                        }
                        className="w-full min-w-0 rounded-lg border border-slate-200 px-1 py-1 text-[10px] text-slate-700 font-mono text-center focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Alignment</label>
                    <div className="inline-flex rounded-lg bg-slate-200/60 p-0.5 w-full">
                      {(["left", "center", "right"] as Alignment[]).map((align) => {
                        const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
                        return (
                          <button
                            key={align}
                            onClick={() =>
                              updateField(selectedField.id, {
                                align,
                              })
                            }
                            className={`flex-1 flex items-center justify-center rounded-md py-1 transition duration-150 ${selectedField.align === align
                              ? "bg-white text-violet-600 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                              }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {!selectedField.autoFit && (
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Font Size ({selectedField.fontSize}px)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="12"
                        max="160"
                        value={selectedField.fontSize}
                        onChange={(e) =>
                          updateField(selectedField.id, {
                            fontSize: parseInt(e.target.value) || 12,
                          })
                        }
                        className="flex-1 accent-violet-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="number"
                        value={selectedField.fontSize}
                        onChange={(e) =>
                          updateField(selectedField.id, {
                            fontSize: parseInt(e.target.value) || 12,
                          })
                        }
                        className="w-10 text-center rounded-lg border border-slate-200 px-1 py-0.5 text-[10px] font-medium focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5 mt-1">
                  <div>
                    <span className="text-xs font-semibold text-slate-700">Auto-fit width size</span>
                    <p className="text-[9px] text-slate-400 leading-tight">Scale text to fit container</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateField(selectedField.id, { autoFit: !selectedField.autoFit })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${selectedField.autoFit ? 'bg-violet-600' : 'bg-slate-200'
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${selectedField.autoFit ? 'translate-x-4' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Data Source */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data Source</label>
            <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition duration-150">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-slate-700 block">Import CSV or TXT</span>
                <span className="text-[9px] text-slate-400 block font-normal leading-none mt-0.5">
                  {rows.length > 0 ? `${rows.length} rows loaded` : 'Place multiple fields'}
                </span>
              </div>
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleDataUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Export */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Export</label>
            <div className="space-y-1.5">
              <button
                onClick={handleExportPNG}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2 px-4 text-xs font-bold shadow-md transition duration-150"
              >
                <Download className="h-3.5 w-3.5" /> Export PNG
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 py-2 px-4 text-xs font-bold transition duration-150"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* WORKSPACE */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100/60">
        {/* Workspace Top Header */}
        <header className="h-14 border-b border-slate-200/80 bg-white flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-1 hover:bg-slate-100 rounded-md transition text-slate-500 hover:text-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">Project / Certificate Template</span>
              <h2 className="text-xs font-bold text-slate-800 leading-tight">
                {backgroundSrc ? "Custom Certificate Design" : "Untitled Template"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {backgroundImage && (
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
                <span>Dimensions: {backgroundImage.width} × {backgroundImage.height} px</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold bg-white border border-slate-200 shadow-sm px-1 py-1 rounded-lg">
              <button
                onClick={() => {
                  const newScale = Math.max(0.1, canvasMeta.scale - 0.1);
                  setCanvasMeta(prev => ({
                    ...prev,
                    scale: newScale,
                    scaledWidth: prev.originalWidth * newScale,
                    scaledHeight: prev.originalHeight * newScale,
                  }));
                }}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="px-1 min-w-[40px] text-center">{Math.round(canvasMeta.scale * 100)}%</span>
              <button
                onClick={() => {
                  const newScale = Math.min(3, canvasMeta.scale + 0.1);
                  setCanvasMeta(prev => ({
                    ...prev,
                    scale: newScale,
                    scaledWidth: prev.originalWidth * newScale,
                    scaledHeight: prev.originalHeight * newScale,
                  }));
                }}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </header>

        {/* Workspace Canvas Area */}
        <div
          ref={workspaceRef}
          className="flex-1 flex items-center justify-center overflow-hidden p-6 relative bg-slate-200/30"
          style={{
            backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          {!backgroundImage ? (
            <div className="flex flex-col items-center justify-center text-center max-w-sm p-8 rounded-2xl border border-slate-200/60 bg-white shadow-xl">
              <div className="p-4 bg-gradient-to-tr from-violet-50 to-indigo-50 text-violet-600 rounded-2xl mb-4 shadow-sm">
                <Upload className="h-8 w-8" />
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Upload your certificate template
              </h2>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Select a blank high-resolution image to get started. You'll be able to place dynamic text fields on top of it.
              </p>
              <label className="mt-6 inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded-xl cursor-pointer transition shadow-md shadow-violet-100">
                Browse Files
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleTemplateUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-center select-none shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-lg overflow-hidden border border-slate-200/80 bg-white">
              <Stage
                ref={stageRef}
                width={canvasMeta.scaledWidth}
                height={canvasMeta.scaledHeight}
                onMouseDown={handleStageMouseDown}
                onTouchStart={handleStageMouseDown}
              >
                <Layer>
                  <KonvaImage
                    image={backgroundImage}
                    width={canvasMeta.scaledWidth}
                    height={canvasMeta.scaledHeight}
                  />

                  {fields.map((field) => (
                    <Text
                      key={field.id}
                      id={field.id}
                      text={field.label}
                      x={field.x * canvasMeta.scale}
                      y={field.y * canvasMeta.scale}
                      width={field.width * canvasMeta.scale}
                      fontSize={field.fontSize * canvasMeta.scale}
                      fontFamily={field.fontFamily}
                      fill={field.fill}
                      align={field.align}
                      draggable
                      lineHeight={1}
                      padding={0}
                      onClick={() => setSelectedFieldId(field.id)}
                      onTap={() => setSelectedFieldId(field.id)}
                      onDragEnd={(e) => {
                        updateField(field.id, {
                          x: e.target.x() / canvasMeta.scale,
                          y: e.target.y() / canvasMeta.scale,
                        });
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();

                        node.scaleX(1);
                        node.scaleY(1);

                        updateField(field.id, {
                          width: (node.width() * scaleX) / canvasMeta.scale,
                          fontSize: Math.max(
                            12,
                            Math.round(field.fontSize * scaleY)
                          ),
                        });

                        setTimeout(() => {
                          transformerRef.current?.forceUpdate();
                          stageRef.current?.batchDraw();
                        }, 10);
                      }}
                    />
                  ))}

                  <Transformer
                    ref={transformerRef}
                    rotateEnabled={false}
                    keepRatio={false}
                    enabledAnchors={[
                      "top-left",
                      "top-center",
                      "top-right",
                      "middle-left",
                      "middle-right",
                      "bottom-left",
                      "bottom-center",
                      "bottom-right",
                    ]}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 50 || newBox.height < 10) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                </Layer>
              </Stage>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
