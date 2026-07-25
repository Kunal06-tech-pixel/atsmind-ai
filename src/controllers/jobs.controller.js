import mongoose from "mongoose";

import Analysis from "../models/Analysis.js";
import { fetchAdzunaJobs } from "../services/adzuna.service.js";
import { rankJobRecommendations } from "../services/jobRecommendation.service.js";
import { createLocalJobMarket } from "../services/localJobMarket.service.js";

const cleanString = (value) => String(value || "").trim();

export const createAnalysisOwnershipQuery = ({ analysisId, userId }) => ({
  _id: analysisId,
  user: userId,
});

const buildSearchRole = (analysis, requestedRole) => {
  const fallbackSkills = Array.isArray(analysis?.skillsDetected)
    ? analysis.skillsDetected.slice(0, 3).join(" ")
    : "";

  return cleanString(requestedRole || analysis?.jobTitle || fallbackSkills);
};

export const getJobRecommendations = async (req, res) => {
  try {
    const analysisId = cleanString(req.query.analysisId);

    if (!mongoose.Types.ObjectId.isValid(analysisId)) {
      return res.status(400).json({
        success: false,
        message: "A valid analysisId is required.",
      });
    }

    const analysis = await Analysis.findOne(
      createAnalysisOwnershipQuery({ analysisId, userId: req.userId })
    ).lean();

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found.",
      });
    }

    const role = buildSearchRole(analysis, req.query.role);

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Add a role or use an analysis with detected skills.",
      });
    }

    let jobSearch;
    let fallbackReason = "";

    try {
      jobSearch = await fetchAdzunaJobs({
        role,
        location: req.query.location,
        country: req.query.country,
        page: req.query.page,
      });
    } catch (error) {
      if (
        error.code !== "ADZUNA_CONFIG_MISSING" &&
        error.code !== "ADZUNA_REQUEST_FAILED"
      ) {
        throw error;
      }

      fallbackReason = error.code;
      jobSearch = createLocalJobMarket({
        role,
        location: req.query.location,
        country: req.query.country,
      });
    }

    const ranked = await rankJobRecommendations({
      analysis,
      jobs: jobSearch.jobs,
    });

    return res.json({
      success: true,
      source: jobSearch.source,
      query: {
        analysisId,
        role,
        location: cleanString(req.query.location),
        country: jobSearch.country,
        page: jobSearch.page,
      },
      total: jobSearch.count,
      returned: ranked.recommendations.length,
      scoringMethod: ranked.scoringMethod,
      note: jobSearch.note || ranked.note,
      fallback: Boolean(fallbackReason),
      fallbackReason,
      jobs: ranked.recommendations,
    });
  } catch (error) {
    console.error("Job recommendations error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not generate job recommendations.",
    });
  }
};
