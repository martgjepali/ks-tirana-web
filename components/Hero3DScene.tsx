"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  PresentationControls,
  Sparkles,
  ContactShadows,
  useTexture,
} from "@react-three/drei";
import type { Mesh } from "three";

function Badge() {
  const texture = useTexture("/images/Tirana_Club_Logo.svg.webp");
  const rimRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (rimRef.current) rimRef.current.rotation.z += delta * 0.12;
  });

  return (
    <group>
      {/* metallic rim behind the badge, for depth */}
      <mesh ref={rimRef} position={[0, 0, -0.08]}>
        <torusGeometry args={[1.42, 0.045, 32, 100]} />
        <meshStandardMaterial
          color="#dab766"
          metalness={1}
          roughness={0.25}
        />
      </mesh>
      {/* dark backing disc for thickness */}
      <mesh position={[0, 0, -0.06]}>
        <circleGeometry args={[1.45, 64]} />
        <meshStandardMaterial
          color="#0a1730"
          metalness={0.6}
          roughness={0.5}
        />
      </mesh>
      {/* the real crest */}
      <mesh castShadow>
        <planeGeometry args={[2.35, 2.35 * (1525 / 960)]} />
        <meshStandardMaterial
          map={texture}
          transparent
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}

function Rig() {
  useFrame((state) => {
    state.camera.position.x +=
      (state.pointer.x * 0.6 - state.camera.position.x) * 0.04;
    state.camera.position.y +=
      (state.pointer.y * 0.3 - state.camera.position.y) * 0.04;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Hero3DScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 5.2], fov: 38 }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[3, 4, 5]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-4, -2, 2]} intensity={0.5} color="#3f7cff" />

      <Suspense fallback={null}>
        <Environment preset="city" environmentIntensity={0.6} />
        <PresentationControls
          global
          snap
          rotation={[0, 0.25, 0]}
          polar={[-0.3, 0.3]}
          azimuth={[-0.7, 0.7]}
        >
          <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.7}>
            <Badge />
          </Float>
        </PresentationControls>
        <Sparkles
          count={36}
          scale={[5, 6, 3]}
          size={2.4}
          speed={0.3}
          opacity={0.7}
          color="#dab766"
        />
        <ContactShadows
          position={[0, -1.7, 0]}
          opacity={0.4}
          scale={6}
          blur={2.6}
          far={2}
        />
      </Suspense>
      <Rig />
    </Canvas>
  );
}
