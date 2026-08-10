import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Brand favicon: a violet→fuchsia "P" tile, matching the app's accent.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "linear-gradient(135deg, #a855f7, #d946ef)",
          color: "white",
          fontSize: 22,
          fontWeight: 800,
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}
