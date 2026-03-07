import type { LanguageModel } from "ai";
import type { CompletionUsage } from "openai/resources/completions";

export const mockUsage: CompletionUsage = {
  prompt_tokens: 100,
  completion_tokens: 50,
  total_tokens: 150,
};

// In AI SDK v6, LanguageModel is a complex interface (LanguageModelV3).
// For tests that mock generateText/generateObject at the module level,
// we only need a token model reference — the actual doGenerate is never called.
const baseModelObj = {
  specificationVersion: "v3" as const,
  provider: "openai" as const,
  modelId: "gpt-4",
  defaultObjectGenerationMode: "json" as const,
  doGenerate: async () => ({
    text: "",
    finishReason: "stop",
    usage: {
      inputTokens: mockUsage.prompt_tokens,
      outputTokens: mockUsage.completion_tokens,
    },
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
  doStream: async () => {
    throw new Error("Not implemented");
  },
};

export const mockEvaluateModel = {
  ...baseModelObj,
  doGenerate: async () => ({
    text: JSON.stringify(mockEvaluation),
    finishReason: "stop",
    usage: {
      inputTokens: mockUsage.prompt_tokens,
      outputTokens: mockUsage.completion_tokens,
    },
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
} as unknown as LanguageModel;

export const mockOptimiseModel = {
  ...baseModelObj,
  doGenerate: async () => ({
    text: JSON.stringify(mockCV),
    finishReason: "stop",
    usage: {
      inputTokens: mockUsage.prompt_tokens,
      outputTokens: mockUsage.completion_tokens,
    },
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
} as unknown as LanguageModel;

export const mockCoverLetterModel = {
  ...baseModelObj,
  doGenerate: async () => ({
    text: JSON.stringify(mockCoverLetter),
    object: mockCoverLetter,
    finishReason: "stop",
    usage: {
      inputTokens: mockUsage.prompt_tokens,
      outputTokens: mockUsage.completion_tokens,
    },
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
} as unknown as LanguageModel;

// Mock data
export const mockCV = {
  name: "John Doe",
  title: "Software Engineer",
  email: "john@example.com",
  phone: "+1234567890",
  location: "New York, USA",
  summary: "Experienced software engineer with a focus on web development",
  experiences: [
    {
      title: "Senior Software Engineer",
      company: "Tech Corp",
      location: "New York, USA",
      startDate: "2020-01-01",
      endDate: "2023-12-31",
      description: "Led development of web applications",
    },
  ],
  educations: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of Technology",
      location: "New York, USA",
      startDate: "2016-01-01",
      endDate: "2020-01-01",
    },
  ],
  skills: [{ skill: "JavaScript" }, { skill: "TypeScript" }, { skill: "React" }],
  links: [
    {
      name: "GitHub",
      url: "https://github.com/johndoe",
      order: 1,
    },
  ],
  customSections: [
    {
      title: "Projects",
      content: "Built various web applications",
    },
  ],
};

export const mockJobDescription = `
We are looking for a Senior Software Engineer to join our team.
Requirements:
- 5+ years of experience in web development
- Strong knowledge of JavaScript, TypeScript, and React
- Experience with Node.js and databases
- Excellent communication skills
`;

export const mockAdditionalInfo =
  "I am particularly interested in this role because of the company's focus on innovation.";

export const mockCustomisations = "Please emphasize my leadership experience.";

export const mockCoverLetter = {
  content: "Professional cover letter content",
};

export const mockEvaluation = {
  score: 85,
  feedback: [
    {
      content: "Strong technical background",
      completed: true,
    },
    {
      content: "Could improve leadership examples",
      completed: false,
    },
  ],
};

export const mockStructuredCV = {
  name: "John Doe",
  title: "Software Engineer",
  email: "john.doe@example.com",
  phone: "+1 (123) 456-7890",
  location: "San Francisco, CA",
  summary: "Experienced software engineer with a passion for building scalable applications.",
  isPublic: false,
  isOriginal: true,
  experiences: [
    {
      title: "Senior Software Engineer",
      company: "Tech Company",
      location: "San Francisco, CA",
      startDate: "2020-01",
      endDate: "Present",
      description: "Led development of key features.",
      order: 1,
      current: true,
    },
  ],
  educations: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of California",
      location: "Berkeley, CA",
      startDate: "2012-09",
      endDate: "2016-05",
      order: 1,
    },
  ],
  skills: [
    {
      skill: "JavaScript",
      order: 1,
    },
    {
      skill: "TypeScript",
      order: 2,
    },
  ],
  links: [
    {
      name: "GitHub",
      url: "https://github.com/johndoe",
      order: 1,
    },
  ],
  customSections: [
    {
      title: "Projects",
      content: "Various personal projects.",
      order: 1,
    },
  ],
};

export const mockStructuredJobDescription = {
  company: "Tech Company",
  role: "Software Engineer",
  requiredQualifications: ["Bachelor's degree in Computer Science or related field"],
  requiredExperience: ["3+ years of experience in software development"],
  requiredSkills: ["JavaScript", "TypeScript", "React"],
  preferredQualifications: ["Master's degree in Computer Science"],
  preferredSkills: ["Node.js", "AWS"],
  responsibilities: ["Develop and maintain web applications"],
  benefits: ["Competitive salary", "Health insurance"],
  location: "San Francisco, CA",
  employmentType: "Full-time",
  seniority: "Mid-level",
  industry: "Technology",
  keyTechnologies: ["React", "TypeScript", "Node.js"],
};

export const mockCandidateDetails = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (123) 456-7890",
  location: "San Francisco, CA",
  currentRole: "Software Engineer",
  professionalSummary:
    "Experienced software engineer with a passion for building scalable applications.",
  linkedinUrl: "https://linkedin.com/in/johndoe",
  portfolioUrl: "https://johndoe.com",
  otherUrls: ["https://github.com/johndoe"],
};

export const mockCompletenessEvaluation = {
  score: 75,
  missingQualifications: ["Master's degree"],
  missingExperiences: ["Leadership experience"],
  missingSkills: ["AWS"],
  recommendations: ["Highlight leadership skills"],
  overallAssessment: "Good match but needs improvement",
  company: "Tech Company",
  role: "Software Engineer",
};

export const mockOptimisedCV = {
  name: "John Doe",
  title: "Software Engineer",
  email: "john@example.com",
  phone: "+1234567890",
  location: "New York, USA",
  summary: "Optimised summary for the job",
  experiences: [
    {
      title: "Senior Software Engineer",
      company: "Tech Corp",
      location: "New York, USA",
      startDate: "2020-01-01",
      endDate: "2023-12-31",
      description: "Led development of web applications",
      order: 0,
    },
  ],
  educations: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of Technology",
      location: "New York, USA",
      startDate: "2016-01-01",
      endDate: "2020-01-01",
      order: 0,
    },
  ],
  skills: [
    {
      skill: "JavaScript",
      order: 0,
    },
    {
      skill: "TypeScript",
      order: 1,
    },
    {
      skill: "React",
      order: 2,
    },
  ],
  links: [
    {
      name: "GitHub",
      url: "https://github.com/johndoe",
      order: 1,
    },
  ],
  customSections: [
    {
      title: "Projects",
      content: "Built various web applications",
      order: 0,
    },
  ],
};
