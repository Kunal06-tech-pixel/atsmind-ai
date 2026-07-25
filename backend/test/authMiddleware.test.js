import test from "node:test";
import assert from "node:assert/strict";

import { authorizeRoles } from "../src/middleware/auth.middleware.js";

const createResponse = () => {
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return response;
};

test("authorizeRoles rejects unauthenticated requests", () => {
  const response = createResponse();
  let called = false;

  authorizeRoles("recruiter")({}, response, () => {
    called = true;
  });

  assert.equal(called, false);
  assert.equal(response.statusCode, 401);
  assert.equal(response.body.success, false);
});

test("authorizeRoles rejects unsupported roles", () => {
  const response = createResponse();
  let called = false;

  authorizeRoles("recruiter")(
    { user: { role: "job_seeker" } },
    response,
    () => {
      called = true;
    }
  );

  assert.equal(called, false);
  assert.equal(response.statusCode, 403);
  assert.equal(response.body.success, false);
});

test("authorizeRoles allows matching roles", () => {
  const response = createResponse();
  let called = false;

  authorizeRoles("recruiter", "admin")(
    { user: { role: "recruiter" } },
    response,
    () => {
      called = true;
    }
  );

  assert.equal(called, true);
  assert.equal(response.statusCode, 200);
});

