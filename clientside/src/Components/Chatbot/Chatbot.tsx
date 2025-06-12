import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Close } from "@mui/icons-material";
import "../../styles/styles.css";

interface ChatbotProps {
  open: boolean;
  onClose: () => void;
}

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function Chatbot({ open, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function addMessage(sender: Message["sender"], text: string) {
    setMessages((msgs) => [...msgs, { sender, text }]);
  }

  async function handleSend() {
    const question = input.trim();
    if (!question) return;
    addMessage("user", question);
    setInput("");
    addMessage("bot", "typing...");

    try {
      const { data } = await axios.post<{ response?: string; error?: string }>(
        "https://sales-chatbot-znkw.onrender.com/ask",
        new URLSearchParams({ question }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      setMessages((msgs) => msgs.filter((m) => m.text !== "...typing"));
      addMessage("bot", data.response || data.error || "");
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((msgs) => msgs.filter((m) => m.text !== "...typing"));
      addMessage("bot", "Error: Could not reach the server.");
    }
  }

  if (!open) return null;

  return (
    <div className="chatbotCardParent" onClick={onClose}>
      <div
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="chatbotCard"
      >
        <div className="chatbotHeading">
          <div className="chatbotTitle">CSV Analysis Chatbot</div>
          <button onClick={onClose} className="chatbotCloseButton">
            <Close />
          </button>
        </div>
        <div className="chatbotSeperation"></div>

        <div style={{ flex: 1, overflowY: "auto" as const, padding: 12 }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                textAlign: m.sender === "user" ? "right" : "left",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  fontFamily: "Arial, sans-serif",
                  borderRadius: 16,
                  background: m.sender === "user" ? "#e3f2fd" : "#f1f3f4",
                }}
              >
                {m.text}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div
          style={{
            display: "flex",
            padding: 12,
            borderTop: "1px solid #ddd",
            gap: 8,
          }}
        >
          <input
            className="chatbotInput"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInput(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent) =>
              e.key === "Enter" && handleSend()
            }
            placeholder="Ask something…"
          />
          <button onClick={handleSend} className="chatbotSendBtn">Send</button>
        </div>
      </div>
    </div>
  );
}
