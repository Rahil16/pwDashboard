import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Close, AttachFile } from "@mui/icons-material";
import "../../styles/styles.css";

interface ChatbotProps {
  open: boolean;
  onClose: () => void;
}

interface Message {
  sender: "user" | "bot";
  text: string;
}

interface ApiResponse {
  success?: string;
  error?: string;
  answer?: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function Chatbot({ open, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [waiting, setWaiting] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({ type: "", message: "" });
  const [csvUploaded, setCsvUploaded] = useState<boolean>(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function addMessage(sender: Message["sender"], text: string) {
    setMessages((msgs) => [...msgs, { sender, text }]);
  }

  function TypingIndicator() {
    return (
      <div className="typing-indicator">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    );
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setUploadStatus({
        type: "error",
        message: "Please select a CSV file",
      });
      return;
    }

    setUploading(true);
    setUploadStatus({ type: "", message: "Uploading..." });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post<ApiResponse>(
        "https://sales-chatbot-znkw.onrender.com/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.error) {
        setUploadStatus({
          type: "error",
          message: response.data.error,
        });
        setCsvUploaded(false);
      } else {
        setUploadStatus({
          type: "success",
          message: response.data.success || "File uploaded successfully!",
        });
        setCsvUploaded(true);
        addMessage(
          "bot",
          "CSV file uploaded successfully! You can now ask questions about your data."
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      const typedError = error as ApiError;
      setUploadStatus({
        type: "error",
        message:
          typedError.response?.data?.error ||
          "Upload failed. Please try again.",
      });
      setCsvUploaded(false);
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSend() {
    const question = input.trim();
    if (!question) return;

    if (!csvUploaded) {
      addMessage(
        "bot",
        "Please upload a CSV file first before asking questions."
      );
      return;
    }

    addMessage("user", question);
    setInput("");
    setWaiting(true);

    try {
      const { data } = await axios.post<{ answer?: string; error?: string }>(
        "https://sales-chatbot-znkw.onrender.com/ask",
        new URLSearchParams({ question }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      addMessage("bot", data.answer || data.error || "No response received");
    } catch (err) {
      console.error("Error sending message:", err);
      const typedError = err as ApiError;
      const errorMessage =
        typedError.response?.data?.error ||
        "Error: Could not reach the server.";
      addMessage("bot", errorMessage);
    } finally {
      setWaiting(false);
    }
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
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

        {/* Upload Section */}
        <div style={{ padding: 12, borderBottom: "1px solid #ddd" }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <button
              onClick={handleUploadClick}
              disabled={uploading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 12px",
                border: "1px solid #ddd",
                borderRadius: 16,
                background: uploading ? "#f5f5f5" : "white",
                cursor: uploading ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              {uploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <AttachFile style={{ fontSize: 16 }} />
                  Choose CSV File
                </>
              )}
            </button>
            {csvUploaded && (
              <span
                style={{
                  color: "#4caf50",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                ✓ CSV Ready
              </span>
            )}
          </div>

          {/* Only render the div if there's a message AND the type is NOT 'success' */}
          {uploadStatus.message && uploadStatus.type !== "success" && (
            <div
              style={{
                padding: "6px 8px",
                borderRadius: 4,
                fontSize: "12px",
                // The 'success' case is no longer needed here as the component won't render
                background:
                  uploadStatus.type === "error" ? "#ffeaea" : "#f5f5f5",
                color: uploadStatus.type === "error" ? "#d32f2f" : "#666",
                border: `1px solid ${
                  uploadStatus.type === "error" ? "#ffcdd2" : "#ddd"
                }`,
              }}
            >
              {uploadStatus.message}
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: "auto" as const, padding: 12 }}>
          {messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#666",
                fontSize: "14px",
                marginTop: 20,
              }}
            >
              {csvUploaded
                ? "Your CSV is ready! Ask me anything about your data."
                : "Upload a CSV file to start analyzing your data."}
            </div>
          )}

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
                  maxWidth: "80%",
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.text}
              </span>
            </div>
          ))}
          {waiting && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input Section */}
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
            placeholder={
              csvUploaded
                ? "Ask anything about your data..."
                : "Upload CSV first..."
            }
            disabled={!csvUploaded}
            style={{
              opacity: csvUploaded ? 1 : 0.6,
            }}
          />
          <button
            onClick={handleSend}
            className="chatbotSendBtn"
            disabled={!csvUploaded || waiting}
            style={{
              opacity: !csvUploaded || waiting ? 0.6 : 1,
              cursor: !csvUploaded || waiting ? "not-allowed" : "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
