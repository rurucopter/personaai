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
          backgroundColor: "#09090b",
          color: "#fafafa",
        }}
      >
        <div style={{ fontSize: 32, letterSpacing: 4, color: "#a1a1aa" }}>
          PERSONAAI
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 64,
            fontWeight: 600,
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Devenez n&apos;importe qui, en restant vous-même.
        </div>
      </div>
    ),
    { ...size }
  );
}
