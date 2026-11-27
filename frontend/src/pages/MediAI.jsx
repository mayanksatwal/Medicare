import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { API_URL, getStoredUser, getToken } from "../utils/api.js";
import "./MediAI.css";

const QUICK_PROMPTS = [
  "Which specialist should I consult for recurring headaches?",
  "How do I prepare for a cardiology consultation?",
  "How can I reschedule my appointment on MediCare?",
  "What are general tips for staying hydrated and sleeping better?",
];

const MediAI = () => {
  const user = getStoredUser();
  const backPath =
    user?.role === "doctor" ? "/doctor-dashboard" : "/dashboard";

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e, overrideText = null) => {
    if (e) e.preventDefault();
    const raw = (overrideText ?? message).trim();
    if (!raw || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: raw }]);
    if (!overrideText) setMessage("");
    setLoading(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message:
            language === "hi" ? `Please reply in Hindi: ${raw}` : raw,
          language,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to get a response.");
      }

      const aiReply = data.reply || data.response || data.message;
      if (!aiReply) {
        throw new Error("The AI server returned an empty response.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiReply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, something went wrong: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medi-ai-page">
      <header className="medi-ai-header">
        <Link to="/" className="medi-ai-brand">
          <span>✚</span> MediCare
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            type="button"
            className="ai-lang-btn"
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          >
            {language === "en" ? "🌐 EN" : "🌐 HI"}
          </button>
          <Link to={backPath} className="back-dashboard">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="medi-ai-container">
        <div className="medi-ai-heading">
          <div className="ai-logo">✦</div>
          <span className="ai-label">MEDICARE INTELLIGENCE</span>
          <h1>Meet MediAI</h1>
          <p>
            Your healthcare assistant. Ask general health questions, explore
            specialties, or get help navigating MediCare.
          </p>
        </div>

        <section className="ai-chat-card">
          <div className="chat-header">
            <div className="chat-avatar">✦</div>
            <div style={{ flex: 1 }}>
              <h3>MediAI Assistant</h3>
              <span>
                <em className="ai-live-dot" /> Online · General Health Guidance
              </span>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                className="ai-clear-btn"
                onClick={() => setMessages([])}
              >
                Clear chat
              </button>
            )}
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <div>👋</div>
                <h2>Hello{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! How can I help?</h2>
                <p>
                  Choose a topic below or type your own general health question.
                </p>
                <div className="ai-prompt-chips">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      type="button"
                      key={prompt}
                      onClick={() => sendMessage(null, prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`chat-message ${item.role}`}
              >
                <span>{item.role === "user" ? "You" : "MediAI"}</span>
                <p>{item.content}</p>
              </motion.div>
            ))}

            {loading && (
              <div className="ai-thinking">MediAI is thinking...</div>
            )}
          </div>

          <form className="chat-input-area" onSubmit={sendMessage}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                language === "hi"
                  ? "MediAI से अपना सवाल पूछें..."
                  : "Ask MediAI a question..."
              }
              disabled={loading}
            />
            <button type="submit" disabled={loading || !message.trim()}>
              Send ➤
            </button>
          </form>

          <p className="ai-disclaimer">
            MediAI provides general information, not a medical diagnosis. For
            emergencies, call 112 or visit the nearest emergency department.
          </p>
        </section>
      </main>
    </div>
  );
};

export default MediAI;
