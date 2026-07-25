import api from "./axios";

export const listRecruiterJobs = (params = {}) =>
  api.get("/api/recruiter/jobs", { params });

export const getRecruiterJob = (jobId) =>
  api.get(`/api/recruiter/jobs/${jobId}`);

export const createRecruiterJob = (data) =>
  api.post("/api/recruiter/jobs", data);

export const updateRecruiterJob = (jobId, data) =>
  api.patch(`/api/recruiter/jobs/${jobId}`, data);

export const deleteRecruiterJob = (jobId) =>
  api.delete(`/api/recruiter/jobs/${jobId}`);

export const uploadCandidateResumes = (jobId, formData) =>
  api.post(`/api/recruiter/jobs/${jobId}/candidates`, formData);

export const listCandidateResumes = (jobId, params = {}) =>
  api.get(`/api/recruiter/jobs/${jobId}/candidates`, { params });

export const getCandidateProgress = (jobId) =>
  api.get(`/api/recruiter/jobs/${jobId}/progress`);

export const listCandidateEvaluations = (jobId, params = {}) =>
  api.get(`/api/recruiter/jobs/${jobId}/evaluations`, { params });

export const getCandidateRankings = (jobId, params = {}) =>
  api.get(`/api/recruiter/jobs/${jobId}/rankings`, { params });

export const getCandidateEvaluation = (evaluationId) =>
  api.get(`/api/recruiter/evaluations/${evaluationId}`);

export const compareCandidateEvaluations = (jobId, evaluationIds) =>
  api.post(`/api/recruiter/jobs/${jobId}/compare`, { evaluationIds });

export const updateCandidateEvaluationStatus = (
  evaluationId,
  recruitmentStatus
) =>
  api.patch(`/api/recruiter/evaluations/${evaluationId}/status`, {
    recruitmentStatus,
  });

export const updateCandidateEvaluationNotes = (evaluationId, data) =>
  api.patch(`/api/recruiter/evaluations/${evaluationId}/notes`, data);
