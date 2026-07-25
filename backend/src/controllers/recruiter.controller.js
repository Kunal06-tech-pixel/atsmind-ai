import crypto from "crypto";
import mongoose from "mongoose";
import { z } from "zod";

import CandidateEvaluation from "../models/CandidateEvaluation.js";
import CandidateResume from "../models/CandidateResume.js";
import JobOpening from "../models/JobOpening.js";
import { candidateEvaluationQueue } from "../queues/resumeAnalysis.queue.js";
import { getEvidenceCounts, rankEvaluationsForJob } from "../services/candidateRanking.service.js";
import { deleteResumeFile, saveResumeFile } from "../services/storage.service.js";
import { parseRequest } from "../utils/validation.js";

const jobStatuses = ["draft", "active", "closed"];

const stringList = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}, z.array(z.string().trim().min(1)).max(80));

const jobOpeningBodySchema = z.object({
  title: z.string().trim().min(2).max(160),
  companyName: z.string().trim().max(160).optional().default(""),
  department: z.string().trim().max(120).optional().default(""),
  location: z.string().trim().max(160).optional().default(""),
  jobDescription: z.string().trim().min(40).max(20000),
  mandatorySkills: stringList.optional().default([]),
  preferredSkills: stringList.optional().default([]),
  minimumExperience: z.coerce.number().min(0).max(60).optional().default(0),
  minimumQualification: z.string().trim().max(240).optional().default(""),
  status: z.enum(jobStatuses).optional().default("draft"),
});

const jobOpeningPatchSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  companyName: z.string().trim().max(160).optional(),
  department: z.string().trim().max(120).optional(),
  location: z.string().trim().max(160).optional(),
  jobDescription: z.string().trim().min(40).max(20000).optional(),
  mandatorySkills: stringList.optional(),
  preferredSkills: stringList.optional(),
  minimumExperience: z.coerce.number().min(0).max(60).optional(),
  minimumQualification: z.string().trim().max(240).optional(),
  status: z.enum(jobStatuses).optional(),
});

const listJobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(jobStatuses).optional(),
  search: z.string().trim().max(160).optional().default(""),
  sort: z.enum(["updatedAt", "createdAt", "title"]).optional().default("updatedAt"),
  direction: z.enum(["asc", "desc"]).optional().default("desc"),
});

const candidateListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  status: z.enum(["queued", "processing", "completed", "failed"]).optional(),
  search: z.string().trim().max(160).optional().default(""),
});

const evaluationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  status: z
    .enum(["pending", "reviewed", "shortlisted", "rejected", "selected"])
    .optional(),
  search: z.string().trim().max(160).optional().default(""),
});

const evaluationStatusSchema = z.object({
  recruitmentStatus: z.enum([
    "pending",
    "reviewed",
    "shortlisted",
    "rejected",
    "selected",
  ]),
});

const evaluationNotesSchema = z.object({
  recruiterNotes: z.string().trim().max(4000).optional().default(""),
  recruiterOverrideScore: z.coerce.number().min(0).max(100).nullable().optional(),
});

const compareSchema = z.object({
  evaluationIds: z.array(z.string().trim().min(1)).min(2).max(3),
});

const validateObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const invalidIdResponse = (res, message = "Resource not found") =>
  res.status(404).json({
    success: false,
    message,
  });

const serializeJobOpening = (job) => {
  const doc = typeof job.toObject === "function" ? job.toObject() : job;

  return {
    id: doc._id?.toString?.() || doc.id,
    title: doc.title,
    companyName: doc.companyName || "",
    department: doc.department || "",
    location: doc.location || "",
    jobDescription: doc.jobDescription || "",
    mandatorySkills: doc.mandatorySkills || [],
    preferredSkills: doc.preferredSkills || [],
    minimumExperience: doc.minimumExperience || 0,
    minimumQualification: doc.minimumQualification || "",
    status: doc.status || "draft",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    candidateCount: doc.candidateCount || 0,
    evaluationCount: doc.evaluationCount || 0,
  };
};

