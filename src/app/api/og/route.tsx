import { config } from "@/lib/config";
import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          fontSize: 50,
          color: "#1C2833", // Darker text color for high contrast
          background: "linear-gradient(135deg, #4A9BB1, #387F92)", // Darker gradient background
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
        {/* Animated Background SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 630"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "1200px",
            height: "630px",
            zIndex: "0",
          }}
        >
          <defs>
            {/* Gradient Definition */}
            <linearGradient
              id="bg-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#4A9BB1" />
              <stop offset="100%" stopColor="#387F92" />
            </linearGradient>

            {/* Wave Pattern */}
            <pattern
              id="wave"
              x="0"
              y="0"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 60 Q 30 0, 60 60 T 120 60"
                fill="none"
                stroke="#AABCCD" // Darkened for better contrast
                strokeWidth="2"
              />
            </pattern>

            {/* Background Shape */}
            <clipPath id="clip-shape">
              <path
                d="M0,0 L1200,0 L1200,630 L0,630 Z M0,400 Q600,500 1200,400 L1200,630 L0,630 Z"
                fill="white"
              />
            </clipPath>
          </defs>

          {/* Apply Gradient and Patterns */}
          <rect width="1200" height="630" fill="url(#bg-gradient)" />
          <rect width="1200" height="630" fill="url(#wave)" opacity="0.2" />

          {/* Background Shape Overlay */}
          <rect
            width="1200"
            height="630"
            fill="white"
            clipPath="url(#clip-shape)"
            opacity="0.1"
          />
        </svg>

        {/* Content Overlay with Improved Hierarchy */}
        <div
          style={{
            display: "flex",
            width: "100%",
            zIndex: "1",
            textAlign: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontWeight: "bold",
              color: "#1C2833", // Dark text for strong contrast
              fontSize: "100px", // Increased to stand out more
              lineHeight: "1.2",
              textShadow: "2px 2px 6px rgba(255, 255, 255, 0.3)",
            }}
          >
            {config.projectName}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "48px", // Increased for better readability
              marginTop: "20px",
              color: "#34495E", // Darker shade for improved readability
              lineHeight: "1.5",
            }}
          >
            Elevate Your CV with AI Precision
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "30px",
              fontSize: "40px", // Increased more significantly
              color: "#D35400", // Deeper orange for better contrast
              fontStyle: "italic",
              textShadow: "1px 1px 4px rgba(255, 255, 255, 0.3)", // Extra text shadow for better contrast
              position: "relative",
              alignItems: "center",
            }}
          >
            {/* Dark background behind orange text for better contrast */}
            <div
              style={{
                position: "absolute",
                backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent dark background
                width: "100%",
                height: "100%",
                top: -25,
                left: -55,
                zIndex: "-1", // Ensures the background stays behind the text
                borderRadius: "10px", // Optional: adding some rounding to the background
                padding: "50px",
                display: "flex",
              }}
            />
            Fast, Accurate, and Tailored
          </div>
        </div>

        {/* Decorative SVG Elements */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 630"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            width: "1200px",
            height: "630px",
            zIndex: "0",
          }}
        >
          {/* Abstract Shape at the Bottom */}
          <path
            d="M0,500 C300,650 900,350 1200,500 L1200,630 L0,630 Z"
            fill="#4A9BB1" // Adjusted color for the abstract shape
            opacity="0.3"
          />
        </svg>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
