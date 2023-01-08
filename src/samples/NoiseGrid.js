import React, {useEffect, useState, useRef} from 'react';
import * as THREE from 'three';
import { SoundMeter } from '../SoundMeter';
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js";
import { ImprovedNoise } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/math/ImprovedNoise.js';

const constraints = window.constraints = {
    audio: true,
    video: false
};


export default function NoiseGrid(){
    const canvasRef = useRef();
    const [voiceData, setVoiceData] = useState({
        instant: 0,
        slow: 0,
        clip: 0,
    })

    const data = useRef()
    let meterRefresh = null;




    function handleSuccessConnection(stream) {
        // Put variables in global scope to make them available to the
        // browser console.
        window.stream = stream;
        const soundMeter = window.soundMeter = new SoundMeter(window.audioContext);
        soundMeter.connectToSource(stream, function(e) {
          if (e) {
            alert(e);
            return;
          }
        meterRefresh = setInterval(() => {
            setVoiceData({
                instant: +soundMeter.instant.toFixed(2),
                slow: +soundMeter.slow.toFixed(2),
                clip: +soundMeter.clip
            })
            data.current = {
                instant: +soundMeter.instant.toFixed(2),
                slow: +soundMeter.slow.toFixed(2),
                clip: +soundMeter.clip
            }
            }, 100);
        });
    }

    const connect = () => {   
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            window.audioContext = new AudioContext();
        } catch (e) {
            alert('Web Audio API not supported.');
        }
        navigator.mediaDevices
        .getUserMedia(constraints)
        .then(handleSuccessConnection)
        // .catch(handleError)
       
    }

    useEffect(()=>{
        const w = window.innerWidth;
        const h = window.innerHeight;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, w / h, 0.1, 1000 );
        const renderer = new THREE.WebGLRenderer();
        camera.position.x = -2;
        camera.position.y = -5;
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
        const points = [];
        let x = 0;
        let y = 0;
        let z = 0;
        // Color
        let r = 0;
        let g = 0;
        let b = 0;
        const numCol = 80;
        const numRow = 80;
        let vertex;
        let col;
        const gap = 0.06;
        const offset = { x: -2.2, y: -2.5};
        let ns;
        let point = {
            position: {},
            rate: 0.0,
          };
        for(let i = 0; i < numCol; i++) {
            for(let j = 0; j < numRow; j++) {
                x = offset.x + i * gap;
                y = offset.y + j * gap; 
                vertex = new THREE.Vector3(x, y, z);
                r = Math.random();
                g = Math.random();
                b = Math.random();
                point = {
                    position: {
                      x,
                      y,
                      z,
                    },
                    color: new THREE.Color(r, g, b),
                  };
              
                  points.push(point);
                coords.push(x,y,z);
                colors.push(r, g, b);
            }
        }
        

        const geo = new THREE.BufferGeometry()
        geo.setAttribute("position", new THREE.Float32BufferAttribute(coords, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        const mat = new THREE.PointsMaterial({size: 0.08, vertexColors: true})
        const pointsShape = new THREE.Points(geo, mat)
        scene.add(pointsShape)



        const updatePoints = (t) => {
            const instant = data.current ? data.current.instant * 10 : 0
            console.log(instant)
            const coords = [];
            const cols = [];
            let ns;
            const nScale = 0.5;
            const zPosScale = 1.5;
            const lowColor = new THREE.Color(0.0, 0, 0.8);
            const highColor = new THREE.Color(1.5, 1.5, 1.5);
            points.forEach((p, i) => {
                ns = Noise.noise(p.position.x * nScale, p.position.y * nScale, t);
                p.position.z = ns * instant  ; // * zPosScale
                p.color.lerpColors(lowColor, highColor, ns * 1.5);
                let { r, g, b } = p.color;
                cols.push(r, g, b);
                let {x, y, z } = p.position;
                coords.push(x, y, z);
            });
            geo.setAttribute("position", new THREE.Float32BufferAttribute(coords, 3));
            geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));            
        }

        const timeMult = 0.0005;
        const animate = (timeStep) => {
            requestAnimationFrame(animate);
            updatePoints(timeStep * timeMult);
            renderer.render(scene, camera);
        }
      
        animate(0);

    },[])

    useEffect(()=>{
        console.log('voiceData', voiceData)
    },[voiceData])

    return (
        <div><button onClick={()=>connect()}>CLICK</button>
        <div ref={canvasRef}/>
        </div>
    )
}