import { useMutation } from "@tanstack/react-query";

interface ExtractFileResponse {
  data: {
    extractedText: string;
    fileName: string;
    fileType: string;
    characterCount: number;
  };
}

interface ExtractUrlResponse {
  data: {
    extractedText: string;
    url: string;
    characterCount: number;
  };
}

/**
 * Hook to extract text from a file (PDF, Word, or images)
 */
export function useExtractFile() {
  return useMutation<ExtractFileResponse, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/extract/file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to extract text from file");
      }

      return response.json();
    },
  });
}

/**
 * Hook to extract text from a URL
 */
export function useExtractUrl() {
  return useMutation<ExtractUrlResponse, Error, string>({
    mutationFn: async (url: string) => {
      const response = await fetch("/api/extract/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to extract text from URL");
      }

      return response.json();
    },
  });
}
