"use client"

import { useState } from "react"

export default function SetupPage({ storeData, trackingEnabled, onToggleTracking }) {
  const [isStoreIdVisible, setIsStoreIdVisible] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(storeData?.storeId || "")
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Tracking Status */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
          border: "1px solid rgba(16, 185, 129, 0.1)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", margin: "0 0 4px 0" }}>
              Session Tracking
            </h3>
            <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
              {trackingEnabled ? "Currently recording user sessions" : "Session recording is paused"}
            </p>
          </div>
          <button
            onClick={() => onToggleTracking(!trackingEnabled)}
            style={{
              position: "relative",
              width: "48px",
              height: "24px",
              background: trackingEnabled ? "#059669" : "#d1d5db",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "2px",
                left: trackingEnabled ? "26px" : "2px",
                width: "20px",
                height: "20px",
                background: "white",
                borderRadius: "50%",
                transition: "left 0.2s ease",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            />
          </button>
        </div>
      </div>

      {/* Connection String */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
          border: "1px solid rgba(16, 185, 129, 0.1)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", margin: "0 0 16px 0" }}>
          Store Connection String
        </h3>
        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "16px" }}>
          Use this ID to connect your Shopify store to StoreReplay tracking.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            background: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <code
            style={{
              flex: 1,
              fontSize: "14px",
              fontFamily: "Monaco, Consolas, monospace",
              color: "#111827",
            }}
          >
            {isStoreIdVisible ? storeData?.storeId : "••••••••••••••••"}
          </code>

          <button
            onClick={() => setIsStoreIdVisible(!isStoreIdVisible)}
            style={{
              padding: "6px 12px",
              background: "none",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#f3f4f6"
              e.target.style.borderColor = "#9ca3af"
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "none"
              e.target.style.borderColor = "#d1d5db"
            }}
          >
            {isStoreIdVisible ? "Hide" : "Show"}
          </button>

          <button
            onClick={handleCopyToClipboard}
            style={{
              padding: "6px 12px",
              background: copySuccess ? "#059669" : "none",
              border: `1px solid ${copySuccess ? "#059669" : "#d1d5db"}`,
              borderRadius: "6px",
              fontSize: "12px",
              color: copySuccess ? "white" : "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {copySuccess ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Shopify Integration Instructions */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "32px",
          border: "1px solid rgba(16, 185, 129, 0.1)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", margin: "0 0 16px 0" }}>
          🛍️ Shopify Integration Guide
        </h3>

        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#059669", margin: "0 0 8px 0" }}>
            ✅ Step 1: Go to Your Shopify Theme Code
          </h4>
          <ul style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6", margin: 0, paddingLeft: "20px" }}>
            <li>Log in to your Shopify Admin</li>
            <li>
              Navigate to <strong>Online Store → Themes → Edit Code</strong>
            </li>
            <li>
              Open the file{" "}
              <code style={{ background: "#f3f4f6", padding: "2px 4px", borderRadius: "3px" }}>theme.liquid</code> under
              the Layout folder
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#059669", margin: "0 0 8px 0" }}>
            ✅ Step 2: Paste This Just Before &lt;/body&gt;
          </h4>
          <div
            style={{
              background: "#1f2937",
              borderRadius: "8px",
              padding: "16px",
              fontFamily: "Monaco, Consolas, monospace",
              fontSize: "13px",
              color: "#e5e7eb",
              overflow: "auto",
            }}
          >
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
              
              
              {`      <script src="https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js" onload="
    window.storeReplayConfig = {
      storeId: 'your-store-id',     <--- Replace with your actual store ID
      apiBase: 'https://api.storereplay.com'
    };
    var s = document.createElement('script');
    s.src = 'https://api.storereplay.com/script.js';
    s.defer = true;
    document.body.appendChild(s);
  "></script>`}



</pre>
          </div>
        </div>

        <div
          style={{
            padding: "12px",
            background: "rgba(16, 185, 129, 0.05)",
            borderRadius: "6px",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          <p style={{ color: "#059669", fontSize: "13px", margin: 0 }}>
            💡 <strong>Pro Tip:</strong> After adding the code, save your theme and the tracking will start
            automatically!
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          padding: "32px",
          border: "1px solid rgba(16, 185, 129, 0.1)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 24px 0" }}>
          How StoreReplay Works
        </h3>

        <div style={{ display: "grid", gap: "24px" }}>
          {[
            {
              step: "1",
              title: "Add Tracking Code",
              description:
                "Copy your store ID and add our lightweight tracking script to your Shopify theme. Just one line of code!",
            },
            {
              step: "2",
              title: "Automatic Recording",
              description:
                "StoreReplay automatically captures every user interaction - clicks, scrolls, hovers, and keystrokes.",
            },
            {
              step: "3",
              title: "AI Analysis",
              description:
                "Our AI analyzes user behavior patterns and identifies optimization opportunities in real-time.",
            },
            {
              step: "4",
              title: "Actionable Insights",
              description: "View detailed analytics and AI-powered insights to improve your store's conversion rate.",
            },
          ].map((item, index) => (
            <div key={index} style={{ display: "flex", gap: "16px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  flexShrink: 0,
                }}
              >
                {item.step}
              </div>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: "0 0 4px 0" }}>
                  {item.title}
                </h4>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: 0, lineHeight: "1.5" }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "rgba(16, 185, 129, 0.05)",
            borderRadius: "8px",
            border: "1px solid rgba(16, 185, 129, 0.1)",
          }}
        >
          <p
            style={{
              color: "#059669",
              fontSize: "14px",
              margin: 0,
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            💡 Every e-merchant deserves to understand their clients using AI
          </p>
        </div>
      </div>
    </div>
  )
}
