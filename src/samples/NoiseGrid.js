import React, {useEffect, useState, useRef} from 'react';
import * as THREE from 'three';
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js";
import { ImprovedNoise } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/math/ImprovedNoise.js';


export default function NoiseGrid(){
    const canvasRef = useRef();
    const [dataChannelLog, setDataChannelLog] = useState('')
    const [logs, setLogs] = useState('')

    // peer connection
    let pc = null;
    // data channel
    var dc = null, dcInterval = null;
    let ac = null;

    function current_stamp() {
        let time_start = null
        if (time_start === null) {
            time_start = new Date().getTime();
            return 0;
        } else {
            return new Date().getTime() - time_start;
        }
    }

    // function escapeRegExp(string) {
    //     return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    // }

    // function sdpFilterCodec(kind, codec, realSdp) {
    //     var allowed = []
    //     var rtxRegex = new RegExp('a=fmtp:(\\d+) apt=(\\d+)\r$');
    //     var codecRegex = new RegExp('a=rtpmap:([0-9]+) ' + escapeRegExp(codec))
    //     var videoRegex = new RegExp('(m=' + kind + ' .*?)( ([0-9]+))*\\s*$')

    //     var lines = realSdp.split('\n');

    //     var isKind = false;
    //     for (var i = 0; i < lines.length; i++) {
    //         if (lines[i].startsWith('m=' + kind + ' ')) {
    //             isKind = true;
    //         } else if (lines[i].startsWith('m=')) {
    //             isKind = false;
    //         }

    //         if (isKind) {
    //             var match = lines[i].match(codecRegex);
    //             if (match) {
    //                 allowed.push(parseInt(match[1]));
    //             }

    //             match = lines[i].match(rtxRegex);
    //             if (match && allowed.includes(parseInt(match[2]))) {
    //                 allowed.push(parseInt(match[1]));
    //             }
    //         }
    //     }
    // }

    function negotiate() {
        return pc.createOffer().then(function(offer) {
            return pc.setLocalDescription(offer);
        }).then(function() {
            // wait for ICE gathering to complete
            return new Promise(function(resolve) {
                if (pc.iceGatheringState === 'complete') {
                    resolve();
                } else {
                    function checkState() {
                        if (pc.iceGatheringState === 'complete') {
                            pc.removeEventListener('icegatheringstatechange', checkState);
                            resolve();
                        }
                    }
                    pc.addEventListener('icegatheringstatechange', checkState);
                }
            
            });
        }).then(function() {
            // var offer = pc.localDescription;
            // var codec;

            // codec = 'default'
            // if (codec !== 'default') {
            //     offer.sdp = sdpFilterCodec('audio', codec, offer.sdp);
            // }

            // console.log('offer.sdp', offer.sdp)
            // console.log('offer.sdp', offer.type)
        // }).then(function(answer) {
        //     console.log('answer-sdp', answer)
        //     // document.getElementById('answer-sdp').textContent = answer.sdp;
        //     return pc.setRemoteDescription(answer);
        }).catch(function(e) {
            console.log('answer-sdp', e)
            alert(e);
        });
        }

    function createPeerConnection() {
        let config = {
            sdpSemantics: 'unified-plan'
        };

        pc = new RTCPeerConnection(config);

        // register some listeners to help debugging
        // pc.addEventListener('icegatheringstatechange', function() {
        //     setLogs(pc.iceGatheringState)
        //     // iceGatheringLog += ' -> ' + pc.iceGatheringState;
        // }, false);
        // iceGatheringLog = pc.iceGatheringState;

        // pc.addEventListener('iceconnectionstatechange', function() {
        //     setLogs(pc.iceConnectionState)
        // }, false);
        // iceConnectionLog = pc.iceConnectionState;

        // pc.addEventListener('signalingstatechange', function() {
        //     setLogs(pc.signalingState)
       
        // }, false);
        // signalingLog = pc.signalingState;

        // // connect audio / video
        // pc.addEventListener('track', function(evt) {
        //     setLogs(evt)
        //     console.log('evt', evt)
        //     console.log(evt.streams[0])
        // // });
        // pc.ontrack = function(event) {
        //     console.log('call')
            
        //     console.log('evt', new MediaStream([event.track]))
        //     setLogs(new MediaStream([event.track]))
        //     // document.getElementById("received_video").srcObject = new MediaStream([event.track]);
        //   };

        return pc;
    }

    const connect = () => {   
        pc = createPeerConnection();
        dc = pc.createDataChannel('chat');
        dc.onclose = function() {
            clearInterval(dcInterval);
            setDataChannelLog(dataChannelLog +'- close\n')
        };
        dc.onopen = function() {
            console.log('channel is open')
            setDataChannelLog(dataChannelLog + '- open\n')
            dcInterval = setInterval(function() {
                var message = 'ping ' + current_stamp();
                setDataChannelLog(dataChannelLog + '> ' + message + '\n')
                dc.send(message);
                console.log('dataC', dataChannelLog)
            }, 1000);
        };
        dc.onmessage = function(evt) {
            // console.log('evt', evt)
            // console.log('evt.data', evt.data)
            setDataChannelLog(dataChannelLog + '< ' + evt.data + '\n')

            if (evt.data.substring(0, 4) === 'pong') {
                var elapsed_ms = current_stamp() - parseInt(evt.data.substring(5), 10);
                setDataChannelLog(dataChannelLog + ' RTT ' + elapsed_ms + ' ms\n')
            }
        };

        var constraints = {
            audio: true
        };

        navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
            stream.getTracks().forEach(function(track) {
                pc.addTrack(track, stream);
            });
            return negotiate();
        }, function(err) {
            alert('Could not acquire media: ' + err);
        });
    }

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
                // ns = Noise.noise(x, y, 0);
                // z = ns;
                vertex = new THREE.Vector3(x, y, z);
                r = Math.random();
                g = Math.random();
                b = Math.random();
                // col = new THREE.Color(r, g, b);
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
            const coords = [];
            const cols = [];
            let ns;
            const nScale = 0.5;
            const zPosScale = 1.5;
            const lowColor = new THREE.Color(0.0, 0, 0.8);
            const highColor = new THREE.Color(1.5, 1.5, 1.5);
            points.forEach((p, i) => {
                ns = Noise.noise(p.position.x * nScale, p.position.y * nScale, t);
                p.position.z = ns * zPosScale;
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
        console.log('dataChannelLog', dataChannelLog)
    },[dataChannelLog])

    return (
        <div><button onClick={()=>connect()}>CLICK</button>
        <div ref={canvasRef} style={{display: 'none'}}/>
        </div>
    )
}