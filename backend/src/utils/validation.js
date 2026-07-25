export const formatValidationIssues = (error) =>
  error.issues?.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  })) || [];

export const parseRequest = (schema, data) => {
  const parsed = schema.safeParse(data);

  if (parsed.success) {
    return {
      success: true,
      data: parsed.data,
    };
  }

  return {
    success: false,
    response: {
      success: false,
      code: "VALIDATION_ERROR",
      message: "Invalid request",
      details: formatValidationIssues(parsed.error),
    },
  };
};

