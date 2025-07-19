import { ImageResponse } from "next/og";
import { logger } from "~/lib/logger";
import { config } from "../../../config";

export const runtime = "edge";
export const contentType = "image/png";

// Set correct type for the route handler to fix type error
export type ImageResponseType = ImageResponse;

// Image metadata - Twitter recommends 2:1 aspect ratio
export const size = {
  width: 1200,
  height: 600,
};

// Image generation
export default async function GET() {
  try {
    // Font
    const interFont = await fetch(
      new URL(
        "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZFhjQ.woff2",
        import.meta.url
      )
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      <div
        style={{
          display: "flex",
          fontSize: 50,
          color: "#1F2937",
          background: "linear-gradient(135deg, #FFF5EC, #FFF8F4)",
          width: "100%",
          height: "100%",
          padding: "40px",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          position: "relative",
          fontFamily: "Inter",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern SVG - Simplified for Twitter */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 600"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        >
          <title>Pattern background</title>
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(15)"
            >
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#F3E8E0" strokeWidth="0.5" />
            </pattern>

            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#D94E1F" fillOpacity="0.1" />
            </pattern>

            <radialGradient id="orbGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D94E1F" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#D94E1F" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Base layers */}
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#dots)" />

          {/* Decorative circles */}
          <circle cx="100" cy="100" r="120" fill="url(#orbGradient)" />
          <circle cx="1100" cy="500" r="160" fill="url(#orbGradient)" />
        </svg>

        {/* Content Container - Made more compact for Twitter */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            background: "linear-gradient(135deg, rgba(255,245,236,0.95), rgba(255,248,244,0.95))",
            padding: "50px",
            borderRadius: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1), 0 0 80px rgba(217, 78, 31, 0.1)",
            border: "1px solid rgba(217, 78, 31, 0.15)",
            width: "85%",
          }}
        >
          {/* Logo/Title */}
          <div
            style={{
              fontSize: "70px",
              fontWeight: "bold",
              color: "#D94E1F",
              marginBottom: "16px",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {config.projectName}
          </div>

          {/* Main Hook - Larger for Twitter visibility */}
          <div
            style={{
              fontSize: "42px",
              color: "#1F2937",
              marginBottom: "20px",
              textAlign: "center",
              maxWidth: "800px",
              fontWeight: "600",
            }}
          >
            Live, adaptive AI interviews—at any scale
          </div>

          {/* Feature Pills - More compact for Twitter */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            {["AI-Powered", "Real-time Feedback", "Industry-Specific"].map((text) => (
              <div
                key={text}
                style={{
                  backgroundColor: "#D94E1F",
                  color: "#FFFFFF",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "22px",
                  fontWeight: "500",
                }}
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>,
      {
        ...size,
        fonts: [
          {
            name: "Inter",
            data: interFont,
            style: "normal",
            weight: 500,
          },
        ],
      }
    );
  } catch (error) {
    logger.error({ error }, "Error generating Twitter image");
    return new Response("Failed to generate recruitment Twitter image", { status: 500 });
  }
}
