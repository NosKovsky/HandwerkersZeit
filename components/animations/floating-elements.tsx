"use client"

import { useEffect, useState } from "react"
import { Hammer, Wrench, HardHat, Building, Ruler, WrenchIcon as Screwdriver } from "lucide-react"

export function FloatingElements() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const elements = [
    { Icon: Hammer, delay: 0, duration: 6, color: "text-orange-400" },
    { Icon: Wrench, delay: 1, duration: 8, color: "text-blue-400" },
    { Icon: HardHat, delay: 2, duration: 7, color: "text-yellow-400" },
    { Icon: Building, delay: 3, duration: 9, color: "text-gray-400" },
    { Icon: Ruler, delay: 4, duration: 5, color: "text-green-400" },
    { Icon: Screwdriver, delay: 5, duration: 10, color: "text-purple-400" },
  ]

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {elements.map(({ Icon, delay, duration, color }, index) => (
        <div
          key={index}
          className={`absolute opacity-5 ${color}`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }}
        >
          <Icon
            className="h-16 w-16 animate-pulse"
            style={{
              animation: `float ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        </div>
      ))}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
          75% { transform: translateY(-15px) rotate(3deg); }
        }
      `}</style>
    </div>
  )
}
