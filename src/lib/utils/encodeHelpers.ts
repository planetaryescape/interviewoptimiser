import { idHandler } from "./idHandler";

/**
 * Recursively encode IDs in an object or array
 * This handles nested objects and arrays, encoding any numeric 'id' fields
 * and fields ending with 'Id' (like userId, jobId, etc.)
 */
export function encodeIds<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => encodeIds(item)) as T;
  }

  if (typeof data === "object") {
    const encoded: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Encode ID fields
      if ((key === "id" || key.endsWith("Id")) && typeof value === "number") {
        encoded[key] = idHandler.encode(value);
      } else if (value !== null && typeof value === "object") {
        // Recursively encode nested objects
        encoded[key] = encodeIds(value);
      } else {
        encoded[key] = value;
      }
    }
    return encoded as T;
  }

  return data;
}

/**
 * Encode Job entity with all its relations
 */
export function encodeJob(job: unknown): unknown {
  if (!job || typeof job !== "object") return null;
  const j = job as Record<string, unknown>;

  return {
    ...j,
    id: j.id && typeof j.id === "number" ? idHandler.encode(j.id) : j.id,
    userId: j.userId && typeof j.userId === "number" ? idHandler.encode(j.userId) : j.userId,
    interviews: Array.isArray(j.interviews) ? j.interviews.map(encodeInterview) : j.interviews,
    candidateDetails: j.candidateDetails ? encodeCandidateDetails(j.candidateDetails) : null,
    jobDescription: j.jobDescription ? encodeJobDescription(j.jobDescription) : null,
  };
}

/**
 * Encode Interview entity with all its relations
 */
export function encodeInterview(interview: unknown): unknown {
  if (!interview || typeof interview !== "object") return null;
  const i = interview as Record<string, unknown>;

  return {
    ...i,
    id: i.id && typeof i.id === "number" ? idHandler.encode(i.id) : i.id,
    jobId: i.jobId && typeof i.jobId === "number" ? idHandler.encode(i.jobId) : i.jobId,
    job: i.job ? encodeJob(i.job) : null,
    report: i.report ? encodeReport(i.report) : null,
  };
}

/**
 * Encode Report entity with all its relations
 */
export function encodeReport(report: unknown): unknown {
  if (!report || typeof report !== "object") return null;
  const r = report as Record<string, unknown>;

  return {
    ...r,
    id: r.id && typeof r.id === "number" ? idHandler.encode(r.id) : r.id,
    interviewId:
      r.interviewId && typeof r.interviewId === "number"
        ? idHandler.encode(r.interviewId)
        : r.interviewId,
    interview: r.interview ? encodeInterview(r.interview) : null,
    questionAnalyses: Array.isArray(r.questionAnalyses)
      ? r.questionAnalyses.map(encodeQuestionAnalysis)
      : r.questionAnalyses,
    pageSettings: r.pageSettings ? encodePageSettings(r.pageSettings) : null,
  };
}

/**
 * Encode QuestionAnalysis entity
 */
export function encodeQuestionAnalysis(analysis: unknown): unknown {
  if (!analysis || typeof analysis !== "object") return null;
  const a = analysis as Record<string, unknown>;

  return {
    ...a,
    id: a.id && typeof a.id === "number" ? idHandler.encode(a.id) : a.id,
    reportId:
      a.reportId && typeof a.reportId === "number" ? idHandler.encode(a.reportId) : a.reportId,
  };
}

/**
 * Encode Organization entity
 */
export function encodeOrganization(organization: unknown): unknown {
  if (!organization || typeof organization !== "object") return null;
  const o = organization as Record<string, unknown>;

  return {
    ...o,
    id: o.id && typeof o.id === "number" ? idHandler.encode(o.id) : o.id,
    ownerId: o.ownerId && typeof o.ownerId === "number" ? idHandler.encode(o.ownerId) : o.ownerId,
    members: Array.isArray(o.members) ? o.members.map(encodeOrganizationMember) : o.members,
    invitations: Array.isArray(o.invitations) ? o.invitations.map(encodeInvitation) : o.invitations,
  };
}

/**
 * Encode OrganizationMember entity
 */
export function encodeOrganizationMember(member: unknown): unknown {
  if (!member || typeof member !== "object") return null;
  const m = member as Record<string, unknown>;

  return {
    ...m,
    id: m.id && typeof m.id === "number" ? idHandler.encode(m.id) : m.id,
    organizationId:
      m.organizationId && typeof m.organizationId === "number"
        ? idHandler.encode(m.organizationId)
        : m.organizationId,
    userId: m.userId && typeof m.userId === "number" ? idHandler.encode(m.userId) : m.userId,
    organization: m.organization ? encodeOrganization(m.organization) : null,
    user: m.user ? encodeUser(m.user) : null,
  };
}

/**
 * Encode Invitation entity
 */
