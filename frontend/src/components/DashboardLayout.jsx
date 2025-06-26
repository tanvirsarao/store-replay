"use client"

import { supabase } from "../supabaseClient"

export default function DashboardLayout({ children, hideNavigation = false }) {
  const handleLogout = async () => {
    try {
      console.log("Logout: Starting logout process")

      // Set logout flag to prevent any router redirects
      sessionStorage.setItem("logging-out", "true")

      // Clear all storage immediately
      localStorage.clear()

      // Sign out from Supabase (don't await to avoid delays)
      supabase.auth.signOut().catch(console.error)

      console.log("Logout: Redirecting to landing page")

      // Use href for full page navigation (bypasses React Router)
      window.location.href = "/"
    } catch (error) {
      console.error("Logout failed:", error)
      // Even if logout fails, clear local data and redirect
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = "/"
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(-45deg, #ecfdf5, #ffffff, #f0fdf4, #ffffff)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {!hideNavigation && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(16, 185, 129, 0.1)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "64px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img
                src="/storeReplay.png"
                alt="StoreReplay Logo"
                style={{
                  width: "32px",
                  height: "32px",
                  filter: "drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))",
                }}
              />
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  margin: 0,
                }}
              >
                StoreReplay
              </h1>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  fontStyle: "italic",
                }}
              >
                Every e-merchant deserves to understand their clients using AI
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 16px",
                  background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-1px)"
                  e.target.style.boxShadow = "0 4px 8px rgba(220, 38, 38, 0.3)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "none"
                }}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </main>

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
      `}</style>
    </div>
  )
}
