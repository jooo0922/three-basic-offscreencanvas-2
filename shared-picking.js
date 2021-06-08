'use strict';

import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

// 메인 스크립트에서 resize 될때마다 메시지에 담아 보내주는 캔버스 사이즈를 할당할 객체 
export const state = {
  width: 300,
  height: 150 // 둘 다 캔버스의 기본 사이즈를 할당해놓음
}

// pickPosition은 mousemove이벤트가 발생하면 마우스 포인터 좌표를 기록해놓는 객체
export const pickPosition = {
  x: 0,
  y: 0
};

export function init(data) {
  const {
    canvas
  } = data;
  const renderer = new THREE.WebGLRenderer({
    canvas
  });

  const fov = 75;
  const aspect = 2
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.z = 2;

  const scene = new THREE.Scene();

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({
      color
    });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.x = x;

    return cube;
  }

  const cubes = [
    makeInstance(geometry, 0x44aa88, 0),
    makeInstance(geometry, 0x8844aa, -2),
    makeInstance(geometry, 0xaa8844, 2),
  ];

  // 물체를 피킹(picking)할 수 있도록 RayCaster 예제에서 코드 일부를 가져옴.
  // 이 코드는 나중에 RayCaster를 사용해서 물체를 피킹하는 방법에 대해서 배울 때 공부할거임.
  class PickHelper {
    constructor() {
      this.raycaster = new THREE.Raycaster();
      this.pickedObject = null;
      this.pickedObjectSavedColor = 0;
    }
    pick(normalizedPosition, scene, camera, time) {
      // 이미 다른 물체를 피킹했다면 색을 복원합니다
      if (this.pickedObject) {
        this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
        this.pickedObject = undefined;
      }

      // 절두체 안에 광선을 쏩니다
      this.raycaster.setFromCamera(normalizedPosition, camera);
      // 광선과 교차하는 물체들을 배열로 만듭니다
      const intersectedObjects = this.raycaster.intersectObjects(scene.children);
      if (intersectedObjects.length) {
        // 첫 번째 물체가 제일 가까우므로 해당 물체를 고릅니다
        this.pickedObject = intersectedObjects[0].object;
        // 기존 색을 저장해둡니다
        this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
        // emissive 색을 빨강/노랑으로 빛나게 만듭니다
        this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
      }
    }
  }

  const pickHelper = new PickHelper();

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;

    // WebGLRenderer를 리사이징하는 메소드에서도 stage 객체의 값들을 쓰도록 변경해 줌.
    const width = state.width;
    const height = state.height;

    const needResize = canvas.width !== width || canvas.height !== height;

    if (needResize) {
      renderer.setSize(width, height, false);
    }

    return needResize;
  }

  function animate(t) {
    t *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      camera.aspect = state.width / state.height; // 카메라의 aspect도 state 객체의 값으로 계산하도록 변경해 줌.
      camera.updateProjectionMatrix();
    }

    cubes.forEach((cube, index) => {
      const speed = 1 + index * 0.1;
      const rotate = t * speed;
      cube.rotation.x = rotate;
      cube.rotation.y = rotate;
    });

    // pickPosition을 전달하면서 pickHelper의 pick 메소드를 호출함.
    pickHelper.pick(pickPosition, scene, camera, t);

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}