import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },

  header: {
    textAlign: "center",
    marginBottom: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },

  contact: {
    fontSize: 9,
    color: "gray",
  },

  section: {
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 2,
    marginBottom: 6,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  company: {
    fontWeight: "bold",
    fontSize: 10,
  },

  italic: {
    fontStyle: "italic",
    fontSize: 9,
  },

  bullet: {
    marginLeft: 8,
    marginBottom: 2,
  },

  skillText: {
    fontSize: 10,
  },
});

const ResumePDF = ({ data }) => {
  const { personal, education, experience, projects, skills } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{personal.name}</Text>

          <Text style={styles.contact}>
            {personal.email} | {personal.phone} | {personal.location}
          </Text>

          {/* ✅ FIX: Force label instead of URL */}
          {personal.linkedin && personal.linkedin.trim() !== "" && (
            <Link style={styles.contact} src={personal.linkedin}>
              LinkedIn
            </Link>
          )}
        </View>

        {/* EDUCATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EDUCATION</Text>

          {education.map((edu, i) => (
            <View key={i} style={{ marginBottom: 4 }}>
              
              <View style={styles.rowBetween}>
                <Text style={styles.company}>{edu.school}</Text>
                <Text>{edu.end}</Text>
              </View>

              {/* ✅ FIX: Reliable degree + field rendering */}
              <Text>
                {[edu.degree, edu.field]
                  .filter((item) => item && item.trim() !== "")
                  .join(", ")}
              </Text>

              {/* ✅ FIX: CGPA safe render */}
              {edu.gpa && edu.gpa.trim() !== "" && (
                <Text>CGPA: {edu.gpa}</Text>
              )}
            </View>
          ))}
        </View>

        {/* EXPERIENCE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WORK EXPERIENCE</Text>

          {experience.map((exp, i) => (
            <View key={i} style={{ marginBottom: 6 }}>

              <View style={styles.rowBetween}>
                <Text style={styles.company}>{exp.company}</Text>
                <Text>{exp.start} - {exp.end}</Text>
              </View>

              <Text style={styles.italic}>{exp.jobTitle}</Text>

              {exp.responsibilities
                ?.split("\n")
                .filter(Boolean)
                .map((line, idx) => (
                  <Text key={idx} style={styles.bullet}>
                    • {line}
                  </Text>
                ))}
            </View>
          ))}
        </View>

        {/* PROJECTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROJECTS</Text>

          {projects.map((proj, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={styles.company}>
                {proj.title}{" "}
                {proj.github && proj.github.trim() !== "" && (
                  <Link src={proj.github}> | GitHub</Link>
                )}
              </Text>

              <Text style={styles.italic}>
                Tech: {proj.techStack}
              </Text>

              {proj.description
                ?.split("\n")
                .filter(Boolean)
                .map((line, idx) => (
                  <Text key={idx} style={styles.bullet}>
                    • {line}
                  </Text>
                ))}
            </View>
          ))}
        </View>

        {/* SKILLS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SKILLS</Text>

          <Text style={styles.skillText}>
            Technical: {skills.technical.join(", ")}
          </Text>

          <Text style={styles.skillText}>
            Soft Skills: {skills.soft.join(", ")}
          </Text>
        </View>

      </Page>
    </Document>
  );
};

export default ResumePDF;