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

interface AsyncExtractionResponse {
  data: {
    extractionId: string;
  };
}

interface ExtractionStreamResult {
  status: "pending" | "completed" | "error";
  extractedText?: string;
  fileName?: string;
  fileType?: string;
  url?: string;
  characterCount?: number;
  error?: string;
}

async function pollExtractionStream(extractionId: string): Promise<ExtractionStreamResult> {
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(`/api/extractions/${extractionId}/stream`);

    eventSource.onmessage = (event) => {
      const data: ExtractionStreamResult = JSON.parse(event.data);

      if (data.status === "completed") {
        eventSource.close();
        resolve(data);
      } else if (data.status === "error") {
        eventSource.close();
        reject(new Error(data.error || "Extraction failed"));
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      reject(new Error("Connection to extraction stream failed"));
    };
  });
}

/**
 * Hook to extract text from a file (PDF, Word, or images)
 * Handles both cached (immediate) and async (Inngest) responses
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

      const json = await response.json();

      // Cached result returned directly (200)
      if (response.status === 200) {
        return json;
      }

      // Async extraction (202) — poll for result via SSE
      const extractionId = (json as AsyncExtractionResponse).data.extractionId;
      const streamResult = await pollExtractionStream(extractionId);

      return {
        data: {
          extractedText: streamResult.extractedText ?? "",
          fileName: streamResult.fileName ?? "",
          fileType: streamResult.fileType ?? "",
          characterCount: streamResult.characterCount ?? 0,
        },
      };
    },
  });
}

/**
 * Hook to extract text from a URL
 * Now dispatches to Inngest and polls for result
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

      const json = await response.json();

      // Async extraction (202) — poll for result via SSE
      if (response.status === 202) {
        const extractionId = (json as AsyncExtractionResponse).data.extractionId;
        const streamResult = await pollExtractionStream(extractionId);

        return {
          data: {
            extractedText: streamResult.extractedText ?? "",
            url: streamResult.url ?? url,
            characterCount: streamResult.characterCount ?? 0,
          },
        };
      }

      return json;
    },
  });
}
