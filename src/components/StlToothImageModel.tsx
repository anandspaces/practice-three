import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Simple STL loader implementation
class STLLoader {
  load(url: string, onLoad: (geometry: THREE.BufferGeometry) => void, onProgress?: (event: ProgressEvent) => void, onError?: (error: any) => void) {
    const loader = new THREE.FileLoader();
    loader.setResponseType('arraybuffer');
    
    loader.load(
      url,
      (data) => {
        try {
          const geometry = this.parse(data as ArrayBuffer);
          onLoad(geometry);
        } catch (error) {
          if (onError) onError(error);
        }
      },
      onProgress,
      onError
    );
  }

  parse(data: ArrayBuffer): THREE.BufferGeometry {
    const view = new DataView(data);
    
    // Check if binary STL
    if (data.byteLength < 84) {
      throw new Error('Invalid STL file');
    }
    
    // Skip header (80 bytes) and read triangle count
    const triangles = view.getUint32(80, true);
    
    if (data.byteLength < 84 + triangles * 50) {
      throw new Error('Invalid STL file size');
    }
    
    const vertices = new Float32Array(triangles * 9);
    const normals = new Float32Array(triangles * 9);
    
    let offset = 84;
    
    for (let i = 0; i < triangles; i++) {
      // Read normal vector
      const nx = view.getFloat32(offset, true);
      const ny = view.getFloat32(offset + 4, true);
      const nz = view.getFloat32(offset + 8, true);
      offset += 12;
      
      // Read vertices
      for (let j = 0; j < 3; j++) {
        const vx = view.getFloat32(offset, true);
        const vy = view.getFloat32(offset + 4, true);
        const vz = view.getFloat32(offset + 8, true);
        offset += 12;
        
        const idx = i * 9 + j * 3;
        vertices[idx] = vx;
        vertices[idx + 1] = vy;
        vertices[idx + 2] = vz;
        
        normals[idx] = nx;
        normals[idx + 1] = ny;
        normals[idx + 2] = nz;
      }
      
      // Skip attribute byte count
      offset += 2;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    
    return geometry;
  }
}

const Scene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [loadingStatus, setLoadingStatus] = useState('Loading STL file...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const container = mountRef.current!;
    
    try {
      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);
      sceneRef.current = scene;
      
      // Create camera
      const camera = new THREE.PerspectiveCamera(
        50,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 10);
      cameraRef.current = camera;
      
      // Create renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;
      
      container.appendChild(renderer.domElement);

      // Add lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      
      const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight1.position.set(5, 5, 5);
      dirLight1.castShadow = true;
      dirLight1.shadow.camera.near = 0.1;
      dirLight1.shadow.camera.far = 50;
      dirLight1.shadow.camera.left = -10;
      dirLight1.shadow.camera.right = 10;
      dirLight1.shadow.camera.top = 10;
      dirLight1.shadow.camera.bottom = -10;
      scene.add(dirLight1);
      
      const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
      dirLight2.position.set(-5, -5, -5);
      scene.add(dirLight2);

      // Add grid helper
      // const gridHelper = new THREE.GridHelper(20, 20, 0xcccccc, 0xeeeeee);
      // scene.add(gridHelper);

      // Mouse interaction variables
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };

      // Mouse controls
      const handleMouseDown = (event: MouseEvent) => {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
        renderer.domElement.style.cursor = 'grabbing';
      };

      const handleMouseUp = () => {
        isDragging = false;
        renderer.domElement.style.cursor = 'grab';
      };

      const handleMouseMove = (event: MouseEvent) => {
        if (!isDragging) return;

        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        // Rotate camera around the scene
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(camera.position);
        
        spherical.theta -= deltaX * 0.01;
        spherical.phi += deltaY * 0.01;
        
        // Limit phi to avoid flipping
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        
        camera.position.setFromSpherical(spherical);
        camera.lookAt(0, 0, 0);

        previousMousePosition = { x: event.clientX, y: event.clientY };
      };

      const handleWheel = (event: WheelEvent) => {
        event.preventDefault();
        const zoomSpeed = 0.1;
        const direction = event.deltaY > 0 ? 1 : -1;
        
        camera.position.multiplyScalar(1 + direction * zoomSpeed);
        
        // Limit zoom
        const distance = camera.position.length();
        if (distance < 1) {
          camera.position.normalize().multiplyScalar(1);
        } else if (distance > 50) {
          camera.position.normalize().multiplyScalar(50);
        }
      };

      // Add event listeners
      renderer.domElement.addEventListener('mousedown', handleMouseDown);
      renderer.domElement.addEventListener('mouseup', handleMouseUp);
      renderer.domElement.addEventListener('mousemove', handleMouseMove);
      renderer.domElement.addEventListener('wheel', handleWheel);
      renderer.domElement.style.cursor = 'grab';

      // Try to load STL file
      const loader = new STLLoader();
      setIsLoading(true);
      setLoadingStatus('Loading STL file...');
      
      loader.load(
        '/outer_layer.stl', // Make sure to place your STL file in the public folder
        (geometry) => {
          try {
            // Center and scale the geometry
            geometry.computeBoundingBox();
            const boundingBox = geometry.boundingBox!;
            const center = boundingBox.getCenter(new THREE.Vector3());
            const size = boundingBox.getSize(new THREE.Vector3());
            
            // Scale to fit in a reasonable size (max dimension = 4 units)
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 4 / maxDim;
            
            geometry.translate(-center.x, -center.y, -center.z);
            geometry.scale(scale, scale, scale);
            
            // Compute vertex normals for smooth shading
            geometry.computeVertexNormals();
            
            // Create material
            const material = new THREE.MeshPhongMaterial({
              color: 0xffffff,
              specular: 0x111111,
              shininess: 200,
              side: THREE.DoubleSide
            });
            
            // Create mesh
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            scene.add(mesh);
            
            setLoadingStatus('STL loaded successfully!');
            setIsLoading(false);
          } catch (error) {
            console.error('Error processing STL:', error);
            setLoadingStatus('Error processing STL file');
            setIsLoading(false);
          }
        },
        (progress) => {
          if (progress.lengthComputable) {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setLoadingStatus(`Loading STL... ${percent}%`);
          }
        },
        (error) => {
          console.error('Failed to load STL file:', error);
          setLoadingStatus('Failed to load outer_layer.stl - check if file exists in public folder');
          setIsLoading(false);
        }
      );

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();

      // Handle resize
      const handleResize = () => {
        if (camera && renderer && container) {
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        }
      };
      
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        renderer.domElement.removeEventListener('mousedown', handleMouseDown);
        renderer.domElement.removeEventListener('mouseup', handleMouseUp);
        renderer.domElement.removeEventListener('mousemove', handleMouseMove);
        renderer.domElement.removeEventListener('wheel', handleWheel);
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    } catch (err) {
      console.error('Error initializing:', err);
      setLoadingStatus('Error initializing 3D viewer');
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="w-full h-screen bg-gray-100 relative">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        
        <div className="text-sm">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
            isLoading ? 'bg-yellow-400' : 'bg-green-400'
          }`}></span>
          <span className="text-gray-700">{loadingStatus}</span>
        </div>
      </div>

      {/* 3D Viewer */}
      <div 
        ref={mountRef} 
        className="w-full h-full"
      />
    </div>
  );
};

export default Scene;