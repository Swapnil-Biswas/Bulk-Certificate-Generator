export type Alignment = "left" | "center" | "right";

export type FieldData = {
  id: string;
  key: string;
  label: string;

  x: number;
  y: number;
  width: number;
  height: number;

  fontFamily: string;
  fontColor: string;
  alignment: Alignment;

  autoFit: boolean;
  manualSize: number;
  minSize: number;
  maxSize: number;
};

export type InputMode = "txt" | "csv";
