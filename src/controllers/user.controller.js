import Analysis from "../models/Analysis.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { deleteUserEmbeddings } from "../services/vectorStore.service.js";
import { deleteResumeFile } from "../services/storage.service.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      userId: user._id,
      email: user.email,
      name: user.name,
      plan: user.plan || "free",
    });
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteUserData = async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.userId })
      .select("filePath storageProvider s3Key")
      .lean();

    const deletedFiles = await Promise.all(
      analyses.map((analysis) =>
        deleteResumeFile({
          storageProvider: analysis.storageProvider,
          s3Key: analysis.s3Key,
          filePath: analysis.filePath,
        }).catch(() => false)
      )
    );

    const [analysisResult, chatResult, deletedEmbeddings] = await Promise.all([
      Analysis.deleteMany({ user: req.userId }),
      Chat.deleteMany({ user: req.userId }),
      deleteUserEmbeddings(req.userId).catch(() => 0),
    ]);

    return res.json({
      success: true,
      deleted: {
        analyses: analysisResult.deletedCount || 0,
        chats: chatResult.deletedCount || 0,
        embeddings: deletedEmbeddings,
        files: deletedFiles.filter(Boolean).length,
      },
    });
  } catch (error) {
    console.error("Delete user data error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not delete user data",
    });
  }
};
