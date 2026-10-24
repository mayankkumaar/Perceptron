import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { CameraMode } from '../../types';
import { LEVELS } from '../../game/levels';
import { Camera, RefreshCw, Eye, Video, Compass, MapPin } from 'lucide-react';

interface ParkingCanvasProps {
  className?: string;
}

export const ParkingCanvas: React.FC<ParkingCanvasProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Zustand selectors
  const cameraMode = useStore((s) => s.cameraMode);
  const setCameraMode = useStore((s) => s.setCameraMode);
  const theme = useStore((s) => s.theme);
  const setInputs = useStore((s) => s.setInputs);
  const resetVehicle = useStore((s) => s.resetVehicle);
  const togglePause = useStore((s) => s.togglePause);
  const currentLevelIndex = useStore((s) => s.currentLevelIndex);
  const sensors = useStore((s) => s.sensors);
  const perceptron = useStore((s) => s.perceptron);
  const vehicle = useStore((s) => s.vehicle);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const isLight = useStore.getState().theme === 'light';

    const bgHex = isLight ? 0xf1f5f9 : 0x0a0f1d;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, isLight ? 0.014 : 0.018);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 16, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isLight ? 1.05 : 1.15;

    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(isLight ? 0xffffff : 0x94a3b8, isLight ? 0.95 : 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(isLight ? 0xffffff : 0xe0f2fe, isLight ? 1.45 : 1.3);
    sunLight.position.set(12, 22, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Accent lamp lights
    const lampLight1 = new THREE.PointLight(isLight ? 0x0284c7 : 0x00f0ff, isLight ? 0.8 : 1.2, 15);
    lampLight1.position.set(-8, 5, -2);
    scene.add(lampLight1);

    const lampLight2 = new THREE.PointLight(isLight ? 0x38bdf8 : 0x38bdf8, isLight ? 0.8 : 1.2, 15);
    lampLight2.position.set(8, 5, -2);
    scene.add(lampLight2);

    // 3. Ground / Asphalt Parking Lot
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x334155 : 0x111726,
      roughness: 0.85,
      metalness: 0.15,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid markings on ground
    const gridHelper = new THREE.GridHelper(60, 30, isLight ? 0x64748b : 0x1e293b, isLight ? 0x475569 : 0x151f33);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // 4. Target Parking Bay Marker Group
    const targetBayGroup = new THREE.Group();
    scene.add(targetBayGroup);

    // 5. Obstacle Meshes Group
    const obstacleGroup = new THREE.Group();
    scene.add(obstacleGroup);

    // 6. Build Player Vehicle
    const carGroup = new THREE.Group();
    scene.add(carGroup);

    // Car Body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x1e3a8a : 0x1e293b,
      metalness: 0.75,
      roughness: 0.25,
    });
    const bodyGeo = new THREE.BoxGeometry(1.9, 0.75, 4.0);
    const carBody = new THREE.Mesh(bodyGeo, bodyMat);
    carBody.position.y = 0.55;
    carBody.castShadow = true;
    carBody.receiveShadow = true;
    carGroup.add(carBody);

    // Roof / Cabin Glass
    const cabinMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.65,
      transparent: true,
      opacity: 0.85,
    });
    const cabinGeo = new THREE.BoxGeometry(1.6, 0.6, 2.2);
    const carCabin = new THREE.Mesh(cabinGeo, cabinMat);
    carCabin.position.set(0, 1.05, -0.2);
    carCabin.castShadow = true;
    carGroup.add(carCabin);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.28, 20);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });

    const createWheel = () => {
      const wheelHub = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.castShadow = true;
      wheelHub.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 12), rimMat);
      rim.rotateZ(Math.PI / 2);
      wheelHub.add(rim);
      return wheelHub;
    };

    const frontLeftWheel = createWheel();
    frontLeftWheel.position.set(-0.95, 0.35, 1.3);
    carGroup.add(frontLeftWheel);

    const frontRightWheel = createWheel();
    frontRightWheel.position.set(0.95, 0.35, 1.3);
    carGroup.add(frontRightWheel);

    const rearLeftWheel = createWheel();
    rearLeftWheel.position.set(-0.95, 0.35, -1.3);
    carGroup.add(rearLeftWheel);

    const rearRightWheel = createWheel();
    rearRightWheel.position.set(0.95, 0.35, -1.3);
    carGroup.add(rearRightWheel);

    // Headlights (Front is +Z)
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const headlightGeo = new THREE.BoxGeometry(0.35, 0.15, 0.08);

    const hlLeft = new THREE.Mesh(headlightGeo, headlightMat);
    hlLeft.position.set(-0.65, 0.6, 2.02);
    carGroup.add(hlLeft);

    const hlRight = new THREE.Mesh(headlightGeo, headlightMat);
    hlRight.position.set(0.65, 0.6, 2.02);
    carGroup.add(hlRight);

    // Headlight Spotlights
    const spotLeft = new THREE.SpotLight(0xbae6fd, 2.5, 14, Math.PI / 6, 0.4);
    spotLeft.position.set(-0.65, 0.6, 2.1);
    const spotLeftTarget = new THREE.Object3D();
    spotLeftTarget.position.set(-0.65, 0, 8);
    carGroup.add(spotLeft);
    carGroup.add(spotLeftTarget);
    spotLeft.target = spotLeftTarget;

    const spotRight = new THREE.SpotLight(0xbae6fd, 2.5, 14, Math.PI / 6, 0.4);
    spotRight.position.set(0.65, 0.6, 2.1);
    const spotRightTarget = new THREE.Object3D();
    spotRightTarget.position.set(0.65, 0, 8);
    carGroup.add(spotRight);
    carGroup.add(spotRightTarget);
    spotRight.target = spotRightTarget;

    // Taillights (Rear is -Z)
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const tlLeft = new THREE.Mesh(headlightGeo, taillightMat);
    tlLeft.position.set(-0.65, 0.65, -2.02);
    carGroup.add(tlLeft);

    const tlRight = new THREE.Mesh(headlightGeo, taillightMat);
    tlRight.position.set(0.65, 0.65, -2.02);
    carGroup.add(tlRight);

    // Reverse Lights (White LEDs when reversing)
    const reverseLightMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
    const rlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.08), reverseLightMat);
    rlLeft.position.set(-0.35, 0.65, -2.02);
    carGroup.add(rlLeft);

    const rlRight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.08), reverseLightMat);
    rlRight.position.set(0.35, 0.65, -2.02);
    carGroup.add(rlRight);

    // Reverse Spotlight behind car
    const reverseSpot = new THREE.SpotLight(0xffffff, 0, 10, Math.PI / 4, 0.3);
    reverseSpot.position.set(0, 0.7, -2.1);
    const reverseSpotTarget = new THREE.Object3D();
    reverseSpotTarget.position.set(0, 0, -8);
    carGroup.add(reverseSpot);
    carGroup.add(reverseSpotTarget);
    reverseSpot.target = reverseSpotTarget;

    // Sonar Beams
    const sonarMat1 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.28,
      wireframe: true,
    });
    const sonarConeGeo = new THREE.ConeGeometry(0.9, 2.8, 12, 1, true);
    sonarConeGeo.rotateX(-Math.PI / 2);
    const sonarCone1 = new THREE.Mesh(sonarConeGeo, sonarMat1);
    sonarCone1.position.set(-0.6, 0.45, -3.4);
    carGroup.add(sonarCone1);

    const sonarMat2 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.28,
      wireframe: true,
    });
    const sonarCone2 = new THREE.Mesh(sonarConeGeo, sonarMat2);
    sonarCone2.position.set(0.6, 0.45, -3.4);
    carGroup.add(sonarCone2);

    // Hit Marker Spheres
    const hitMarkerMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const hitMarker1 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), hitMarkerMat);
    hitMarker1.visible = false;
    scene.add(hitMarker1);

    const hitMarker2 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), hitMarkerMat);
    hitMarker2.visible = false;
    scene.add(hitMarker2);

    // 7. Helper: Build Level Environment
    let builtLevelId = -1;
    const movingMeshes: { mesh: THREE.Mesh; id: string }[] = [];

    const rebuildLevelEnvironment = (lvlId: number) => {
      while (obstacleGroup.children.length > 0) {
        const obj = obstacleGroup.children[0];
        obstacleGroup.remove(obj);
      }
      while (targetBayGroup.children.length > 0) {
        const obj = targetBayGroup.children[0];
        targetBayGroup.remove(obj);
      }
      movingMeshes.length = 0;

      const level = LEVELS[lvlId - 1] || LEVELS[0];

      // Draw Parking Bay
      const bay = level.targetBay;
      const bayBox = new THREE.BoxGeometry(bay.width, 0.03, bay.length);
      const bayMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.2,
      });
      const bayMesh = new THREE.Mesh(bayBox, bayMat);
      bayMesh.position.set(bay.x, 0.02, bay.z);
      targetBayGroup.add(bayMesh);

      const edges = new THREE.EdgesGeometry(bayBox);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
      const bayEdges = new THREE.LineSegments(edges, lineMat);
      bayEdges.position.copy(bayMesh.position);
      targetBayGroup.add(bayEdges);

      // Sign board
      const signPost = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 2.4),
        new THREE.MeshStandardMaterial({ color: 0x64748b })
      );
      signPost.position.set(bay.x - bay.width / 2 - 0.4, 1.2, bay.z - bay.length / 2);
      targetBayGroup.add(signPost);

      const signBoard = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.7, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x0284c7 })
      );
      signBoard.position.set(bay.x - bay.width / 2 - 0.4, 2.2, bay.z - bay.length / 2);
      targetBayGroup.add(signBoard);

      // Obstacles
      level.obstacles.forEach((obs) => {
        let obsMesh: THREE.Mesh;

        if (obs.type === 'parked-car') {
          const pCarGroup = new THREE.Group();
          const pBody = new THREE.Mesh(
            new THREE.BoxGeometry(obs.width, 0.75, obs.depth),
            new THREE.MeshStandardMaterial({ color: obs.color || 0x334155, roughness: 0.3, metalness: 0.7 })
          );
          pBody.position.y = 0.55;
          pBody.castShadow = true;
          pCarGroup.add(pBody);

          const pCabin = new THREE.Mesh(
            new THREE.BoxGeometry(obs.width * 0.85, 0.6, obs.depth * 0.55),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
          );
          pCabin.position.set(0, 1.05, 0);
          pCabin.castShadow = true;
          pCarGroup.add(pCabin);

          pCarGroup.position.set(obs.x, 0, obs.z);
          obstacleGroup.add(pCarGroup);
          return;
        }

        if (obs.type === 'pillar') {
          const colGeo = new THREE.CylinderGeometry(obs.width / 2, obs.width / 2, obs.height, 16);
          const colMat = new THREE.MeshStandardMaterial({ color: obs.color || 0x64748b, roughness: 0.7 });
          obsMesh = new THREE.Mesh(colGeo, colMat);
          obsMesh.position.set(obs.x, obs.height / 2, obs.z);
        } else {
          const boxGeo = new THREE.BoxGeometry(obs.width, obs.height, obs.depth);
          const boxMat = new THREE.MeshStandardMaterial({ color: obs.color || 0x334155, roughness: 0.6 });
          obsMesh = new THREE.Mesh(boxGeo, boxMat);
          obsMesh.position.set(obs.x, obs.height / 2, obs.z);
        }

        obsMesh.castShadow = true;
        obsMesh.receiveShadow = true;
        obstacleGroup.add(obsMesh);

        if (obs.moving) {
          movingMeshes.push({ mesh: obsMesh, id: obs.id });
        }
      });

      builtLevelId = lvlId;
    };

    // 8. Animation & Simulation Render Loop
    let lastTime = performance.now();
    let animationFrameId: number;

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const currentLevel = useStore.getState().currentLevelIndex;
      if (builtLevelId !== currentLevel) {
        rebuildLevelEnvironment(currentLevel);
      }

      useStore.getState().stepSimulation(dt);

      const state = useStore.getState();
      const veh = state.vehicle;
      const s = state.sensors;
      const p = state.perceptron;
      const activeCamMode = state.cameraMode;

      // Update Car Position & Heading
      carGroup.position.set(veh.x, 0, veh.z);
      carGroup.rotation.y = veh.heading;

      // Steer wheels
      frontLeftWheel.rotation.y = veh.steeringAngle;
      frontRightWheel.rotation.y = veh.steeringAngle;

      const wheelSpin = (veh.speed / 0.35) * dt;
      frontLeftWheel.children[0].rotation.x += wheelSpin;
      frontRightWheel.children[0].rotation.x += wheelSpin;
      rearLeftWheel.children[0].rotation.x += wheelSpin;
      rearRightWheel.children[0].rotation.x += wheelSpin;

      // Reverse lights
      if (veh.isReversing) {
        reverseLightMat.color.setHex(0xffffff);
        reverseSpot.intensity = 2.0;
      } else {
        reverseLightMat.color.setHex(0x1e293b);
        reverseSpot.intensity = 0;
      }

      // Sonar colors
      let sonarColor = 0x10b981;
      if (p.y === 1) {
        if (s.nearestDistance <= 30) {
          sonarColor = 0xef4444;
        } else {
          sonarColor = 0xf59e0b;
        }
      }
      sonarMat1.color.setHex(sonarColor);
      sonarMat2.color.setHex(sonarColor);

      const pulse = 0.2 + 0.15 * Math.sin(time * 0.008);
      sonarMat1.opacity = pulse;
      sonarMat2.opacity = pulse;

      // Hit markers
      if (s.rayHitPointLeft) {
        hitMarker1.visible = true;
        hitMarker1.position.set(s.rayHitPointLeft[0], s.rayHitPointLeft[1], s.rayHitPointLeft[2]);
      } else {
        hitMarker1.visible = false;
      }

      if (s.rayHitPointRight) {
        hitMarker2.visible = true;
        hitMarker2.position.set(s.rayHitPointRight[0], s.rayHitPointRight[1], s.rayHitPointRight[2]);
      } else {
        hitMarker2.visible = false;
      }

      // Moving obstacles
      const lvlConfig = LEVELS[currentLevel - 1] || LEVELS[0];
      lvlConfig.obstacles.forEach((obs) => {
        if (obs.moving) {
          const match = movingMeshes.find((m) => m.id === obs.id);
          if (match) {
            match.mesh.position.x = obs.x;
          }
        }
      });

      // CAMERA MODES: TPP BACK CAMERA (REAR CHASE), BUMPER BACKUP CAM, TPP CHASE, TOP-DOWN
      const sinH = Math.sin(veh.heading);
      const cosH = Math.cos(veh.heading);

      if (activeCamMode === 'tppBack') {
        // TPP BACK CAMERA: Third-Person Perspective positioned elevated looking REARWARD over the car towards obstacles & bay
        const targetCamX = veh.x + 5.5 * sinH;
        const targetCamY = 3.6;
        const targetCamZ = veh.z + 5.5 * cosH;

        camera.position.x += (targetCamX - camera.position.x) * 0.14;
        camera.position.y += (targetCamY - camera.position.y) * 0.14;
        camera.position.z += (targetCamZ - camera.position.z) * 0.14;

        const targetLookX = veh.x - 7.5 * sinH;
        const targetLookZ = veh.z - 7.5 * cosH;
        camera.lookAt(targetLookX, 0.5, targetLookZ);

      } else if (activeCamMode === 'backup') {
        // REAR BUMPER BACKUP CAMERA (Bumper-mounted wide-angle lens looking directly backward with parking guidelines)
        const targetCamX = veh.x - 1.85 * sinH;
        const targetCamY = 1.35;
        const targetCamZ = veh.z - 1.85 * cosH;

        camera.position.x += (targetCamX - camera.position.x) * 0.20;
        camera.position.y += (targetCamY - camera.position.y) * 0.20;
        camera.position.z += (targetCamZ - camera.position.z) * 0.20;

        const targetLookX = veh.x - 10.0 * sinH;
        const targetLookZ = veh.z - 10.0 * cosH;
        camera.lookAt(targetLookX, 0.35, targetLookZ);

      } else if (activeCamMode === 'tpp') {
        // TPP FORWARD CHASE (Behind vehicle looking forward, with auto rear tilt when reversing)
        const isRev = veh.isReversing;
        const targetCamX = veh.x - 6.5 * sinH;
        const targetCamY = isRev ? 3.8 : 2.8;
        const targetCamZ = veh.z - 6.5 * cosH;

        camera.position.x += (targetCamX - camera.position.x) * 0.12;
        camera.position.y += (targetCamY - camera.position.y) * 0.12;
        camera.position.z += (targetCamZ - camera.position.z) * 0.12;

        const targetLookX = isRev ? veh.x - 2.0 * sinH : veh.x + 4.0 * sinH;
        const targetLookZ = isRev ? veh.z - 2.0 * cosH : veh.z + 4.0 * cosH;
        camera.lookAt(targetLookX, 0.8, targetLookZ);

      } else if (activeCamMode === 'isometric') {
        const targetCamX = veh.x + Math.sin(veh.heading + 0.3) * 11;
        const targetCamZ = veh.z + Math.cos(veh.heading + 0.3) * 11;
        camera.position.x += (targetCamX - camera.position.x) * 0.08;
        camera.position.y += (11 - camera.position.y) * 0.08;
        camera.position.z += (targetCamZ - camera.position.z) * 0.08;
        camera.lookAt(veh.x, 0.6, veh.z);

      } else {
        // topDown bird's eye
        camera.position.x += (veh.x - camera.position.x) * 0.12;
        camera.position.y += (22 - camera.position.y) * 0.12;
        camera.position.z += (veh.z - camera.position.z) * 0.12;
        camera.lookAt(veh.x, 0, veh.z);
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [theme]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setInputs({ forward: true });
          break;
        case 's':
        case 'arrowdown':
          setInputs({ reverse: true });
          break;
        case 'a':
        case 'arrowleft':
          setInputs({ left: true });
          break;
        case 'd':
        case 'arrowright':
          setInputs({ right: true });
          break;
        case ' ':
          setInputs({ brake: true });
          break;
        case 'r':
          resetVehicle();
          break;
        case 'p':
          togglePause();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setInputs({ forward: false });
          break;
        case 's':
        case 'arrowdown':
          setInputs({ reverse: false });
          break;
        case 'a':
        case 'arrowleft':
          setInputs({ left: false });
          break;
        case 'd':
        case 'arrowright':
          setInputs({ right: false });
          break;
        case ' ':
          setInputs({ brake: false });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setInputs, resetVehicle, togglePause]);

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className || ''}`}>
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Backup Camera Guideline Overlay (Visible in 'backup' mode) */}
      {cameraMode === 'backup' && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
          <div className="flex items-center justify-between">
            <div className="px-3 py-1 rounded-md bg-black/75 text-emerald-400 font-mono text-xs flex items-center gap-2 border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>REAR BACKUP CAMERA • TPP GUIDELINES ACTIVE</span>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-black/75 text-white font-mono text-xs border border-white/20">
              CLEARANCE: <strong className={sensors.nearestDistance <= 30 ? 'text-red-400' : 'text-emerald-400'}>{sensors.nearestDistance} cm</strong>
            </div>
          </div>

          {/* Guidelines Graphic Overlay */}
          <div className="relative w-full h-48 flex items-end justify-center">
            <svg viewBox="0 0 400 160" className="w-full max-w-lg h-full opacity-85">
              {/* Dynamic trajectory curves */}
              <path d="M 60 160 L 140 20 L 260 20 L 340 160" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* Green Zone Guide Line (>100 cm) */}
              <line x1="120" y1="50" x2="280" y2="50" stroke="#10b981" strokeWidth="3" />
              <text x="290" y="54" fill="#10b981" fontSize="10" fontFamily="JetBrains Mono">100cm</text>
              {/* Yellow Zone Guide Line (30 - 100 cm) */}
              <line x1="90" y1="95" x2="310" y2="95" stroke="#f59e0b" strokeWidth="3" />
              <text x="320" y="99" fill="#f59e0b" fontSize="10" fontFamily="JetBrains Mono">50cm</text>
              {/* Red Critical Stop Line (30 cm) */}
              <line x1="60" y1="140" x2="340" y2="140" stroke="#ef4444" strokeWidth="4" />
              <text x="350" y="144" fill="#ef4444" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">STOP 30cm</text>
            </svg>
          </div>
        </div>
      )}

      {/* Camera Angle Selector Toolbar Overlay */}
      <div className="absolute top-4 right-4 flex flex-wrap items-center gap-1.5 z-10">
        <button
          onClick={() => setCameraMode('tppBack')}
          className={`px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-mono transition flex items-center gap-1.5 shadow-md ${
            cameraMode === 'tppBack'
              ? 'bg-sky-500 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400 font-bold shadow-sm'
              : 'bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="TPP Back Camera: Elevated chase view looking rearward over the car towards obstacles & parking bay"
        >
          <Camera className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400" />
          <span>TPP Back Cam</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-700 dark:text-amber-300 font-bold hidden sm:inline">REC</span>
        </button>

        <button
          onClick={() => setCameraMode('backup')}
          className={`px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-mono transition flex items-center gap-1.5 shadow-md ${
            cameraMode === 'backup'
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
              : 'bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Rear Bumper Camera Feed with active trajectory guidelines"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Bumper Cam</span>
        </button>

        <button
          onClick={() => setCameraMode('tpp')}
          className={`px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-mono transition flex items-center gap-1.5 shadow-md ${
            cameraMode === 'tpp'
              ? 'bg-sky-500 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400 font-bold shadow-sm'
              : 'bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Standard TPP Chase View"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>TPP Chase</span>
        </button>

        <button
          onClick={() => setCameraMode('topDown')}
          className={`px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-mono transition flex items-center gap-1.5 shadow-md ${
            cameraMode === 'topDown'
              ? 'bg-sky-500 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400 font-bold shadow-sm'
              : 'bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Top-Down Bird's Eye Radar View"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Radar</span>
        </button>

        <button
          onClick={resetVehicle}
          className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shadow-md"
          title="Reset Vehicle to Starting Position (R)"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Picture-in-Picture (PiP) In-Dash Backup Monitor (When not in full backup mode) */}
      {cameraMode !== 'backup' && (
        <div
          onClick={() => setCameraMode('backup')}
          className="absolute bottom-4 right-4 z-10 w-44 sm:w-52 p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl cursor-pointer group transition hover:border-amber-400 hover:scale-[1.02]"
          title="Click to expand full Rear Backup Camera"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-white mb-1 px-1">
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              BACK CAM (PiP)
            </span>
            <span className={sensors.nearestDistance <= 30 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
              {sensors.nearestDistance} cm
            </span>
          </div>

          <div className="relative w-full h-16 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
            {/* Trajectory Guide SVG */}
            <svg viewBox="0 0 200 80" className="w-full h-full opacity-80">
              <path d="M 30 80 L 70 10 L 130 10 L 170 80" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="60" y1="25" x2="140" y2="25" stroke="#10b981" strokeWidth="2" />
              <line x1="45" y1="50" x2="155" y2="50" stroke="#f59e0b" strokeWidth="2" />
              <line x1="30" y1="72" x2="170" y2="72" stroke="#ef4444" strokeWidth="2.5" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] font-mono text-slate-300 bg-black/25">
              <span className="font-bold text-white text-[11px]">TPP BACKUP VIEW</span>
              <span className="text-[9px] text-amber-300 opacity-90 group-hover:underline">Click to Full View</span>
            </div>
          </div>
        </div>
      )}

      {/* Level Badge Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-cyan-500/30 text-xs shadow-md">
          <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-cyan-400 animate-pulse"></span>
          <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
            LEVEL {currentLevelIndex}: {LEVELS[currentLevelIndex - 1]?.title.split(':')[1] || 'PARKING'}
          </span>
        </div>
      </div>
    </div>
  );
};
