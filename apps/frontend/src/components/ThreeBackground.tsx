"use client";

import type { MotionValue } from "motion/react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Line, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useMouse } from "@/hooks/use-mouse";

function MeasurementGrid({
  size = 40,
  divisions = 4,
  overflow = 0.5,
  pinLength = 14,
  gridHeight = 3,
}) {
  const lines = [];
  const step = size / divisions;
  const half = size / 2;

  // 生成水平的主网格线 (XZ平面，高度在 gridHeight)
  for (let i = 0; i <= divisions; i++) {
    const pos = -half + i * step;

    // 沿 X 轴的横线
    lines.push(
      <Line
        key={`x-${i}`}
        points={[[-half - overflow, gridHeight, pos], [half + overflow, gridHeight, pos]]}
        color="#888"
        lineWidth={1}
        transparent
        opacity={0.5}
      />,
    );

    // 沿 Z 轴的纵线
    lines.push(
      <Line
        key={`z-${i}`}
        points={[[pos, gridHeight, -half - overflow], [pos, gridHeight, half + overflow]]}
        color="#888"
        lineWidth={1}
        transparent
        opacity={0.5}
      />,
    );
  }

  // 在每个交叉点生成垂直的线 (沿 Y 轴)
  for (let i = 0; i <= divisions; i++) {
    for (let j = 0; j <= divisions; j++) {
      const x = -half + i * step;
      const z = -half + j * step;

      lines.push(
        <Line
          key={`pin-${i}-${j}`}
          points={[
            [x, gridHeight - pinLength * 0.7, z],
            [x, gridHeight + pinLength * 0.3, z],
          ]}
          color="#888"
          lineWidth={1.2}
          transparent
          opacity={0.8}
        />,
      );
    }
  }

  return <group>{lines}</group>;
}

function CameraLogger({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsImpl | null> }) {
  const { camera } = useThree();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c") {
        const pos = camera.position;
        const rot = camera.rotation;
        const tar = controlsRef.current?.target || { x: 0, y: 0, z: 0 };
        console.log(`Position: [${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}]`);
        console.log(`Rotation: [${rot.x.toFixed(2)}, ${rot.y.toFixed(2)}, ${rot.z.toFixed(2)}]`);
        console.log("GSAP Config:", {
          position: { x: pos.x, y: pos.y, z: pos.z },
          rotation: { x: rot.x, y: rot.y, z: rot.z },
          target: { x: tar.x, y: tar.y, z: tar.z },
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camera, controlsRef]);

  return null;
}

function Ground() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -9, 0]}
      receiveShadow
    >
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#323232" />
    </mesh>
  );
}

function Rig({ mouse }: { mouse?: { x: MotionValue<number>; y: MotionValue<number> } }) {
  const yawRef = useRef<THREE.Group>(null!);
  const pitchRef = useRef<THREE.Group>(null!);

  const basePosition: [number, number, number] = [-3.04, -4.04, 17.78];
  const baseYaw = -0.125;
  const basePitch = 0.20;

  useFrame((state) => {
    // Use global mouse context if available (x/y are -0.5 to 0.5, so *2 to match -1 to 1)
    const px = mouse ? mouse.x.get() * 2 : state.pointer.x;
    const py = mouse ? mouse.y.get() * 2 : state.pointer.y;

    const offsetY = -px * 0.1;
    const offsetX = -py * 0.1;

    yawRef.current.rotation.y = THREE.MathUtils.lerp(
      yawRef.current.rotation.y,
      baseYaw + offsetY,
      0.1,
    );

    pitchRef.current.rotation.x = THREE.MathUtils.lerp(
      pitchRef.current.rotation.x,
      basePitch + offsetX,
      0.1,
    );
  });

  return (
    <group ref={yawRef} position={basePosition}>
      <group ref={pitchRef}>
        <PerspectiveCamera makeDefault fov={70} />
      </group>
    </group>
  );
}

export default function ThreeBackground() {
  const controlsRef = React.useRef<OrbitControlsImpl>(null);
  const isAdjusting = false;
  const mouse = useMouse();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        background: "#0a0a0a",
        zIndex: -1,
      }}
    >
      <Canvas>
        <CameraLogger controlsRef={controlsRef} />
        <fog attach="fog" args={["#0a0a0a", 0, 100]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <MeasurementGrid />
        <Ground />

        {isAdjusting
          ? (
              <>
                <PerspectiveCamera
                  makeDefault
                  position={[0, 5, 20]}
                  fov={70}
                />
                <OrbitControls ref={controlsRef} makeDefault />
              </>
            )
          : (
              <Rig mouse={mouse} />
            )}
      </Canvas>
    </div>
  );
}
