"use client";
/**
 * A 3D animated visual for the login/register screens — an abstract
 * pulse/trace line looping through space, echoing the EKG-trace motif
 * used elsewhere in the product (the sidebar hairline, the timeline
 * connector), rendered in 3D instead of flat SVG. Kept subtle: soft teal,
 * slow auto-rotation, no interaction required, transparent background so
 * it sits naturally over the page.
 */
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function buildTracePoints(): THREE.Vector3[] {
  // A heartbeat-like waveform, extruded into a gentle 3D spiral so it
  // reads as a "living" signal rather than a flat chart line.
  const points: THREE.Vector3[] = [];
  const segments = 240;
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 4;
    const beat = Math.sin(t * 3) * Math.exp(-(((t % (Math.PI / 1.5)) - 0.35) ** 2) * 40);
    const x = Math.cos(t * 0.5) * 2.4;
    const z = Math.sin(t * 0.5) * 2.4;
    const y = beat * 0.9 + Math.sin(t * 0.2) * 0.15;
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

function TraceRibbon() {
  const groupRef = useRef<THREE.Group>(null);
  const points = useMemo(buildTracePoints, []);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, true), [points]);
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 400, 0.045, 12, true), [curve]);

  const particleGeo = useMemo(() => {
    const count = 140;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3.2 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.0002) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#1F5275"
          emissive="#3E86B5"
          emissiveIntensity={1.6}
          roughness={0.25}
          metalness={0.2}
        />
      </mesh>
      <points geometry={particleGeo}>
        <pointsMaterial color="#2E7953" size={0.05} transparent opacity={0.7} sizeAttenuation />
      </points>
    </group>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Static radial glow — guarantees visible color immediately, even
          during the brief moment before the WebGL canvas finishes mounting. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(62,134,181,0.18) 0%, rgba(46,121,83,0.07) 35%, transparent 65%)",
        }}
      />
      <Canvas
        camera={{ position: [0, 1.2, 6.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 3, 3]} intensity={60} color="#3E86B5" />
        <pointLight position={[-3, -2, -3]} intensity={25} color="#123A56" />
        <TraceRibbon />
      </Canvas>
    </div>
  );
}
