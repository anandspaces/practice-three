import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const traceBoundary = (
  alpha: Uint8ClampedArray,
  w: number,
  h: number,
  threshold = 10
): { x: number; y: number }[] => {
  const isOpaque = (x: number, y: number) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return false;
    return alpha[y * w + x] > threshold;
  };

  let startX = -1, startY = -1;
  outer: for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!isOpaque(x, y)) continue;
      for (let ny = -1; ny <= 1; ny++) {
        for (let nx = -1; nx <= 1; nx++) {
          if (nx === 0 && ny === 0) continue;
          if (!isOpaque(x + nx, y + ny)) {
            startX = x;
            startY = y;
            break outer;
          }
        }
      }
    }
  }

  if (startX === -1) return [];

  const visited = new Set<string>();
  const boundary: { x: number; y: number }[] = [];
  let cx = startX, cy = startY;
  let prevDir = 0;
  
  const dirs = [
    [1, 0], [1, -1], [0, -1], [-1, -1],
    [-1, 0], [-1, 1], [0, 1], [1, 1],
  ];

  const key = (x: number, y: number) => `${x},${y}`;
  let safety = 0;
  
  do {
    safety++;
    if (safety > 20000) break;
    boundary.push({ x: cx, y: cy });
    visited.add(key(cx, cy));

    let found = false;
    let startSearch = (prevDir + 6) % 8;
    
    for (let i = 0; i < 8; i++) {
      const di = (startSearch + i) % 8;
      const nx = cx + dirs[di][0];
      const ny = cy + dirs[di][1];
      
      if (isOpaque(nx, ny)) {
        let hasTransNeighbor = false;
        for (let yy = -1; yy <= 1 && !hasTransNeighbor; yy++) {
          for (let xx = -1; xx <= 1; xx++) {
            if (xx === 0 && yy === 0) continue;
            if (!isOpaque(nx + xx, ny + yy)) {
              hasTransNeighbor = true;
              break;
            }
          }
        }
        if (hasTransNeighbor) {
          if (!visited.has(key(nx, ny))) {
            cx = nx;
            cy = ny;
            prevDir = di;
            found = true;
            break;
          } else {
            cx = nx;
            cy = ny;
            prevDir = di;
            found = true;
            break;
          }
        }
      }
    }

    if (!found) break;
  } while (!(cx === startX && cy === startY));

  return boundary;
};

const loadSVGAsImage = (svgPath: string, width: number = 512, height: number = 512): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    // First, fetch the SVG content
    fetch(svgPath)
      .then(response => response.text())
      .then(svgText => {
        // Create a blob from the SVG text
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG as image'));
        };
        
        // Set size for rasterization
        img.width = width;
        img.height = height;
        img.src = url;
      })
      .catch(reject);
  });
};

