import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateFinalAtsScore,
  SCORE_WEIGHTS,
} from "../src/utils/atsScoring.js";

test("current ATS score weights remain stable", () => {
  assert.deepEqual(SCORE_WEIGHTS, {
    skills: 0.45,
    semantic: 0.3,
    keywords: 0.15,
    quality: 0.1,
  });
});

test("calculateFinalAtsScore uses deterministic weighted scoring", () => {
  const score = calculateFinalAtsScore({
    hasJobDescription: true,
    skillScore: 80,
    semanticScore: 70,
    keywordScore: 60,
    resumeQualityScore: 50,
  });

  assert.equal(score, 71);
});

test("calculateFinalAtsScore falls back to resume quality without a job description", () => {
  const score = calculateFinalAtsScore({
    hasJobDescription: false,
    skillScore: 100,
    semanticScore: 100,
    keywordScore: 100,
    resumeQualityScore: 42,
  });

  assert.equal(score, 42);
});
