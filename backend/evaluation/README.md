# Evidence Evaluation

This folder contains offline evaluation helpers for the recruiter evidence engine.
Use manually labelled data before making accuracy claims.

## Dataset Format

Create a JSON file with an array of labelled requirement results:

```json
[
  {
    "jobId": "sample-job-1",
    "candidateId": "candidate-1",
    "requirement": "Experience with REST APIs",
    "expectedStatus": "strong",
    "predictedStatus": "strong",
    "expectedEvidence": "Developed RESTful endpoints using Express.",
    "predictedEvidence": "Developed RESTful endpoints using Express."
  }
]
```

## Run

```bash
node backend/evaluation/evaluateEvidence.js backend/evaluation/sample-evidence.json
```

The script reports:

- Classification accuracy for strong, partial, and missing labels
- Precision at 1 for exact evidence text matches
- Confusion matrix

## Error Analysis Categories

Use these labels during manual review:

- `skill_alias_failure`
- `false_semantic_match`
- `experience_duration_mismatch`
- `qualification_mismatch`
- `section_parsing_failure`
- `pdf_extraction_failure`
- `missing_marked_partial`
- `java_javascript_conflict`

