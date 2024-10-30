import { config } from "@/lib/config";
import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          fontSize: 50,
          color: "#1F2937", // --foreground converted to hex
          background: "linear-gradient(135deg, #FFF5EC, #FFF8F4)", // --gradient converted to hex
          width: "1200px",
          height: "630px",
          padding: "40px",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          position: "relative",
          fontFamily: "sans-serif",
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
          <defs>
            {/* Refined grid pattern */}
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(15)"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#F3E8E0"
                strokeWidth="0.5"
              />
            </pattern>

            {/* Animated dots pattern */}
            <pattern
              id="dots"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="#D94E1F" fillOpacity="0.1" />
            </pattern>

            {/* Gradient definitions */}
            <linearGradient
              id="cardGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
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

          {/* Decorative circles with gradient fills */}
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
            <path
              d="M0,0 L30,0 L15,26"
              fill="#9333EA"
              transform="rotate(-45)"
            />
          </g>

          {/* Dynamic wave pattern */}
          <path
            d="M0,500 C200,450 400,550 600,500 C800,450 1000,550 1200,500"
            fill="none"
            stroke="#D94E1F"
            strokeWidth="2"
            opacity="0.1"
          />
        </svg>

        {/* Content Container - updated with subtle glow */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            background:
              "linear-gradient(135deg, rgba(255,245,236,0.95), rgba(255,248,244,0.95))",
            padding: "60px",
            borderRadius: "24px",
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.1),
              0 0 80px rgba(217, 78, 31, 0.1)
            `,
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
            Real Voice-to-Voice Interview Practice
          </div>

          {/* Feature Pills */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "20px",
            }}
          >
            {[
              "AI-Powered Conversations",
              "Real-time Feedback",
              "Industry-Specific",
            ].map((text, i) => (
              <div
                key={i}
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

        {/* Enhanced decorative bottom element */}
        <svg
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "300px",
          }}
          height="8"
        >
          <line
            x1="0"
            y1="4"
            x2="300"
            y2="4"
            stroke="#D94E1F"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <animate
              attributeName="stroke-dasharray"
              values="0,300;300,0"
              dur="2s"
              repeatCount="indefinite"
            />
          </line>
          <line
            x1="0"
            y1="4"
            x2="300"
            y2="4"
            stroke="#9333EA"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.3"
            strokeDasharray="0,300"
          >
            <animate
              attributeName="stroke-dasharray"
              values="300,0;0,300"
              dur="2s"
              repeatCount="indefinite"
            />
          </line>
        </svg>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
