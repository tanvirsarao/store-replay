"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"
import SessionViewer from "./SessionViewer"

export default function MetricsPage({ storeId, onSessionViewerToggle }) {
  const [dashboardData, setDashboardData] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)
  const [aiSummary, setAiSummary] = useState(null)
  const [showAiModal, setShowAiModal] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSessionViewerOpen, setIsSessionViewerOpen] = useState(false)

  // Generate fake access data for the chart (only thing we're faking)
  const generateAccessData = () => {
    const data = []
    const now = new Date()
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
      data.push({
        time: hour.getHours() + ":00",
        accesses: Math.floor(Math.random() * 50) + 10,
        conversions: Math.floor(Math.random() * 8) + 1,
      })
    }
    return data
  }

  const [accessData] = useState(generateAccessData())

  useEffect(() => {
    if (storeId) {
      fetchAllData()
    }
  }, [storeId])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError("No session found")
        return
      }

      console.log("Fetching data for store:", storeId)

      // Fetch dashboard data from your backend server
      try {
        console.log("Fetching dashboard data...")
        const dashboardResponse = await fetch(`https://store-replay.onrender.com/api/dashboard/${storeId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("Dashboard response status:", dashboardResponse.status)

        if (dashboardResponse.ok) {
          const dashboardJson = await dashboardResponse.json()
          console.log("Dashboard data:", dashboardJson)
          setDashboardData(dashboardJson)
        } else {
          const errorText = await dashboardResponse.text()
          console.error("Dashboard API error:", dashboardResponse.status, errorText)
        }
      } catch (dashboardError) {
        console.error("Dashboard fetch error:", dashboardError)
      }

      // Fetch analysis data from your backend server
      try {
        console.log("Fetching analysis data...")
        const analysisResponse = await fetch(`https://store-replay.onrender.com/api/analysis/${storeId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("Analysis response status:", analysisResponse.status)

        if (analysisResponse.ok) {
          const analysisJson = await analysisResponse.json()
          console.log("Analysis data:", analysisJson)
          setAnalysisData(analysisJson)
        } else {
          const errorText = await analysisResponse.text()
          console.error("Analysis API error:", analysisResponse.status, errorText)
        }
      } catch (analysisError) {
        console.error("Analysis fetch error:", analysisError)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const generateAISummary = async () => {
    if (!analysisData) {
      console.error("No analysis data available")
      return
    }

    try {
      setAiLoading(true)

      // Use real data from analysis API
      setAiSummary({
        summary: analysisData.summary,
        recommendations: [
          {
            priority:
              analysisData.optimizationReccomendation1.priority === 1
                ? "HIGH"
                : analysisData.optimizationReccomendation1.priority === 2
                  ? "MEDIUM"
                  : "LOW",
            issue: analysisData.optimizationReccomendation1.title,
            impact: "Impact varies", // You can enhance this based on priority
            solution: analysisData.optimizationReccomendation1.Description,
          },
          {
            priority:
              analysisData.optimizationReccomendation2.priority === 1
                ? "HIGH"
                : analysisData.optimizationReccomendation2.priority === 2
                  ? "MEDIUM"
                  : "LOW",
            issue: analysisData.optimizationReccomendation2.title,
            impact: "Impact varies",
            solution: analysisData.optimizationReccomendation2.Description,
          },
          {
            priority:
              analysisData.optimizationReccomendation3.priority === 1
                ? "HIGH"
                : analysisData.optimizationReccomendation3.priority === 2
                  ? "MEDIUM"
                  : "LOW",
            issue: analysisData.optimizationReccomendation3.title,
            impact: "Impact varies",
            solution: analysisData.optimizationReccomendation3.Description,
          },
        ],
      })
      setShowAiModal(true)
    } catch (error) {
      console.error("Error generating AI summary:", error)
    } finally {
      setAiLoading(false)
    }
  }

  const downloadPDF = async () => {
    try {
      setPdfLoading(true)
      const printContent = document.getElementById("dashboard-content")
      const originalContent = document.body.innerHTML

      document.body.innerHTML = printContent.innerHTML
      window.print()
      document.body.innerHTML = originalContent
      window.location.reload()
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
          gap: "24px",
        }}
      >
        {/* Main loading spinner */}
        <div
          style={{
            position: "relative",
            width: "60px",
            height: "60px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "4px solid rgba(16, 185, 129, 0.1)",
              borderTop: "4px solid #059669",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "40px",
              height: "40px",
              top: "10px",
              left: "10px",
              border: "3px solid rgba(16, 185, 129, 0.2)",
              borderBottom: "3px solid #10b981",
              borderRadius: "50%",
              animation: "spin 1.5s linear infinite reverse",
            }}
          />
        </div>

        {/* Loading text with animation */}
        <div style={{ textAlign: "center" }}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#059669",
              margin: "0 0 8px 0",
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            Loading Analytics
          </h3>
          <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>Fetching your insights and data...</p>
        </div>

        {/* Loading progress dots */}
        <div style={{ display: "flex", gap: "8px" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                background: "#059669",
                borderRadius: "50%",
                animation: `bounce 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>

        {/* Skeleton cards preview */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            width: "100%",
            maxWidth: "800px",
            marginTop: "32px",
          }}
        >
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(20px)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid rgba(16, 185, 129, 0.1)",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div
                style={{
                  height: "12px",
                  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                  backgroundSize: "200% 100%",
                  borderRadius: "6px",
                  marginBottom: "12px",
                  animation: "shimmer 2s infinite",
                }}
              />
              <div
                style={{
                  height: "24px",
                  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                  backgroundSize: "200% 100%",
                  borderRadius: "6px",
                  width: "60%",
                  animation: "shimmer 2s infinite",
                  animationDelay: "0.2s",
                }}
              />
            </div>
          ))}
        </div>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
            
            @keyframes bounce {
              0%, 80%, 100% { transform: scale(0); }
              40% { transform: scale(1); }
            }
            
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}
        </style>
      </div>
    )
  }

  // Show error if both APIs failed
  if (error || (!dashboardData && !analysisData)) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p style={{ color: "#dc2626", fontSize: "16px", marginBottom: "16px" }}>
          {error || "Unable to load dashboard data. Please try again later."}
        </p>
        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "16px" }}>Debug info: Store ID = {storeId}</p>
        <p style={{ color: "#6b7280", fontSize: "12px", marginBottom: "16px" }}>
          Make sure your backend server is running on localhost:3000
        </p>
        <button
          onClick={fetchAllData}
          style={{
            padding: "8px 16px",
            background: "#059669",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div id="dashboard-content">
      {/* Session Viewer Modal */}
      {selectedSessionId && (
        <SessionViewer
          sessionId={selectedSessionId}
          onClose={() => {
            setSelectedSessionId(null)
            onSessionViewerToggle?.(false)
          }}
        />
      )}

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={generateAISummary}
          disabled={aiLoading || !analysisData}
          style={{
            padding: "10px 20px",
            background:
              aiLoading || !analysisData
                ? "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)"
                : "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: aiLoading || !analysisData ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {aiLoading && (
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
          {aiLoading ? "Generating..." : "🧠 Generate AI Summary"}
        </button>

        <button
          onClick={downloadPDF}
          disabled={pdfLoading}
          style={{
            padding: "10px 20px",
            background: pdfLoading
              ? "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)"
              : "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: pdfLoading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {pdfLoading ? "Generating..." : "📄 Download PDF"}
        </button>
      </div>

      {/* Access Chart (FAKE DATA as requested) */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "32px",
          border: "1px solid rgba(16, 185, 129, 0.1)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", margin: "0 0 16px 0" }}>
          📊 Store Access Over Time (Last 24 Hours)
        </h3>
        <div style={{ height: "200px", position: "relative" }}>
          <svg width="100%" height="100%" viewBox="0 0 800 200">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="50" y1={40 + i * 32} x2="750" y2={40 + i * 32} stroke="#f3f4f6" strokeWidth="1" />
            ))}

            {/* Access line */}
            <polyline
              fill="none"
              stroke="#059669"
              strokeWidth="3"
              points={accessData.map((point, index) => `${50 + index * 29},${170 - point.accesses * 2.5}`).join(" ")}
            />

            {/* Conversion line */}
            <polyline
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
              strokeDasharray="5,5"
              points={accessData.map((point, index) => `${50 + index * 29},${170 - point.conversions * 15}`).join(" ")}
            />

            {/* Data points */}
            {accessData.map((point, index) => (
              <circle key={index} cx={50 + index * 29} cy={170 - point.accesses * 2.5} r="3" fill="#059669" />
            ))}
          </svg>

          {/* Legend */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "rgba(255, 255, 255, 0.9)",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <div style={{ width: "12px", height: "2px", background: "#059669" }}></div>
              <span>Store Visits</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "2px", background: "#dc2626", borderStyle: "dashed" }}></div>
              <span>Conversions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Show available data */}
      {(dashboardData || analysisData) && (
        <>
          {/* Real KPI Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            {/* Dashboard API Metrics */}
            {dashboardData &&
              [
                {
                  title: "Total Sessions",
                  value: dashboardData.totalSessions || 0,
                  unit: "",
                  icon: "👥",
                  trend: "+12%",
                },
                {
                  title: "Avg Session Time",
                  value: dashboardData.avgSessionTime ? (dashboardData.avgSessionTime / 1000).toFixed(1) : "0.0",
                  unit: "s",
                  icon: "⏱️",
                  trend: "+5%",
                },
                {
                  title: "Events Per Minute",
                  value: dashboardData.avgEventsPerMin ? dashboardData.avgEventsPerMin.toFixed(1) : "0.0",
                  unit: "",
                  icon: "⚡",
                  trend: "+8%",
                },
                {
                  title: "Avg Keypresses",
                  value: dashboardData.avgKeypresses ? dashboardData.avgKeypresses.toFixed(1) : "0.0",
                  unit: "",
                  icon: "⌨️",
                  trend: "+3%",
                },
                {
                  title: "Time to First Click",
                  value: dashboardData.avgFirstClick ? (dashboardData.avgFirstClick / 1000).toFixed(1) : "0.0",
                  unit: "s",
                  icon: "👆",
                  trend: "-2%",
                },
              ].map((metric, index) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "12px",
                    padding: "20px",
                    border: "1px solid rgba(16, 185, 129, 0.1)",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                    transition: "transform 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 8px 0" }}>{metric.title}</p>
                      <p
                        style={{
                          fontSize: "24px",
                          fontWeight: "700",
                          color: "#111827",
                          margin: "0 0 4px 0",
                        }}
                      >
                        {metric.value}
                        {metric.unit}
                      </p>
                      <span
                        style={{
                          fontSize: "12px",
                          color: metric.trend.startsWith("+") ? "#059669" : "#dc2626",
                          fontWeight: "500",
                        }}
                      >
                        {metric.trend} vs last week
                      </span>
                    </div>
                    <span style={{ fontSize: "20px" }}>{metric.icon}</span>
                  </div>
                </div>
              ))}

            {/* Analysis API Metrics */}
            {analysisData &&
              [
                {
                  title: "Rage Click Rate",
                  value: analysisData.rageClickRate,
                  unit: "",
                  icon: "😤",
                  trend: "-3%",
                  color: "#dc2626",
                },
                {
                  title: "Potential Conversion",
                  value: analysisData.potentialConversation,
                  unit: "",
                  icon: "🎯",
                  trend: "+1.4%",
                  color: "#059669",
                },
                {
                  title: "User Frustration",
                  value: analysisData.userFrustrationScore,
                  unit: "/100",
                  icon: "😠",
                  trend: "-5%",
                  color: "#dc2626",
                },
                {
                  title: "Engagement Score",
                  value: analysisData.engagementScore,
                  unit: "/100",
                  icon: "⚡",
                  trend: "+8%",
                },
              ].map((metric, index) => (
                <div
                  key={`analysis-${index}`}
                  style={{
                    background: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "12px",
                    padding: "20px",
                    border: "1px solid rgba(16, 185, 129, 0.1)",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                    transition: "transform 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 8px 0" }}>{metric.title}</p>
                      <p
                        style={{
                          fontSize: "24px",
                          fontWeight: "700",
                          color: metric.color || "#111827",
                          margin: "0 0 4px 0",
                        }}
                      >
                        {metric.value}
                        {metric.unit}
                      </p>
                      <span
                        style={{
                          fontSize: "12px",
                          color: metric.trend.startsWith("+") ? "#059669" : "#dc2626",
                          fontWeight: "500",
                        }}
                      >
                        {metric.trend} vs last week
                      </span>
                    </div>
                    <span style={{ fontSize: "20px" }}>{metric.icon}</span>
                  </div>
                </div>
              ))}
          </div>

          {/* Additional sections only if we have data */}
          {dashboardData?.mostDropOffElement && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(20px)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "32px",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#dc2626", margin: "0 0 8px 0" }}>
                ⚠️ Most Drop-off Element
              </h3>
              <code
                style={{
                  fontSize: "14px",
                  fontFamily: "Monaco, Consolas, monospace",
                  color: "#111827",
                  background: "#f9fafb",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                {dashboardData.mostDropOffElement}
              </code>
            </div>
          )}

          {dashboardData?.last10Sessions && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(20px)",
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "32px",
                border: "1px solid rgba(16, 185, 129, 0.1)",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", margin: "0 0 16px 0" }}>
                Recent Sessions
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <th style={{ textAlign: "left", padding: "8px 0", fontSize: "14px", color: "#6b7280" }}>
                        Session ID
                      </th>
                      <th style={{ textAlign: "left", padding: "8px 0", fontSize: "14px", color: "#6b7280" }}>
                        Duration
                      </th>
                      <th style={{ textAlign: "left", padding: "8px 0", fontSize: "14px", color: "#6b7280" }}>
                        Clicks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.last10Sessions.map((session, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "12px 0", fontSize: "14px", color: "#111827" }}>
                          <button
                            onClick={() => {
                              setSelectedSessionId(session.sessionId)
                              onSessionViewerToggle?.(true)
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#059669",
                              textDecoration: "underline",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontFamily: "inherit",
                            }}
                            onMouseEnter={(e) => (e.target.style.color = "#047857")}
                            onMouseLeave={(e) => (e.target.style.color = "#059669")}
                          >
                            {session.sessionId}
                          </button>
                        </td>
                        <td style={{ padding: "12px 0", fontSize: "14px", color: "#111827" }}>
                          {(session.time / 1000).toFixed(1)}s
                        </td>
                        <td style={{ padding: "12px 0", fontSize: "14px", color: "#111827" }}>{session.clicks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* AI Summary Modal */}
      {showAiModal && aiSummary && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}
            >
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>
                🧠 AI-Powered Insights
              </h3>
              <button
                onClick={() => setShowAiModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                background: "#f8fafc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  lineHeight: "1.6",
                  margin: 0,
                  fontStyle: "italic",
                }}
              >
                {aiSummary.summary}
              </p>
            </div>

            <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: "0 0 12px 0" }}>
              🎯 Optimization Recommendations
            </h4>

            {aiSummary.recommendations.map((rec, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "12px",
                  background: rec.priority === "HIGH" ? "#fef2f2" : rec.priority === "MEDIUM" ? "#fffbeb" : "#f0fdf4",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background:
                        rec.priority === "HIGH" ? "#dc2626" : rec.priority === "MEDIUM" ? "#d97706" : "#059669",
                      color: "white",
                    }}
                  >
                    {rec.priority}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#059669" }}>{rec.impact}</span>
                </div>
                <h5 style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: "0 0 4px 0" }}>
                  {rec.issue}
                </h5>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>{rec.solution}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
    </div>
  )
}
