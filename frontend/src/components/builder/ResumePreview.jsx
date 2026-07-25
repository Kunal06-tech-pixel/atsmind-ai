const ResumePreview = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    projects = [],
    skills = { technical: [], soft: [], certifications: [] },
  } = data;

  return (
    <div
      id="resume-preview"
      className="mx-auto w-full break-words rounded-lg border border-slate-200 bg-white p-8 text-[14px] leading-[1.6] text-slate-900 shadow-xl shadow-slate-950/10"
      style={{ transform: "none" }}
    >
      <div className="mb-5 border-b border-slate-300 pb-4 text-center">
        <h1 className="break-words text-3xl font-bold tracking-tight">
          {personal.name || "Your Name"}
        </h1>

        <div className="mt-2 flex flex-wrap justify-center gap-2 break-all text-xs text-slate-700">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>| {personal.phone}</span>}
          {personal.location && <span>| {personal.location}</span>}

          {personal.linkedin && (
            <span>
              |{" "}
              <a
                href={personal.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 hover:underline"
              >
                LinkedIn
              </a>
            </span>
          )}

          {personal.portfolio && (
            <span>
              |{" "}
              <a
                href={personal.portfolio}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 hover:underline"
              >
                Portfolio
              </a>
            </span>
          )}
        </div>
      </div>

      <section className="mb-5">
        <h2 className="mb-2 border-b border-slate-400 text-[18px] font-bold uppercase">
          Education
        </h2>

        {education.map((edu, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between gap-4 font-semibold">
              <span className="break-words">{edu.school}</span>
              <span className="whitespace-nowrap text-xs">{edu.end}</span>
            </div>

            <p className="break-words text-sm">
              {edu.degree}
              {edu.field && `, ${edu.field}`}
            </p>

            {edu.gpa && <p className="text-sm">CGPA: {edu.gpa}</p>}
          </div>
        ))}
      </section>

      <section className="mb-5">
        <h2 className="mb-2 border-b border-slate-400 text-[18px] font-bold uppercase">
          Work Experience
        </h2>

        {experience.map((exp, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between gap-4 font-semibold">
              <span className="break-words">{exp.company}</span>
              <span className="whitespace-nowrap text-xs">
                {exp.start} - {exp.end}
              </span>
            </div>

            <p className="break-words italic">{exp.jobTitle}</p>

            <div className="mt-2 space-y-2">
              {exp.responsibilities
                ?.split("\n")
                .filter(Boolean)
                .map((line, lineIndex) => (
                  <div key={lineIndex} className="flex items-start gap-2">
                    <span className="mt-1 shrink-0">-</span>
                    <p className="flex-1 break-words leading-[1.6]">{line}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mb-5">
        <h2 className="mb-2 border-b border-slate-400 text-[18px] font-bold uppercase">
          Projects
        </h2>

        {projects.map((project, index) => (
          <div key={index} className="mb-4">
            <p className="break-words font-semibold">
              {project.title || "Project Title"}

              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 text-sm font-normal text-blue-700 hover:underline"
                >
                  | GitHub
                </a>
              )}

              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 text-sm font-normal text-green-700 hover:underline"
                >
                  | Live
                </a>
              )}
            </p>

            {project.techStack && (
              <p className="break-words text-sm">
                <span className="font-medium">Tech:</span> {project.techStack}
              </p>
            )}

            <div className="mt-2 space-y-2">
              {project.description
                ?.split("\n")
                .filter(Boolean)
                .map((line, lineIndex) => (
                  <div key={lineIndex} className="flex items-start gap-2">
                    <span className="mt-1 shrink-0">-</span>
                    <p className="flex-1 break-words leading-[1.6]">{line}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mb-5">
        <h2 className="mb-2 border-b border-slate-400 text-[18px] font-bold uppercase">
          Skills
        </h2>

        <p>
          <span className="font-semibold">Technical:</span>{" "}
          {skills.technical.join(", ") || "-"}
        </p>

        <p>
          <span className="font-semibold">Soft Skills:</span>{" "}
          {skills.soft.join(", ") || "-"}
        </p>
      </section>

      {skills.certifications?.length > 0 && (
        <section>
          <h2 className="mb-2 border-b border-slate-400 text-[18px] font-bold uppercase">
            Certifications
          </h2>

          <div className="space-y-2">
            {skills.certifications.map((cert, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="mt-1 shrink-0">-</span>

                <p className="flex-1 break-words">
                  {typeof cert === "string" ? (
                    cert
                  ) : (
                    <>
                      {cert.name}
                      {cert.link && (
                        <a
                          href={cert.link}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 text-blue-700 hover:underline"
                        >
                          (View)
                        </a>
                      )}
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ResumePreview;
