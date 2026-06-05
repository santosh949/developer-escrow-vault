"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const fragmentShader = `
uniform float uTime;
varying vec2 vUv;

void main() {
    vec2 p = vUv * 2.0 - 1.0;
    
    // Slow liquid distortion
    float t = uTime * 0.3;
    float dist = length(p);
    
    float wave = sin(dist * 5.0 - t) * cos(p.x * 3.0 + t);
    float glow = smoothstep(0.5, 0.0, dist + wave * 0.2);
    
    // Obsidian base with cyan/emerald hints
    vec3 obsidian = vec3(0.01, 0.015, 0.02);
    vec3 cyan = vec3(0.0, 0.9, 0.6);
    vec3 emerald = vec3(0.1, 0.8, 0.3);
    
    vec3 finalColor = mix(obsidian, cyan * 0.08, glow);
    finalColor = mix(finalColor, emerald * 0.05, sin(t + dist * 2.0) * 0.5 + 0.5);
    
    // Scanline effect
    float scanline = sin(vUv.y * 800.0) * 0.02;
    finalColor -= scanline;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

function ShaderMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function LiquidObsidian() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-black">
      <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
        <ShaderMesh />
      </Canvas>
    </div>
  );
}
