import test from "node:test";
import assert from "node:assert/strict";

import {
  classifyEvidence,
  extractJobRequirements,
  segmentResumeEvidence,
} from "../src/services/requirementEvidence.service.js";

test("extractJobRequirements includes mandatory and preferred skills", () => {
  const requirements = extractJobRequirements({
    jobDescription: "Must build REST APIs. Preferred experience with Redis.",
    mandatorySkills: ["Node.js"],
    preferredSkills: ["Redis"],
    minimumExperience: 3,
    minimumQualification: "Bachelor's degree",
  });
  const labels = requirements.map((entry) => entry.requirement);

  assert.ok(labels.includes("Experience with Node.js"));
  assert.ok(labels.includes("Experience with Redis"));
  assert.ok(labels.includes("At least 3 years of experience"));
  assert.ok(labels.includes("Bachelor's degree"));
  assert.equal(
    requirements.find((entry) => entry.requirement === "Experience with Node.js")
      .mandatory,
    true
  );
});

test("segmentResumeEvidence preserves section metadata", () => {
  const segments = segmentResumeEvidence(`
Experience
- Built REST APIs with Node.js and Express.
Education
Bachelor of Engineering
`);

  assert.equal(segments[0].section, "experience");
  assert.equal(segments[0].text, "Built REST APIs with Node.js and Express.");
  assert.equal(segments[1].section, "education");
});

test("classifyEvidence requires lexical verification for strong evidence", () => {
  assert.equal(
    classifyEvidence({ similarityScore: 0.8, lexicalVerified: true }),
    "strong"
  );
  assert.equal(
    classifyEvidence({ similarityScore: 0.8, lexicalVerified: false }),
    "partial"
  );
  assert.equal(
    classifyEvidence({ similarityScore: 0.4, lexicalVerified: true }),
    "missing"
  );
});

