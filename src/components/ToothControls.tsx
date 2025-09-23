import * as THREE from "three";
import { useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Enamel (outer shiny white)
const enamelMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.15,
  metalness: 0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.05,
});

// Dentin (yellowish layer)
const dentinMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xfff1b8,
  roughness: 0.4,
  metalness: 0,
});

// Root (matte, off-white)
const rootMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xe0d6c6,
  roughness: 0.6,
  metalness: 0,
});


const Scene = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scene + Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 6);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);


    // Ambient light (soft overall)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Directional light (sunlight-like)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Point light (warm lamp)
    const pointLight = new THREE.PointLight(0xfff2cc, 0.8, 20);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // // Light
    // const light = new THREE.PointLight(0xffffff, 1);
    // light.position.set(5, 5, 5);
    // scene.add(light);

    const crownGeometry = new THREE.SphereGeometry(1, 32, 32);
    crownGeometry.scale(1, 0.8, 1);
    const crown = new THREE.Mesh(crownGeometry, enamelMaterial);
    crown.position.y = 1;
    scene.add(crown);

    // Neck (dentin)
    const neckGeometry = new THREE.CylinderGeometry(0.6, 0.7, 0.3, 32);
    const neck = new THREE.Mesh(neckGeometry, dentinMaterial);
    neck.position.y = 0.3;
    scene.add(neck);

    // Root (matte)
    const rootGeometry = new THREE.ConeGeometry(0.5, 1.5, 32);
    const root = new THREE.Mesh(rootGeometry, rootMaterial);
    root.position.y = -0.7;
    scene.add(root);


    // // 🦷 Crown (sphere, squished)
    // const crownGeometry = new THREE.SphereGeometry(1, 32, 32);
    // crownGeometry.scale(1, 0.8, 1); // make it slightly flat
    // const crownMaterial = new THREE.MeshStandardMaterial({
    //   color: 0xffffff,
    //   roughness: 0.2,
    //   metalness: 0.1,
    // });
    // const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    // crown.position.y = 1;
    // scene.add(crown);
    // Crown (enamel)

    // // 🦷 Neck (cylinder)
    // const neckGeometry = new THREE.CylinderGeometry(0.6, 0.7, 0.3, 32);
    // const neck = new THREE.Mesh(neckGeometry, crownMaterial);
    // neck.position.y = 0.3;
    // scene.add(neck);

    // // 🦷 Root (cone)
    // const rootGeometry = new THREE.ConeGeometry(0.5, 1.5, 32);
    // const root = new THREE.Mesh(rootGeometry, crownMaterial);
    // root.position.y = -0.7;
    // scene.add(root);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      crown.rotation.y += 0.01;
      neck.rotation.y += 0.01;
      root.rotation.y += 0.01;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default Scene;
