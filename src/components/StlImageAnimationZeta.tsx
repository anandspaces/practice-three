import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// STL Loader implementation
class STLLoader extends THREE.Loader {
  load(url: string, onLoad: (geometry: THREE.BufferGeometry) => void, onProgress?: (event: ProgressEvent) => void, onError?: (err: unknown) => void) {
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
        if (onError) onError(e);
        else console.error(e);
      }
    }, onProgress, onError);
  }

  parse(data: ArrayBuffer | string): THREE.BufferGeometry {
    const isBinary = (data: ArrayBuffer): boolean => {
      const reader = new DataView(data);
      const numTriangles = reader.getUint32(80, true);
      const faceSize = (32 / 8 * 3) + ((32 / 8 * 3) * 3) + (16 / 8);
      return 80 + (32 / 8) + (numTriangles * faceSize) === data.byteLength;
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
      const normal = new THREE.Vector3(reader.getFloat32(dataOffset, true), reader.getFloat32(dataOffset + 4, true), reader.getFloat32(dataOffset + 8, true));
      dataOffset += 12;
      for (let j = 0; j < 3; j++) {
        vertices.push(reader.getFloat32(dataOffset, true), reader.getFloat32(dataOffset + 4, true), reader.getFloat32(dataOffset + 8, true));
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
    let normalMatch, vertexMatch;
    
    while ((normalMatch = normalPattern.exec(data)) !== null) {
      const normal = new THREE.Vector3(parseFloat(normalMatch[1]), parseFloat(normalMatch[2]), parseFloat(normalMatch[3]));
      let vertexCount = 0;
      const startIndex = normalPattern.lastIndex;
      while (vertexCount < 3 && (vertexMatch = vertexPattern.exec(data)) !== null) {
        if (vertexPattern.lastIndex > startIndex + 200) break;
        vertices.push(parseFloat(vertexMatch[1]), parseFloat(vertexMatch[2]), parseFloat(vertexMatch[3]));
        normals.push(normal.x, normal.y, normal.z);
        vertexCount++;
      }
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    return geometry;
  }
}

// Orbit Controls
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
    if (this.state === 'ROTATE' && this.enableRotate) {
      const rotateEnd = new THREE.Vector2(event.clientX, event.clientY);
      const rotateDelta = new THREE.Vector2().subVectors(rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);
      this.rotateLeft(2 * Math.PI * rotateDelta.x / this.domElement.clientHeight);
      this.rotateStart.copy(rotateEnd);
      this.update();
    } else if (this.state === 'PAN' && this.enablePan) {
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
    setTimeout(() => { this.isUserInteracting = false; }, 1000);
  }

  private onMouseWheel(event: WheelEvent) {
    if (!this.enableZoom) return;
    event.preventDefault();
    this.isUserInteracting = true;
    if (event.deltaY < 0) this.dollyIn(this.getZoomScale());
    else if (event.deltaY > 0) this.dollyOut(this.getZoomScale());
    this.update();
    setTimeout(() => { this.isUserInteracting = false; }, 1000);
  }

  private onContextMenu(event: Event) { event.preventDefault(); }
  private rotateLeft(angle: number) { this.sphericalDelta.theta -= angle; }
  private dollyIn(dollyScale: number) { this.sphericalDelta.radius /= dollyScale; }
  private dollyOut(dollyScale: number) { this.sphericalDelta.radius *= dollyScale; }

  private pan(deltaX: number, deltaY: number) {
    const offset = new THREE.Vector3();
    offset.copy(this.camera.position).sub(this.target);
    let targetDistance = offset.length() * Math.tan((this.camera.fov / 2) * Math.PI / 180.0);
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

  private getZoomScale() { return Math.pow(0.95, this.zoomSpeed); }

  public applyAutoRotate() {
    if (!this.isUserInteracting) this.sphericalDelta.theta = -0.01;
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

interface ModelConfig {
  url: string;
  title: string;
  subtitle?: string;
}

interface STLViewerProps {
  models?: ModelConfig[];
  width?: string | number;
  height?: string | number;
  autoRotate?: boolean;
  modelColor?: string;
  backgroundColor?: string;
  modelScale?: number;
  className?: string;
  style?: React.CSSProperties;
  displayDuration?: number;
}

const Scene: React.FC<STLViewerProps> = ({
  models,
  width = '100%',
  height = '400px',
  autoRotate = true,
  modelColor = '#c0c0c0',
  backgroundColor = 'transparent',
  modelScale = 1,
  className = '',
  style = {},
  displayDuration = 10000
}) => {
  const defaultModels: ModelConfig[] = [
    { url: '/ROOTLIB/upper/grin-design-26.stl', title: 'PreMolar'},
    { url: '/ROOTLIB/lower/Grin-158-(37).stl', title: 'Molar'},
    { url: '/ROOTLIB/lower/Grin-58-(32).stl', title: 'Canine'},
    { url: '/ROOTLIB/lower/Grin-158-(33).stl', title: 'Incisor'}
  ];

  const modelConfigs = models || defaultModels;
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentModel = modelConfigs[currentModelIndex];

  useEffect(() => {
    if (modelConfigs.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentModelIndex((prev) => (prev + 1) % modelConfigs.length);
        setIsTransitioning(false);
      }, 500);
    }, displayDuration);
    return () => clearInterval(interval);
  }, [displayDuration, modelConfigs.length]);

  const getSizeValue = (size: string | number): string => typeof size === 'number' ? `${size}px` : size;

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
      const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 2000);
      cameraRef.current = camera;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
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
      setIsLoading(true);
      setError(null);
      
      loader.load(
        currentModel.url,
        (geometry) => {
          try {
            geometry.center();
            geometry.rotateX(Math.PI);
            geometry.computeBoundingBox();
            geometry.computeBoundingSphere();
            const material = new THREE.MeshPhysicalMaterial({
              color: modelColor,
              metalness: 0.5,
              roughness: 0.2,
              clearcoat: 1,
              clearcoatRoughness: 0,
            });
            const model = new THREE.Mesh(geometry, material);
            model.scale.setScalar(modelScale);
            model.castShadow = true;
            model.receiveShadow = true;
            modelRef.current = model;
            scene.add(model);
            
            const boundingSphere = geometry.boundingSphere!;
            const center = boundingSphere.center;
            const radius = boundingSphere.radius * modelScale;
            const containerAspect = container.clientWidth / container.clientHeight;
            const distance = radius * (containerAspect < 1 ? 3.5 : 2.5);
            camera.position.set(center.x + distance * 0.7, center.y + distance * 0.7, center.z + distance * 0.9);
            
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.setTarget(center.x, center.y, center.z);
            controls.enableRotate = true;
            controls.enableZoom = true;
            controls.enablePan = false;
            controls.rotateSpeed = 0.5;
            controls.zoomSpeed = 1.2;
            controls.minDistance = radius * 1.2;
            controls.maxDistance = radius * 10;
            controlsRef.current = controls;
            renderer.domElement.style.cursor = 'grab';
            setTimeout(() => setIsLoading(false), 500);
          } catch (error) {
            console.error('Error processing STL file:', error);
            setError('Failed to process 3D model');
            setIsLoading(false);
          }
        },
        undefined,
        (error) => {
          console.error('Failed to load STL file:', error);
          setError('Failed to load 3D model');
          setIsLoading(false);
        }
      );

      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
        if (autoRotate && modelRef.current && controlsRef.current) {
          controlsRef.current.applyAutoRotate();
        }
        if (controlsRef.current) controlsRef.current.update();
        renderer.render(scene, camera);
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
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (controlsRef.current) controlsRef.current.dispose();
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
  }, [currentModel.url, autoRotate, modelColor, backgroundColor, modelScale]);

  return (
    <div className={`${className}`} style={containerStyles}>
      <div className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm border-b border-white/10 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white drop-shadow-lg">{currentModel.title}</h3>
              {currentModel.subtitle && <p className="text-sm text-gray-200/80 drop-shadow">{currentModel.subtitle}</p>}
            </div>
            {/* <span className="text-xs text-white/60 font-medium">{currentModelIndex + 1} / {modelConfigs.length}</span> */}
          </div>
        </div>
      </div>


      {modelConfigs.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
          {modelConfigs.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentModelIndex(index);
                  setIsTransitioning(false);
                }, 500);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentModelIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-95 z-30">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            <h3 className="text-base font-semibold text-gray-900">Loading Model...</h3>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-30">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Unable to Load Model</h3>
            <p className="text-xs text-gray-600">{error}</p>
          </div>
        </div>
      )}

      <div ref={mountRef} className={`w-full h-full transition-opacity duration-500 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`} style={{ background: backgroundColor }} />

      <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
};

export default Scene;