import { ImageResponse } from "next/og";
import { config } from "../../config";

export const contentType = "image/png";

// Image metadata
const size = {
  width: 1200,
  height: 630,
};

// Image generation
export async function GET() {
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
          color: "#1F2937", // --foreground converted to hex
          background: "linear-gradient(135deg, #FFF5EC, #FFF8F4)", // --gradient converted to hex
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
        {/* Enhanced Background Pattern SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 630"
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
            {/* Grid pattern */}
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(15)"
            >
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#F3E8E0" strokeWidth="0.5" />
            </pattern>

            {/* Dots pattern */}
            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#D94E1F" fillOpacity="0.1" />
            </pattern>

            {/* Gradient definitions */}
            <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D94E1F" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#9333EA" stopOpacity="0.1" />
            </linearGradient>

            {/* Radial gradient for orbs */}
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
          <circle cx="1100" cy="530" r="160" fill="url(#orbGradient)" />

          {/* Abstract flowing curves */}
          <path
            d="M-100,400 Q300,350 600,400 T1300,400"
            fill="none"
            stroke="#D94E1F"
            strokeWidth="1"
            opacity="0.2"
          />
          <path
            d="M-100,420 Q300,370 600,420 T1300,420"
            fill="none"
            stroke="#9333EA"
            strokeWidth="1"
            opacity="0.15"
          />

          {/* Decorative geometric elements */}
          <g transform="translate(50, 500)" opacity="0.1">
            <path d="M0,0 L30,0 L15,26" fill="#D94E1F" transform="rotate(45)" />
          </g>
          <g transform="translate(1150, 130)" opacity="0.1">
            <path d="M0,0 L30,0 L15,26" fill="#9333EA" transform="rotate(-45)" />
          </g>
        </svg>

        {/* Content Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            background: "linear-gradient(135deg, rgba(255,245,236,0.95), rgba(255,248,244,0.95))",
            padding: "60px",
            borderRadius: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1), 0 0 80px rgba(217, 78, 31, 0.1)",
            border: "1px solid rgba(217, 78, 31, 0.15)",
          }}
        >
          {/* Logo/Title */}
          <div
            style={{
              fontSize: "80px",
              fontWeight: "bold",
              color: "#D94E1F",
              marginBottom: "20px",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {config.projectName}
          </div>

          {/* Main Hook */}
          <div
            style={{
              fontSize: "40px",
              color: "#1F2937",
              marginBottom: "24px",
              textAlign: "center",
              maxWidth: "800px",
              fontWeight: "600",
            }}
          >
            Live, adaptive AI interviews—at any scale
          </div>

          {/* Feature Pills */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "20px",
            }}
          >
            {["AI-Powered Conversations", "Real-time Feedback", "Industry-Specific"].map((text) => (
              <div
                key={text}
                style={{
                  backgroundColor: "#D94E1F",
                  color: "#FFFFFF",
                  padding: "8px 24px",
                  borderRadius: "20px",
                  fontSize: "24px",
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
    console.error("Error generating OG image:", error);
    return new Response("Failed to generate recruitment OG image", { status: 500 });
  }
}
