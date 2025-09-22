// Scene.tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";

const Scene = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    // === Tooth Group ===
    const toothGroup = new THREE.Group();

    // Crown (top)
    const crownGeometry = new THREE.SphereGeometry(1, 32, 32);
    crownGeometry.scale(1, 0.7, 1); // squash vertically
    const crownMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, // white enamel
      roughness: 0.2,
      clearcoat: 1.0,
    });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 0.6;
    toothGroup.add(crown);

    // Root (bottom)
    const rootGeometry = new THREE.ConeGeometry(0.4, 1.5, 32);
    const rootMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe8dcc0, // bone-like root color
      roughness: 0.4,
    });
    const root = new THREE.Mesh(rootGeometry, rootMaterial);
    root.position.y = -0.6;
    toothGroup.add(root);

    scene.add(toothGroup);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      toothGroup.rotation.y += 0.01; // rotate whole tooth
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
};

export default Scene;
