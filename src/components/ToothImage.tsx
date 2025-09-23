import * as THREE from "three";
import { useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const Scene = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(3, 5, 5);
    scene.add(directionalLight);

    // Load texture (main image)
    const textureLoader = new THREE.TextureLoader();
    const colorTexture = textureLoader.load("/tooth.png"); // your image path

    // (Optional) Depth/Displacement map (grayscale image)
    // If you don’t have it, remove `displacementMap` and `displacementScale`
    // const depthTexture = textureLoader.load("/tooth_depth.png");

    // Geometry (subdivisions allow displacement)
    const geometry = new THREE.PlaneGeometry(3, 3, 256, 256);

    // Material
    const material = new THREE.MeshStandardMaterial({
      map: colorTexture,
      // displacementMap: depthTexture, // remove if no depth map
      displacementScale: 0.3,        // tweak depth effect
      side: THREE.DoubleSide,
    });

    // Mesh
    const imageMesh = new THREE.Mesh(geometry, material);
    scene.add(imageMesh);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
};

export default Scene;
