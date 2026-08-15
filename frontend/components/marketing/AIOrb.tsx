"use client";
/**
 * The hero's central 3D visualization: a translucent core with a slow
 * wireframe outer shell and a thin ring of orbiting data points —
 * representing labs, vitals, medications, timeline, insights collapsing
 * into one intelligence layer. Kept restrained (no game-like glow storms,
 * no bloom postprocessing) so it reads as enterprise health-tech, not sci-fi.
 */
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function OrbitRing({ radius, count, speed, color, size }: { radius: number; count: number; speed: number; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null);
  const positions = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      pts.push([Math.cos(a) * radius, (Math.random() - 0.5) * 0.3, Math.sin(a) * radius]);
    }
    return pts;
  }, [count, radius]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });

  return (
    <group ref={ref}>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[size, 10, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.1} />
        </mesh>
      ))}
    </group>
  );
}

function Core() {
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (coreRef.current) coreRef.current.rotation.y += delta * 0.12;
    if (shellRef.current) {
      shellRef.current.rotation.y -= delta * 0.06;
      shellRef.current.rotation.x = Math.sin(Date.now() * 0.0001) * 0.1;
    }
  });

  return (
    <>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.05, 2]} />
        <meshStandardMaterial color="#087EA4" emissive="#12B8A6" emissiveIntensity={0.55} roughness={0.3} metalness={0.4} transparent opacity={0.85} />
      </mesh>
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[1.55, 1]} />
        <meshStandardMaterial color="#67E8F9" wireframe transparent opacity={0.18} />
      </mesh>
    </>
  );
}

export default function AIOrb() {
  return (
    <div className="w-full h-full" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 5.2], fov: 42 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 2, 4]} intensity={45} color="#67E8F9" />
        <pointLight position={[-3, -2, -3]} intensity={20} color="#A78BFA" />
        <Core />
        <OrbitRing radius={2.3} count={5} speed={0.18} color="#12B8A6" size={0.06} />
        <OrbitRing radius={2.8} count={4} speed={-0.12} color="#A78BFA" size={0.05} />
      </Canvas>
    </div>
  );
}