const serializeCandidate = (candidate) => {
  if (!candidate) return null;

  const doc = typeof candidate.toObject === "function" ? candidate.toObject() : candidate;

  return {
    id: doc._id?.toString?.() || doc.id,
    jobOpeningId: doc.jobOpeningId?.toString?.() || doc.jobOpeningId,
    candidateName: doc.candidateName || "",
    candidateEmail: doc.candidateEmail || "",
    candidatePhone: doc.candidatePhone || "",
    originalFileName: doc.originalFileName || "",
    consentConfirmed: Boolean(doc.consentConfirmed),
    processingStatus: doc.processingStatus || "queued",
    errorMessage: doc.errorMessage || "",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const serializeEvaluation = (evaluation, candidate) => {
  const doc =
    typeof evaluation.toObject === "function" ? evaluation.toObject() : evaluation;
  const counts = getEvidenceCounts(doc);

  return {
    id: doc._id?.toString?.() || doc.id,
    jobOpeningId: doc.jobOpeningId?.toString?.() || doc.jobOpeningId,
    candidateResumeId:
      doc.candidateResumeId?.toString?.() || doc.candidateResumeId,
    candidate: candidate ? serializeCandidate(candidate) : null,
    scores: doc.scores || {},
    matchedSkills: doc.matchedSkills || [],
    missingSkills: doc.missingSkills || [],
    matchedKeywords: doc.matchedKeywords || [],
    missingKeywords: doc.missingKeywords || [],
    requirementEvidence: doc.requirementEvidence || [],
    mandatoryRequirementWarnings: doc.mandatoryRequirementWarnings || [],
    systemRank: doc.systemRank || null,
    recruitmentStatus: doc.recruitmentStatus || "pending",
    recruiterNotes: doc.recruiterNotes || "",
    recruiterOverrideScore: doc.recruiterOverrideScore ?? null,
    recruiterSummary: doc.recruiterSummary || "",
    ...counts,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const createOwnershipQuery = (req, jobId) => ({
  _id: jobId,
  recruiterId: req.userId,
});

const isPdfBuffer = (buffer) =>
  buffer?.subarray?.(0, 5).toString("utf8") === "%PDF-";

const getCandidateHash = (buffer) =>
  crypto.createHash("sha256").update(buffer).digest("hex");

const parseCandidateMetadata = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const clean = (value) => (typeof value === "string" ? value.trim() : "");

const ensureOwnedJob = async (req, res) => {
  if (!validateObjectId(req.params.jobId)) {
    invalidIdResponse(res, "Job requirement not found");
    return null;
  }

  const job = await JobOpening.findOne(createOwnershipQuery(req, req.params.jobId));

  if (!job) {
    invalidIdResponse(res, "Job requirement not found");
    return null;
  }

  return job;
};

export const createJobOpening = async (req, res) => {
  try {
    const parsed = parseRequest(jobOpeningBodySchema, req.body);

    if (!parsed.success) {
      return res.status(400).json(parsed.response);
    }

    const companyName =
      parsed.data.companyName || req.user?.companyProfile?.companyName || "";

    const job = await JobOpening.create({
      ...parsed.data,
      companyName,
      recruiterId: req.userId,
    });

    return res.status(201).json({
      success: true,
      job: serializeJobOpening(job),
    });
  } catch (error) {
    console.error("Create recruiter job error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not create job requirement",
    });
  }
};

export const listJobOpenings = async (req, res) => {
  try {
    const parsed = parseRequest(listJobsQuerySchema, req.query);

    if (!parsed.success) {
      return res.status(400).json(parsed.response);
    }

    const { page, limit, status, search, sort, direction } = parsed.data;
    const query = { recruiterId: req.userId };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const sortDirection = direction === "asc" ? 1 : -1;
    const [total, jobs] = await Promise.all([
      JobOpening.countDocuments(query),
      JobOpening.find(query)
        .sort({ [sort]: sortDirection, _id: sortDirection })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const jobIds = jobs.map((job) => job._id);
    const [candidateCounts, evaluationCounts] = await Promise.all([
      CandidateResume.aggregate([
        { $match: { jobOpeningId: { $in: jobIds } } },
        { $group: { _id: "$jobOpeningId", count: { $sum: 1 } } },
      ]),
      CandidateEvaluation.aggregate([
        { $match: { jobOpeningId: { $in: jobIds } } },
        { $group: { _id: "$jobOpeningId", count: { $sum: 1 } } },
      ]),
    ]);
    const candidatesByJob = new Map(
      candidateCounts.map((entry) => [entry._id.toString(), entry.count])
    );
    const evaluationsByJob = new Map(
      evaluationCounts.map((entry) => [entry._id.toString(), entry.count])
    );

    return res.json({
      success: true,
      page,
      limit,
      total,
      jobs: jobs.map((job) =>
        serializeJobOpening({
          ...job,
          candidateCount: candidatesByJob.get(job._id.toString()) || 0,
          evaluationCount: evaluationsByJob.get(job._id.toString()) || 0,
        })
      ),
    });
  } catch (error) {
    console.error("List recruiter jobs error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not load job requirements",
    });
  }
};

export const getJobOpening = async (req, res) => {
  try {
    if (!validateObjectId(req.params.jobId)) {
      return invalidIdResponse(res, "Job requirement not found");
    }

    const job = await JobOpening.findOne(createOwnershipQuery(req, req.params.jobId))
      .lean();

    if (!job) {
      return invalidIdResponse(res, "Job requirement not found");
    }

    const [candidateCount, evaluationCount] = await Promise.all([
      CandidateResume.countDocuments({ jobOpeningId: job._id }),
      CandidateEvaluation.countDocuments({ jobOpeningId: job._id }),
    ]);

    return res.json({
      success: true,
      job: serializeJobOpening({
        ...job,
        candidateCount,
        evaluationCount,
      }),
    });
  } catch (error) {
    console.error("Get recruiter job error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not load job requirement",
    });
  }
};

export const updateJobOpening = async (req, res) => {
  try {
    if (!validateObjectId(req.params.jobId)) {
      return invalidIdResponse(res, "Job requirement not found");
    }

    const parsed = parseRequest(jobOpeningPatchSchema, req.body);

    if (!parsed.success) {
      return res.status(400).json(parsed.response);
    }

    const job = await JobOpening.findOneAndUpdate(
      createOwnershipQuery(req, req.params.jobId),
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!job) {
      return invalidIdResponse(res, "Job requirement not found");
    }

    return res.json({
      success: true,
      job: serializeJobOpening(job),
    });
  } catch (error) {
    console.error("Update recruiter job error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not update job requirement",
    });
  }
};

export const deleteJobOpening = async (req, res) => {
  try {
    if (!validateObjectId(req.params.jobId)) {
      return invalidIdResponse(res, "Job requirement not found");
    }

    const job = await JobOpening.findOne(createOwnershipQuery(req, req.params.jobId));

    if (!job) {
      return invalidIdResponse(res, "Job requirement not found");
    }

    const candidates = await CandidateResume.find({
      recruiterId: req.userId,
      jobOpeningId: job._id,
    })
      .select("storageProvider s3Key filePath")
      .lean();

    await Promise.all(
      candidates.map((candidate) =>
        deleteResumeFile({
          storageProvider: candidate.storageProvider,
          s3Key: candidate.s3Key,
          filePath: candidate.filePath,
        }).catch(() => false)
      )
    );

    const [candidateResult, evaluationResult] = await Promise.all([
      CandidateResume.deleteMany({
        recruiterId: req.userId,
        jobOpeningId: job._id,
      }),
      CandidateEvaluation.deleteMany({
        recruiterId: req.userId,
        jobOpeningId: job._id,
      }),
    ]);

    await job.deleteOne();

    return res.json({
      success: true,
      deleted: {
        jobs: 1,
        candidates: candidateResult.deletedCount || 0,
        evaluations: evaluationResult.deletedCount || 0,
      },
    });
  } catch (error) {
    console.error("Delete recruiter job error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not delete job requirement",
    });
  }
};

export const uploadCandidateResumes = async (req, res) => {
  const storedFiles = [];

  try {
    const job = await ensureOwnedJob(req, res);

    if (!job) return null;

    const files = req.files || [];
    const maxBatchSize = Number(process.env.CANDIDATE_BATCH_MAX_FILES || 20);
    const consentConfirmed =
      req.body.consentConfirmed === true ||
      req.body.consentConfirmed === "true";

    if (!consentConfirmed) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Candidate consent confirmation is required",
        details: [],
      });
    }

    if (!files.length) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "At least one PDF resume is required",
        details: [],
      });
    }

    if (files.length > maxBatchSize) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: `Upload up to ${maxBatchSize} resumes in one batch`,
        details: [],
      });
    }

    const candidateMetadata = parseCandidateMetadata(req.body.candidateMetadata);
    const accepted = [];
    const failed = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const metadata = candidateMetadata[index] || {};
      const fileBuffer = file.buffer;
      let candidate = null;

      if (!isPdfBuffer(fileBuffer)) {
        failed.push({
          fileName: file.originalname,
          message: "File is not a valid PDF",
        });
        continue;
      }

      const contentHash = getCandidateHash(fileBuffer);
      const queueJobId = `${job._id.toString()}-${contentHash}`;
      let storedFile = null;

      try {
        const duplicateCandidate = await CandidateResume.findOne({
          recruiterId: req.userId,
          jobOpeningId: job._id,
          contentHash,
        });
        const duplicateQueueJob = duplicateCandidate
          ? await candidateEvaluationQueue.getJob(queueJobId)
          : null;

        if (duplicateCandidate && duplicateQueueJob) {
          failed.push({
            fileName: file.originalname,
            message: "Duplicate resume for this job requirement",
          });
          continue;
        }

        if (
          duplicateCandidate &&
          !["queued", "failed"].includes(duplicateCandidate.processingStatus)
        ) {
          failed.push({
            fileName: file.originalname,
            message: "Duplicate resume for this job requirement",
          });
          continue;
        }

        if (duplicateCandidate) {
          await Promise.all([
            CandidateEvaluation.deleteOne({
              recruiterId: req.userId,
              candidateResumeId: duplicateCandidate._id,
            }),
            deleteResumeFile({
              storageProvider: duplicateCandidate.storageProvider,
              s3Key: duplicateCandidate.s3Key,
              filePath: duplicateCandidate.filePath,
            }).catch(() => false),
          ]);
          await duplicateCandidate.deleteOne();
        }

        storedFile = await saveResumeFile({
          userId: req.userId,
          originalName: file.originalname,
          buffer: fileBuffer,
        });
        storedFiles.push(storedFile);

        candidate = await CandidateResume.create({
          recruiterId: req.userId,
          jobOpeningId: job._id,
          candidateName: clean(metadata.candidateName),
          candidateEmail: clean(metadata.candidateEmail),
          candidatePhone: clean(metadata.candidatePhone),
          originalFileName: file.originalname,
          storageProvider: storedFile.storageProvider,
          filePath: storedFile.filePath,
          s3Key: storedFile.s3Key,
          consentConfirmed,
          contentHash,
          processingStatus: "queued",
        });

        await candidateEvaluationQueue.add(
          "evaluate",
          {
            type: "recruiter-candidate-analysis",
            recruiterId: req.userId,
            jobOpeningId: job._id.toString(),
            candidateResumeId: candidate._id.toString(),
          },
          {
            jobId: queueJobId,
          }
        );

        storedFiles.splice(storedFiles.indexOf(storedFile), 1);
        accepted.push(serializeCandidate(candidate));
      } catch (error) {
        console.error("Queue candidate resume error:", {
          fileName: file.originalname,
          message: error.message,
        });

        if (candidate) {
          await CandidateResume.deleteOne({
            _id: candidate._id,
            recruiterId: req.userId,
          }).catch(() => {});
        }

        if (storedFile) {
          await deleteResumeFile(storedFile).catch(() => {});
        }

        failed.push({
          fileName: file.originalname,
          message:
            error?.code === 11000
              ? "Duplicate resume for this job requirement"
              : "Could not queue this resume. Confirm Redis and the worker are running.",
        });
      }
    }

    return res.status(202).json({
      success: true,
      accepted,
      failed,
      totalAccepted: accepted.length,
      totalFailed: failed.length,
    });
  } catch (error) {
    console.error("Upload candidate resumes error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not upload candidate resumes",
    });
  } finally {
    await Promise.all(
      storedFiles.map((file) => deleteResumeFile(file).catch(() => false))
    );
  }
};

