import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 150
const DIST = 3.2
const SPEED = 0.003
const HALF = 10

function Field() {
  const pointsRef = useRef<THREE.Points>(null!)
  const linesRef = useRef<THREE.LineSegments>(null!)

  const { posArr, velArr } = useMemo(() => {
    const posArr = new Float32Array(COUNT * 3)
    const velArr = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      posArr[i * 3] = (Math.random() - 0.5) * HALF * 2
      posArr[i * 3 + 1] = (Math.random() - 0.5) * HALF
      posArr[i * 3 + 2] = (Math.random() - 0.5) * HALF
      velArr[i * 3] = (Math.random() - 0.5) * SPEED
      velArr[i * 3 + 1] = (Math.random() - 0.5) * SPEED
      velArr[i * 3 + 2] = (Math.random() - 0.5) * SPEED * 0.5
    }
    return { posArr, velArr }
  }, [])

  const pointGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(posArr.slice(), 3))
    return g
  }, [posArr])

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const maxLines = COUNT * 10
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxLines * 6), 3))
    g.setDrawRange(0, 0)
    return g
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current || !linesRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    const t = clock.getElapsedTime()

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] += velArr[i * 3]
      pos[i * 3 + 1] += velArr[i * 3 + 1] + Math.sin(t * 0.2 + i) * 0.0008
      pos[i * 3 + 2] += velArr[i * 3 + 2]
      if (Math.abs(pos[i * 3]) > HALF) velArr[i * 3] *= -1
      if (Math.abs(pos[i * 3 + 1]) > HALF * 0.6) velArr[i * 3 + 1] *= -1
      if (Math.abs(pos[i * 3 + 2]) > HALF * 0.6) velArr[i * 3 + 2] *= -1
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true

    const linePos = linesRef.current.geometry.attributes.position.array as Float32Array
    let count = 0
    const max = linePos.length / 6

    for (let i = 0; i < COUNT && count < max; i++) {
      for (let j = i + 1; j < COUNT && count < max; j++) {
        const dx = pos[i * 3] - pos[j * 3]
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2]
        const d2 = dx * dx + dy * dy + dz * dz
        if (d2 < DIST * DIST) {
          const b = count * 6
          linePos[b] = pos[i * 3]; linePos[b + 1] = pos[i * 3 + 1]; linePos[b + 2] = pos[i * 3 + 2]
          linePos[b + 3] = pos[j * 3]; linePos[b + 4] = pos[j * 3 + 1]; linePos[b + 5] = pos[j * 3 + 2]
          count++
        }
      }
    }

    linesRef.current.geometry.setDrawRange(0, count * 2)
    linesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <>
      <points ref={pointsRef} geometry={pointGeo}>
        <pointsMaterial color="#00ff41" size={0.04} transparent opacity={0.8} sizeAttenuation />
      </points>
      <lineSegments ref={linesRef} geometry={lineGeo}>
        <lineBasicMaterial color="#00ff41" transparent opacity={0.15} />
      </lineSegments>
    </>
  )
}

export default function NeuralField() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <Field />
      </Canvas>
    </div>
  )
}
