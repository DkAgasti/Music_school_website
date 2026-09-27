import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFF7FB",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "#E11D48",
            marginBottom: 36,
          }}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#111827",
            textAlign: "center",
          }}
        >
          Synchrocity Music School
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 30,
            color: "#E11D48",
            fontWeight: 600,
          }}
        >
          Learn · Play · Grow
        </div>
      </div>
    ),
    { ...size }
  );
}
