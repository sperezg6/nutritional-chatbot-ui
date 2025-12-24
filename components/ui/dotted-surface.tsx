'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from 'next-themes'

interface DottedSurfaceProps {
  density?: number
  amplitude?: number
  frequency?: number
  speed?: number
}

export function DottedSurface({
  density = 30,
  amplitude = 0.5,
  frequency = 1.5,
  speed = 0.5,
}: DottedSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      })
    } catch {
      console.warn('WebGL not available')
      return
    }

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Create dots
    const geometry = new THREE.BufferGeometry()
    const positions: number[] = []
    const colors: number[] = []

    const gridSize = density
    const spacing = 0.5

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const posX = (x - gridSize / 2) * spacing
        const posZ = (z - gridSize / 2) * spacing
        positions.push(posX, 0, posZ)

        // Color based on theme - using medical green/teal
        const color = new THREE.Color(
          theme === 'dark' ? 0x5db3a0 : 0x469C88
        )
        colors.push(color.r, color.g, color.b)
      }
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    )
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    camera.position.z = 8
    camera.position.y = 3

    // Animation
    let time = 0
    let animationFrameId: number
    let isDisposed = false

    const animate = () => {
      if (isDisposed) return

      animationFrameId = requestAnimationFrame(animate)

      time += 0.01 * speed
      const positions = geometry.attributes.position.array as Float32Array

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i]
        const z = positions[i + 2]
        positions[i + 1] =
          Math.sin(x * frequency + time) * amplitude +
          Math.cos(z * frequency + time) * amplitude
      }

      geometry.attributes.position.needsUpdate = true
      points.rotation.y = time * 0.1

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (isDisposed) return
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      isDisposed = true
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      scene.remove(points)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [theme, density, amplitude, frequency, speed])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.3 }}
    />
  )
}