export const listCandidateResumes = async (req, res) => {
  try {
    const job = await ensureOwnedJob(req, res);
    if (!job) return null;

    const parsed = parseRequest(candidateListQuerySchema, req.query);

    if (!parsed.success) {
      return res.status(400).json(parsed.response);
    }

    const { page, limit, status, search } = parsed.data;
    const query = {
      recruiterId: req.userId,
      jobOpeningId: job._id,
    };

    if (status) query.processingStatus = status;
    if (search) {
      query.$or = [
        { candidateName: { $regex: search, $options: "i" } },
        { candidateEmail: { $regex: search, $options: "i" } },
        { originalFileName: { $regex: search, $options: "i" } },
      ];
    }

    const [total, candidates] = await Promise.all([
      CandidateResume.countDocuments(query),
      CandidateResume.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return res.json({
      success: true,
      page,
      limit,
      total,
      candidates: candidates.map(serializeCandidate),
    });
  } catch (error) {
    console.error("List candidate resumes error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not load candidate resumes",
    });
  }
};

export const getCandidateProgress = async (req, res) => {
  try {
    const job = await ensureOwnedJob(req, res);
    if (!job) return null;

    const counts = await CandidateResume.aggregate([
      {
        $match: {
          recruiterId: new mongoose.Types.ObjectId(req.userId),
          jobOpeningId: job._id,
        },
      },
      { $group: { _id: "$processingStatus", count: { $sum: 1 } } },
    ]);
    const byStatus = Object.fromEntries(
      counts.map((entry) => [entry._id, entry.count])
    );
    const total = counts.reduce((sum, entry) => sum + entry.count, 0);
    const completed = byStatus.completed || 0;

    return res.json({
      success: true,
      total,
      completed,
      queued: byStatus.queued || 0,
      processing: byStatus.processing || 0,
      failed: byStatus.failed || 0,
      label: `${completed} of ${total} resumes analysed`,
    });
  } catch (error) {
    console.error("Candidate progress error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not load candidate progress",
    });
  }
};

