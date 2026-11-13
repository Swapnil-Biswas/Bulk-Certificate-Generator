import Image from "next/image";

/**
 * A certificate preview built the same way the editor builds one: a background image
 * with the recipient's name set on top. Text is sized in container units so it scales
 * with the card exactly like the canvas does.
 */

export type Design = "achievement" | "hackathon" | "workshop" | "appreciation";

const designs: Record<
  Design,
  {
    label: string;
    name: React.CSSProperties;
    qr?: React.CSSProperties;
  }
> = {
  achievement: {
    label: "Certificate of Achievement",
    name: {
      top: "40.2%",
      left: "18.75%",
      width: "62.5%",
      textAlign: "center",
      fontFamily: "'Great Vibes', cursive",
      fontSize: "7.5cqw",
      color: "#1c2541",
    },
  },
  hackathon: {
    label: "Certificate of Participation",
    name: {
      top: "43.5%",
      left: "6.875%",
      width: "70%",
      textAlign: "left",
      fontFamily: "'Poppins', sans-serif",
      fontSize: "6cqw",
      color: "#ffffff",
    },
    qr: { left: "80.6%", top: "75.2%", width: "10.6%" },
  },
  workshop: {
    label: "Workshop Completion certificate",
    name: {
      top: "43.3%",
      left: "26.875%",
      width: "62%",
      textAlign: "left",
      fontFamily: "'Playfair Display', serif",
      fontSize: "5.6cqw",
      color: "#5b3df5",
    },
    qr: { left: "79.4%", top: "77.8%", width: "8.75%" },
  },
  appreciation: {
    label: "Certificate of Appreciation",
    name: {
      top: "40.2%",
      left: "18.75%",
      width: "62.5%",
      textAlign: "center",
      fontFamily: "'Great Vibes', cursive",
      fontSize: "7.5cqw",
      color: "#12372a",
    },
  },
};

/** Decorative QR-style matrix (deterministic, not scannable) for certificate previews. */
export function QrGlyph({ seed = 7, className = "" }: { seed?: number; className?: string }) {
  const n = 21;
  const cells: string[] = [];
  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const on = rand() > 0.52;
      if (!inFinder(x, y) && on) cells.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  const finder = (x: number, y: number) =>
    `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
  return (
    <svg viewBox="-1.5 -1.5 24 24" className={className} aria-hidden="true">
      <rect x="-1.5" y="-1.5" width="24" height="24" fill="#fff" />
      <path
        fill="#0b0b12"
        fillRule="evenodd"
        d={`${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}${cells.join("")}`}
      />
    </svg>
  );
}

export function Certificate({
  design,
  name,
  nameRef,
  className = "",
  sizes = "(min-width: 1024px) 560px, 90vw",
  eager = false,
}: {
  design: Design;
  name: string;
  /** Lets an animation swap the name without re-rendering. */
  nameRef?: React.Ref<HTMLSpanElement>;
  className?: string;
  sizes?: string;
  eager?: boolean;
}) {
  const d = designs[design];
  return (
    <div
      role="img"
      aria-label={`${d.label} for ${name}`}
      className={`mk-cert relative aspect-[1600/1131] overflow-hidden bg-white ${className}`}
    >
      <Image
        src={`/landing/${design}.jpg`}
        alt=""
        width={1600}
        height={1131}
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        className="h-full w-full object-cover select-none"
        draggable={false}
      />
      <span
        ref={nameRef}
        aria-hidden="true"
        className="absolute block whitespace-nowrap leading-none"
        style={d.name}
      >
        {name}
      </span>
      {d.qr && (
        <span className="absolute block" style={d.qr} aria-hidden="true">
          <QrGlyph seed={name.length + 3} className="block h-auto w-full" />
        </span>
      )}
    </div>
  );
}
