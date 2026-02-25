import { useMemo, useRef, useState, type ComponentProps } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointMaterial, Points, Sparkles } from '@react-three/drei';
import {
    AdditiveBlending,
    type BufferGeometry,
    type ColorRepresentation,
    type Group,
    type Material,
    type Mesh,
    type PointLight,
    type Points as ThreePoints,
} from 'three';

type PointFieldProps = ComponentProps<typeof Points> & {
    count: number;
    spread: number;
    size: number;
    color: ColorRepresentation;
    opacity: number;
    speed: number;
    drift: number;
    direction?: 1 | -1;
};

interface OrbConfig {
    radius: number;
    speed: number;
    phase: number;
    size: number;
    color: ColorRepresentation;
}

function PointField({
    count,
    spread,
    size,
    color,
    opacity,
    speed,
    drift,
    direction = 1,
    ...props
}: PointFieldProps) {
    const ref = useRef<ThreePoints<BufferGeometry, Material | Material[]>>(null);
    const [positions] = useState(() => {
        const points = new Float32Array(count * 3);

        for (let i = 0; i < count; i += 1) {
            const offset = i * 3;
            points[offset] = (Math.random() - 0.5) * spread * 2.2;
            points[offset + 1] = (Math.random() - 0.5) * spread * 1.25;
            points[offset + 2] = (Math.random() - 0.5) * spread * 1.1;
        }

        return points;
    });

    useFrame(({ mouse }, delta) => {
        if (!ref.current) return;

        ref.current.rotation.y += direction * speed * delta;
        ref.current.rotation.x += direction * speed * 0.45 * delta;
        ref.current.position.x += (mouse.x * drift - ref.current.position.x) * 0.04;
        ref.current.position.y += (mouse.y * drift * 0.6 - ref.current.position.y) * 0.04;
    });

    return (
        <Points ref={ref} positions={positions as Float32Array} stride={3} frustumCulled={false} {...props}>
            <PointMaterial
                transparent
                color={color}
                size={size}
                sizeAttenuation
                depthWrite={false}
                opacity={opacity}
                blending={AdditiveBlending}
            />
        </Points>
    );
}

function CursorLight() {
    const lightRef = useRef<PointLight>(null);

    useFrame(({ mouse }) => {
        if (!lightRef.current) return;

        lightRef.current.position.x += (mouse.x * 2.5 - lightRef.current.position.x) * 0.1;
        lightRef.current.position.y += (mouse.y * 1.6 - lightRef.current.position.y) * 0.1;
    });

    return <pointLight ref={lightRef} position={[0, 0, 2.4]} intensity={1.2} distance={6} color="#f4b9c4" />;
}

function OrbitingOrbs() {
    const orbGroupRef = useRef<Group>(null);
    const orbRefs = useRef<Array<Mesh | null>>([]);
    const orbConfigs = useMemo<OrbConfig[]>(
        () => [
            { radius: 1.45, speed: 0.65, phase: 0.2, size: 0.07, color: '#ffe5eb' },
            { radius: 1.2, speed: 0.8, phase: 1.5, size: 0.06, color: '#f8ccd5' },
            { radius: 1.65, speed: 0.5, phase: 2.6, size: 0.08, color: '#ffd6df' },
            { radius: 1.05, speed: 0.95, phase: 3.1, size: 0.05, color: '#f3b8c4' },
            { radius: 1.85, speed: 0.42, phase: 4.4, size: 0.09, color: '#fce2e8' },
            { radius: 1.3, speed: 0.72, phase: 5.0, size: 0.06, color: '#efb2be' },
        ],
        [],
    );

    useFrame(({ clock, mouse }) => {
        const elapsed = clock.elapsedTime;

        if (orbGroupRef.current) {
            orbGroupRef.current.rotation.y += (mouse.x * 0.25 - orbGroupRef.current.rotation.y) * 0.04;
            orbGroupRef.current.rotation.x += (-mouse.y * 0.15 - orbGroupRef.current.rotation.x) * 0.04;
        }

        orbRefs.current.forEach((orb, index) => {
            const config = orbConfigs[index];
            if (!orb || !config) return;

            const angle = elapsed * config.speed + config.phase;
            orb.position.set(
                Math.cos(angle) * config.radius + mouse.x * 0.3,
                Math.sin(angle * 1.2) * config.radius * 0.42 + mouse.y * 0.2,
                Math.sin(angle) * config.radius * 0.55,
            );
        });
    });

    return (
        <group ref={orbGroupRef}>
            {orbConfigs.map((config, index) => (
                <mesh
                    key={index}
                    ref={(node) => {
                        orbRefs.current[index] = node;
                    }}
                >
                    <sphereGeometry args={[config.size, 18, 18]} />
                    <meshBasicMaterial color={config.color} transparent opacity={0.7} />
                </mesh>
            ))}
        </group>
    );
}

function Scene() {
    return (
        <>
            <fog attach="fog" args={['#0b0b0f', 3, 8]} />
            <ambientLight intensity={0.28} color="#ffe9ef" />
            <directionalLight position={[2.2, 2.8, 2.2]} intensity={0.35} color="#ffd3dc" />
            <CursorLight />
            <OrbitingOrbs />

            <PointField
                count={5200}
                spread={5.5}
                size={0.016}
                color="#e8aeb7"
                opacity={0.45}
                speed={0.12}
                drift={0.3}
            />
            <PointField
                count={2900}
                spread={7.5}
                size={0.012}
                color="#fce4ea"
                opacity={0.3}
                speed={0.08}
                drift={0.18}
                direction={-1}
            />
            <Sparkles
                count={80}
                scale={[6.2, 4.2, 4.2]}
                size={2.6}
                speed={0.4}
                opacity={0.45}
                color="#ffd9e1"
                noise={0.35}
            />
        </>
    );
}

export const BackgroundEffect = () => {
    const eventSource = typeof document !== 'undefined'
        ? document.getElementById('root') ?? undefined
        : undefined;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                pointerEvents: 'none',
                background:
                    'radial-gradient(ellipse at 15% 10%, rgba(232, 174, 183, 0.2) 0%, rgba(11, 11, 15, 0.95) 52%, rgba(11, 11, 15, 1) 100%)',
            }}
        >
            <Canvas
                eventSource={eventSource}
                eventPrefix="client"
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                camera={{ position: [0, 0, 4.6], fov: 48 }}
                dpr={[1, 1.8]}
            >
                <Scene />
            </Canvas>
        </div>
    );
};
