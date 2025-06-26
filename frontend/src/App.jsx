"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"
import Landing from "./pages/Landing"
import Auth from "./pages/Auth"
import VerifyEmail from "./pages/VerifyEmail"
import Dashboard from "./pages/Dashboard"

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dashboardId, setDashboardId] = useState(null)

  useEffect(() => {
    // Check if we're in the middle of logging out
    const isLoggingOut = sessionStorage.getItem("logging-out")
    if (isLoggingOut) {
      console.log("App: Logout in progress, skipping auth check")
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("App: Initial session check", session ? "found" : "not found")
      setSession(session)

      if (session) {
        handleSessionFound(session)
      }

      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Skip auth state changes during logout
      const isLoggingOut = sessionStorage.getItem("logging-out")
      if (isLoggingOut) {
        console.log("App: Skipping auth state change during logout")
        return
      }

      console.log("App: Auth state changed", _event, session ? "session exists" : "no session")

      if (_event === "SIGNED_OUT" || !session) {
        // Clear everything on sign out
        console.log("App: User signed out, clearing state")
        setSession(null)
        setDashboardId(null)
        localStorage.removeItem("dashboard_mapping")
      } else if (session && _event === "SIGNED_IN") {
        setSession(session)
        handleSessionFound(session)
      } else if (session) {
        // Handle existing session
        setSession(session)
        if (!dashboardId) {
          handleSessionFound(session)
        }
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSessionFound = async (session) => {
    try {
      console.log("App: Handling session found for user:", session.user.id)

      // Check for existing mapping
      const existingMapping = localStorage.getItem("dashboard_mapping")

      if (existingMapping) {
        try {
          const mapping = JSON.parse(existingMapping)

          // Validate mapping
          if (
            mapping.userId === session.user.id &&
            mapping.dashboardId &&
            mapping.actualStoreId &&
            mapping.timestamp &&
            Date.now() - mapping.timestamp < 24 * 60 * 60 * 1000
          ) {
            console.log("App: Valid existing mapping found")
            setDashboardId(mapping.dashboardId)
            return
          } else {
            console.log("App: Invalid mapping, clearing")
            localStorage.removeItem("dashboard_mapping")
          }
        } catch (error) {
          console.error("App: Error parsing mapping:", error)
          localStorage.removeItem("dashboard_mapping")
        }
      }

      // Create new mapping
      console.log("App: Creating new mapping")
      const { data: userData, error: fetchErr } = await supabase
        .from("users")
        .select("store_id")
        .eq("email", session.user.email)
        .single()

      const actualStoreId = !fetchErr && userData?.store_id ? userData.store_id : session.user.id
      const secureDashboardId =
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      const newMapping = {
        dashboardId: secureDashboardId,
        actualStoreId: actualStoreId,
        userId: session.user.id,
        email: session.user.email,
        timestamp: Date.now(),
      }

      localStorage.setItem("dashboard_mapping", JSON.stringify(newMapping))
      setDashboardId(secureDashboardId)
      console.log("App: New mapping created with ID:", secureDashboardId)
    } catch (error) {
      console.error("App: Error handling session:", error)
    }
  }

  // Show loading only if not logging out
  if (loading && !sessionStorage.getItem("logging-out")) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(-45deg, #ecfdf5, #ffffff, #f0fdf4, #ffffff)",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e5e7eb",
            borderTop: "4px solid #059669",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/auth"
          element={session && dashboardId ? <Navigate to={`/dashboard/${dashboardId}`} replace /> : <Auth />}
        />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route
          path="/dashboard/:id"
          element={session && dashboardId ? <Dashboard /> : <Navigate to="/auth" replace />}
        />
      </Routes>
    </Router>
  )
}

export default App
