"use client"

import { useState, useEffect } from "react"
import AuthForm from "../components/AuthForm"

export default function Auth() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Clear any logout flags when visiting auth page
    sessionStorage.removeItem("logging-out")
    console.log("Auth: Cleared logout flag")
  }, [])

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", updateMousePosition)
    return () => window.removeEventListener("mousemove", updateMousePosition)
  }, [])

  // Initialize moving particles
  useEffect(() => {
    const initialParticles = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 50 + 25,
      opacity: Math.random() * 0.08 + 0.03,
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
        padding: "48px 16px",
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
      {/* Background Effects */}
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
      </div>

      {/* Cursor Glow */}
      <div
        style={{
          position: "fixed",
          width: "150px",
          height: "150px",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 1,
          transform: `translate(${mousePosition.x - 75}px, ${mousePosition.y - 75}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />

      <div style={{ maxWidth: "400px", width: "100%", position: "relative", zIndex: 10 }}>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(16, 185, 129, 0.1)",
            overflow: "hidden",
            animation: "fadeInUp 0.8s ease-out",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
              padding: "32px 24px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Header shine effect */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
                animation: "shine 3s ease-in-out infinite",
              }}
            />

            <div
              style={{
                display: "inline-block",
                padding: "20px",
                marginBottom: "20px",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1)",
              }}
            >
              {/* <img
                src="/storeReplay.png"
                alt="StoreReplay"
                style={{
                  width: "48px",
                  height: "48px",
                  marginBottom: "12px",
                  filter: "drop-shadow(0 0 15px rgba(16, 185, 129, 0.3))",
                }}
              /> */}
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
          </div>
          <div style={{ padding: "32px" }}>
            <AuthForm />
          </div>
        </div>
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
          33% {
            transform: translateY(-15px) rotate(120deg);
          }
          66% {
            transform: translateY(8px) rotate(240deg);
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
