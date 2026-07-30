/**
 * CineChroma - 3D Chromatic Cloud via Three.js
 */

let cloudScene, cloudCamera, cloudRenderer, cloudControls, cloudReqId;

window.init3DCloud = function(containerId, hexColors) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Cleanup any existing instance
  if (cloudRenderer) {
    window.cleanup3DCloud();
  }

  // 1. Setup Scene
  cloudScene = new THREE.Scene();

  // 2. Setup Camera
  const aspect = container.clientWidth / container.clientHeight;
  cloudCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
  cloudCamera.position.set(150, 150, 250);

  // 3. Setup Renderer
  cloudRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  cloudRenderer.setSize(container.clientWidth, container.clientHeight);
  cloudRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(cloudRenderer.domElement);

  // 4. Setup Controls
  cloudControls = new THREE.OrbitControls(cloudCamera, cloudRenderer.domElement);
  cloudControls.enableDamping = true;
  cloudControls.dampingFactor = 0.05;
  cloudControls.autoRotate = true;
  cloudControls.autoRotateSpeed = 2.0;

  // 5. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  cloudScene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 0.8);
  pointLight.position.set(100, 200, 100);
  cloudScene.add(pointLight);

  // 6. Grid Helper (Subtle)
  const gridHelper = new THREE.GridHelper(200, 10, 0x444444, 0x222222);
  gridHelper.position.y = -100;
  cloudScene.add(gridHelper);

  // 7. Add spheres for each color
  const sphereGeo = new THREE.SphereGeometry(12, 32, 32);

  hexColors.forEach(hex => {
    // Clean hex
    const colorStr = hex.startsWith('#') ? hex : '#' + hex;
    const color = new THREE.Color(colorStr);

    // Convert RGB to 3D coords (-100 to 100)
    const x = (color.r * 200) - 100;
    const y = (color.g * 200) - 100;
    const z = (color.b * 200) - 100;

    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.1,
      roughness: 0.2,
      emissive: color,
      emissiveIntensity: 0.4
    });

    const mesh = new THREE.Mesh(sphereGeo, material);
    mesh.position.set(x, y, z);
    cloudScene.add(mesh);

    // Add a small point light to each sphere for glow effect
    const glowLight = new THREE.PointLight(color, 0.5, 50);
    mesh.add(glowLight);
  });

  // 8. Handle Resize
  window.addEventListener('resize', onCloudResize);

  // 9. Animation Loop
  function animate() {
    cloudReqId = requestAnimationFrame(animate);
    cloudControls.update();
    cloudRenderer.render(cloudScene, cloudCamera);
  }
  animate();
};

function onCloudResize() {
  const container = document.getElementById('modal-3d-cloud');
  if (!container || !cloudCamera || !cloudRenderer) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  cloudCamera.aspect = width / height;
  cloudCamera.updateProjectionMatrix();
  cloudRenderer.setSize(width, height);
}

window.cleanup3DCloud = function() {
  if (cloudReqId) {
    cancelAnimationFrame(cloudReqId);
    cloudReqId = null;
  }
  
  window.removeEventListener('resize', onCloudResize);

  if (cloudScene) {
    cloudScene.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }

  if (cloudRenderer) {
    cloudRenderer.dispose();
    const dom = cloudRenderer.domElement;
    if (dom && dom.parentNode) {
      dom.parentNode.removeChild(dom);
    }
  }

  if (cloudControls) {
    cloudControls.dispose();
  }

  cloudScene = null;
  cloudCamera = null;
  cloudRenderer = null;
  cloudControls = null;
};
