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

// Orbit Controls implementation
class OrbitControls {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;
  private target = new THREE.Vector3();
  private spherical = new THREE.Spherical();
  private sphericalDelta = new THREE.Spherical();
  private rotateStart = new THREE.Vector2();
  private panStart = new THREE.Vector2();
  
  public enableRotate = true;
  public enableZoom = true;
  public enablePan = true;
  public rotateSpeed = 1.0;
  public zoomSpeed = 1.0;
  public panSpeed = 1.0;
  public minDistance = 0;
  public maxDistance = Infinity;
  
  private state = 'NONE';
  private isUserInteracting = false;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    this.update();
    this.addEventListeners();
  }

  private addEventListeners() {
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this));
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
      this.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight);
      
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

  private onMouseWheel(event: WheelEvent) {
    if (this.enableZoom === false) return;
    
    event.preventDefault();
    this.isUserInteracting = true;
    
    if (event.deltaY < 0) {
      this.dollyIn(this.getZoomScale());
    } else if (event.deltaY > 0) {
      this.dollyOut(this.getZoomScale());
    }
    
    this.update();
    
    setTimeout(() => {
      this.isUserInteracting = false;
    }, 1000);
  }

  private onContextMenu(event: Event) {
    event.preventDefault();
  }

  private rotateLeft(angle: number) {
    this.sphericalDelta.theta -= angle;
  }

  private dollyIn(dollyScale: number) {
    this.sphericalDelta.radius /= dollyScale;
  }

  private dollyOut(dollyScale: number) {
    this.sphericalDelta.radius *= dollyScale;
  }

  private pan(deltaX: number, deltaY: number) {
    const offset = new THREE.Vector3();
    offset.copy(this.camera.position).sub(this.target);
    
    let targetDistance = offset.length();
    targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180.0);
    
    const panLeft = new THREE.Vector3();
    panLeft.setFromMatrixColumn(this.camera.matrix, 0);
    panLeft.multiplyScalar(-2 * deltaX * targetDistance / this.domElement.clientHeight);
    
    const panUp = new THREE.Vector3();
    panUp.setFromMatrixColumn(this.camera.matrix, 1);
    panUp.multiplyScalar(2 * deltaY * targetDistance / this.domElement.clientHeight);
    
    const pan = new THREE.Vector3();
    pan.copy(panLeft).add(panUp);
    
    this.camera.position.add(pan);
    this.target.add(pan);
  }

  private getZoomScale() {
    return Math.pow(0.95, this.zoomSpeed);
  }

  public applyAutoRotate() {
    if (!this.isUserInteracting) {
      this.sphericalDelta.theta = -0.01;
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
    
    this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));
    
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
    this.domElement.removeEventListener('wheel', this.onMouseWheel.bind(this));
    this.domElement.removeEventListener('contextmenu', this.onContextMenu.bind(this));
  }
}

interface DualSTLViewerProps {
  stlUrl1?: string;
  stlUrl2?: string;
  width?: string | number;
  height?: string | number;
  autoRotate?: boolean;
  modelColor1?: string;
  modelColor2?: string;
  backgroundColor?: string;
  modelScale?: number;
  modelScale1?: number;
  modelScale2?: number;
  spacing?: number;
  className?: string;
  style?: React.CSSProperties;
  rotateModel1?: boolean;
  rotateModel2?: boolean;
  rotationSpeed1?: number;
  rotationSpeed2?: number;
  rotation1?: { x?: number; y?: number; z?: number };
  rotation2?: { x?: number; y?: number; z?: number };
}

