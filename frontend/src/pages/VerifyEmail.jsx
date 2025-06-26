"use client"

import { useState } from "react"
import { supabase } from "../supabaseClient"

export default function VerifyEmail() {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      // Get email from URL params or localStorage
      const urlParams = new URLSearchParams(window.location.search)
      const email = urlParams.get("email") || localStorage.getItem("pendingEmail")

      if (email) {
        const { error } = await supabase.auth.resend({
          type: "signup",
          email: email,
        })

        if (error) {
          setResendMessage("Error resending email. Please try again.")
        } else {
          setResendMessage("Verification email sent! Check your inbox.")
        }
      } else {
        setResendMessage("Email not found. Please sign up again.")
      }
    } catch (error) {
      setResendMessage("Error resending email. Please try again." + error.message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(-45deg, #ecfdf5, #ffffff, #f0fdf4, #ffffff)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Floating Particles Background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: Math.random() * 6 + 2 + "px",
              height: Math.random() * 6 + 2 + "px",
              background: `rgba(16, 185, 129, ${Math.random() * 0.3 + 0.1})`,
              borderRadius: "50%",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: Math.random() * 5 + "s",
            }}
          />
        ))}
      </div>

      <div
        style={{
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "48px",
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
          border: "1px solid rgba(16, 185, 129, 0.1)",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "800",
            background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "8px",
          }}
        >
          StoreReplay
        </h1>

        <p
          style={{
            color: "#059669",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "32px",
          }}
        >
          Almost there!
        </p>

        {/* Email Icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "32px",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          📧
        </div>

        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "16px",
          }}
        >
          Check your inbox
        </h2>

        <p
          style={{
            color: "#6b7280",
            fontSize: "16px",
            lineHeight: "1.6",
            marginBottom: "8px",
          }}
        >
          We've sent you a verification email. Click the{" "}
          <span style={{ color: "#059669", fontWeight: "600" }}>link in the email</span> to activate your account.
        </p>

        <p
          style={{
            color: "#9ca3af",
            fontSize: "14px",
            marginBottom: "32px",
          }}
        >
          Didn't receive the email? Check your spam folder or resend it.
        </p>

        {/* Resend Button */}
        <button
          onClick={handleResendEmail}
          disabled={isResending}
          style={{
            background: isResending
              ? "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)"
              : "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: isResending ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            margin: "0 auto 16px",
          }}
          onMouseEnter={(e) => {
            if (!isResending) {
              e.target.style.transform = "translateY(-2px)"
              e.target.style.boxShadow = "0 10px 20px rgba(5, 150, 105, 0.3)"
            }
          }}
          onMouseLeave={(e) => {
            if (!isResending) {
              e.target.style.transform = "translateY(0)"
              e.target.style.boxShadow = "none"
            }
          }}
        >
          {isResending && (
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                borderTop: "2px solid white",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          )}
          {isResending ? "Sending..." : "Resend verification email"}
        </button>

        {/* Resend Message */}
        {resendMessage && (
          <p
            style={{
              color: resendMessage.includes("Error") ? "#dc2626" : "#059669",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "24px",
            }}
          >
            {resendMessage}
          </p>
        )}

        {/* Back to Sign In */}
        <button
          onClick={() => (window.location.href = "/auth")}
          style={{
            background: "none",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "14px",
            color: "#6b7280",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = "#059669"
            e.target.style.color = "#059669"
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = "#d1d5db"
            e.target.style.color = "#6b7280"
          }}
        >
          ← Back to Sign In
        </button>

        {/* Bottom tagline */}
        <p
          style={{
            color: "#9ca3af",
            fontSize: "12px",
            fontStyle: "italic",
            marginTop: "32px",
          }}
        >
          Every e-merchant deserves to understand their clients using AI
        </p>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
