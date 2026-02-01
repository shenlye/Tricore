'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Line } from '@react-three/drei'
import { useEffect } from 'react'

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

function CameraLogger() {
  const { camera } = useThree()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c') {
        console.log('Position:', camera.position)
        console.log('Rotation:', camera.rotation)
        console.log('Quaternion:', camera.quaternion)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [camera])

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
      
        <fog attach="fog" args={['#0a0a0a', 0, 100]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
          <MeasurementGrid />
        <Ground />
      </Canvas>
    </div>
  )
}
