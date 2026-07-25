import { useState } from "react";
import { MessageCircle } from "lucide-react";
import ResumeChat from "./ResumeChat";
import "./ResumeChat.css";

const FloatingChatButton = ({ analysisId, fileName }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (!analysisId) return null;

  return (
    <>
      <button
        className="floating-chat-btn"
        onClick={() => setIsChatOpen(true)}
        title="Chat about your resume"
        aria-label="Chat about your resume"
      >
        <MessageCircle size={22} />
      </button>

      <ResumeChat
        analysisId={analysisId}
        fileName={fileName}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
};

export default FloatingChatButton;
