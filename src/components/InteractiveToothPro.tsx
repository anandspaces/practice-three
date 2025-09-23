import * as THREE from "three";
import { useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const Scene = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);

    // 4. Cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // 5. Light
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    // 6. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // smooth motion
    controls.dampingFactor = 0.05;
    controls.maxDistance = 10; // how far you can zoom out
    controls.minDistance = 2;  // how close you can zoom in

    // 7. Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 8. Cleanup
    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default Scene;
