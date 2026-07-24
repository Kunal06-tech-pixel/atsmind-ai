import test from "node:test";
import assert from "node:assert/strict";

import {
  createAdzunaConfigurationError,
  fetchAdzunaJobs,
  normalizeAdzunaJob,
} from "../src/services/adzuna.service.js";
import { rankJobRecommendations } from "../src/services/jobRecommendation.service.js";
import { createLocalJobMarket } from "../src/services/localJobMarket.service.js";
import { createAnalysisOwnershipQuery } from "../src/controllers/jobs.controller.js";

test("normalizeAdzunaJob maps Adzuna fields into the public job shape", () => {
  const job = normalizeAdzunaJob({
    id: "123",
    title: "React Developer",
    company: { display_name: "Example Co" },
    location: { display_name: "Bengaluru, India" },
    description: "<p>Build React apps &amp; APIs.</p>",
    redirect_url: "https://example.test/job",
    salary_min: 600000,
    salary_max: 900000,
    salary_is_predicted: 1,
    category: { label: "IT Jobs" },
  });

  assert.equal(job.id, "123");
  assert.equal(job.title, "React Developer");
  assert.equal(job.company, "Example Co");
  assert.equal(job.location, "Bengaluru, India");
  assert.equal(job.description, "Build React apps & APIs.");
  assert.equal(job.url, "https://example.test/job");
  assert.deepEqual(job.salary, {
    min: 600000,
    max: 900000,
    isPredicted: true,
  });
  assert.equal(job.category, "IT Jobs");
});

test("fetchAdzunaJobs fails clearly when credentials are missing", async () => {
  await assert.rejects(
    () => fetchAdzunaJobs({ role: "React", env: {} }),
    (error) => {
      assert.equal(error.code, "ADZUNA_CONFIG_MISSING");
      assert.equal(error.statusCode, 503);
      assert.deepEqual(error.missing, ["ADZUNA_APP_ID", "ADZUNA_APP_KEY"]);
      return true;
    }
  );

  const error = createAdzunaConfigurationError({});
  assert.match(error.message, /ADZUNA_APP_ID/);
  assert.match(error.message, /ADZUNA_APP_KEY/);
});

test("createLocalJobMarket returns usable fallback jobs without Adzuna", () => {
  const result = createLocalJobMarket({
    role: "React developer",
    location: "Bengaluru",
    country: "in",
    count: 3,
  });

  assert.equal(result.source, "Local fallback");
  assert.equal(result.jobs.length, 3);
  assert.equal(result.jobs[0].location, "Bengaluru");
  assert.match(result.jobs[0].description, /React/);
  assert.match(result.note, /ADZUNA_APP_ID/);
});

test("fetchAdzunaJobs calls Adzuna search and normalizes results", async () => {
  let requestedUrl = "";
  const response = await fetchAdzunaJobs({
    role: "Node developer",
    location: "Pune",
    country: "in",
    env: {
      ADZUNA_APP_ID: "app",
      ADZUNA_APP_KEY: "key",
      ADZUNA_RESULTS_PER_PAGE: "5",
    },
    fetchImpl: async (url) => {
      requestedUrl = url.toString();
      return {
        ok: true,
        json: async () => ({
          count: 1,
          results: [
            {
              id: "1",
              title: "Node.js Developer",
              description: "Build APIs with Node.js",
              redirect_url: "https://example.test/1",
            },
          ],
        }),
      };
    },
  });

  assert.match(requestedUrl, /\/jobs\/in\/search\/1/);
  assert.match(requestedUrl, /what=Node\+developer/);
  assert.match(requestedUrl, /where=Pune/);
  assert.equal(response.count, 1);
  assert.equal(response.jobs[0].title, "Node.js Developer");
});

test("rankJobRecommendations places stronger matches first", async () => {
  const analysis = {
    embedding: [1, 0],
    skillsDetected: ["React", "Node.js"],
    resumeQualityScore: 80,
  };
  const jobs = [
    {
      id: "weak",
      title: "Python Developer",
      company: "Example",
      description: "Requires Python and Flask.",
    },
    {
      id: "strong",
      title: "React Node.js Developer",
      company: "Example",
      description: "Requires React and Node.js.",
    },
  ];
  const embeddings = new Map([
    ["Python Developer\nExample\nRequires Python and Flask.", [0, 1]],
    ["React Node.js Developer\nExample\nRequires React and Node.js.", [1, 0]],
  ]);

  const result = await rankJobRecommendations({
    analysis,
    jobs,
    generateEmbeddingsFn: async (texts) => texts.map((text) => embeddings.get(text)),
  });

  assert.equal(result.recommendations[0].id, "strong");
  assert.equal(result.recommendations[0].jobFitScore, 98);
  assert.deepEqual(result.recommendations[0].matchedSkills, ["React", "Node.js"]);
  assert.ok(result.recommendations[0].jobFitScore > result.recommendations[1].jobFitScore);
});

test("jobs without catalog skills still rank by semantic similarity", async () => {
  const analysis = {
    embedding: [1, 0],
    skillsDetected: ["React"],
    resumeQualityScore: 90,
  };
  const jobs = [
    {
      id: "low",
      title: "Operations Coordinator",
      description: "Coordinate schedules and support internal teams.",
    },
    {
      id: "high",
      title: "Product Associate",
      description: "Own roadmap research and user workflow documentation.",
    },
  ];

  const result = await rankJobRecommendations({
    analysis,
    jobs,
    generateEmbeddingsFn: async () => [
      [0, 1],
      [1, 0],
    ],
  });

  assert.equal(result.recommendations[0].id, "high");
  assert.equal(result.recommendations[0].detectedJobSkills.length, 0);
  assert.ok(result.recommendations[0].jobFitScore > result.recommendations[1].jobFitScore);
});

test("job recommendation analysis lookup is scoped to the authenticated user", () => {
  assert.deepEqual(
    createAnalysisOwnershipQuery({
      analysisId: "64b7f9e5f1a2b3c4d5e6f789",
      userId: "64b7f9e5f1a2b3c4d5e6f111",
    }),
    {
      _id: "64b7f9e5f1a2b3c4d5e6f789",
      user: "64b7f9e5f1a2b3c4d5e6f111",
    }
  );
});
