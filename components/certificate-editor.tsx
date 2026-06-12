"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

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
  ChevronLeft,
  AlignCenter,
  AlignLeft,
  AlignRight,
  QrCode,
} from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { Logo } from "@/components/logo";

type Alignment = "left" | "center" | "right";

type TextField = {
  id: string;
  type?: "text" | "qr";
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
];

function createField(label = "{{name}}"): TextField {
  return {
    id: `field-${Math.random().toString(36).substr(2, 9)}`,
    type: "text",
    label,
    x: 50,
    y: 50,
    width: 400,
    fontSize: 72,
    fontFamily: "Great Vibes",
    fill: "#111827",
    align: "center",
    autoFit: true,
  };
}

function createQRField(): TextField {
  return {
    id: `qr-${Math.random().toString(36).substr(2, 9)}`,
    type: "qr",
    label: "Verification QR",
    x: 50,
    y: 50,
    width: 150,
    fontSize: 150, // Use fontSize as height/size for QR
    fontFamily: "Inter",
    fill: "#000000",
    align: "left",
    autoFit: false,
  };
}

function getFilenameFromRow(row: Record<string, string>, index: number) {
  const possibleKeys = [
    "name",
    "Name",
    "names",
    "Names",
    "Full Name",
    "fullname",
  ];
  for (const key of possibleKeys) {
    if (row[key]) return row[key].trim().replace(/[^a-z0-9]/gi, "_");
  }
  // Fallback to first column
  const values = Object.values(row);
  if (values[0]) return values[0].trim().replace(/[^a-z0-9]/gi, "_");
  return `certificate_${index + 1}`;
}

function replacePlaceholders(text: string, row: Record<string, string>) {
  let output = text;
  Object.entries(row).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    output = output.split(placeholder).join(value);
  });
  return output;
}
function QRNode({ field, scale, isExporting, onSelect, onUpdate }: { 
  field: TextField, 
  scale: number, 
  isExporting: boolean,
  onSelect: () => void, 
  onUpdate: (u: Partial<TextField>) => void 
}) {
  const [qrPlaceholder, setQrPlaceholder] = useState<string | null>(null);

  useEffect(() => {
    // Generate a placeholder QR for the UI
    QRCode.toDataURL("https://certificategenerator.space/verify/placeholder", {
      margin: 1,
      width: 400,
      color: {
        dark: "#000000",
        light: "#ffffff",
      }
    }).then(setQrPlaceholder);
  }, []);

  const [image] = useImage(qrPlaceholder || "");

  return (
    <>
      <KonvaImage
        id={field.id}
        image={image}
        x={field.x * scale}
        y={field.y * scale}
        width={field.width * scale}
        height={field.fontSize * scale}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onUpdate({
            x: e.target.x() / scale,
            y: e.target.y() / scale,
          });
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          // Enforce square aspect ratio by taking the larger scale
          const maxScale = Math.max(scaleX, scaleY);
          
          node.scaleX(1);
          node.scaleY(1);
          
          onUpdate({
            width: (node.width() * maxScale) / scale,
            fontSize: Math.max(40, Math.round(field.fontSize * maxScale)), // Sync fontSize with width for square
          });
        }}
      />
      {!isExporting && (
        <Text
          text="PREVIEW ONLY"
          x={field.x * scale}
          y={(field.y * scale) + (field.fontSize * scale) / 2 - 5}
          width={field.width * scale}
          fontSize={Math.max(8, (field.width * scale) / 8)}
          fontFamily="Inter"
          fontStyle="black"
          fill="white"
          align="center"
          listening={false}
          opacity={0.8}
          shadowColor="black"
          shadowBlur={10}
        />
      )}
    </>
  );
}

