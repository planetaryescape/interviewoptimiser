export interface Interview {
  data: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    actualTime: number;
    duration: number;
    type: string;
    keyQuestions: string[];
    customSessionId: string;
    transcript: string | null;
    chatGroupId: string;
    humeChatId: string;
    requestId: string;
    job: {
      candidateDetails: {
        name: string;
      };
      jobDescription: {
        role: string;
        company: string;
      };
    };
  };
}
