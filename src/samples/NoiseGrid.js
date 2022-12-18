import React, {useEffect, useRef} from 'react'
import * as THREE from 'three';


export default function NoiseGrid(){
    const canvasRef = useRef()

    useEffect(()=>{
        const w = window.innerWidth;
        const h = window.innerHeight;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, w / h, 0.1, 1000 );
        const renderer = new THREE.WebGLRenderer()
        camera.position.z = 5
        renderer.setSize(w, h)
        canvasRef.current.appendChild( renderer.domElement );

        
        const coords = [];
        const colors = [];
        let x = 0;
        let y = 0;
        let z = 0;
        // COLOR
        let r = 0;
        let g = 0;
        let b = 0;
        const numCol = 20;
        const numRow = 20;
        let vertex;
        let col;
        const gap = 0.25;
        const offset = { x: -2.2, y: -2.5};
        for(let i = 0; i < numCol; i++) {
            for(let j = 0; j < numRow; j++) {
                x = offset.x + i * gap
                y = offset.y + j * gap
                vertex = new THREE.Vector3(x, y, z)
                r = Math.random()
                g = Math.random()
                b = Math.random()
                col = new THREE.Color(r, g, b)
                coords.push(x,y,z)
                colors.push(r, g, b)
            }
        }
        

        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3))
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        const mat = new THREE.PointsMaterial({size: 0.3, vertexColors: true})
        const points = new THREE.Points(geo, mat)
        scene.add(points)


        renderer.render( scene, camera );

    },[])
    return (
        <div className="App" ref={canvasRef}/>
    )
}