const loadCandidateMap = async (evaluations) => {
  const candidateIds = evaluations.map((entry) => entry.candidateResumeId);
  const candidates = await CandidateResume.find({
    _id: { $in: candidateIds },
  }).lean();

  return new Map(candidates.map((candidate) => [candidate._id.toString(), candidate]));
};

export const listCandidateEvaluations = async (req, res) => {
  try {
    const job = await ensureOwnedJob(req, res);
    if (!job) return null;

    await rankEvaluationsForJob({
      recruiterId: req.userId,
      jobOpeningId: job._id,
    });

    const parsed = parseRequest(evaluationListQuerySchema, req.query);

    if (!parsed.success) {
      return res.status(400).json(parsed.response);
    }

    const { page, limit, status, search } = parsed.data;
    const query = {
      recruiterId: req.userId,
      jobOpeningId: job._id,
    };

    if (status) query.recruitmentStatus = status;

    const allEvaluations = await CandidateEvaluation.find(query)
      .sort({ systemRank: 1, "scores.overallScore": -1, createdAt: 1 })
      .lean();
    const candidateMap = await loadCandidateMap(allEvaluations);
    const filtered = search
      ? allEvaluations.filter((evaluation) => {
          const candidate = candidateMap.get(
            evaluation.candidateResumeId.toString()
          );
          const haystack = [
            candidate?.candidateName,
            candidate?.candidateEmail,
            candidate?.originalFileName,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(search.toLowerCase());
        })
      : allEvaluations;
    const paged = filtered.slice((page - 1) * limit, page * limit);

    return res.json({
      success: true,
      page,
      limit,
      total: filtered.length,
      evaluations: paged.map((evaluation) =>
        serializeEvaluation(
          evaluation,
          candidateMap.get(evaluation.candidateResumeId.toString())
        )
      ),
    });
  } catch (error) {
    console.error("List candidate evaluations error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not load candidate evaluations",
    });
  }
};

