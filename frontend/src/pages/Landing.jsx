"use client"

import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"

export default function Landing() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", updateMousePosition)
    return () => window.removeEventListener("mousemove", updateMousePosition)
  }, [])

  useEffect(() => {
    // Clear logout flag when landing on this page
    sessionStorage.removeItem("logging-out")

    // Clear any existing session when visiting landing page
    const clearSession = async () => {
      try {
        await supabase.auth.signOut()
        console.log("Cleared any existing session on landing page")
      } catch (error) {
        console.error("Error clearing session:", error)
      }
    }
    clearSession()
  }, [])

  // Initialize moving particles
  useEffect(() => {
    const initialParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 60 + 30,
      opacity: Math.random() * 0.1 + 0.05,
    }))
    setParticles(initialParticles)

    const animateParticles = () => {
      setParticles((prev) =>
        prev.map((particle) => {
          let newX = particle.x + particle.vx
          let newY = particle.y + particle.vy
          let newVx = particle.vx
          let newVy = particle.vy

          // Bounce off edges
          if (newX <= 0 || newX >= window.innerWidth - particle.size) {
            newVx = -newVx
            newX = Math.max(0, Math.min(window.innerWidth - particle.size, newX))
          }
          if (newY <= 0 || newY >= window.innerHeight - particle.size) {
            newVy = -newVy
            newY = Math.max(0, Math.min(window.innerHeight - particle.size, newY))
          }

          return {
            ...particle,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
          }
        }),
      )
    }

    const interval = setInterval(animateParticles, 50)
    return () => clearInterval(interval)
  }, [])

  const handleTryStoreReplay = () => {
    // Clear any existing session data before going to auth
    localStorage.removeItem("dashboard_mapping")
    sessionStorage.clear() // This will also clear the logout flag
    window.location.href = "/auth"
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(-45deg, #ecfdf5, #ffffff, #f0fdf4, #ffffff)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
        fontFamily: "Inter, system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Logo in top left corner */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 16px",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          boxShadow: "0 4px 16px rgba(16, 185, 129, 0.1)",
        }}
      >
        <img
          src="/storeReplay.png"
          alt="StoreReplay Logo"
          style={{
            width: "32px",
            height: "32px",
          }}
        />
        <span
          style={{
            fontSize: "18px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          StoreReplay
        </span>
      </div>

      {/* Animated Background Elements */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {/* Moving Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: "absolute",
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `radial-gradient(circle, rgba(16, 185, 129, ${particle.opacity}) 0%, transparent 70%)`,
              borderRadius: "50%",
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              transition: "all 0.05s linear",
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
            animation: "gridMove 20s linear infinite",
          }}
        />
      </div>

      {/* Cursor Follower */}
      <div
        style={{
          position: "fixed",
          width: "20px",
          height: "20px",
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, rgba(16, 185, 129, 0.1) 50%, transparent 100%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
          transform: `translate(${mousePosition.x - 10}px, ${mousePosition.y - 10}px)`,
          transition: "transform 0.1s ease-out",
          filter: "blur(1px)",
        }}
      />

      {/* Larger Cursor Glow */}
      <div
        style={{
          position: "fixed",
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 1,
          transform: `translate(${mousePosition.x - 100}px, ${mousePosition.y - 100}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />

      {/* Main Content */}
      <div style={{ position: "relative", zIndex: 10 }}>
        {/* Hero Section */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            {/* Main Logo with glow effect */}
            <div
              style={{
                display: "inline-block",
                padding: "30px",
                marginBottom: "20px",
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1)",
              }}
            >

              <h1
                style={{
                  fontSize: "48px",
                  fontWeight: "800",
                  background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  margin: 0,
                  textShadow: "0 0 30px rgba(16, 185, 129, 0.3)",
                }}
              >
                StoreReplay
              </h1>
            </div>

            {/* Slogan */}
            <p
              style={{
                fontSize: "16px",
                color: "#059669",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "20px",
                animation: "fadeInUp 1s ease-out 0.1s both",
              }}
            >
              Every E-Merchant Deserves To Understand Their Clients Using AI
            </p>

            {/* Animated main heading */}
            <div style={{ marginBottom: "24px" }}>
              <h2
                style={{
                  fontSize: "56px",
                  fontWeight: "900",
                  color: "#111827",
                  lineHeight: "1.1",
                  margin: 0,
                  animation: "slideInUp 1s ease-out",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    animation: "fadeInUp 1s ease-out 0.2s both",
                  }}
                >
                  AI-Powered
                </span>
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    display: "inline-block",
                    animation: "fadeInUp 1s ease-out 0.4s both",
                  }}
                >
                  Session Replay
                </span>
                <br />
                <span
                  style={{
                    display: "inline-block",
                    animation: "fadeInUp 1s ease-out 0.6s both",
                  }}
                >
                  for Shopify
                </span>
              </h2>
            </div>

            <p
              style={{
                fontSize: "20px",
                color: "#6b7280",
                marginBottom: "40px",
                maxWidth: "600px",
                margin: "0 auto 40px auto",
                lineHeight: "1.6",
                animation: "fadeInUp 1s ease-out 0.8s both",
              }}
            >
              Understand your customers like never before. Capture every click, scroll, and interaction with intelligent
              AI insights that help you optimize your store.
            </p>

            {/* CTA Button with enhanced effects */}
            <Link
              to="/auth"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                display: "inline-block",
                padding: "18px 36px",
                background: isHovered
                  ? "linear-gradient(135deg, #047857 0%, #059669 100%)"
                  : "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                color: "white",
                textDecoration: "none",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: "600",
                boxShadow: isHovered
                  ? "0 20px 40px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)"
                  : "0 10px 30px rgba(16, 185, 129, 0.3)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isHovered ? "translateY(-2px) scale(1.05)" : "translateY(0) scale(1)",
                animation: "fadeInUp 1s ease-out 1s both",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <span style={{ position: "relative", zIndex: 2 }}>Use StoreReplay</span>
              {/* Button shine effect */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                  animation: isHovered ? "shine 0.6s ease-out" : "none",
                }}
              />
            </Link>
          </div>

          {/* How It Works Section */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(20px)",
              padding: "60px 40px",
              borderRadius: "24px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(16, 185, 129, 0.1)",
              animation: "fadeInUp 1s ease-out 1.2s both",
              marginBottom: "60px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "50px" }}>
              <p
                style={{
                  color: "#059669",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  fontSize: "14px",
                  marginBottom: "12px",
                  letterSpacing: "2px",
                }}
              >
                How It Works
              </p>
              <h3
                style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Three Steps To Better Conversions
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "40px",
              }}
            >
              {[
                {
                  icon: "▶",
                  title: "Capture",
                  desc: "Record every user session automatically with our lightweight tracking script.",
                  delay: "1.4s",
                },
                {
                  icon: "🧠",
                  title: "AI Insights",
                  desc: "Our AI analyzes user behavior patterns and identifies optimization opportunities.",
                  delay: "1.6s",
                },
                {
                  icon: "📊",
                  title: "Dashboard",
                  desc: "View actionable insights and metrics in a beautiful, easy-to-understand dashboard.",
                  delay: "1.8s",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: "center",
                    padding: "30px 20px",
                    borderRadius: "16px",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    animation: `fadeInUp 1s ease-out ${feature.delay} both`,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-10px)"
                    e.target.style.background = "rgba(16, 185, 129, 0.05)"
                    e.target.style.boxShadow = "0 20px 40px rgba(16, 185, 129, 0.1)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)"
                    e.target.style.background = "transparent"
                    e.target.style.boxShadow = "none"
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      borderRadius: "16px",
                      margin: "0 auto 20px auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "28px",
                      boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h4
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: "12px",
                      margin: "0 0 12px 0",
                    }}
                  >
                    {feature.title}
                  </h4>
                  <p
                    style={{
                      color: "#6b7280",
                      lineHeight: "1.6",
                      margin: 0,
                    }}
                  >
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Easy Setup Section */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(20px)",
              padding: "60px 40px",
              borderRadius: "24px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(16, 185, 129, 0.1)",
              animation: "fadeInUp 1s ease-out 2s both",
              marginBottom: "60px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "50px" }}>
              <p
                style={{
                  color: "#059669",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  fontSize: "14px",
                  marginBottom: "12px",
                  letterSpacing: "2px",
                }}
              >
                Easy Setup
              </p>
              <h3
                style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Get Started In Minutes
              </h3>
              <p
                style={{
                  fontSize: "18px",
                  color: "#6b7280",
                  marginTop: "16px",
                  fontStyle: "italic",
                }}
              >
                Every e-merchant deserves to understand their clients using AI
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "40px",
              }}
            >
              {[
                {
                  number: "1",
                  title: "One Line Integration",
                  desc: "Inject our tracking API with just ONE line of code in your Shopify theme.",
                  delay: "2.2s",
                  highlight: "ONE",
                },
                {
                  number: "2",
                  title: "Instant Dashboard Access",
                  desc: "View your customer insights dashboard immediately after logging in - no waiting.",
                  delay: "2.4s",
                },
                {
                  number: "3",
                  title: "Real-Time Analytics",
                  desc: "Start receiving AI-powered insights about your customers within minutes of setup.",
                  delay: "2.6s",
                },
              ].map((step, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: "center",
                    padding: "30px 20px",
                    borderRadius: "16px",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    animation: `fadeInUp 1s ease-out ${step.delay} both`,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-10px)"
                    e.target.style.background = "rgba(16, 185, 129, 0.05)"
                    e.target.style.boxShadow = "0 20px 40px rgba(16, 185, 129, 0.1)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)"
                    e.target.style.background = "transparent"
                    e.target.style.boxShadow = "none"
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      borderRadius: "16px",
                      margin: "0 auto 20px auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "32px",
                      fontWeight: "900",
                      boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  >
                    {step.number}
                  </div>
                  <h4
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: "12px",
                      margin: "0 0 12px 0",
                    }}
                  >
                    {step.title}
                  </h4>
                  <p
                    style={{
                      color: "#6b7280",
                      lineHeight: "1.6",
                      margin: 0,
                    }}
                  >
                    {step.highlight ? (
                      <>
                        {step.desc.split(step.highlight)[0]}
                        <span
                          style={{
                            color: "#059669",
                            fontWeight: "800",
                            fontSize: "1.2em",
                          }}
                        >
                          {step.highlight}
                        </span>
                        {step.desc.split(step.highlight)[1]}
                      </>
                    ) : (
                      step.desc
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {/* What You'll See Section */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(20px)",
              padding: "60px 40px",
              borderRadius: "24px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(16, 185, 129, 0.1)",
              animation: "fadeInUp 1s ease-out 2.8s both",
              marginBottom: "60px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "50px" }}>
              <p
                style={{
                  color: "#059669",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  fontSize: "14px",
                  marginBottom: "12px",
                  letterSpacing: "2px",
                }}
              >
                What You'll See
              </p>
              <h3
                style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  color: "#111827",
                  margin: "0 0 16px 0",
                }}
              >
                Every User Interaction Captured
              </h3>
              <p
                style={{
                  fontSize: "18px",
                  color: "#6b7280",
                  maxWidth: "600px",
                  margin: "0 auto",
                  lineHeight: "1.6",
                }}
              >
                See exactly how your customers interact with your store. From mouse movements to form inputs, we capture
                it all.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
                marginBottom: "40px",
              }}
            >
              {[
                {
                  icon: "🖱️",
                  title: "Mouse Movements",
                  desc: "Track every mouse movement and hover to understand user attention patterns.",
                  color: "#3b82f6",
                  delay: "3.0s",
                },
                {
                  icon: "👆",
                  title: "Click Events",
                  desc: "Capture all clicks, double-clicks, and right-clicks with precise coordinates.",
                  color: "#059669",
                  delay: "3.1s",
                },
                {
                  icon: "📝",
                  title: "Form Inputs",
                  desc: "Monitor text inputs, selections, and form interactions in real-time.",
                  color: "#7c3aed",
                  delay: "3.2s",
                },
                {
                  icon: "📜",
                  title: "Scroll Behavior",
                  desc: "Analyze scrolling patterns to see what content engages users most.",
                  color: "#dc2626",
                  delay: "3.3s",
                },
                {
                  icon: "🔄",
                  title: "DOM Changes",
                  desc: "Track dynamic content changes and how users respond to them.",
                  color: "#ea580c",
                  delay: "3.4s",
                },
                {
                  icon: "📱",
                  title: "Viewport Resizes",
                  desc: "Monitor screen size changes and responsive behavior patterns.",
                  color: "#0891b2",
                  delay: "3.5s",
                },
                {
                  icon: "🎬",
                  title: "Media Interactions",
                  desc: "See how users interact with videos, images, and other media elements.",
                  color: "#be185d",
                  delay: "3.6s",
                },
                {
                  icon: "⚡",
                  title: "Page Navigation",
                  desc: "Track page loads, redirects, and navigation patterns across your store.",
                  color: "#059669",
                  delay: "3.7s",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    padding: "24px 20px",
                    borderRadius: "12px",
                    border: `1px solid ${feature.color}20`,
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    animation: `fadeInUp 1s ease-out ${feature.delay} both`,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-5px)"
                    e.target.style.boxShadow = `0 10px 30px ${feature.color}20`
                    e.target.style.borderColor = `${feature.color}40`
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)"
                    e.target.style.boxShadow = "none"
                    e.target.style.borderColor = `${feature.color}20`
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        background: `${feature.color}15`,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                      }}
                    >
                      {feature.icon}
                    </div>
                    <h4
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#111827",
                        margin: 0,
                      }}
                    >
                      {feature.title}
                    </h4>
                  </div>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      margin: 0,
                    }}
                  >
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Sample Data Preview */}
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
                animation: "fadeInUp 1s ease-out 3.8s both",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  background: "#f9fafb",
                  padding: "16px 20px",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                    Session Replay: #1bd99ce9
                  </h4>
                  <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#059669", fontWeight: "600" }}>
                    <span>📊 29 events loaded</span>
                    <span>⏱️ 4.9s duration</span>
                    <span>⌨️ 12 keypresses</span>
                    <span>👆 First click: 1.2s</span>
                  </div>
                </div>
                <div
                  style={{
                    padding: "6px 12px",
                    background: "#f0fdf4",
                    borderRadius: "6px",
                    border: "1px solid #bbf7d0",
                    fontSize: "11px",
                    color: "#059669",
                    fontWeight: "600",
                  }}
                >
                  🧠 AI: High engagement session
                </div>
              </div>

              {/* Content Area */}
              <div style={{ display: "flex", height: "300px" }}>
                {/* Event Timeline */}
                <div
                  style={{
                    width: "280px",
                    background: "#f9fafb",
                    borderRight: "1px solid #e5e7eb",
                    padding: "16px",
                    overflowY: "auto",
                  }}
                >
                  <h5 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                    Event Timeline
                  </h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { type: "Page Load", time: "0.0s", color: "#3b82f6", details: "Homepage loaded" },
                      { type: "Mouse Move", time: "0.3s", color: "#6b7280", details: "→ (582, 424)" },
                      { type: "Mouse Click", time: "1.2s", color: "#059669", details: "Add to Cart button" },
                      {
                        type: "Input Change",
                        time: "2.1s",
                        color: "#7c3aed",
                        details: "Search: 'wireless headphones'",
                      },
                      { type: "Scroll", time: "3.4s", color: "#dc2626", details: "Y: 340px" },
                      { type: "Mouse Move", time: "4.1s", color: "#6b7280", details: "→ (855, 433)" },
                      { type: "DOM Mutation", time: "4.9s", color: "#ea580c", details: "Cart updated" },
                    ].map((event, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "8px 10px",
                          background: index === 2 ? "#f0fdf4" : "white",
                          border: `1px solid ${index === 2 ? "#059669" : "#e5e7eb"}`,
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "2px",
                          }}
                        >
                          <span style={{ fontWeight: "600", color: event.color }}>{event.type}</span>
                          <span style={{ color: "#6b7280" }}>{event.time}</span>
                        </div>
                        <div style={{ color: "#374151", fontSize: "11px" }}>{event.details}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Details */}
                <div style={{ flex: 1, padding: "20px" }}>
                  <h5 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                    Current Event Details
                  </h5>
                  <div
                    style={{
                      background: "#f9fafb",
                      borderRadius: "8px",
                      padding: "16px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <h6 style={{ margin: "0 0 8px 0", color: "#059669", fontSize: "14px", fontWeight: "600" }}>
                      Mouse Click • Add to Cart Button
                    </h6>
                    <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#6b7280" }}>
                      Timestamp: 1.2s • Position: (159, 207)
                    </p>

                    <div style={{ marginBottom: "12px" }}>
                      <strong style={{ fontSize: "12px" }}>Interaction Details:</strong>
                      <div
                        style={{
                          background: "#e0f2fe",
                          padding: "8px",
                          borderRadius: "4px",
                          marginTop: "4px",
                          fontSize: "11px",
                          fontFamily: "Monaco, Consolas, monospace",
                        }}
                      >
                        Element: &lt;button class="btn-primary"&gt;Add to Cart&lt;/button&gt;
                        <br />
                        Click Type: Left Click
                        <br />
                        Coordinates: (159, 207)
                        <br />
                        Viewport: 1920 × 919
                      </div>
                    </div>

                    <div>
                      <strong style={{ fontSize: "12px" }}>Raw Event Data:</strong>
                      <pre
                        style={{
                          background: "#1f2937",
                          color: "#e5e7eb",
                          padding: "8px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          marginTop: "4px",
                          overflow: "auto",
                          fontFamily: "Monaco, Consolas, monospace",
                        }}
                      >
                        {`{
  "type": 3,
  "timestamp": 1200,
  "data": {
    "source": 2,
    "type": 2,
    "x": 159,
    "y": 207,
    "id": 42
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
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
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(10px) rotate(240deg);
          }
        }

        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        @keyframes shine {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  )
}
