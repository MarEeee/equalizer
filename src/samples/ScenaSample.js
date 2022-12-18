import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";


export default function ScenaSample() {
  const canvasRef = useRef()

  useEffect(()=>{
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 150 );
    const loader = new THREE.TextureLoader();

    
    scene.background = new THREE.Color( 0x333333 );
		// scene.fog = new THREE.Fog( 0x333333, 12, 50);

    const planeSize = 50;
    const texture = loader.load('https://r105.threejsfundamentals.org/threejs/resources/images/checker.png');

    const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    planeMat.color.setRGB(1.5, 1.5, 5);
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);

    // const grid = new THREE.GridHelper( 20, 40, 0xffffff, 0xffffff );
    // grid.material.opacity = 0.2;
    // grid.material.depthWrite = false;
    // grid.material.transparent = true;
    // scene.add( grid );

    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0xB97A20;  // brownish orange
    const intensity = 2;

    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);

    {
      const color = 0xFFFFFF;
      const intensity = 1;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(0, 10, 5);
      light.target.position.set(-5, 0, 0);
      scene.add(light);
      scene.add(light.target);
    }

   

    
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    canvasRef.current.appendChild( renderer.domElement );
    renderer.physicallyCorrectLights = true;
    
    // const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    // const material = new THREE.MeshBasicMaterial( { color: 0x00000 } );
    // const cube = new THREE.Mesh( geometry, material );
    // scene.add( cube );

      const sphereRadius = 1;
      const sphereWidthDivisions = 32;
      const sphereHeightDivisions = 16;
      const sphereGeo = new THREE.SphereBufferGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
      const base = new THREE.Object3D();
      scene.add(base);

      const sphereMat = new THREE.MeshPhongMaterial();
      sphereMat.color.setHSL(.2, 1, .75);
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(0, sphereRadius + 2, 0);
      base.add(sphereMesh);


    const controls = new OrbitControls( camera, renderer.domElement );
    camera.position.set( 10, 20, 50 );
    controls.update();
    
    renderer.render( scene, camera );
    window.addEventListener( 'resize', onWindowResize );

    
    const time = 0.001;
    const yOff = Math.abs(Math.sin(time * 2));
    sphereMesh.position.y += THREE.MathUtils.lerp(-2, 2, yOff);
    
    function animate() {
      requestAnimationFrame( animate );
      // const speed = time * .2;
      // const angle = speed + Math.PI * 2 * (1);
      // const radius = Math.sin(speed) * 10;
      // base.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

   

      

      // sphereMesh.rotation.x += 0.01;
      // sphereMesh.rotation.y += 0.01;
      // sphereMesh.rotation.z += 0.01;


      renderer.render( scene, camera );
    };

    animate();

    function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );

    }
  },[])
  return (
    <div className="App" ref={canvasRef}/>
  );
}

