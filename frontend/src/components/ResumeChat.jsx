import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles, User, X } from "lucide-react";
import axios from "../services/axios";
import MarkdownMessage from "./MarkdownMessage";
import { useToast } from "./ui/useToast";
import "./ResumeChat.css";

const suggestedQuestions = [
  "How can I improve my ATS score?",
  "What are my resume's main weaknesses?",
  "Which skills should I add?",
  "How does my experience match the job?",
  "What makes my resume strong?",
];

const ResumeChat = ({ analysisId, fileName, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = useCallback(async () => {
    try {
      const response = await axios.get(`/api/chat/${analysisId}/history`);
      if (response.data.success && response.data.chat) {
        setMessages(response.data.chat.messages);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      toast.error("Failed to load chat history.");
    }
  }, [analysisId, toast]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (analysisId && isOpen) {
      loadChatHistory();
    }
  }, [analysisId, isOpen, loadChatHistory]);

  const sendMessage = async (event) => {
    event.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setMessages((current) => [...current, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`/api/chat/${analysisId}/message`, {
        message: userMessage,
      });

      if (response.data.success) {
        setMessages((current) => [...current, response.data.message]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message.");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
  };

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        className="chat-backdrop"
        onClick={onClose}
        aria-label="Close resume chat"
      />

      <div className="chat-popup">
        <div className="resume-chat">
          <div className="chat-header">
            <div className="chat-title-wrap">
              <div className="chat-header-icon">
                <Sparkles size={17} />
              </div>
              <div className="min-w-0">
                <h3>Resume advisor</h3>
                <p className="chat-subtitle">{fileName}</p>
              </div>
            </div>
            <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">
              <X size={17} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="chat-welcome-icon">
                  <Bot size={22} />
                </div>
                <h4>Ask about this analysis</h4>
                <p>
                  Get focused guidance on your ATS score, missing skills, and
                  resume improvements.
                </p>

                <div className="suggested-questions">
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      className="suggested-question"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`message ${
                      message.role === "user" ? "user-message" : "assistant-message"
                    }`}
                  >
                    <div className="message-avatar">
                      {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className="message-content">
                      <div className="message-text">
                        {message.role === "assistant" ? (
                          <MarkdownMessage content={message.content} />
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message assistant-message">
                    <div className="message-avatar">
                      <Bot size={16} />
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <Loader2 size={16} className="animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={sendMessage}>
            <input
              type="text"
              className="chat-input"
              placeholder="Ask about your resume..."
              value={inputMessage}
              onChange={(event) => setInputMessage(event.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputMessage.trim() || isLoading}
              aria-label="Send message"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResumeChat;
