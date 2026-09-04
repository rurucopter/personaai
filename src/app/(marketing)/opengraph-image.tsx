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
          backgroundImage:
            "radial-gradient(circle at 50% 30%, #2a0f3d 0%, #0a0710 55%, #060509 100%)",
          color: "#fafafa",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, letterSpacing: 4, color: "#c98bf5" }}>
          PERSONAAI
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 64,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: -1,
            textAlign: "center",
            maxWidth: 950,
          }}
        >
          Une histoire. Un style. Une vidéo.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 30,
            color: "#c4b8d8",
          }}
        >
          🎬 Style 3D Pixar   •   🍌 Fruits qui parlent
        </div>
      </div>
    ),
    { ...size }
  );
}
