// Scene.tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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
    camera.position.set(0, 1.5, 5);

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
    crownGeometry.scale(1, 0.7, 1);
    const crownMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.2,
      clearcoat: 1.0,
    });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 0.6;
    toothGroup.add(crown);

    // Root (bottom)
    const rootGeometry = new THREE.ConeGeometry(0.4, 1.5, 32);
    const rootMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe8dcc0,
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

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // smooth motion
    controls.dampingFactor = 0.05;
    controls.enablePan = false; // optional: lock panning
    controls.minDistance = 2;   // min zoom
    controls.maxDistance = 8;   // max zoom

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
};

export default Scene;
