
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';

// Enable modern color management
THREE.ColorManagement.enabled = true;

const API_BASE = 'http://127.0.0.1:8000';

/**
 * SkeletalAvatar Component
 * Handles the loading and bone-level animation of the Gloss-generated motion.
 */
const SkeletalAvatar = ({ timeline, onSceneReady }) => {
    // Load the Mixamo avatar from public/avatar.glb
    const { scene } = useGLTF('/avatar.glb');
    const [frameIdx, setFrameIdx] = useState(0);
    const lastUpdate = useRef(0);

    // FIX 5: Debug bone names once
    useEffect(() => {
        console.log("--- AVATAR BONE STRUCTURE ---");
        scene.traverse((o) => {
            if (o.isBone) console.log(o.name);
        });
    }, [scene]);

    useEffect(() => {
        if (onSceneReady) onSceneReady(scene);
    }, [onSceneReady, scene]);

    // Bone Map for O(1) lookup during animation
    const boneMap = useMemo(() => {
        const map = new Map();
        scene.traverse((obj) => {
            if (obj.isBone) {
                // Store both original and lowercase for flexible matching
                map.set(obj.name, obj);
                map.set(obj.name.toLowerCase(), obj);
                // Also handle common Mixamo prefix variations (mixamorig_ or mixamorig)
                const strippedName = obj.name.replace(/^mixamorig_?/, '').replace(/^Mixamorig_?/, '');
                map.set(strippedName.toLowerCase(), obj);
            }
        });
        return map;
    }, [scene]);

    useEffect(() => {
        const LUA = boneMap.get('LeftUpperArm') || boneMap.get('leftupperarm');
        const RUA = boneMap.get('RightUpperArm') || boneMap.get('rightupperarm');
        const LFA = boneMap.get('LeftForeArm') || boneMap.get('leftforearm');
        const RFA = boneMap.get('RightForeArm') || boneMap.get('rightforearm');

        if (LUA) {
            LUA.rotation.z = Math.PI / 6;
            LUA.rotation.x = -Math.PI / 8;
        }
        if (RUA) {
            RUA.rotation.z = -Math.PI / 6;
            RUA.rotation.x = -Math.PI / 8;
        }
        if (LFA) LFA.rotation.x = -Math.PI / 6;
        if (RFA) RFA.rotation.x = -Math.PI / 6;
    }, [boneMap]);

    useFrame((state, delta) => {
        if (!timeline || timeline.length === 0) return;

        // Control playback speed (30 FPS)
        lastUpdate.current += delta;
        if (lastUpdate.current > 1 / 30) {
            setFrameIdx((prev) => (prev + 1) % timeline.length);
            lastUpdate.current = 0;
        }

        const currentFrame = timeline[frameIdx];
        if (!currentFrame || !currentFrame.bones) return;

        // Apply Bone Rotations
        Object.entries(currentFrame.bones).forEach(([boneName, rotation]) => {
            // Match against: original name, lowercase name, or stripped name
            let strippedKey = boneName.replace(/^mixamorig_?/, '').replace(/^Mixamorig_?/, '').toLowerCase();
            const bone = boneMap.get(boneName) || boneMap.get(boneName.toLowerCase()) || boneMap.get(strippedKey);

            if (bone) {
                // Use SLERP for smooth transitions
                const targetEuler = new THREE.Euler(rotation[0], rotation[1], rotation[2]);
                const targetQuaternion = new THREE.Quaternion().setFromEuler(targetEuler);

                const lower = boneName.toLowerCase();
                const isLeft = lower.startsWith('left');
                const isFinger = lower.includes('finger') || lower.includes('hand');
                const lerpFactor = isFinger && !isLeft ? 0.28 : isFinger && isLeft ? 0.14 : 0.12;

                bone.quaternion.slerp(targetQuaternion, lerpFactor);
            }
        });

        const clamp = THREE.MathUtils.clamp;
        ['LeftUpperArm', 'RightUpperArm'].forEach((name) => {
            const b = boneMap.get(name.toLowerCase());
            if (!b) return;
            b.rotation.y = clamp(b.rotation.y, -0.5, 0.5);
            b.rotation.z = clamp(b.rotation.z, -0.7, 0.7);
        });

        // Face Morph/Pitch
        if (currentFrame.face) {
            const head = boneMap.get('mixamorighead') || boneMap.get('head') || boneMap.get('mixamorig_head');
            if (head) {
                head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, currentFrame.face.head_pitch || 0, 0.1);
            }
        }
    });

    // FIX 1 & 2: Correct Scale and Position
    return (
        <group position={[0, -0.9, 0]} scale={1}>
            <primitive object={scene} />
        </group>
    );
};