export function encodeInvitation(invitation: unknown): unknown {
  if (!invitation || typeof invitation !== "object") return null;
  const i = invitation as Record<string, unknown>;

  return {
    ...i,
    id: i.id && typeof i.id === "number" ? idHandler.encode(i.id) : i.id,
    organizationId:
      i.organizationId && typeof i.organizationId === "number"
        ? idHandler.encode(i.organizationId)
        : i.organizationId,
    invitedBy:
      i.invitedBy && typeof i.invitedBy === "number" ? idHandler.encode(i.invitedBy) : i.invitedBy,
    organization: i.organization ? encodeOrganization(i.organization) : null,
  };
}

/**
 * Encode User entity
 */
export function encodeUser(user: unknown): unknown {
  if (!user || typeof user !== "object") return null;
  const u = user as Record<string, unknown>;

  return {
    ...u,
    id: u.id && typeof u.id === "number" ? idHandler.encode(u.id) : u.id,
    customisation: u.customisation ? encodeCustomisation(u.customisation) : null,
  };
}

/**
 * Encode Customisation entity
 */
export function encodeCustomisation(customisation: unknown): unknown {
  if (!customisation || typeof customisation !== "object") return null;
  const c = customisation as Record<string, unknown>;

  return {
    ...c,
    id: c.id && typeof c.id === "number" ? idHandler.encode(c.id) : c.id,
    userId: c.userId && typeof c.userId === "number" ? idHandler.encode(c.userId) : c.userId,
  };
}

/**
 * Encode PageSettings entity
 */
export function encodePageSettings(pageSettings: unknown): unknown {
  if (!pageSettings || typeof pageSettings !== "object") return null;
  const p = pageSettings as Record<string, unknown>;

  return {
    ...p,
    id: p.id && typeof p.id === "number" ? idHandler.encode(p.id) : p.id,
  };
}

/**
 * Encode CandidateDetails entity
 */
export function encodeCandidateDetails(candidateDetails: unknown): unknown {
  if (!candidateDetails || typeof candidateDetails !== "object") return null;
  const c = candidateDetails as Record<string, unknown>;

  return {
    ...c,
    id: c.id && typeof c.id === "number" ? idHandler.encode(c.id) : c.id,
    jobId: c.jobId && typeof c.jobId === "number" ? idHandler.encode(c.jobId) : c.jobId,
  };
}

/**
 * Encode JobDescription entity
 */
export function encodeJobDescription(jobDescription: unknown): unknown {
  if (!jobDescription || typeof jobDescription !== "object") return null;
  const j = jobDescription as Record<string, unknown>;

  return {
    ...j,
    id: j.id && typeof j.id === "number" ? idHandler.encode(j.id) : j.id,
    jobId: j.jobId && typeof j.jobId === "number" ? idHandler.encode(j.jobId) : j.jobId,
  };
}

/**
 * Encode FeatureRequest entity
 */
export function encodeFeatureRequest(request: unknown): unknown {
  if (!request || typeof request !== "object") return null;
  const r = request as Record<string, unknown>;

  return {
    ...r,
    id: r.id && typeof r.id === "number" ? idHandler.encode(r.id) : r.id,
    userId: r.userId && typeof r.userId === "number" ? idHandler.encode(r.userId) : r.userId,
  };
}

/**
 * Encode Review entity
 */
export function encodeReview(review: unknown): unknown {
  if (!review || typeof review !== "object") return null;
  const r = review as Record<string, unknown>;

  return {
    ...r,
    id: r.id && typeof r.id === "number" ? idHandler.encode(r.id) : r.id,
    userId: r.userId && typeof r.userId === "number" ? idHandler.encode(r.userId) : r.userId,
  };
}

/**
 * Encode Changelog entity
 */
export function encodeChangelog(changelog: unknown): unknown {
  if (!changelog || typeof changelog !== "object") return null;
  const c = changelog as Record<string, unknown>;

  return {
    ...c,
    id: c.id && typeof c.id === "number" ? idHandler.encode(c.id) : c.id,
  };
}

/**
 * Generic encoder for any entity with common ID fields
 */
export function encodeEntity(entity: unknown): unknown {
  if (!entity || typeof entity !== "object") return null;
  const e = entity as Record<string, unknown>;

  const encoded: Record<string, unknown> = { ...e };

  // Common ID fields that might exist
  const idFields = [
    "id",
    "userId",
    "jobId",
    "interviewId",
    "reportId",
    "organizationId",
    "customisationId",
    "pageSettingsId",
    "jobDescriptionId",
    "candidateDetailsId",
    "featureRequestId",
    "changelogId",
    "reviewId",
    "invitedBy",
    "ownerId",
  ];

  for (const field of idFields) {
    if (encoded[field] && typeof encoded[field] === "number") {
      encoded[field] = idHandler.encode(encoded[field] as number);
    }
  }

  return encoded;
}