export default function CertificateEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateIdFromUrl = searchParams.get("id");
  const { resolvedTheme } = useTheme();

  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const [backgroundSrc, setBackgroundSrc] = useState<string | null>(null);
  const [backgroundImage] = useImage(backgroundSrc || "");
  const [fields, setFields] = useState<TextField[]>([createField()]);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("Untitled Template");
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [activeTab, setActiveTab] = useState<"design" | "layers" | "data">("design");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const [canvasMeta, setCanvasMeta] = useState({
    originalWidth: 1,
    originalHeight: 1,
    scaledWidth: 1,
    scaledHeight: 1,
    scale: 1,
  });

  // Sync template from URL
  useEffect(() => {
    if (templateIdFromUrl) {
      const loadTemplate = async () => {
        try {
          const res = await fetch(`/api/templates/${templateIdFromUrl}`);
          if (res.ok) {
            const data = await res.json();
            setCurrentTemplateId(data.id);
            setTemplateName(data.name);
            setBackgroundSrc(data.imagePath);
            setFields(data.fields as TextField[]);
            if (data.canvasMeta) {
              setCanvasMeta(data.canvasMeta);
            }
          }
        } catch (err) {
          console.error("Failed to load template:", err);
        }
      };
      loadTemplate();
    }
  }, [templateIdFromUrl]);

  const selectedField = useMemo(() => {
    return fields.find((f) => f.id === selectedFieldId);
  }, [fields, selectedFieldId]);

  const handleTemplateUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const workspace = workspaceRef.current;
        if (workspace) {
          const wWidth = workspace.clientWidth - 40;
          const wHeight = workspace.clientHeight - 40;
          let scale = 1;
          if (img.width > wWidth || img.height > wHeight) {
            scale = Math.min(wWidth / img.width, wHeight / img.height);
          }
          setCanvasMeta({
            originalWidth: img.width,
            originalHeight: img.height,
            scaledWidth: img.width * scale,
            scaledHeight: img.height * scale,
            scale,
          });
        }
        setBackgroundSrc(url);
      };
      img.src = url;
    }
  };

  const handleDataUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        let data: Record<string, string>[] = [];

        if (file.name.endsWith(".txt")) {
          // Try parsing as CSV first (might be tab-separated or comma-separated with header)
          const result = Papa.parse(text, { header: true, skipEmptyLines: true });
          const firstRow = result.data[0] as Record<string, string> | undefined;
          // If no headers were found or it looks like a single column list
          if (
            result.data.length > 0 &&
            firstRow &&
            Object.keys(firstRow).length <= 1 &&
            !result.meta.fields?.includes("name")
          ) {
            // Treat as simple list of names
            const lines = text
              .split(/\r?\n/)
              .map((l) => l.trim())
              .filter((l) => l.length > 0);
            data = lines.map((line) => ({ name: line }));
          } else {
            data = result.data as Record<string, string>[];
          }
        } else {
          const result = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
          });
          data = result.data as Record<string, string>[];
        }

        if (data.length > 0) {
          setRows(data);
          setActiveTab("data");
        }
      };
      reader.readAsText(file);
    }
  };

  const addField = () => {
    const field = createField();
    setFields((prev) => [...prev, field]);
    setSelectedFieldId(field.id);
  };

  const addQRField = () => {
    const field = createQRField();
    setFields((prev) => [...prev, field]);
    setSelectedFieldId(field.id);
  };

  const deleteField = () => {
    if (selectedFieldId) {
      setFields((prev) => prev.filter((f) => f.id !== selectedFieldId));
      setSelectedFieldId(null);
    }
  };

  const duplicateField = () => {
    if (selectedField) {
      const copy = {
        ...selectedField,
        id: `field-${Math.random().toString(36).substr(2, 9)}`,
        y: selectedField.y + 40,
      };
      setFields((prev) => [...prev, copy]);
      setSelectedFieldId(copy.id);
    }
  };

  const updateField = (id: string, updates: Partial<TextField>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleSaveTemplate = async (isSaveAs = false) => {
    const payload = {
      name: isSaveAs ? `${templateName} (Copy)` : templateName,
      imagePath: backgroundSrc,
      fields,
      canvasMeta,
      category: "Custom",
    };

    try {
      if (currentTemplateId && !isSaveAs) {
        const res = await fetch(`/api/templates/${currentTemplateId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) alert("Registry updated.");
      } else {
        const res = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          setCurrentTemplateId(data.id);
          alert("New design saved.");
        }
      }
    } catch (err) {
      alert("Persistence operation failed.");
    }
  };

  const handleExportPNG = async () => {
    if (!stageRef.current) return;
    const prevSelection = selectedFieldId;
    setSelectedFieldId(null);
    if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
    setIsExporting(true);
    setExportProgress(0);

    await new Promise((resolve) => setTimeout(resolve, 150));
    const pixelRatio = canvasMeta.scale > 0 ? 1 / canvasMeta.scale : 1;

    if (rows.length === 0) {
      const dataUrl = stageRef.current.toDataURL({ pixelRatio });
      saveAs(dataUrl, `${templateName.replace(/\s+/g, "_")}.png`);
      setSelectedFieldId(prevSelection);
      setIsExporting(false);

      // Log single export
      try {
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: templateName,
            count: 1,
            templateName: templateName,
            format: "PNG",
          }),
        });
      } catch (e) {}
      return;
    }

    // NEW: Initialize Batch to get IDs for QR codes
    let initializedBatch;
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${templateName} - Bulk PNG`,
          count: rows.length,
          templateName: templateName,
          format: "PNG",
          rows: rows,
        }),
      });
      initializedBatch = await res.json();
    } catch (err) {
      console.error("Batch initialization failed", err);
      alert("System failed to initialize batch records. Aborting export.");
      setIsExporting(false);
      return;
    }

    const zip = new JSZip();
    const stage = stageRef.current;
    const qrFields = fields.filter(f => f.type === "qr");

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const certId = initializedBatch.certificates?.[i]?.id;
      
      // 1. Update Text Fields Imperatively
      fields.forEach((f) => {
        if (f.type !== "qr") {
          const node = stage.findOne(`#${f.id}`);
          if (node) node.text(replacePlaceholders(f.label, row));
        }
      });

      // 2. Update QR Fields Imperatively
      if (qrFields.length > 0 && certId) {
        const verifyUrl = `${window.location.origin}/verify/${certId}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 500 });
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise((res) => (qrImg.onload = res));

        qrFields.forEach(f => {
          const node = stage.findOne(`#${f.id}`);
          if (node) node.image(qrImg);
        });
      }

      // 3. Draw and Capture immediately before any re-renders
      stage.batchDraw();
      await new Promise((resolve) => setTimeout(resolve, 50));
      const dataUrl = stage.toDataURL({ pixelRatio });
      
      zip.file(`${getFilenameFromRow(row, i)}.png`, dataUrl.split(",")[1], {
        base64: true,
      });

      // 4. Update progress at the end to trigger re-render AFTER capture
      setExportProgress(Math.round(((i + 1) / rows.length) * 100));
    }

    // Reset UI
    fields.forEach((f) => {
      const node = stage.findOne(`#${f.id}`);
      if (node) {
        if (f.type !== "qr") node.text(f.label);
      }
    });
    stage.getLayers()[0].batchDraw();

    setFields([...fields]);
    setSelectedFieldId(prevSelection);
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "certificates_png.zip");
    setIsExporting(false);
  };

  const handleExportPDF = async () => {
    if (!stageRef.current) return;
    const prevSelection = selectedFieldId;
    setSelectedFieldId(null);
    if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 150));

    const pixelRatio = canvasMeta.scale > 0 ? 1 / canvasMeta.scale : 1;
    const dataUrl = stageRef.current.toDataURL({ pixelRatio });
    const pdf = new jsPDF({
      orientation: canvasMeta.originalWidth > canvasMeta.originalHeight ? "landscape" : "portrait",
      unit: "px",
      format: [canvasMeta.originalWidth, canvasMeta.originalHeight],
    });
    pdf.addImage(
      dataUrl,
      "PNG",
      0,
      0,
      canvasMeta.originalWidth,
      canvasMeta.originalHeight
    );
    pdf.save(`${templateName.replace(/\s+/g, "_")}.pdf`);
    setSelectedFieldId(prevSelection);
    setIsExporting(false);

    try {
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          count: 1,
          templateName: templateName,
          format: "PDF",
        }),
      });
    } catch (e) {}
  };

  const handleExportBulkPDF = async () => {
    if (!stageRef.current || rows.length === 0) return;
    const prevSelection = selectedFieldId;
    setSelectedFieldId(null);
    if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
    setIsExporting(true);
    setExportProgress(0);

    // NEW: Initialize Batch to get IDs for QR codes
    let initializedBatch;
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${templateName} - Bulk PDF`,
          count: rows.length,
          templateName: templateName,
          format: "PDF",
          rows: rows,
        }),
      });
      initializedBatch = await res.json();
    } catch (err) {
      console.error("Batch initialization failed", err);
      alert("System failed to initialize batch records. Aborting export.");
      setIsExporting(false);
      return;
    }

    const zip = new JSZip();
    const stage = stageRef.current;
    const pixelRatio = canvasMeta.scale > 0 ? 1 / canvasMeta.scale : 1;
    const qrFields = fields.filter(f => f.type === "qr");

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const certId = initializedBatch.certificates?.[i]?.id;

      // 1. Update Text Fields Imperatively
      fields.forEach((f) => {
        if (f.type !== "qr") {
          const node = stage.findOne(`#${f.id}`);
          if (node) node.text(replacePlaceholders(f.label, row));
        }
      });

      // 2. Update QR Fields Imperatively
      if (qrFields.length > 0 && certId) {
        const verifyUrl = `${window.location.origin}/verify/${certId}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 500 });
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise((res) => (qrImg.onload = res));

        qrFields.forEach(f => {
          const node = stage.findOne(`#${f.id}`);
          if (node) node.image(qrImg);
        });
      }

      // 3. Draw and Capture immediately before any re-renders
      stage.batchDraw();
      await new Promise((resolve) => setTimeout(resolve, 50));
      const dataUrl = stage.toDataURL({ pixelRatio });
      
      const pdf = new jsPDF({
        orientation:
          canvasMeta.originalWidth > canvasMeta.originalHeight
            ? "landscape"
            : "portrait",
        unit: "px",
        format: [canvasMeta.originalWidth, canvasMeta.originalHeight],
      });
      pdf.addImage(
        dataUrl,
        "PNG",
        0,
        0,
        canvasMeta.originalWidth,
        canvasMeta.originalHeight
      );
      zip.file(`${getFilenameFromRow(row, i)}.pdf`, pdf.output("blob"));

      // 4. Update progress at the end to trigger re-render AFTER capture
      setExportProgress(Math.round(((i + 1) / rows.length) * 100));
    }

    // Reset UI
    fields.forEach((f) => {
      const node = stage.findOne(`#${f.id}`);
      if (node) {
        if (f.type !== "qr") node.text(f.label);
      }
    });
    stage.getLayers()[0].batchDraw();

    setFields([...fields]);
    setSelectedFieldId(prevSelection);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "certificates_pdf.zip");
    setIsExporting(false);
  };

  const handleStageMouseDown = (e: any) => {
    if (e.target === e.target.getStage()) {
      setSelectedFieldId(null);
      return;
    }
    const clickedOnTransformer = e.target.getParent().className === "Transformer";
    if (clickedOnTransformer) return;
  };

  useEffect(() => {
    if (!selectedFieldId || !transformerRef.current) {
      transformerRef.current?.nodes([]);
      return;
    }
    const node = stageRef.current.findOne(`#${selectedFieldId}`);
    if (node) {
      transformerRef.current.nodes([node]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedFieldId]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-background font-sans antialiased text-foreground transition-colors duration-300">
      {/* Sidebar - Tools Switcher (80px) */}
      <aside className="w-20 shrink-0 h-full border-r border-border bg-card flex flex-col items-center py-6 gap-6 z-20">
        <button
          onClick={() => setActiveTab("design")}
          className={`p-3 rounded-xl transition-all duration-200 ${activeTab === "design" 
            ? "bg-violet-600 text-white shadow-md shadow-violet-500/20" 
            : "text-muted-foreground hover:bg-muted"}`}
          title="Design"
        >
          <Logo iconClassName="h-6 w-6" />
        </button>
        <button
          onClick={() => setActiveTab("layers")}
          className={`p-3 rounded-xl transition-all duration-200 ${activeTab === "layers" 
            ? "bg-violet-600 text-white shadow-md shadow-violet-500/20" 
            : "text-muted-foreground hover:bg-muted"}`}
          title="Layers"
        >
          <Layers3 className="h-6 w-6" />
        </button>
        <button
          onClick={() => setActiveTab("data")}
          className={`p-3 rounded-xl transition-all duration-200 ${activeTab === "data" 
            ? "bg-violet-600 text-white shadow-md shadow-violet-500/20" 
            : "text-muted-foreground hover:bg-muted"}`}
          title="Data"
        >
          <FileSpreadsheet className="h-6 w-6" />
        </button>
      </aside>

      {/* Control Panel (360px) */}
      <aside className="w-[360px] shrink-0 h-full border-r border-border bg-card flex flex-col shadow-xl shadow-black/5 z-10">
        <div className="px-6 py-6 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-widest leading-none">
            {activeTab} Settings
          </h2>
          <span className="text-[10px] font-black text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-tighter">v2.5</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {activeTab === "design" && (
            <>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Background</label>
                <label className="flex flex-col items-center justify-center border border-dashed border-border hover:border-violet-500/50 rounded-xl p-6 bg-muted/20 hover:bg-muted transition-all cursor-pointer group">
                  <Upload className="h-6 w-6 text-muted-foreground/30 group-hover:text-violet-600 mb-2 transition-colors" />
                  <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground">
                    {backgroundSrc ? 'Change Image' : 'Upload Template'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleTemplateUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Tools</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={addField}
                    className="flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-3 font-bold text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all"
                  >
                    <Plus className="h-4 w-4" /> Add Text Layer
                  </button>
                  <button
                    onClick={addQRField}
                    className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-muted py-3 font-bold text-xs shadow-sm active:scale-95 transition-all"
                  >
                    <QrCode className="h-4 w-4 text-violet-600" /> Add Verification QR
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={duplicateField}
                      disabled={!selectedField}
                      className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-muted py-2.5 text-[11px] font-bold transition disabled:opacity-30"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={deleteField}
                      disabled={!selectedFieldId}
                      className="flex items-center justify-center gap-2 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500 py-2.5 text-[11px] font-bold transition hover:bg-rose-500/10 disabled:opacity-30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {selectedField && (
                <div className="space-y-6 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Properties</label>
                  
                  <div className="space-y-5 bg-muted/30 rounded-2xl p-4 border border-border">
                    {selectedField.type === "qr" ? (
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
                          This QR code will dynamically link to each recipient's verification page during export.
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Size</label>
                            <span className="text-[9px] font-black text-violet-600">{selectedField.fontSize}px</span>
                          </div>
                          <input
                            type="range" min="40" max="400"
                            value={selectedField.fontSize}
                            onChange={(e) => updateField(selectedField.id, { fontSize: parseInt(e.target.value), width: parseInt(e.target.value) })}
                            className="w-full accent-violet-600 h-1 bg-border rounded-full appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Content</label>
                          <input
                            type="text"
                            value={selectedField.label}
                            onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-violet-500/30 font-bold outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Typography</label>
                          <select
                            value={selectedField.fontFamily}
                            onChange={(e) => updateField(selectedField.id, { fontFamily: e.target.value })}
                            className="w-full rounded-lg border border-border bg-card px-2 py-2 text-xs text-foreground focus:ring-1 focus:ring-violet-500/30 font-bold outline-none cursor-pointer"
                          >
                            {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Color</label>
                            <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1.5 shadow-sm">
                              <input
                                type="color"
                                value={selectedField.fill}
                                onChange={(e) => updateField(selectedField.id, { fill: e.target.value })}
                                className="h-6 w-6 rounded border border-border bg-transparent cursor-pointer"
                              />
                              <span className="text-[9px] font-black font-mono text-muted-foreground uppercase">{selectedField.fill}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Align</label>
                            <div className="flex bg-card border border-border rounded-lg p-0.5 shadow-sm">
                              {(["left", "center", "right"] as Alignment[]).map((align) => {
                                const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
                                return (
                                  <button
                                    key={align}
                                    onClick={() => updateField(selectedField.id, { align })}
                                    className={`flex-1 flex items-center justify-center rounded-md py-1.5 transition ${selectedField.align === align ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                                  >
                                    <Icon className="h-3 w-3" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {!selectedField.autoFit && (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Size</label>
                              <span className="text-[9px] font-black text-violet-600">{selectedField.fontSize}px</span>
                            </div>
                            <input
                              type="range" min="8" max="200"
                              value={selectedField.fontSize}
                              onChange={(e) => updateField(selectedField.id, { fontSize: parseInt(e.target.value) })}
                              className="w-full accent-violet-600 h-1 bg-border rounded-full appearance-none cursor-pointer"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <span className="text-[10px] font-black text-foreground uppercase tracking-tight">Auto-fit width</span>
                          <button
                            onClick={() => updateField(selectedField.id, { autoFit: !selectedField.autoFit })}
                            className={`w-10 h-5 rounded-full transition-colors relative ${selectedField.autoFit ? 'bg-violet-600' : 'bg-muted-foreground/30'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${selectedField.autoFit ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "layers" && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Design Stack</label>
              {fields.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-border rounded-2xl">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">No Active Layers</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {fields.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFieldId(f.id)}
                      className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all border ${selectedFieldId === f.id
                        ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/20"
                        : "bg-muted/10 border-border text-foreground hover:border-violet-500/50"
                        }`}
                    >
                      <Type className={`h-4 w-4 ${selectedFieldId === f.id ? "text-white" : "text-violet-600 opacity-60"}`} />
                      <div className="flex-1 truncate">
                        <p className="text-xs font-bold truncate leading-none">{f.label}</p>
                        <p className={`text-[9px] mt-1 font-semibold uppercase tracking-tighter opacity-60`}>
                          {f.fontFamily} • {f.fontSize}px
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">External Source</label>
                <label className="flex flex-col items-center justify-center border border-dashed border-border hover:border-emerald-500 rounded-2xl p-6 bg-muted/10 hover:bg-emerald-500/5 cursor-pointer transition-all group">
                  <FileSpreadsheet className={`h-6 w-6 mb-2 ${rows.length > 0 ? "text-emerald-600" : "text-muted-foreground/30"} group-hover:text-emerald-500 transition-colors`} />
                  <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground text-center px-4 leading-relaxed">
                    {rows.length > 0 ? `${rows.length} Rows Available` : 'Import CSV or TXT Registry'}
                  </span>
                  <input type="file" accept=".csv,.txt" onChange={handleDataUpload} className="hidden" />
                </label>
              </div>

              {rows.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-border animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Pointers</label>
                    <button onClick={() => setRows([])} className="text-[9px] font-black text-rose-500 hover:underline uppercase">Purge</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(rows[0]).map(h => (
                      <span key={h} className="px-2 py-1 rounded-md bg-muted text-[10px] font-black text-foreground uppercase tracking-tighter ring-1 ring-border">
                        {"{{"}{h}{"}}"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Workspace Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-1.5 hover:bg-muted rounded-lg transition text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-3">
              <input 
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="bg-transparent text-sm font-bold text-foreground tracking-tight outline-none focus:ring-1 focus:ring-violet-500/20 rounded px-1 min-w-[180px]"
                placeholder="Design Entity Name"
              />
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Resolution:</span>
                <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest">
                  {backgroundImage ? `${backgroundImage.width}×${backgroundImage.height}` : "0×0"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Persistence Group */}
            <div className="flex items-center gap-1.5 bg-muted/40 border border-border p-1 rounded-xl">
              <button 
                onClick={() => handleSaveTemplate(false)}
                className="px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-muted text-foreground text-[10px] font-black uppercase tracking-widest transition shadow-sm active:scale-95"
              >
                {currentTemplateId ? "Update" : "Save"}
              </button>
              <button 
                onClick={() => handleSaveTemplate(true)}
                className="px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-muted text-foreground text-[10px] font-black uppercase tracking-widest transition shadow-sm active:scale-95"
              >
                Save As
              </button>
            </div>

            <div className="h-5 w-px bg-border mx-1" />

            {/* Standard Export Group */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handleExportPNG}
                disabled={isExporting}
                className="px-4 py-2 rounded-xl bg-card border border-border hover:bg-muted text-foreground text-[10px] font-black uppercase tracking-widest transition shadow-sm active:scale-95 disabled:opacity-30"
              >
                Export PNG
              </button>
              <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="px-4 py-2 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition active:scale-95 disabled:opacity-30"
              >
                {isExporting && !rows.length ? "..." : "Export PDF"}
              </button>
            </div>

            {/* Bulk Export Group - Conditional */}
            {rows.length > 0 && (
              <>
                <div className="h-5 w-px bg-border mx-1" />
                <div className="flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/10 p-1 rounded-xl animate-in slide-in-from-right-2 duration-500">
                  <button 
                    onClick={handleExportPNG}
                    disabled={isExporting}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-sm active:scale-95 disabled:opacity-30"
                  >
                    {isExporting ? `${exportProgress}%` : "Bulk PNG ZIP"}
                  </button>
                  <button 
                    onClick={handleExportBulkPDF}
                    disabled={isExporting}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition shadow-sm active:scale-95 disabled:opacity-30"
                  >
                    {isExporting ? `${exportProgress}%` : "Bulk PDF ZIP"}
                  </button>
                </div>
              </>
            )}

            <div className="h-5 w-px bg-border mx-1" />

            {/* View Controls */}
            <div className="flex items-center bg-muted/40 border border-border rounded-xl p-0.5 shadow-sm">
              <button
                onClick={() => setCanvasMeta(prev => {
                  const s = Math.max(0.1, prev.scale - 0.1);
                  return { ...prev, scale: s, scaledWidth: prev.originalWidth * s, scaledHeight: prev.originalHeight * s };
                })}
                className="p-1 hover:bg-card rounded-lg text-muted-foreground hover:text-foreground transition-all"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="px-2.5 text-[10px] font-black text-foreground min-w-[45px] text-center tracking-widest">
                {Math.round(canvasMeta.scale * 100)}%
              </span>
              <button
                onClick={() => setCanvasMeta(prev => {
                  const s = Math.min(3, prev.scale + 0.1);
                  return { ...prev, scale: s, scaledWidth: prev.originalWidth * s, scaledHeight: prev.originalHeight * s };
                })}
                className="p-1 hover:bg-card rounded-lg text-muted-foreground hover:text-foreground transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>

        <div
          ref={workspaceRef}
          className="flex-1 overflow-auto relative bg-background/50 custom-scrollbar"
          style={{
            backgroundImage: resolvedTheme === 'dark' ? "radial-gradient(#1e293b 1.5px, transparent 1.5px)" : "radial-gradient(#cbd5e1 1.5px, transparent 1.5px)",
            backgroundSize: "32px 32px",
          }}
        >
          <div className="min-h-full min-w-full inline-flex items-center justify-center p-20">
            {!backgroundImage ? (
              <div className="flex flex-col items-center justify-center text-center max-w-xs p-10 rounded-3xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="p-5 bg-violet-500/10 text-violet-600 rounded-2xl mb-6">
                  <Upload className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Studio Empty</h2>
                <p className="mt-2 text-xs text-muted-foreground font-medium leading-relaxed">
                  Initialize your workspace by uploading a high-resolution certificate template.
                </p>
                <label className="mt-8 block w-full px-6 py-3 text-[10px] font-black uppercase tracking-widest text-background bg-foreground hover:scale-105 rounded-xl cursor-pointer transition-all active:scale-95 text-center">
                  Select Base Image
                  <input type="file" accept="image/*" onChange={handleTemplateUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="relative select-none shadow-[0_40px_120px_rgba(0,0,0,0.3)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.7)] rounded border border-border bg-white transition-all duration-500">
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
                      field.type === "qr" ? (
                        <QRNode
                          key={field.id}
                          field={field}
                          scale={canvasMeta.scale}
                          isExporting={isExporting}
                          onSelect={() => setSelectedFieldId(field.id)}
                          onUpdate={(updates) => updateField(field.id, updates)}
                        />
                      ) : (
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
                              fontSize: Math.max(8, Math.round(field.fontSize * scaleY)),
                            });
                            setTimeout(() => {
                              transformerRef.current?.forceUpdate();
                              stageRef.current?.batchDraw();
                            }, 10);
                          }}
                        />
                      )
                    ))}

                    <Transformer
                      ref={transformerRef}
                      rotateEnabled={false}
                      keepRatio={false}
                      enabledAnchors={["top-left", "top-center", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-center", "bottom-right"]}
                      boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 50 || newBox.height < 10) return oldBox;
                        return newBox;
                      }}
                    />
                  </Layer>
                </Stage>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