const Scene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    const container = mountRef.current!;
    
    try {
      // Create scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      // Create camera
      const camera = new THREE.PerspectiveCamera(
        50,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 6);
      cameraRef.current = camera;
      
      // Create renderer with transparent background
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x000000, 0); // Transparent background
      rendererRef.current = renderer;
      
      container.appendChild(renderer.domElement);

      // Add lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(3, 5, 5);
      scene.add(dirLight);

      // Mouse interaction variables
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };

      // Mouse controls
      const handleMouseDown = (event: MouseEvent) => {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
      };

      const handleMouseUp = () => {
        isDragging = false;
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
        } else if (distance > 20) {
          camera.position.normalize().multiplyScalar(20);
        }
      };

      // Add event listeners
      renderer.domElement.addEventListener('mousedown', handleMouseDown);
      renderer.domElement.addEventListener('mouseup', handleMouseUp);
      renderer.domElement.addEventListener('mousemove', handleMouseMove);
      renderer.domElement.addEventListener('wheel', handleWheel);
      renderer.domElement.style.cursor = 'grab';

      // Try to load the SVG image
      const rasterSize = 512; // Size for rasterization
      
      loadSVGAsImage('/search.svg', rasterSize, rasterSize)
        .then(img => {
          try {
            const w = img.width || rasterSize;
            const h = img.height || rasterSize;

            // Create canvas and draw the SVG image
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d')!;
            
            // Set white background for better visibility
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, w, h);
            
            // Draw the image
            ctx.drawImage(img, 0, 0, w, h);
            
            const imgData = ctx.getImageData(0, 0, w, h);
            const alpha = new Uint8ClampedArray(w * h);
            
            // Extract alpha channel (for transparency) or use luminance for solid SVGs
            for (let i = 0; i < w * h; i++) {
              const r = imgData.data[i * 4];
              const g = imgData.data[i * 4 + 1];
              const b = imgData.data[i * 4 + 2];
              const a = imgData.data[i * 4 + 3];
              
              // If the pixel has transparency, use alpha channel
              // Otherwise, use luminance (darker pixels = more transparent)
              if (a < 255) {
                alpha[i] = a;
              } else {
                // Convert to grayscale and invert (white becomes transparent)
                const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                alpha[i] = 255 - luminance; // Invert so dark areas are opaque
              }
            }

            // First, create a simple textured plane as fallback
            const planeGeometry = new THREE.PlaneGeometry(3, (3 * h) / w);
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            
            const planeMaterial = new THREE.MeshStandardMaterial({
              map: texture,
              transparent: true,
              alphaTest: 0.1,
              side: THREE.DoubleSide,
            });
            
            const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
            scene.add(planeMesh);

            // Now try to trace boundary for extruded version
            const boundary = traceBoundary(alpha, w, h, 50); // Higher threshold for SVG
            
            if (boundary.length > 0) {
              const targetWidth = 3;
              const scale = targetWidth / w;
              const points: THREE.Vector2[] = boundary.map((p) => {
                const x = (p.x - w / 2) * scale;
                const y = (h / 2 - p.y) * scale;
                return new THREE.Vector2(x, y);
              });

              // Simplify points
              const simplified: THREE.Vector2[] = [];
              const tol = 1e-3;
              for (let i = 0; i < points.length; i++) {
                const a = points[(i - 1 + points.length) % points.length];
                const b = points[i];
                const c = points[(i + 1) % points.length];
                const area = Math.abs(
                  (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
                );
                if (area > tol) simplified.push(b);
              }

              if (simplified.length >= 3) {
                const shape = new THREE.Shape(simplified);
                const extrudeSettings = {
                  depth: 0.15,
                  bevelEnabled: true,
                  bevelThickness: 0.02,
                  bevelSize: 0.02,
                  steps: 1,
                };

                const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                const extrudeMaterial = new THREE.MeshStandardMaterial({
                  map: texture,
                  transparent: true,
                  side: THREE.DoubleSide,
                  color: 0xffffff
                });

                const extrudedMesh = new THREE.Mesh(extrudeGeometry, extrudeMaterial);
                
                // Center the geometry
                extrudeGeometry.computeBoundingBox();
                if (extrudeGeometry.boundingBox) {
                  const center = extrudeGeometry.boundingBox.getCenter(new THREE.Vector3());
                  extrudedMesh.position.sub(center);
                }
                
                scene.add(extrudedMesh);
              }
            }
          } catch (err) {
            console.error('Error processing SVG image:', err);
          }
        })
        .catch(err => {
          console.error('Failed to load SVG - check if tooth.svg exists in public folder:', err);
          
          // Create a fallback shape
          const shape = new THREE.Shape();
          shape.moveTo(-1, -1);
          shape.lineTo(1, -1);
          shape.lineTo(1, 1);
          shape.lineTo(-1, 1);
          shape.lineTo(-1, -1);
          
          const extrudeSettings = {
            depth: 0.2,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.03,
            steps: 2,
          };
          
          const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          const material = new THREE.MeshStandardMaterial({
            color: 0x4a90e2,
            transparent: true,
            opacity: 0.8
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
        });

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
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#f0f0f0' }}>
      <div 
        ref={mountRef} 
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default Scene;