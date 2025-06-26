"use client"

import { useState } from "react"
import { supabase } from "../supabaseClient"

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  /* ------------------------------------------------------------------ */
  /*  Sign-in / Sign-up handler                                         */
  /* ------------------------------------------------------------------ */
  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      if (isSignUp) {
        /* ---------- CREATE ACCOUNT ---------- */
        if (password !== confirmPassword) {
          setMessage("Passwords do not match")
          return
        }
        if (password.length < 6) {
          setMessage("Password must be at least 6 characters long")
          return
        }

        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        setMessage("Check your email for verification link!")
        localStorage.setItem("pendingEmail", email)
        window.location.href = "/verify"
      } else {
        /* ---------- SIGN IN ---------- */
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        // Don't handle navigation here - let App.jsx handle it via auth state change
        console.log("AuthForm: Sign in successful, letting App.jsx handle navigation")
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Forgot-password handler                                           */
  /* ------------------------------------------------------------------ */
  const handleForgotPassword = async () => {
    if (!email) return setMessage("Please enter your email address first")

    setLoading(true)
    setMessage("")
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      setMessage("Password reset email sent!")
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Helper for switching tabs                                         */
  /* ------------------------------------------------------------------ */
  const handleTabSwitch = (signUp) => {
    setIsSignUp(signUp)
    setMessage("")
    setPassword("")
    setConfirmPassword("")
  }

  /* ------------------------------------------------------------------ */
  /*  JSX                                                               */
  /* ------------------------------------------------------------------ */
  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#111827",
            margin: "0 0 24px 0",
          }}
        >
          {isSignUp ? "Join Our Mission" : "Welcome back"}
        </h2>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e5e7eb",
            marginBottom: 24,
          }}
        >
          <button
            type="button"
            onClick={() => handleTabSwitch(false)}
            style={{
              flex: 1,
              padding: "12px 0",
              background: "none",
              border: "none",
              fontSize: 16,
              fontWeight: 500,
              color: !isSignUp ? "#059669" : "#6b7280",
              cursor: "pointer",
              borderBottom: !isSignUp ? "2px solid #059669" : "2px solid transparent",
              transition: "all 0.2s ease",
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch(true)}
            style={{
              flex: 1,
              padding: "12px 0",
              background: "none",
              border: "none",
              fontSize: 16,
              fontWeight: 500,
              color: isSignUp ? "#059669" : "#6b7280",
              cursor: "pointer",
              borderBottom: isSignUp ? "2px solid #059669" : "2px solid transparent",
              transition: "all 0.2s ease",
            }}
          >
            Sign up
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleAuth} style={{ width: "100%" }}>
        {/* Email */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 500,
              color: "#374151",
              marginBottom: 6,
            }}
          >
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            style={inputStyle}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 500,
              color: "#374151",
              marginBottom: 6,
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            required
            style={inputStyle}
          />
        </div>

        {/* Confirm Password (sign-up only) */}
        {isSignUp && (
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••"
              required
              style={{
                ...inputStyle,
                border:
                  confirmPassword && password !== confirmPassword
                    ? "1px solid #ef4444"
                    : confirmPassword && password === confirmPassword
                      ? "1px solid #059669"
                      : "1px solid #d1d5db",
              }}
            />
            {confirmPassword && (
              <div
                style={{
                  fontSize: 12,
                  marginTop: 4,
                  color: password === confirmPassword ? "#059669" : "#ef4444",
                }}
              >
                {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
              </div>
            )}
          </div>
        )}

        {/* Forgot password link */}
        {!isSignUp && (
          <div style={{ textAlign: "right", marginBottom: 24 }}>
            <button type="button" onClick={handleForgotPassword} disabled={loading} style={forgotLinkStyle}>
              Forgot password?
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || (isSignUp && password !== confirmPassword)}
          style={{
            width: "100%",
            padding: "12px 16px",
            background:
              loading || (isSignUp && password !== confirmPassword)
                ? "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)"
                : "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: loading || (isSignUp && password !== confirmPassword) ? "not-allowed" : "pointer",
            transition: "transform 0.1s ease, box-shadow 0.1s ease",
            marginBottom: 16,
          }}
        >
          {loading ? "Loading..." : isSignUp ? "Sign up" : "Sign in"}
        </button>

        {/* Message */}
        {message && (
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              fontSize: 14,
              textAlign: "center",
              background:
                message.includes("Check your email") || message.includes("reset email sent")
                  ? "rgba(5, 150, 105, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
              color:
                message.includes("Check your email") || message.includes("reset email sent") ? "#059669" : "#dc2626",
              border:
                message.includes("Check your email") || message.includes("reset email sent")
                  ? "1px solid rgba(5, 150, 105, 0.2)"
                  : "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Re-usable inline-style objects                                    */
/* ------------------------------------------------------------------ */
const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 16,
  backgroundColor: "#f9fafb",
  transition: "all 0.2s ease",
  outline: "none",
  boxSizing: "border-box",
}

const forgotLinkStyle = {
  background: "none",
  border: "none",
  color: "#059669",
  fontSize: 14,
  cursor: "pointer",
  textDecoration: "none",
  padding: 0,
}
