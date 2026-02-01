'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { Line } from '@react-three/drei'
import { useEffect } from 'react'
import React from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

function MeasurementGrid({
  size = 40,
  divisions = 5,
  overflow = 0.5,
  pinLength = 12,
  gridHeight = 2
}) {
  const lines = []
  const step = size / divisions
  const half = size / 2

  // 生成水平的主网格线 (XZ平面，高度在 gridHeight)
  for (let i = 0; i <= divisions; i++) {
    const pos = -half + i * step

    // 沿 X 轴的横线
    lines.push(
      <Line
        key={`x-${i}`}
        points={[[-half - overflow, gridHeight, pos], [half + overflow, gridHeight, pos]]}
        color="#888"
        lineWidth={1}
        transparent
        opacity={0.5}
      />
    )

    // 沿 Z 轴的纵线
    lines.push(
      <Line
        key={`z-${i}`}
        points={[[pos, gridHeight, -half - overflow], [pos, gridHeight, half + overflow]]}
        color="#888"
        lineWidth={1}
        transparent
        opacity={0.5}
      />
    )
  }

  // 在每个交叉点生成垂直的线 (沿 Y 轴)
  for (let i = 0; i <= divisions; i++) {
    for (let j = 0; j <= divisions; j++) {
      const x = -half + i * step
      const z = -half + j * step

      lines.push(
        <Line
          key={`pin-${i}-${j}`}
          points={[
            [x, gridHeight - pinLength * 0.7, z],
            [x, gridHeight + pinLength * 0.3, z]
          ]}
          color="#888"
          lineWidth={1.2}
          transparent
          opacity={0.8}
        />
      )
    }
  }

  return <group>{lines}</group>
}

function CameraLogger({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsImpl | null> }) {
  const { camera } = useThree()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c') {
        const pos = camera.position
        const rot = camera.rotation
        const tar = controlsRef.current?.target || { x: 0, y: 0, z: 0 }
        console.log(`Position: [${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}]`)
        console.log(`Rotation: [${rot.x.toFixed(2)}, ${rot.y.toFixed(2)}, ${rot.z.toFixed(2)}]`)
        console.log("GSAP Config:", {
          position: { x: pos.x, y: pos.y, z: pos.z },
          rotation: { x: rot.x, y: rot.y, z: rot.z },
          target: { x: tar.x, y: tar.y, z: tar.z }
        });
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [camera, controlsRef])

  return null
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -9, 0]}
      receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#323232" />
    </mesh>
  )
}

export default function ThreeBackground() {
  const controlsRef = React.useRef<OrbitControlsImpl>(null);
  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%', 
        height: '100vh', 
        background: '#0a0a0a',
        zIndex: -1
      }}
    >
      <Canvas>
        <PerspectiveCamera
          makeDefault
          position={[-10.19, -2.82, -5.57]}
          rotation={[3.14, -1.12, 3.14]}
          fov={70}
        />
        <OrbitControls
          ref={controlsRef}
          enableDamping={true} 
          dampingFactor={0.05}
          makeDefault
        />
        <CameraLogger controlsRef={controlsRef} />
        <fog attach="fog" args={['#0a0a0a', 0, 100]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
          <MeasurementGrid />
        <Ground />
      </Canvas>
    </div>
  )
}
