// src/app/opengraph-image.jsx
import { ImageResponse } from "next/og";

export const alt = "Addis Eats: Ethiopian food, delivered";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          background: "#166534",
          color: "white",
        }}
      >
        <div style={{ fontSize: 128, fontWeight: 700 }}>Addis Eats</div>
        <div style={{ fontSize: 48, marginTop: 16 }}>Ethiopian food, delivered</div>
      </div>
    ),
    { ...size }
  );
}