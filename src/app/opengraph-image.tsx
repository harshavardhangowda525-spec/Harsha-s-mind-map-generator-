import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const dynamic = "force-static";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          background: "radial-gradient(circle at 80% 20%, rgba(255,90,31,0.35), transparent 45%), linear-gradient(160deg, #141414 0%, #080808 60%)",
          color: "#f4f4f4",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 54, height: 6, background: "#FF5A1F" }} />
          <div style={{ fontSize: 26, letterSpacing: 8, color: "#bdbdbd" }}>PREMIUM GYM &amp; TRAINING CENTER</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, fontWeight: 900, letterSpacing: -4, lineHeight: 0.95 }}>{site.brandMark}</div>
          <div style={{ fontSize: 40, letterSpacing: 10, color: "#bdbdbd", marginTop: 12 }}>{site.brandSub.toUpperCase()}</div>
          <div style={{ fontSize: 56, fontWeight: 800, color: "#FF5A1F", marginTop: 18 }}>{site.tagline}</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#9a9a9a", letterSpacing: 4 }}>
          STRENGTH · DISCIPLINE · PERFORMANCE
        </div>
      </div>
    ),
    size,
  );
}
