export const USER_ROLES = {
  jobSeeker: "job_seeker",
  recruiter: "recruiter",
  admin: "admin",
};

export const getUserRole = (user) => user?.role || USER_ROLES.jobSeeker;

export const getDashboardPathByRole = (user) => {
  const role = getUserRole(user);

  if (role === USER_ROLES.recruiter) return "/recruiter/dashboard";
  if (role === USER_ROLES.admin) return "/admin/dashboard";

  return "/dashboard";
};