export const getCandidateEvaluation = async (req, res) => {
  try {
    if (!validateObjectId(req.params.evaluationId)) {
      return invalidIdResponse(res, "Candidate evaluation not found");
    }

    const evaluation = await CandidateEvaluation.findOne({
      _id: req.params.evaluationId,
      recruiterId: req.userId,
    }).lean();

    if (!evaluation) {
      return invalidIdResponse(res, "Candidate evaluation not found");
    }

    const candidate = await CandidateResume.findOne({
      _id: evaluation.candidateResumeId,
      recruiterId: req.userId,
    }).lean();

    return res.json({
      success: true,
      evaluation: serializeEvaluation(evaluation, candidate),
    });
  } catch (error) {
    console.error("Get candidate evaluation error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not load candidate evaluation",
    });
  }
};

export const getCandidateRankings = async (req, res) =>
  listCandidateEvaluations(req, res);

export const compareCandidateEvaluations = async (req, res) => {
  try {
    const job = await ensureOwnedJob(req, res);
    if (!job) return null;

    const parsed = parseRequest(compareSchema, req.body);

    if (!parsed.success) {
      return res.status(400).json(parsed.response);
    }

    const evaluationIds = parsed.data.evaluationIds;
    const validIds = evaluationIds.every(validateObjectId);

    if (!validIds) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: [{ path: "evaluationIds", message: "Invalid evaluation id" }],
      });
    }

    const evaluations = await CandidateEvaluation.find({
      _id: { $in: evaluationIds },
      recruiterId: req.userId,
      jobOpeningId: job._id,
    }).lean();

    if (evaluations.length !== evaluationIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more evaluations were not found",
      });
    }

    const candidateMap = await loadCandidateMap(evaluations);
    const requirementKeys = new Map();

    evaluations.forEach((evaluation) => {
      (evaluation.requirementEvidence || []).forEach((entry) => {
        if (!requirementKeys.has(entry.requirement)) {
          requirementKeys.set(entry.requirement, {
            requirement: entry.requirement,
            requirementType: entry.requirementType || "general",
            mandatory: Boolean(entry.mandatory),
          });
        }
      });
    });

    const rows = [...requirementKeys.values()].map((requirement) => ({
      ...requirement,
      candidates: evaluations.map((evaluation) => {
        const evidence = (evaluation.requirementEvidence || []).find(
          (entry) => entry.requirement === requirement.requirement
        );

        return {
          evaluationId: evaluation._id.toString(),
          candidate: serializeCandidate(
            candidateMap.get(evaluation.candidateResumeId.toString())
          ),
          status: evidence?.status || "missing",
          bestEvidence: evidence?.bestEvidence || null,
          similarityScore: evidence?.similarityScore || 0,
        };
      }),
    }));

    return res.json({
      success: true,
      job: serializeJobOpening(job),
      evaluations: evaluations.map((evaluation) =>
        serializeEvaluation(
          evaluation,
          candidateMap.get(evaluation.candidateResumeId.toString())
        )
      ),
      rows,
    });
  } catch (error) {
    console.error("Compare candidate evaluations error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not compare candidate evaluations",
    });
  }
};

