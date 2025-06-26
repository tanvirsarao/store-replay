"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import DashboardLayout from "../components/DashboardLayout"
import SetupPage from "../components/SetupPage"
import MetricsPage from "../components/MetricsPage"

export default function Dashboard() {
  const { id: dashboardId } = useParams()
  const [currentView, setCurrentView] = useState("setup")
  const [storeData, setStoreData] = useState(null)
  const [trackingEnabled, setTrackingEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [isSessionViewerOpen, setIsSessionViewerOpen] = useState(false)

  useEffect(() => {
    fetchStoreData()
  }, [dashboardId])

  const fetchStoreData = async () => {
    try {
      setLoading(true)
      console.log("Dashboard: Fetching store data for dashboard ID:", dashboardId)

      // Get the real store ID from mapping
      const dashboardMapping = localStorage.getItem("dashboard_mapping")
      if (!dashboardMapping) {
        console.error("Dashboard: No mapping found")
        return
      }

      const mapping = JSON.parse(dashboardMapping)
      if (mapping.dashboardId !== dashboardId) {
        console.error("Dashboard: Dashboard ID mismatch")
        return
      }

      // Use the actual store ID for API calls, but keep the secure ID in URL
      const mockStoreData = {
        storeId: mapping.actualStoreId, // This is the real store ID for API calls
        storeName: "Demo Store",
        trackingEnabled: true,
      }
      setStoreData(mockStoreData)
      setTrackingEnabled(mockStoreData.trackingEnabled)
    } catch (error) {
      console.error("Error fetching store data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTracking = (newValue) => {
    setTrackingEnabled(newValue)
    if (storeData) {
      setStoreData({
        ...storeData,
        trackingEnabled: newValue,
      })
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
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

  return (
    <DashboardLayout hideNavigation={isSessionViewerOpen}>
      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "32px",
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          borderRadius: "12px",
          padding: "8px",
          border: "1px solid rgba(16, 185, 129, 0.1)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        <button
          onClick={() => setCurrentView("setup")}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
            background: currentView === "setup" ? "linear-gradient(135deg, #059669 0%, #10b981 100%)" : "transparent",
            color: currentView === "setup" ? "white" : "#6b7280",
          }}
        >
          🔧 Setup & Configuration
        </button>
        <button
          onClick={() => setCurrentView("metrics")}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
            background: currentView === "metrics" ? "linear-gradient(135deg, #059669 0%, #10b981 100%)" : "transparent",
            color: currentView === "metrics" ? "white" : "#6b7280",
          }}
        >
          📊 Analytics & Insights
        </button>
      </div>

      {/* Content */}
      {currentView === "metrics" ? (
        <MetricsPage storeId={storeData?.storeId} onSessionViewerToggle={setIsSessionViewerOpen} />
      ) : (
        <SetupPage storeData={storeData} trackingEnabled={trackingEnabled} onToggleTracking={handleToggleTracking} />
      )}
    </DashboardLayout>
  )
}
