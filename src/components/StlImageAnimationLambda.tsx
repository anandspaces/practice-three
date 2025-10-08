import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const calculateOpacity = (rotation: number): number => {
  const normalizedRotation = ((rotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
  const degrees = (normalizedRotation * 180) / Math.PI;
  
  if (degrees >= 135 && degrees <= 225) {
    return 0;
  }
  
  if (degrees > 90 && degrees < 135) {
    return 1 - ((degrees - 90) / 45);
  }
  
  if (degrees > 225 && degrees < 270) {
    return (degrees - 225) / 45;
  }
  
  return 1;
};

interface ModelAnimationConfig {
  startScale: number;
  peakScale: number;
  startPosition: { x: number; y: number; z: number };
  peakPosition: { x: number; y: number; z: number };
  startRotation: { x: number; y: number; z: number };
  peakRotation: { x: number; y: number; z: number };
}

const calculateModel1Transform = (
  rotation: number,
  config: ModelAnimationConfig
): { scale: number; position: THREE.Vector3; rotation: THREE.Euler } => {
  const normalizedRotation = ((rotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
  const degrees = (normalizedRotation * 180) / Math.PI;

  let progress = 0;

  if (degrees >= 0 && degrees <= 135) {
    progress = degrees / 135;
    
    const easedProgress =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    const scale =
      config.startScale +
      (config.peakScale - config.startScale) * easedProgress;

    const position = new THREE.Vector3(
      config.startPosition.x +
        (config.peakPosition.x - config.startPosition.x) * easedProgress,
      config.startPosition.y +
        (config.peakPosition.y - config.startPosition.y) * easedProgress,
      config.startPosition.z +
        (config.peakPosition.z - config.startPosition.z) * easedProgress
    );

    const eulerRotation = new THREE.Euler(
      config.startRotation.x +
        (config.peakRotation.x - config.startRotation.x) * easedProgress,
      config.startRotation.y +
        (config.peakRotation.y - config.startRotation.y) * easedProgress,
      config.startRotation.z +
        (config.peakRotation.z - config.startRotation.z) * easedProgress
    );

    return { scale, position, rotation: eulerRotation };
  }

  if (degrees >= 225 && degrees <= 360) {
    progress = (degrees - 225) / 135;
    
    const easedProgress =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    const scale =
      config.peakScale -
      (config.peakScale - config.startScale) * easedProgress;

    const position = new THREE.Vector3(
      config.peakPosition.x -
        (config.peakPosition.x - config.startPosition.x) * easedProgress,
      config.peakPosition.y -
        (config.peakPosition.y - config.startPosition.y) * easedProgress,
      config.peakPosition.z -
        (config.peakPosition.z - config.startPosition.z) * easedProgress
    );

    const eulerRotation = new THREE.Euler(
      config.peakRotation.x -
        (config.peakRotation.x - config.startRotation.x) * easedProgress,
      config.peakRotation.y -
        (config.peakRotation.y - config.startRotation.y) * easedProgress,
      config.peakRotation.z -
        (config.peakRotation.z - config.startRotation.z) * easedProgress
    );

    return { scale, position, rotation: eulerRotation };
  }

  if (degrees > 135 && degrees < 225) {
    return {
      scale: config.peakScale,
      position: new THREE.Vector3(
        config.peakPosition.x,
        config.peakPosition.y,
        config.peakPosition.z
      ),
      rotation: new THREE.Euler(
        config.peakRotation.x,
        config.peakRotation.y,
        config.peakRotation.z
      ),
    };
  }

  return {
    scale: config.startScale,
    position: new THREE.Vector3(
      config.startPosition.x,
      config.startPosition.y,
      config.startPosition.z
    ),
    rotation: new THREE.Euler(
      config.startRotation.x,
      config.startRotation.y,
      config.startRotation.z
    ),
  };
};

const calculateModel2Transform = (
  rotation: number,
  config: ModelAnimationConfig
): { scale: number; position: THREE.Vector3; rotation: THREE.Euler } => {
  return calculateModel1Transform(rotation, config);
};

const calculateModel3Transform = (
  rotation: number,
  config: ModelAnimationConfig
): { scale: number; position: THREE.Vector3; rotation: THREE.Euler } => {
  const normalizedRotation = ((rotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
  const degrees = (normalizedRotation * 180) / Math.PI;

  let progress = 0;

  if (degrees >= 135 && degrees <= 225) {
    if (degrees <= 180) {
      progress = (degrees - 135) / 45;
    } else {
      progress = 1 - ((degrees - 180) / 45);
    }

    const easedProgress =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    const scale =
      config.startScale +
      (config.peakScale - config.startScale) * easedProgress;

    const position = new THREE.Vector3(
      config.startPosition.x +
        (config.peakPosition.x - config.startPosition.x) * easedProgress,
      config.startPosition.y +
        (config.peakPosition.y - config.startPosition.y) * easedProgress,
      config.startPosition.z +
        (config.peakPosition.z - config.startPosition.z) * easedProgress
    );

    const eulerRotation = new THREE.Euler(
      config.startRotation.x +
        (config.peakRotation.x - config.startRotation.x) * easedProgress,
      config.startRotation.y +
        (config.peakRotation.y - config.startRotation.y) * easedProgress,
      config.startRotation.z +
        (config.peakRotation.z - config.startRotation.z) * easedProgress
    );

    return { scale, position, rotation: eulerRotation };
  }

  return {
    scale: config.startScale,
    position: new THREE.Vector3(
      config.startPosition.x,
      config.startPosition.y,
      config.startPosition.z
    ),
    rotation: new THREE.Euler(
      config.startRotation.x,
      config.startRotation.y,
      config.startRotation.z
    ),
  };
};

interface STLViewerProps {
  stlUrl1?: string;
  stlUrl2?: string;
  stlUrl3?: string;
  width?: string | number;
  height?: string | number;
  autoRotate?: boolean;
  modelColor?: string;
  backgroundColor?: string;
  showControls?: boolean;
  model1AnimationConfig?: ModelAnimationConfig;
  model2AnimationConfig?: ModelAnimationConfig;
  model3AnimationConfig?: ModelAnimationConfig;
}

const Scene: React.FC<STLViewerProps> = ({
  stlUrl1 = '/lower.stl',
  stlUrl2 = '/upper.stl',
  stlUrl3 = '/ROOTLIB/combined/grin-design-26.stl',
  width = '100%',
  height = '600px',
  autoRotate = true,
  modelColor = '#c0c0c0',
  backgroundColor = '#1a1a1a',
  model1AnimationConfig,
  model2AnimationConfig,
  model3AnimationConfig,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const model1Ref = useRef<THREE.Mesh | null>(null);
  const model2Ref = useRef<THREE.Mesh | null>(null);
  const model3Ref = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationRef = useRef<number | null>(null);
  const totalRotationRef = useRef<number>(0);
  const isUserInteractingRef = useRef<boolean>(false);
  
  const initialModel1Config = useRef<ModelAnimationConfig | null>(null);
  const initialModel2Config = useRef<ModelAnimationConfig | null>(null);
  const initialModel3Config = useRef<ModelAnimationConfig | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = mountRef.current!;
    
    try {
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        2000
      );
      cameraRef.current = camera;
      
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      rendererRef.current = renderer;
      
      container.appendChild(renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);
      
      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight1.position.set(10, 10, 5);
      scene.add(directionalLight1);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
      directionalLight2.position.set(-10, -10, -5);
      scene.add(directionalLight2);

      const loadModel = (url: string, modelRef: React.RefObject<THREE.Mesh | null>): Promise<THREE.Vector3> => {
        return new Promise((resolve, reject) => {
          const loader = new STLLoader();
          loader.load(
            url,
            (geometry) => {
              geometry.computeBoundingBox();
              geometry.computeBoundingSphere();

              const material = new THREE.MeshStandardMaterial({
                color: modelColor,
                metalness: 0.3,
                roughness: 0.3,
              });
              
              const model = new THREE.Mesh(geometry, material);
              modelRef.current = model;
              scene.add(model);
              
              const position = model.position.clone();
              resolve(position);
            },
            undefined,
            (error) => reject(error)
          );
        });
      };

      setIsLoading(true);
      setError(null);
      
      Promise.all([
        loadModel(stlUrl1, model1Ref),
        loadModel(stlUrl2, model2Ref),
        loadModel(stlUrl3, model3Ref)
      ]).then(([]) => {
        if (model1Ref.current) {
          const initialPos = model1Ref.current.position.clone();
          const initialRot = model1Ref.current.rotation.clone();
          const initialScale = model1Ref.current.scale.x;
          
          initialModel1Config.current = model1AnimationConfig || {
            startScale: initialScale,
            peakScale: initialScale,
            startPosition: { x: initialPos.x, y: initialPos.y, z: initialPos.z },
            peakPosition: { x: initialPos.x, y: initialPos.y, z: initialPos.z },
            startRotation: { x: initialRot.x, y: initialRot.y, z: initialRot.z },
            peakRotation: { x: initialRot.x, y: initialRot.y, z: initialRot.z },
          };
          
          if (model1Ref.current.material instanceof THREE.MeshStandardMaterial) {
            model1Ref.current.material.transparent = true;
            model1Ref.current.material.opacity = 1;
          }
        }
        
        if (model2Ref.current) {
          const initialPos = model2Ref.current.position.clone();
          const initialRot = model2Ref.current.rotation.clone();
          const initialScale = model2Ref.current.scale.x;
          
          initialModel2Config.current = model2AnimationConfig || {
            startScale: initialScale,
            peakScale: initialScale,
            startPosition: { x: initialPos.x, y: initialPos.y, z: initialPos.z },
            peakPosition: { x: initialPos.x, y: initialPos.y, z: initialPos.z },
            startRotation: { x: initialRot.x, y: initialRot.y, z: initialRot.z },
            peakRotation: { x: initialRot.x, y: initialRot.y, z: initialRot.z },
          };
          
          if (model2Ref.current.material instanceof THREE.MeshStandardMaterial) {
            model2Ref.current.material.transparent = true;
            model2Ref.current.material.opacity = 1;
          }
        }
        
        if (model3Ref.current) {
          const initialPos = model3Ref.current.position.clone();
          const initialRot = model3Ref.current.rotation.clone();
          const initialScale = model3Ref.current.scale.x;
          
          initialModel3Config.current = model3AnimationConfig || {
            startScale: initialScale,
            peakScale: initialScale,
            startPosition: { x: initialPos.x, y: initialPos.y, z: initialPos.z },
            peakPosition: { x: initialPos.x, y: initialPos.y, z: initialPos.z },
            startRotation: { x: initialRot.x, y: initialRot.y, z: initialRot.z },
            peakRotation: { x: initialRot.x, y: initialRot.y, z: initialRot.z },
          };
        }
        
        const box = new THREE.Box3();
        if (model1Ref.current) {
          box.expandByObject(model1Ref.current);
        }
        if (model2Ref.current) {
          box.expandByObject(model2Ref.current);
        }
        if (model3Ref.current) {
          box.expandByObject(model3Ref.current);
        }
        
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        const distance = maxDim * 2;
        camera.position.set(
          center.x + distance * 0.5,
          center.y + distance * 0.5,
          center.z + distance * 0.5
        );
        
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.copy(center);
        controls.enableRotate = true;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.rotateSpeed = 0.5;
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = -1;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        
        controls.addEventListener('start', () => {
          isUserInteractingRef.current = true;
        });
        
        controls.addEventListener('end', () => {
          setTimeout(() => {
            isUserInteractingRef.current = false;
          }, 1000);
        });
        
        controlsRef.current = controls;
        
        renderer.domElement.style.cursor = 'grab';

        setIsLoading(false);
      }).catch((error) => {
        console.error('Failed to load STL files:', error);
        setError('Failed to load 3D models');
        setIsLoading(false);
      });

      const updateModels = (rotation: number) => {
        const opacity = calculateOpacity(rotation);
        
        if (model1Ref.current && model1Ref.current.material instanceof THREE.MeshStandardMaterial && initialModel1Config.current) {
          model1Ref.current.material.opacity = opacity;
          model1Ref.current.material.needsUpdate = true;
          const transform = calculateModel1Transform(rotation, initialModel1Config.current);
          model1Ref.current.scale.setScalar(transform.scale);
          model1Ref.current.position.copy(transform.position);
          model1Ref.current.rotation.copy(transform.rotation);
        }
        if (model2Ref.current && model2Ref.current.material instanceof THREE.MeshStandardMaterial && initialModel2Config.current) {
          model2Ref.current.material.opacity = opacity;
          model2Ref.current.material.needsUpdate = true;
          const transform = calculateModel2Transform(rotation, initialModel2Config.current);
          model2Ref.current.scale.setScalar(transform.scale);
          model2Ref.current.position.copy(transform.position);
          model2Ref.current.rotation.copy(transform.rotation);
        }
        
        if (model3Ref.current && initialModel3Config.current) {
          const transform = calculateModel3Transform(rotation, initialModel3Config.current);
          model3Ref.current.scale.setScalar(transform.scale);
          model3Ref.current.position.copy(transform.position);
          model3Ref.current.rotation.copy(transform.rotation);
        }
      };

      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
        
        if (controlsRef.current) {
          const prevAzimuth = controlsRef.current.getAzimuthalAngle();
          controlsRef.current.update();
          const currentAzimuth = controlsRef.current.getAzimuthalAngle();
          
          const deltaRotation = currentAzimuth - prevAzimuth;
          totalRotationRef.current += deltaRotation;
          
          updateModels(totalRotationRef.current);
        }
        
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      animate();

      const handleResize = () => {
        if (camera && renderer && container) {
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (controlsRef.current) {
          controlsRef.current.dispose();
        }
        window.removeEventListener('resize', handleResize);
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    } catch (err) {
      console.error('Error initializing viewer:', err);
      setError('Failed to initialize 3D viewer');
      setIsLoading(false);
    }
  }, [stlUrl1, stlUrl2, stlUrl3, autoRotate, modelColor, model1AnimationConfig, model2AnimationConfig, model3AnimationConfig]);

  return (
    <div className="relative w-full" style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-30">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading 3D Models...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-30">
          <div className="text-center text-white">
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div 
        ref={mountRef} 
        className="w-full h-full"
        style={{ background: backgroundColor }}
      />
    </div>
  );
};

export default Scene;