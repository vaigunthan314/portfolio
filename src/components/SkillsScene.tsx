'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function RotatingGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.25 + pointer.y * 0.5;
      meshRef.current.rotation.y = t * 0.35 + pointer.x * 0.5;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = -t * 0.3;
      innerRef.current.rotation.y = -t * 0.2;
    }
  });

  return (
    <group>
      {/* Outer Icosahedron in solid red wireframe */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial wireframe color="#d93025" />
      </mesh>
      {/* Inner Octahedron in solid light wireframe */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshBasicMaterial wireframe color="#f4f3ef" />
      </mesh>
    </group>
  );
}

export default function SkillsScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '100px' }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        dpr={[1, 1.5]}
        frameloop={isVisible ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <RotatingGeometry />
      </Canvas>
    </div>
  );
}
