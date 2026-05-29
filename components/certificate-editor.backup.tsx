"use client";

import "@fontsource/great-vibes";
import "@fontsource/dancing-script";
import "@fontsource/pacifico";
import "@fontsource/satisfy";
import "@fontsource/lobster";
import "@fontsource/cinzel";
import "@fontsource/playfair-display";
import "@fontsource/merriweather";
import "@fontsource/cormorant-garamond";
import "@fontsource/alex-brush";
import "@fontsource/allura";
import "@fontsource/courgette";
import "@fontsource/kaushan-script";
import "@fontsource/marck-script";
import "@fontsource/parisienne";
import "@fontsource/sacramento";
import "@fontsource/tangerine";
import "@fontsource/bebas-neue";
import "@fontsource/montserrat";
import "@fontsource/raleway";
import "@fontsource/poppins";
import "@fontsource/oswald";
import "@fontsource/lora";
import "@fontsource/abril-fatface";
import "@fontsource/josefin-sans";

import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Konva from "konva";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text,
  Transformer,
} from "react-konva";

import JSZip from "jszip";
import { saveAs } from "file-saver";

const FONT_LIST = [
  "Arial",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Trebuchet MS",
  "Courier New",
  "Great Vibes",
  "Dancing Script",
  "Pacifico",
  "Satisfy",
  "Lobster",
  "Cinzel",
  "Playfair Display",
  "Merriweather",
  "Cormorant Garamond",
  "Alex Brush",
  "Allura",
  "Courgette",
  "Kaushan Script",
  "Marck Script",
  "Parisienne",
  "Sacramento",
  "Tangerine",
  "Bebas Neue",
  "Montserrat",
  "Raleway",
  "Poppins",
  "Oswald",
  "Lora",
  "Abril Fatface",
  "Josefin Sans",
];

type NameBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function getAutoFontSize(
  text: string,
  width: number,
  height: number,
  fontFamily: string,
  minSize: number,
  maxSize: number
) {
  for (let size = maxSize; size >= minSize; size--) {
    const measure = new Konva.Text({
      text,
      fontSize: size,
      fontFamily,
    });

    if (measure.width() <= width && measure.height() <= height) {
      return size;
    }
  }

  return minSize;
}

export default function CertificateEditor() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [],
      "image/jpeg": [],
    },
    multiple: false,
    onDrop(files) {
      const file = files[0];
      if (!file) return;
      setImageUrl(URL.createObjectURL(file));
    },
  });

  return (
    <div className="space-y-8">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-zinc-700 rounded-xl p-10 text-center cursor-pointer"
      >
        <input {...getInputProps()} />
        <p>Drop certificate template here or click to upload</p>
        <p className="text-zinc-400 text-sm mt-2">PNG / JPG only</p>
      </div>

      {imageUrl && <EditorCanvas imageUrl={imageUrl} />}
    </div>
  );
}

function EditorCanvas({ imageUrl }: { imageUrl: string }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const stageRef = useRef<any>(null);
  const textRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  const [name, setName] = useState("Swapnil Biswas");
  const [fontFamily, setFontFamily] = useState("Great Vibes");
  const [fontColor, setFontColor] = useState("#000000");
  const [alignment, setAlignment] = useState<
    "left" | "center" | "right"
  >("center");

  const [autoFit, setAutoFit] = useState(true);
  const [manualSize, setManualSize] = useState(60);
  const [minSize, setMinSize] = useState(20);
  const [maxSize, setMaxSize] = useState(180);

  const [box, setBox] = useState<NameBox>({
    x: 250,
    y: 250,
    width: 600,
    height: 120,
  });

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;

    img.onload = () => {
      setImage(img);
    };
  }, [imageUrl]);

  useEffect(() => {
    if (textRef.current && transformerRef.current) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [image]);

  async function handleNamesUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const content = await file.text();

    const parsed = content
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);

    setNames(parsed);
  }

  async function generateCertificates() {
    if (!stageRef.current || names.length === 0) return;

    setGenerating(true);

    const zip = new JSZip();

    for (const personName of names) {
      setName(personName);

      await new Promise((r) => setTimeout(r, 150));

      transformerRef.current.hide();
      stageRef.current.draw();
    
      const dataUrl = stageRef.current.toDataURL({
        pixelRatio: 2,
      });

      transformerRef.current.show();
      stageRef.current.draw();
      
      const blob = await fetch(dataUrl).then((r) => r.blob());

      zip.file(
        `${personName.replace(/\s+/g, "_")}.png`,
        blob
      );
    }

    const content = await zip.generateAsync({
      type: "blob",
    });

    saveAs(content, "certificates.zip");

    setGenerating(false);
  }

  if (!image) {
    return <div>Loading image...</div>;
  }

  const actualFontSize = autoFit
    ? getAutoFontSize(
        name,
        box.width,
        box.height,
        fontFamily,
        minSize,
        maxSize
      )
    : manualSize;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-zinc-900 p-3 rounded text-white"
        />

        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="bg-zinc-900 p-3 rounded text-white"
        >
          {FONT_LIST.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>

        <input
          type="color"
          value={fontColor}
          onChange={(e) => setFontColor(e.target.value)}
        />

        <select
          value={alignment}
          onChange={(e) =>
            setAlignment(
              e.target.value as "left" | "center" | "right"
            )
          }
          className="bg-zinc-900 p-3 rounded text-white"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>

        <label className="text-white flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoFit}
            onChange={(e) => setAutoFit(e.target.checked)}
          />
          Auto Fit
        </label>

        <input
          type="number"
          value={manualSize}
          onChange={(e) => setManualSize(Number(e.target.value))}
          className="bg-zinc-900 p-3 rounded text-white"
        />

        <input
          type="number"
          value={minSize}
          onChange={(e) => setMinSize(Number(e.target.value))}
          className="bg-zinc-900 p-3 rounded text-white"
        />

        <input
          type="number"
          value={maxSize}
          onChange={(e) => setMaxSize(Number(e.target.value))}
          className="bg-zinc-900 p-3 rounded text-white"
        />
      </div>

      <div className="mb-6 flex gap-4 items-center">
        <input
          type="file"
          accept=".txt"
          onChange={handleNamesUpload}
          className="text-white"
        />

        <button
          onClick={generateCertificates}
          disabled={generating || names.length === 0}
          className="bg-white text-black px-6 py-3 rounded disabled:opacity-50"
        >
          {generating
            ? "Generating..."
            : `Generate ${names.length} Certificates`}
        </button>
      </div>

      <div className="border border-zinc-800 inline-block">
        <Stage
          ref={stageRef}
          width={image.width}
          height={image.height}
        >
          <Layer>
            <KonvaImage image={image} />

            <Text
              ref={textRef}
              text={name}
              x={box.x}
              y={box.y}
              width={box.width}
              height={box.height}
              fontSize={actualFontSize}
              fontFamily={fontFamily}
              fill={fontColor}
              align={alignment}
              verticalAlign="middle"
              draggable
              onDragEnd={(e) => {
                setBox((prev) => ({
                  ...prev,
                  x: e.target.x(),
                  y: e.target.y(),
                }));
              }}
              onTransformEnd={() => {
                const node = textRef.current;

                const scaleX = node.scaleX();
                const scaleY = node.scaleY();

                const newWidth = Math.max(50, box.width * scaleX);
                const newHeight = Math.max(30, box.height * scaleY);

                node.scaleX(1);
                node.scaleY(1);

                setBox({
                  x: node.x(),
                  y: node.y(),
                  width: newWidth,
                  height: newHeight,
                });
              }}
            />

            <Transformer
              ref={transformerRef}
              rotateEnabled={false}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
