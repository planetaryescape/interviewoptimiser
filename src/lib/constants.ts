// Placeholder for global site constants

export const SITE_TITLE = "Interview Optimiser"; // Replace with your actual site title if different
export const SITE_DESCRIPTION = "The AI-Powered, Real-Time Interview Practice Tool"; // Replace with your actual default site description

// Determine the base URL from environment variables or set a default
export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit for uploaded files
