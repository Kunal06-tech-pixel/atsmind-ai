import mongoose from "mongoose";

const cleanStringArray = (values) =>
  Array.isArray(values)
    ? values.map((value) => String(value || "").trim()).filter(Boolean)
    : [];

const jobOpeningSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    companyName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 160,
    },
    department: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: 160,
    },
    jobDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20000,
    },
    mandatorySkills: {
      type: [String],
      default: [],
      set: cleanStringArray,
    },
    preferredSkills: {
      type: [String],
      default: [],
      set: cleanStringArray,
    },
    minimumExperience: {
      type: Number,
      default: 0,
      min: 0,
      max: 60,
    },
    minimumQualification: {
      type: String,
      default: "",
      trim: true,
      maxlength: 240,
    },
    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft",
      index: true,
    },
  },
  { timestamps: true }
);

jobOpeningSchema.index({ recruiterId: 1, status: 1, updatedAt: -1 });
jobOpeningSchema.index({ recruiterId: 1, title: 1, createdAt: -1 });

const JobOpening = mongoose.model("JobOpening", jobOpeningSchema);

export default JobOpening;

