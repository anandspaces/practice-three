import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// STL Loader implementation
class STLLoader extends THREE.Loader {
  load(
    url: string, 
    onLoad: (geometry: THREE.BufferGeometry) => void, 
    onProgress?: (event: ProgressEvent) => void, 
    onError?: (err: unknown) => void
  ) {
    const loader = new THREE.FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setResponseType('arraybuffer');
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);
    
    loader.load(url, (buffer) => {
      try {
        const geometry = this.parse(buffer);
        onLoad(geometry);
      } catch (e) {
        if (onError) {
          onError(e);
        } else {
          console.error(e);
        }
      }
    }, onProgress, onError);
  }

  parse(data: ArrayBuffer | string): THREE.BufferGeometry {
    const isBinary = (data: ArrayBuffer): boolean => {
      const reader = new DataView(data);
      const numTriangles = reader.getUint32(80, true);
      const faceSize = (32 / 8 * 3) + ((32 / 8 * 3) * 3) + (16 / 8);
      const numExpectedBytes = 80 + (32 / 8) + (numTriangles * faceSize);
      return numExpectedBytes === data.byteLength;
    };

    return isBinary(data as ArrayBuffer) ? this.parseBinary(data as ArrayBuffer) : this.parseASCII(new TextDecoder().decode(data as ArrayBuffer));
  }

  parseBinary(data: ArrayBuffer): THREE.BufferGeometry {
    const reader = new DataView(data);
    const triangles = reader.getUint32(80, true);
    
    let dataOffset = 84;
    const geometry = new THREE.BufferGeometry();
    
    const vertices = [];
    const normals = [];
    
    for (let i = 0; i < triangles; i++) {
      const normal = new THREE.Vector3(
        reader.getFloat32(dataOffset, true),
        reader.getFloat32(dataOffset + 4, true),
        reader.getFloat32(dataOffset + 8, true)
      );
      
      dataOffset += 12;
      
      for (let j = 0; j < 3; j++) {
        vertices.push(
          reader.getFloat32(dataOffset, true),
          reader.getFloat32(dataOffset + 4, true),
          reader.getFloat32(dataOffset + 8, true)
        );
        
        normals.push(normal.x, normal.y, normal.z);
        dataOffset += 12;
      }
      
      dataOffset += 2;
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    
    return geometry;
  }

  parseASCII(data: string): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const normals = [];
    
    const normalPattern = /facet\s+normal\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/g;
    const vertexPattern = /vertex\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/g;
    
    let normalMatch;
    let vertexMatch;
    
    while ((normalMatch = normalPattern.exec(data)) !== null) {
      const normal = new THREE.Vector3(
        parseFloat(normalMatch[1]),
        parseFloat(normalMatch[2]),
        parseFloat(normalMatch[3])
      );
      
      let vertexCount = 0;
      const startIndex = normalPattern.lastIndex;
      
      while (vertexCount < 3 && (vertexMatch = vertexPattern.exec(data)) !== null) {
        if (vertexPattern.lastIndex > startIndex + 200) break;
        
        vertices.push(
          parseFloat(vertexMatch[1]),
          parseFloat(vertexMatch[2]),
          parseFloat(vertexMatch[3])
        );
        
        normals.push(normal.x, normal.y, normal.z);
        vertexCount++;
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    
    return geometry;
  }
}

// Orbit Controls implementation for Orthographic Camera
class OrbitControls {
  private camera: THREE.OrthographicCamera;
  private domElement: HTMLElement;
  private target = new THREE.Vector3();
  private spherical = new THREE.Spherical();
  private sphericalDelta = new THREE.Spherical();
  private rotateStart = new THREE.Vector2();
  private panStart = new THREE.Vector2();
  
  public enableRotate = true;
  public enableZoom = false;
  public enablePan = true;
  public rotateSpeed = 1.0;
  public zoomSpeed = 1.0;
  public panSpeed = 1.0;
  public minZoom = 0;
  public maxZoom = Infinity;
  
  private state = 'NONE';
  private isUserInteracting = false;
  private totalRotation = 0;
  public onRotationChange?: (rotation: number) => void;

  constructor(camera: THREE.OrthographicCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    this.update();
    this.addEventListeners();
  }

  private addEventListeners() {
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    // this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this));
    this.domElement.addEventListener('contextmenu', this.onContextMenu.bind(this));
  }

  private onMouseDown(event: MouseEvent) {
    this.isUserInteracting = true;
    
    if (event.button === 0) {
      this.state = 'ROTATE';
      this.rotateStart.set(event.clientX, event.clientY);
    } else if (event.button === 1) {
      this.state = 'PAN';
      this.panStart.set(event.clientX, event.clientY);
    }
    
    if (this.state !== 'NONE') {
      document.addEventListener('mousemove', this.onMouseMove.bind(this));
      document.addEventListener('mouseup', this.onMouseUp.bind(this));
      this.domElement.style.cursor = 'grabbing';
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (this.state === 'ROTATE') {
      if (this.enableRotate === false) return;
      
      const rotateEnd = new THREE.Vector2(event.clientX, event.clientY);
      const rotateDelta = new THREE.Vector2().subVectors(rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);
      
      const element = this.domElement;
      const rotationAngle = 2 * Math.PI * rotateDelta.x / element.clientHeight;
      this.rotateLeft(rotationAngle);
      
      this.totalRotation += rotationAngle;
      
      if (this.onRotationChange) {
        this.onRotationChange(this.totalRotation);
      }
      
      this.rotateStart.copy(rotateEnd);
      this.update();
      
    } else if (this.state === 'PAN') {
      if (this.enablePan === false) return;
      
      const panEnd = new THREE.Vector2(event.clientX, event.clientY);
      const panDelta = new THREE.Vector2().subVectors(panEnd, this.panStart).multiplyScalar(this.panSpeed);
      
      this.pan(panDelta.x, panDelta.y);
      this.panStart.copy(panEnd);
      this.update();
    }
  }

  private onMouseUp() {
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
    this.domElement.style.cursor = 'grab';
    this.state = 'NONE';
    
    setTimeout(() => {
      this.isUserInteracting = false;
    }, 1000);
  }

  // private onMouseWheel(event: WheelEvent) {
  //   if (this.enableZoom === false) return;
    
  //   event.preventDefault();
  //   this.isUserInteracting = true;
    
  //   if (event.deltaY < 0) {
  //     this.dollyIn(this.getZoomScale());
  //   } else if (event.deltaY > 0) {
  //     this.dollyOut(this.getZoomScale());
  //   }
    
  //   this.update();
    
  //   setTimeout(() => {
  //     this.isUserInteracting = false;
  //   }, 1000);
  // }

  private onContextMenu(event: Event) {
    event.preventDefault();
  }

  private rotateLeft(angle: number) {
    this.sphericalDelta.theta -= angle;
  }

  // private dollyIn(dollyScale: number) {
  //   this.camera.zoom *= dollyScale;
  //   this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom));
  //   this.camera.updateProjectionMatrix();
  // }

  // private dollyOut(dollyScale: number) {
  //   this.camera.zoom /= dollyScale;
  //   this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom));
  //   this.camera.updateProjectionMatrix();
  // }

  private pan(deltaX: number, deltaY: number) {
    const offset = new THREE.Vector3();
    offset.copy(this.camera.position).sub(this.target);
    
    // For orthographic camera, use the visible area based on zoom
    const scale = (this.camera.top - this.camera.bottom) / this.camera.zoom / this.domElement.clientHeight;
    
    const panLeft = new THREE.Vector3();
    panLeft.setFromMatrixColumn(this.camera.matrix, 0);
    panLeft.multiplyScalar(-2 * deltaX * scale);
    
    const panUp = new THREE.Vector3();
    panUp.setFromMatrixColumn(this.camera.matrix, 1);
    panUp.multiplyScalar(2 * deltaY * scale);
    
    const pan = new THREE.Vector3();
    pan.copy(panLeft).add(panUp);
    
    this.camera.position.add(pan);
    this.target.add(pan);
  }

  // private getZoomScale() {
  //   return Math.pow(0.95, this.zoomSpeed);
  // }

  public applyAutoRotate() {
    if (!this.isUserInteracting) {
      this.sphericalDelta.theta = -0.01;
      this.totalRotation -= 0.01;
      
      if (this.onRotationChange) {
        this.onRotationChange(this.totalRotation);
      }
    }
  }

  public update(): boolean {
    const offset = new THREE.Vector3();
    const quat = new THREE.Quaternion().setFromUnitVectors(this.camera.up, new THREE.Vector3(0, 1, 0));
    const quatInverse = quat.clone().invert();
    
    offset.copy(this.camera.position).sub(this.target);
    offset.applyQuaternion(quat);
    
    this.spherical.setFromVector3(offset);
    this.spherical.theta += this.sphericalDelta.theta;
    this.spherical.phi = Math.PI / 2;
    
    this.spherical.radius = Math.max(this.camera.near + 1, Math.min(this.camera.far - 1, this.spherical.radius));
    
    offset.setFromSpherical(this.spherical);
    offset.applyQuaternion(quatInverse);
    
    this.camera.position.copy(this.target).add(offset);
    this.camera.lookAt(this.target);
    
    this.sphericalDelta.set(0, 0, 0);
    
    return true;
  }

  public setTarget(x: number, y: number, z: number) {
    this.target.set(x, y, z);
    this.update();
  }

  public dispose() {
    this.domElement.removeEventListener('mousedown', this.onMouseDown.bind(this));
    // this.domElement.removeEventListener('wheel', this.onMouseWheel.bind(this));
    this.domElement.removeEventListener('contextmenu', this.onContextMenu.bind(this));
  }
}

// Calculate opacity based on rotation angle
const calculateOpacity = (rotation: number): number => {
  const normalizedRotation = ((rotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
  const degrees = (normalizedRotation * 180) / Math.PI;
  
  // Between 135° and 225°, opacity is 0
  if (degrees >= 135 && degrees <= 225) {
    return 0;
  }
  
  // Transition zone: 90° to 135°
  if (degrees > 90 && degrees < 135) {
    return 1 - ((degrees - 90) / 45);
  }
  
  // Transition zone: 225° to 270°
  if (degrees > 225 && degrees < 270) {
    return (degrees - 225) / 45;
  }
  
  // Fully visible: 0° to 90° and 270° to 360°
  return 1;
};

interface ModelTransform {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: number;
  visible?: boolean;
}

interface STLViewerProps {
  stlUrl1?: string;
  stlUrl2?: string;
  stlUrl3?: string;
  width?: string | number;
  height?: string | number;
  autoRotate?: boolean;
  modelColor?: string;
  backgroundColor?: string;
  model1Transform?: ModelTransform;
  model2Transform?: ModelTransform;
  model3Transform?: ModelTransform;
  showControls?: boolean;
}

const Scene: React.FC<STLViewerProps> = ({
  stlUrl1 = '/lower.stl',
  stlUrl2 = '/upper.stl',
  stlUrl3 = '/ROOTLIB/combined/grin-design-26.stl',
  width = '100%',
  height = '600px',
  autoRotate = false,
  modelColor = '#c0c0c0',
  backgroundColor = 'transparent',
  model1Transform = {
    position: { x: 5, y: 5, z: 5 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 0.7,
    visible: true,
  },
  model2Transform = {
    position: { x: -5, y: -5, z: -5 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 0.7,
    visible: true,
  },
  model3Transform = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 0.7,
    visible: true,
  },
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const model1Ref = useRef<THREE.Mesh | null>(null);
  const model2Ref = useRef<THREE.Mesh | null>(null);
  const model3Ref = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = mountRef.current!;
    
    try {
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      const aspect = container.clientWidth / container.clientHeight;
      const frustumSize = 100;
      const camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / -2,
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

      const loadModel = (url: string, modelRef: React.MutableRefObject<THREE.Mesh | null>): Promise<void> => {
        return new Promise((resolve, reject) => {
          const loader = new STLLoader();
          loader.load(
            url,
            (geometry) => {
              geometry.center();
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
              
              resolve();
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
      ]).then(() => {
        if (model1Ref.current) {
          model1Ref.current.position.set(
            model1Transform?.position?.x ?? 0, 
            model1Transform?.position?.y ?? 0, 
            model1Transform?.position?.z ?? 0
          );
          model1Ref.current.rotation.set(
            model1Transform?.rotation?.x ?? 0, 
            model1Transform?.rotation?.y ?? 0, 
            model1Transform?.rotation?.z ?? 0
          );
          model1Ref.current.scale.setScalar(model1Transform?.scale ?? 1);
          model1Ref.current.visible = model1Transform?.visible ?? true;
          
          if (model1Ref.current.material instanceof THREE.MeshStandardMaterial) {
            model1Ref.current.material.transparent = true;
            model1Ref.current.material.opacity = 1;
          }
        }
        
        if (model2Ref.current) {
          model2Ref.current.position.set(
            model2Transform?.position?.x ?? 0,
            model2Transform?.position?.y ?? 0,
            model2Transform?.position?.z ?? 0
          );
          model2Ref.current.rotation.set(
            model2Transform?.rotation?.x ?? 0,
            model2Transform?.rotation?.y ?? 0,
            model2Transform?.rotation?.z ?? 0
          );
          model2Ref.current.scale.setScalar(model2Transform?.scale ?? 1);
          model2Ref.current.visible = model2Transform?.visible ?? true;
          
          if (model2Ref.current.material instanceof THREE.MeshStandardMaterial) {
            model2Ref.current.material.transparent = true;
            model2Ref.current.material.opacity = 1;
          }
        }
        
        if (model3Ref.current) {
          model3Ref.current.position.set(
            model3Transform?.position?.x ?? 0,
            model3Transform?.position?.y ?? 0,
            model3Transform?.position?.z ?? 0
          );
          model3Ref.current.rotation.set(
            model3Transform?.rotation?.x ?? 0,
            model3Transform?.rotation?.y ?? 0,
            model3Transform?.rotation?.z ?? 0
          );
          model3Ref.current.scale.setScalar(model3Transform?.scale ?? 1);
          model3Ref.current.visible = model3Transform?.visible ?? true;
        }
        
        const box = new THREE.Box3();
        if (model1Ref.current && model1Ref.current.visible) {
          box.expandByObject(model1Ref.current);
        }
        if (model2Ref.current && model2Ref.current.visible) {
          box.expandByObject(model2Ref.current);
        }
        if (model3Ref.current && model3Ref.current.visible) {
          box.expandByObject(model3Ref.current);
        }
        
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Position camera for orthographic view
        const distance = maxDim * 3;
        camera.position.set(
          center.x + distance * 0.5,
          center.y + distance * 0.5,
          center.z + distance * 0.5
        );
        
        // Adjust camera zoom to fit the model
        camera.zoom = (frustumSize / maxDim) * 0.8;
        camera.updateProjectionMatrix();
        
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.setTarget(center.x, center.y, center.z);
        controls.enableRotate = true;
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.rotateSpeed = 0.5;
        controls.zoomSpeed = 1.2;
        controls.minZoom = 0.1;
        controls.maxZoom = 10;
        
        controls.onRotationChange = (rotation: number) => {
          const opacity = calculateOpacity(rotation);
          
          if (model1Ref.current && model1Ref.current.material instanceof THREE.MeshStandardMaterial) {
            model1Ref.current.material.opacity = opacity;
            model1Ref.current.material.needsUpdate = true;
          }
          if (model2Ref.current && model2Ref.current.material instanceof THREE.MeshStandardMaterial) {
            model2Ref.current.material.opacity = opacity;
            model2Ref.current.material.needsUpdate = true;
          }
        };
        
        controlsRef.current = controls;
        
        renderer.domElement.style.cursor = 'grab';

        setIsLoading(false);
      }).catch((error) => {
        console.error('Failed to load STL files:', error);
        setError('Failed to load 3D models');
        setIsLoading(false);
      });

      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
        
        if (autoRotate && controlsRef.current) {
          controlsRef.current.applyAutoRotate();
        }
        
        if (controlsRef.current) {
          controlsRef.current.update();
        }
        
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (camera && renderer && container) {
          const width = container.clientWidth;
          const height = container.clientHeight;
          const aspect = width / height;
          
          camera.left = frustumSize * aspect / -2;
          camera.right = frustumSize * aspect / 2;
          camera.top = frustumSize / 2;
          camera.bottom = frustumSize / -2;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
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
  }, [stlUrl1, stlUrl2, stlUrl3, autoRotate, modelColor, model1Transform, model2Transform, model3Transform]);

  useEffect(() => {
    if (model1Ref.current) {
      model1Ref.current.position.set(
        model1Transform?.position?.x ?? 0, 
        model1Transform?.position?.y ?? 0, 
        model1Transform?.position?.z ?? 0
      );
      model1Ref.current.rotation.set(
        model1Transform?.rotation?.x ?? 0, 
        model1Transform?.rotation?.y ?? 0, 
        model1Transform?.rotation?.z ?? 0
      );
      model1Ref.current.scale.setScalar(model1Transform?.scale ?? 1);
      model1Ref.current.visible = model1Transform?.visible ?? true;
    }
  }, [model1Transform]);

  useEffect(() => {
    if (model2Ref.current) {
      model2Ref.current.position.set(
        model2Transform?.position?.x ?? 0,
        model2Transform?.position?.y ?? 0,
        model2Transform?.position?.z ?? 0
      );
      model2Ref.current.rotation.set(
        model2Transform?.rotation?.x ?? 0,
        model2Transform?.rotation?.y ?? 0,
        model2Transform?.rotation?.z ?? 0
      );
      model2Ref.current.scale.setScalar(model2Transform?.scale ?? 1);
      model2Ref.current.visible = model2Transform?.visible ?? true;
    }
  }, [model2Transform]);

  useEffect(() => {
    if (model3Ref.current) {
      model3Ref.current.position.set(
        model3Transform?.position?.x ?? 0,
        model3Transform?.position?.y ?? 0,
        model3Transform?.position?.z ?? 0
      );
      model3Ref.current.rotation.set(
        model3Transform?.rotation?.x ?? 0,
        model3Transform?.rotation?.y ?? 0,
        model3Transform?.rotation?.z ?? 0
      );
      model3Ref.current.scale.setScalar(model3Transform?.scale ?? 1);
      model3Ref.current.visible = model3Transform?.visible ?? true;
    }
  }, [model3Transform]);

  return (
    <div className="relative w-full" style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-30">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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