"use client"

interface GradientBlobBgProps {
  className?: string
  opacity?: number
}

export function GradientBlobBg({ className = '', opacity = 0.6 }: GradientBlobBgProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Top-right blob */}
      <div
        className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] md:w-[1200px] md:h-[1200px]"
        style={{ opacity }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/gradient-blob.png"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>

      {/* Bottom-left blob (mirrored and rotated) */}
      <div
        className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] md:w-[900px] md:h-[900px] rotate-180"
        style={{ opacity: opacity * 0.5 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/gradient-blob.png"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  )
}
