"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"

export default function SessionViewer({ sessionId, onClose }) {
  const [sessionData, setSessionData] = useState(null)
  const [sessionMetadata, setSessionMetadata] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentEventIndex, setCurrentEventIndex] = useState(0)

  useEffect(() => {
    fetchSessionData()
  }, [sessionId])

  const fetchSessionData = async () => {
    try {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError("No session found")
        return
      }

      console.log("Fetching session replay data for:", sessionId)

      const response = await fetch(`https://store-replay.onrender.com/api/session/${sessionId}/replay`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const replayData = await response.json()
        console.log("Session data loaded:", replayData)

        // Handle the new API response format
        if (replayData.events && Array.isArray(replayData.events)) {
          setSessionData(replayData.events) // Extract events array
          setSessionMetadata(replayData.metadata) // Extract metadata
          console.log("Events loaded:", replayData.events.length, "events")
          console.log("Metadata loaded:", replayData.metadata)
        } else if (Array.isArray(replayData)) {
          // Fallback for direct array response
          setSessionData(replayData)
          console.log("Events loaded:", replayData.length, "events")
        } else {
          setError("Invalid response format")
        }
      } else {
        const errorText = await response.text()
        setError(`Failed to load session: ${errorText}`)
      }
    } catch (error) {
      console.error("Error fetching session data:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getEventTypeLabel = (type) => {
    const types = {
      0: "Meta Event",
      1: "Full Snapshot",
      2: "Incremental Snapshot",
      3: "User Interaction",
      4: "Page Load",
      5: "Viewport Resize",
      6: "Input Change",
      7: "Media Interaction",
      8: "Style Sheet",
      9: "Canvas Mutation",
      10: "Font Load",
      11: "Log",
      12: "Drag & Drop",
    }
    return types[type] || `Event Type ${type}`
  }

  const formatDuration = (duration) => {
    if (!duration) return "0.0s"
    return (duration / 1000).toFixed(1) + "s"
  }

  const getInteractionDetails = (event) => {
    if (event.type !== 3) return null

    const sourceTypes = {
      0: "DOM Mutation",
      1: "Mouse Movement",
      2: "Mouse Click",
      3: "Mouse Interaction",
      4: "Scroll",
      5: "Input/Form",
      6: "Touch",
      7: "Drag",
    }

    const clickTypes = {
      0: "Mouse Down",
      1: "Mouse Up",
      2: "Click",
      3: "Context Menu",
      4: "Double Click",
      5: "Focus",
      6: "Blur",
    }

    let details = sourceTypes[event.data?.source] || "Unknown Interaction"

    if (event.data?.source === 2 && event.data?.type !== undefined) {
      details += ` (${clickTypes[event.data.type] || `Type ${event.data.type}`})`
    }

    return details
  }

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
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
              margin: "0 auto 16px",
            }}
          />
          <p>Loading session replay...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <h3 style={{ color: "#dc2626", marginBottom: "16px" }}>Error Loading Session</h3>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>{error}</p>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              background: "#059669",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const currentEvent = sessionData?.[currentEventIndex]

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#000000",
        zIndex: 99999, // Much higher z-index
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header with Back Button and Metadata */}
      <div
        style={{
          background: "white",
          padding: "16px 24px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
          minHeight: "120px", // Increased height for more metadata
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Back Button */}
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "#059669",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "white",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#047857"
              e.target.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#059669"
              e.target.style.transform = "translateY(0)"
            }}
          >
            ← Back to Dashboard
          </button>

          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#111827" }}>
              Session Replay: {sessionId}
            </h2>

            {/* First row of metadata */}
            <div style={{ display: "flex", gap: "20px", marginTop: "6px" }}>
              <span style={{ fontSize: "14px", color: "#059669", fontWeight: "600" }}>
                📊 {sessionData?.length || 0} events loaded
              </span>
              {sessionMetadata?.event_count && (
                <span style={{ fontSize: "14px", color: "#059669", fontWeight: "600" }}>
                  🔢 {sessionMetadata.event_count} total events
                </span>
              )}
              {sessionMetadata?.session_time && (
                <span style={{ fontSize: "14px", color: "#059669", fontWeight: "600" }}>
                  ⏱️ {(sessionMetadata.session_time / 1000).toFixed(1)}s duration
                </span>
              )}
            </div>

            {/* Second row of metadata */}
            <div style={{ display: "flex", gap: "20px", marginTop: "4px" }}>
              {sessionMetadata?.total_keypresses && (
                <span style={{ fontSize: "14px", color: "#7c3aed", fontWeight: "600" }}>
                  ⌨️ {sessionMetadata.total_keypresses} keypresses
                </span>
              )}
              {sessionMetadata?.first_click_ms && (
                <span style={{ fontSize: "14px", color: "#dc2626", fontWeight: "600" }}>
                  👆 First click: {(sessionMetadata.first_click_ms / 1000).toFixed(1)}s
                </span>
              )}
              {sessionMetadata?.store_id && (
                <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>
                  🏪 Store: {sessionMetadata.store_id}
                </span>
              )}
            </div>

            {/* AI Summary if available */}
            {sessionMetadata?.ai_summary && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "8px 12px",
                  background: "#f0fdf4",
                  borderRadius: "6px",
                  border: "1px solid #bbf7d0",
                  maxWidth: "600px",
                }}
              >
                <span style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}>🧠 AI Summary:</span>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#065f46",
                    margin: "4px 0 0 0",
                    lineHeight: "1.4",
                    fontStyle: "italic",
                  }}
                >
                  {sessionMetadata.ai_summary}
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "#f3f4f6",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            width: "40px",
            height: "40px",
            fontSize: "20px",
            cursor: "pointer",
            color: "#6b7280",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#ef4444"
            e.target.style.color = "white"
            e.target.style.borderColor = "#ef4444"
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#f3f4f6"
            e.target.style.color = "#6b7280"
            e.target.style.borderColor = "#d1d5db"
          }}
        >
          ×
        </button>
      </div>

      {/* Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          height: "calc(100vh - 80px)",
          overflow: "hidden",
        }}
      >
        {/* Event Timeline */}
        <div
          style={{
            width: "400px",
            background: "white",
            borderRight: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div style={{ padding: "16px", flexShrink: 0, background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600", color: "#111827" }}>
              Event Timeline
            </h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>Click any event to view details</p>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
            }}
          >
            {sessionData?.map((event, index) => (
              <div
                key={index}
                onClick={() => setCurrentEventIndex(index)}
                style={{
                  padding: "12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  cursor: "pointer",
                  background: index === currentEventIndex ? "#f0fdf4" : "white",
                  borderColor: index === currentEventIndex ? "#059669" : "#e5e7eb",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (index !== currentEventIndex) {
                    e.target.style.background = "#f9fafb"
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== currentEventIndex) {
                    e.target.style.background = "white"
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#059669" }}>
                    {getEventTypeLabel(event.type)}
                    {event.type === 3 && (
                      <span style={{ fontSize: "11px", color: "#7c3aed", marginLeft: "4px" }}>
                        • {getInteractionDetails(event)}
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: "11px", color: "#6b7280" }}>{formatTimestamp(event.timestamp)}</span>
                </div>

                {/* Enhanced event preview */}
                <div style={{ fontSize: "12px", color: "#374151" }}>
                  {/* Input text preview */}
                  {event.data?.text && (
                    <div
                      style={{ background: "#f3f4f6", padding: "4px 6px", borderRadius: "3px", marginBottom: "4px" }}
                    >
                      <strong>Input:</strong> "{event.data.text}"
                    </div>
                  )}

                  {/* Mouse position */}
                  {event.data?.x !== undefined && event.data?.y !== undefined && (
                    <div>
                      <strong>Position:</strong> ({event.data.x}, {event.data.y})
                    </div>
                  )}

                  {/* Mouse movement positions */}
                  {event.data?.positions && event.data.positions.length > 0 && (
                    <div>
                      <strong>Movement:</strong> {event.data.positions.length} positions
                      {event.data.positions.length > 0 && (
                        <span style={{ color: "#6b7280" }}>
                          {" "}
                          → ({event.data.positions[event.data.positions.length - 1].x},{" "}
                          {event.data.positions[event.data.positions.length - 1].y})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Page dimensions for load events */}
                  {event.data?.width && event.data?.height && (
                    <div>
                      <strong>Viewport:</strong> {event.data.width} × {event.data.height}
                    </div>
                  )}

                  {/* URL for navigation events */}
                  {event.data?.href && (
                    <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                      <strong>URL:</strong>{" "}
                      {event.data.href.length > 40 ? event.data.href.substring(0, 40) + "..." : event.data.href}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Details */}
        <div
          style={{
            flex: 1,
            background: "#f9fafb",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div style={{ padding: "24px", flexShrink: 0, background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600", color: "#111827" }}>
              Current Event Details
            </h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
              Event {currentEventIndex + 1} of {sessionData?.length || 0}
            </p>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px",
            }}
          >
            {currentEvent ? (
              <div
                style={{
                  background: "white",
                  borderRadius: "8px",
                  padding: "20px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#059669" }}>
                    {getEventTypeLabel(currentEvent.type)}
                    {currentEvent.type === 3 && (
                      <span style={{ color: "#7c3aed", fontSize: "14px", marginLeft: "8px" }}>
                        • {getInteractionDetails(currentEvent)}
                      </span>
                    )}
                  </h4>
                  <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                    Timestamp: {formatTimestamp(currentEvent.timestamp)}
                  </p>
                  {currentEvent.delay !== undefined && (
                    <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                      Delay: {currentEvent.delay}ms
                    </p>
                  )}
                </div>

                {/* Enhanced interaction details */}
                {currentEvent.type === 3 && (
                  <div style={{ marginBottom: "16px" }}>
                    <h5 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600" }}>Interaction Details</h5>
                    <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "6px", fontSize: "13px" }}>
                      {/* Input text */}
                      {currentEvent.data?.text && (
                        <div style={{ marginBottom: "8px" }}>
                          <strong>Input Text:</strong>
                          <span
                            style={{
                              background: "#e0f2fe",
                              padding: "2px 6px",
                              borderRadius: "3px",
                              marginLeft: "6px",
                              fontFamily: "Monaco, Consolas, monospace",
                            }}
                          >
                            "{currentEvent.data.text}"
                          </span>
                          {currentEvent.data?.isChecked !== undefined && (
                            <span style={{ marginLeft: "8px", color: "#6b7280" }}>
                              (Checked: {currentEvent.data.isChecked ? "Yes" : "No"})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Click position */}
                      {currentEvent.data?.x !== undefined && currentEvent.data?.y !== undefined && (
                        <div style={{ marginBottom: "8px" }}>
                          <strong>Click Position:</strong> ({currentEvent.data.x}, {currentEvent.data.y})
                        </div>
                      )}

                      {/* Mouse movement trail */}
                      {currentEvent.data?.positions && currentEvent.data.positions.length > 0 && (
                        <div style={{ marginBottom: "8px" }}>
                          <strong>Mouse Trail:</strong> {currentEvent.data.positions.length} positions
                          <div
                            style={{
                              maxHeight: "100px",
                              overflowY: "auto",
                              marginTop: "4px",
                              fontSize: "11px",
                              color: "#6b7280",
                            }}
                          >
                            {currentEvent.data.positions.slice(0, 5).map((pos, i) => (
                              <div key={i}>
                                Position {i + 1}: ({pos.x}, {pos.y})
                                {pos.timeOffset !== undefined && <span> at +{pos.timeOffset}ms</span>}
                              </div>
                            ))}
                            {currentEvent.data.positions.length > 5 && (
                              <div>... and {currentEvent.data.positions.length - 5} more positions</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Page load info */}
                      {currentEvent.data?.href && (
                        <div style={{ marginBottom: "8px" }}>
                          <strong>Page URL:</strong>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#6b7280",
                              wordBreak: "break-all",
                              marginTop: "2px",
                            }}
                          >
                            {currentEvent.data.href}
                          </div>
                        </div>
                      )}

                      {/* Viewport dimensions */}
                      {currentEvent.data?.width && currentEvent.data?.height && (
                        <div>
                          <strong>Viewport Size:</strong> {currentEvent.data.width} × {currentEvent.data.height} pixels
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Raw event data */}
                {currentEvent.data && (
                  <div>
                    <h5 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600" }}>Raw Event Data</h5>
                    <pre
                      style={{
                        background: "#f9fafb",
                        padding: "12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        overflow: "auto",
                        maxHeight: "300px",
                        fontFamily: "Monaco, Consolas, monospace",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {JSON.stringify(currentEvent.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  background: "white",
                  borderRadius: "8px",
                  padding: "40px",
                  textAlign: "center",
                  border: "1px solid #e5e7eb",
                }}
              >
                <p style={{ color: "#6b7280" }}>Select an event from the timeline to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}
      </style>
    </div>
  )
}