const Scene: React.FC<DualSTLViewerProps> = ({
  stlUrl1 = '',
  stlUrl2 = '',
  width = '100%',
  height = '400px',
  autoRotate = true,
  modelColor1 = '#ffffff',
  modelColor2 = '#ffffff',
  backgroundColor = 'transparent',
  modelScale = 1,
  modelScale1,
  modelScale2,
  spacing = 50,
  className = '',
  style = {},
  rotateModel1 = false,
  rotateModel2 = false,
  rotationSpeed1 = 0.01,
  rotationSpeed2 = 0.01,
  rotation1 = { x: 0, y: 0, z: 0 },
  rotation2 = { x: 0, y: 0, z: 0 }
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const model1Ref = useRef<THREE.Mesh | null>(null);
  const model2Ref = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const [loadingStatus, setLoadingStatus] = useState('Initializing viewer...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSizeValue = (size: string | number): string => {
    if (typeof size === 'number') {
      return `${size}px`;
    }
    return size;
  };

  const containerStyles: React.CSSProperties = {
    width: getSizeValue(width),
    height: getSizeValue(height),
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

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
      directionalLight1.castShadow = true;
      scene.add(directionalLight1);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
      directionalLight2.position.set(-10, -10, -5);
      scene.add(directionalLight2);

      const loader = new STLLoader();
      let loadedCount = 0;
      const totalModels = 2;

      const loadModel = (url: string, color: string, position: number, isModel1: boolean) => {
        const scale = isModel1 ? (modelScale1 ?? modelScale) : (modelScale2 ?? modelScale);
        const rotation = isModel1 ? rotation1 : rotation2;
        
        loader.load(
          url,
          (loadedGeometry) => {
            try {
              const geometry = loadedGeometry.clone();
              
              geometry.center();
              geometry.rotateX(Math.PI);
              geometry.computeBoundingBox();
              geometry.computeBoundingSphere();

              const material = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 100,
                specular: 0x222222,
                side: THREE.DoubleSide,
                flatShading: false
              });
              
              const model = new THREE.Mesh(geometry, material);
              model.scale.setScalar(scale);
              model.castShadow = true;
              model.receiveShadow = true;
              
              model.position.x = position;
              
              if (rotation.x !== undefined) model.rotation.x += rotation.x;
              if (rotation.y !== undefined) model.rotation.y += rotation.y;
              if (rotation.z !== undefined) model.rotation.z += rotation.z;
              
              if (isModel1) {
                model1Ref.current = model;
              } else {
                model2Ref.current = model;
              }
              
              scene.add(model);
              
              loadedCount++;
              const progress = (loadedCount / totalModels) * 100;
              setLoadingProgress(progress);
              
              if (loadedCount === totalModels) {
                const boundingSphere = geometry.boundingSphere!;
                const radius = boundingSphere.radius * scale;
                const distance = (radius + spacing) * 2.5;
                
                camera.position.set(0, distance * 0.7, distance * 0.9);
                
                const controls = new OrbitControls(camera, renderer.domElement);
                controls.setTarget(0, 0, 0);
                controls.enableRotate = true;
                controls.enableZoom = true;
                controls.enablePan = false;
                controls.rotateSpeed = 0.5;
                controls.zoomSpeed = 1.2;
                controls.minDistance = radius * 1.2;
                controls.maxDistance = (radius + spacing) * 15;
                controlsRef.current = controls;
                
                renderer.domElement.style.cursor = 'grab';
                
                setLoadingStatus('Models loaded successfully');
                setTimeout(() => setIsLoading(false), 500);
              }
              
            } catch (error) {
              console.error('Error processing STL file:', error);
              setError('Failed to process 3D model');
              setIsLoading(false);
            }
          },
          (progress) => {
            if (progress.lengthComputable) {
              const percent = Math.round((progress.loaded / progress.total) * 50);
              const totalPercent = isModel1 ? percent : 50 + percent;
              setLoadingProgress(totalPercent);
              setLoadingStatus(`Loading models... ${totalPercent}%`);
            }
          },
          (error) => {
            console.error('Failed to load STL file:', error);
            setError('Failed to load 3D model. Please check the file path.');
            setIsLoading(false);
          }
        );
      };

      loadModel(stlUrl1, modelColor1, -spacing / 2, true);
      loadModel(stlUrl2, modelColor2, spacing / 2, false);

      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
        
        if (autoRotate && controlsRef.current) {
          controlsRef.current.applyAutoRotate();
        }
        
        if (rotateModel1 && model1Ref.current) {
          model1Ref.current.rotation.y += rotationSpeed1;
        }
        
        if (rotateModel2 && model2Ref.current) {
          model2Ref.current.rotation.y += rotationSpeed2;
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
          
          camera.aspect = width / height;
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
        if (sceneRef.current) {
          sceneRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              if (object.geometry) object.geometry.dispose();
              if (object.material) {
                if (Array.isArray(object.material)) {
                  object.material.forEach(material => material.dispose());
                } else {
                  object.material.dispose();
                }
              }
            }
          });
        }
      };
    } catch (err) {
      console.error('Error initializing viewer:', err);
      setError('Failed to initialize 3D viewer');
      setIsLoading(false);
    }
  }, [stlUrl1, stlUrl2, autoRotate, modelColor1, modelColor2, backgroundColor, modelScale, modelScale1, modelScale2, spacing, rotateModel1, rotateModel2, rotationSpeed1, rotationSpeed2, rotation1, rotation2]);

  return (
    <div className={className} style={containerStyles}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 z-30">
          <div className="text-center max-w-sm px-4">
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-3 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-3 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">{loadingStatus}</h3>
            {loadingProgress > 0 && (
              <div className="w-32 bg-gray-200 rounded-full h-2 mx-auto mb-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            )}
            <p className="text-xs text-gray-600">Loading 3D models...</p>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-30">
          <div className="text-center max-w-sm px-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Unable to Load Models</h3>
            <p className="text-xs text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs font-medium"
            >
              Retry Loading
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