export const updateEvaluationStatus = async (req, res) => {
  try {
    if (!validateObjectId(req.params.evaluationId)) {
      return invalidIdResponse(res, "Candidate evaluation not found");
    }

    const parsed = parseRequest(evaluationStatusSchema, req.body);

    if (!parsed.success) {
      return res.status(400).json(parsed.response);
    }

    const evaluation = await CandidateEvaluation.findOneAndUpdate(
      {
        _id: req.params.evaluationId,
        recruiterId: req.userId,
      },
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).lean();

    if (!evaluation) {
      return invalidIdResponse(res, "Candidate evaluation not found");
    }

    const candidate = await CandidateResume.findById(
      evaluation.candidateResumeId
    ).lean();

    return res.json({
      success: true,
      evaluation: serializeEvaluation(evaluation, candidate),
    });
  } catch (error) {
    console.error("Update evaluation status error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not update evaluation status",
    });
  }
};

export const updateEvaluationNotes = async (req, res) => {
  try {
    if (!validateObjectId(req.params.evaluationId)) {
      return invalidIdResponse(res, "Candidate evaluation not found");
    }

    const parsed = parseRequest(evaluationNotesSchema, req.body);

    if (!parsed.success) {
      return res.status(400).json(parsed.response);
    }

    const evaluation = await CandidateEvaluation.findOneAndUpdate(
      {
        _id: req.params.evaluationId,
        recruiterId: req.userId,
      },
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).lean();

    if (!evaluation) {
      return invalidIdResponse(res, "Candidate evaluation not found");
    }

    const candidate = await CandidateResume.findById(
      evaluation.candidateResumeId
    ).lean();

    return res.json({
      success: true,
      evaluation: serializeEvaluation(evaluation, candidate),
    });
  } catch (error) {
    console.error("Update evaluation notes error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not update evaluation notes",
    });
  }
};
