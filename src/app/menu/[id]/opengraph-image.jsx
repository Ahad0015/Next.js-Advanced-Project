// src/app/menu/[id]/opengraph-image.jsx
import { ImageResponse } from "next/og";
import { dishes } from "../data";

export const alt = "A dish on the Addis Eats menu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const { id } = await params;
  const dish = dishes.find((d) => d.id === id);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#fffbeb",
          color: "#1c1917",
        }}
      >
        <div style={{ fontSize: 36, color: "#166534", fontWeight: 700 }}>Addis Eats</div>
        <div style={{ fontSize: 110, fontWeight: 700, marginTop: 16 }}>
          {dish ? dish.name : "Addis Eats"}
        </div>
        {dish && (
          <div style={{ display: "flex", fontSize: 48, marginTop: 24, color: "#57534e" }}>
            {dish.category} · {dish.price} ETB
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}