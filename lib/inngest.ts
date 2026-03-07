import { EventSchemas, Inngest } from "inngest";

type Events = {
  "interview/report.requested": {
    data: {
      jobId: number;
      reportId: number;
      interviewId: number;
      userId: number;
      restart?: boolean;
    };
  };
  "interview/audio-save.requested": {
    data: {
      reportId: number;
      interviewId: number;
      userId: number;
    };
  };
  "interview/extract-file.requested": {
    data: {
      extractionId: string;
      fileBase64: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      fileHash: string;
      userId: number;
      userEmail: string;
    };
  };
  "interview/extract-url.requested": {
    data: {
      extractionId: string;
      url: string;
      userId: number;
    };
  };
};

export const inngest = new Inngest({
  id: "interview-optimiser",
  schemas: new EventSchemas().fromRecord<Events>(),
});
