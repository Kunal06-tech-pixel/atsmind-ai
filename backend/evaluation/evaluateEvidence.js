import fs from "fs/promises";

const statuses = ["strong", "partial", "missing"];

const normalize = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const createMatrix = () =>
  Object.fromEntries(
    statuses.map((expected) => [
      expected,
      Object.fromEntries(statuses.map((predicted) => [predicted, 0])),
    ])
  );

const main = async () => {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error("Usage: node backend/evaluation/evaluateEvidence.js <dataset.json>");
    process.exit(1);
  }

  const raw = await fs.readFile(filePath, "utf8");
  const rows = JSON.parse(raw);

  if (!Array.isArray(rows)) {
    throw new Error("Dataset must be a JSON array");
  }

  const matrix = createMatrix();
  let classified = 0;
  let correctClassifications = 0;
  let precisionAtOneDenominator = 0;
  let precisionAtOneHits = 0;

  rows.forEach((row) => {
    const expectedStatus = normalize(row.expectedStatus);
    const predictedStatus = normalize(row.predictedStatus);

    if (!statuses.includes(expectedStatus) || !statuses.includes(predictedStatus)) {
      return;
    }

    classified += 1;
    matrix[expectedStatus][predictedStatus] += 1;

    if (expectedStatus === predictedStatus) {
      correctClassifications += 1;
    }

    if (expectedStatus !== "missing") {
      precisionAtOneDenominator += 1;

      if (normalize(row.expectedEvidence) === normalize(row.predictedEvidence)) {
        precisionAtOneHits += 1;
      }
    }
  });

  const classificationAccuracy = classified
    ? correctClassifications / classified
    : 0;
  const precisionAtOne = precisionAtOneDenominator
    ? precisionAtOneHits / precisionAtOneDenominator
    : 0;

  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        classified,
        classificationAccuracy,
        precisionAtOne,
        confusionMatrix: matrix,
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

