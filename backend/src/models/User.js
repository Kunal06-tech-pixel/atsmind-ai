import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    plan: {
      type: String,
      enum: ["free", "pro", "team"],
      default: "free",
    },

    role: {
      type: String,
      enum: ["job_seeker", "recruiter", "admin"],
      default: "job_seeker",
      required: true,
      index: true,
    },

    companyProfile: {
      companyName: {
        type: String,
        default: "",
        trim: true,
      },
      designation: {
        type: String,
        default: "",
        trim: true,
      },
      companyWebsite: {
        type: String,
        default: "",
        trim: true,
      },
    },

    recruiterVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    stripeCustomerId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
