import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js";
import { ImprovedNoise } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/math/ImprovedNoise.js';


export default function NoiseGrid(){
    const canvasRef = useRef();

    useEffect(()=>{
        const w = window.innerWidth;
        const h = window.innerHeight;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, w / h, 0.1, 1000 );
        const renderer = new THREE.WebGLRenderer();
        camera.position.z = 5;
        renderer.setSize(w, h);
        canvasRef.current.appendChild( renderer.domElement );


        // Orbit Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.update();
        
        

        const Noise = new ImprovedNoise()
        const coords = [];
        const colors = [];
        let x = 0;
        let y = 0;
        let z = 0;
        // Color
        let r = 0;
        let g = 0;
        let b = 0;
        const numCol = 40;
        const numRow = 40;
        let vertex;
        let col;
        const gap = 0.125;
        const offset = { x: -2.2, y: -2.5};
        let ns;
        for(let i = 0; i < numCol; i++) {
            for(let j = 0; j < numRow; j++) {
                x = offset.x + i * gap;
                y = offset.y + j * gap;                
                ns = Noise.noise(x, y, 0);
                z = ns;
                vertex = new THREE.Vector3(x, y, z);
                r = Math.random();
                g = 0;
                b = 0;
                col = new THREE.Color(r, g, b);
                coords.push(x,y,z);
                colors.push(r, g, b);
            }
        }
        

        const geo = new THREE.BufferGeometry()
        geo.setAttribute("position", new THREE.Float32BufferAttribute(coords, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        const mat = new THREE.PointsMaterial({size: 0.15, vertexColors: true})
        const points = new THREE.Points(geo, mat)
        scene.add(points)


        // renderer.render( scene, camera );
        function animate() {
            requestAnimationFrame( animate );           
      
            renderer.render( scene, camera );
          };
      
          animate();

    },[])
    return (
        <div className="App" ref={canvasRef}/>
    )
}