const AutoFrameCamera = ({ targetRef }) => {
    const { camera, size } = useThree();
    const box = useMemo(() => new THREE.Box3(), []);
    const center = useMemo(() => new THREE.Vector3(), []);
    const target = useMemo(() => new THREE.Vector3(), []);

    useFrame(() => {
        const targetObj = targetRef.current;
        if (!targetObj) return;

        box.setFromObject(targetObj);
        if (!isFinite(box.min.y) || !isFinite(box.max.y)) return;

        box.getCenter(center);
        const boxSize = box.getSize(new THREE.Vector3());

        const fov = (camera.fov * Math.PI) / 180;
        const aspect = size.width / size.height;
        const fitHeightDistance = boxSize.y / (2 * Math.tan(fov / 2));
        const fitWidthDistance = boxSize.x / (2 * Math.tan(fov / 2)) / aspect;
        const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.15;

        target.copy(center);
        target.y += boxSize.y * 0.1;

        camera.position.lerp(
            new THREE.Vector3(target.x, target.y, target.z + distance),
            0.08
        );
        camera.lookAt(target);
    });

    return null;
};

const AvatarViewer = ({ motionUrl }) => {
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const avatarSceneRef = useRef(null);

    useEffect(() => {
        const fetchMotionData = async () => {
            if (!motionUrl) return;
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE}${motionUrl}`);
                setTimeline(response.data.timeline || []);
                setError(null);
            } catch (err) {
                console.error("Failed to load motion data:", err);
                setError("Motion data unavailable");
            } finally {
                setLoading(false);
            }
        };

        fetchMotionData();
    }, [motionUrl]);

    if (error) return (
        <div className="w-full h-full flex items-center justify-center bg-[#f5f6f8] rounded-[40px] text-red-400">
            {error}
        </div>
    );

    return (
        <div className="w-full h-full bg-[#f5f6f8] rounded-[40px] relative overflow-hidden group shadow-2xl border-4 border-white">
            {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-900 font-bold">Waking up Zephyr...</p>
                    </div>
                </div>
            )}

            <Canvas
                shadows
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    outputColorSpace: THREE.SRGBColorSpace,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.1,
                    preserveDrawingBuffer: true
                }}
            >
                {/* FIX 3 & 6: Correct Camera Position and LookAt Target */}
                <PerspectiveCamera
                    makeDefault
                    position={[0, 1.58, 2.15]}
                    fov={28}
                    onUpdate={(cam) => cam.lookAt(0, 1.48, 0)}
                />

                <color attach="background" args={['#f5f6f8']} />

                {/* Optimized Lighting Rig */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[2, 4, 3]} intensity={1.2} castShadow />
                <directionalLight position={[-2, 3, 2]} intensity={0.6} />
                <directionalLight position={[0, 2, -3]} intensity={0.4} />

                <Environment preset="studio" />

                <SkeletalAvatar
                    timeline={timeline}
                    onSceneReady={(scene) => {
                        avatarSceneRef.current = scene;
                    }}
                />
                <AutoFrameCamera targetRef={avatarSceneRef} />

                <ContactShadows
                    opacity={0.25}
                    scale={10}
                    blur={2}
                    far={10}
                    resolution={512}
                    color="#000000"
                    position={[0, -1.0, 0]}
                />
            </Canvas>

            {/* Quality Flags */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                <div className="bg-slate-900/10 backdrop-blur-md px-4 py-2 rounded-full border border-slate-900/5">
                    <span className="text-slate-900 text-xs font-bold uppercase tracking-widest">
                        GLB SKELETON • 30 FPS • LERP
                    </span>
                </div>
                <div className="flex gap-2">
                    <div className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></div>
                    <span className="text-green-600 text-[10px] font-bold">HD AVATAR READY</span>
                </div>
            </div>
        </div>
    );
};

export default AvatarViewer;
