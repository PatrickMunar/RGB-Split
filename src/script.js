import './style.css'
// import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'
import Scrollbar from 'smooth-scrollbar';
import gsap from 'gsap'

// Clear Scroll Memory
window.history.scrollRestoration = 'manual'

// Scroll Triggers
gsap.registerPlugin(ScrollTrigger)

// 3rd party library setup:
const bodyScrollBar = Scrollbar.init(document.querySelector('#bodyScrollbar'), { damping: 0.1, delegateTo: document })

let scrollY = 0

// Tell ScrollTrigger to use these proxy getter/setter methods for the "body" element: 
ScrollTrigger.scrollerProxy('#bodyScrollbar', {
  scrollTop(value) {
    if (arguments.length) {
      bodyScrollBar.scrollTop = value; // setter
    }
    return bodyScrollBar.scrollTop    // getter
  },
  getBoundingClientRect() {
    return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight}
  }
})

// when the smooth scroller updates, tell ScrollTrigger to update() too: 
bodyScrollBar.addListener(ScrollTrigger.update);

// Functions
const lerp = (start, end, t) => {
    return start * ( 1 - t ) + end * t;
}

// -----------------------------------------------------------------
/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Fix Position
bodyScrollBar.addListener(({ offset }) => {  
    canvas.style.top = offset.y + 'px'
})

// Scene
const scene = new THREE.Scene()
// scene.background = new THREE.Color(0xffffff)

/**
 * Loaders
 */
// Loading Manager
const loadingBar = document.getElementById('loadingBar')
const loadingPage = document.getElementById('loadingPage')

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
       
    },
    // Progress
    (itemUrl, itemsLoaded, itemsTotal) => {

    }
)

const images = []

// Texture loader
const textureLoader = new THREE.TextureLoader()
images[0] = textureLoader.load('./images/demo1.jpg')
images[1] = textureLoader.load('./images/demo2.jpg')
images[2] = textureLoader.load('./images/demo3.jpg')
// images[1] = textureLoader.load('./images/Gabito.png')
// images[0] = textureLoader.load('./images/Flagle.png')
// images[2] = textureLoader.load('./images/LDR.png')

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

// Font Loader
const fontLoader = new FontLoader()

// Lighting

const ambientLight = new THREE.AmbientLight(0xaa00ff, 0.1)
scene.add(ambientLight)

// Position Checker
// const box = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.3,0.3), new THREE.MeshNormalMaterial)
// box.position.set(-1.25,0,-1.75)
// scene.add(box)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {    
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Mesh
const PGroups = new THREE.Group

const parameters = {
    width: 16,
    height: 9,
    sectionDistance: 15,
    rotationAngle: Math.PI * 20/180
}

const offsetGains = {
    mx: 0.0005, 
    my: 0.001,
    // sy: 0.0025
    // mx: 0.005, 
    // my: 0.01,
    sy: 0.005
}

const g = new THREE.PlaneGeometry(parameters.width, parameters.height, parameters.width*32, parameters.height*32)
const m1 = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTexture: {value: images[0]},
        uAlpha: {value: 0},
        uOffset: {value: new THREE.Vector2(0,0)},
        uTime: {value: 0}
    },
    transparent: true
})
const p1 = new THREE.Mesh(g, m1)
const p1g = new THREE.Group
p1g.add(p1)
PGroups.add(p1g)

const m2 = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTexture: {value: images[1]},
        uAlpha: {value: 0},
        uOffset: {value: new THREE.Vector2(0,0)},
        uTime: {value: 0}
    },
    transparent: true
})
const p2 = new THREE.Mesh(g, m2)
const p2g = new THREE.Group
p2g.add(p2)
p2g.position.set(0,-parameters.sectionDistance,0)
PGroups.add(p2g)

const m3 = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTexture: {value: images[2]},
        uAlpha: {value: 0},
        uOffset: {value: new THREE.Vector2(0,0)},
        uTime: {value: 0}
    },
    transparent: true
})
const p3 = new THREE.Mesh(g, m3)
const p3g = new THREE.Group
p3g.add(p3)
p3g.position.set(0,-parameters.sectionDistance*2,0)
PGroups.add(p3g)

PGroups.rotation.z = parameters.rotationAngle
scene.add(PGroups)
// Offsets
const offset = {
    x: 0,
    y: 0
}

let scrollCurrent = 0

const scrollOffset = {
    x: 0,
    y: 0
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enabled = false

controls.enableDamping = true
controls.maxPolarAngle = Math.PI/2
// controls.minAzimuthAngle = Math.PI*0/180
// controls.maxAzimuthAngle = Math.PI*90/180
controls.minDistance = 12  
controls.maxDistance = 80

// Axes Helper
// const axesHelper = new THREE.AxesHelper()
// scene.add(axesHelper)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.CineonToneMapping

// Raycaster
const raycaster = new THREE.Raycaster()

// Parallax Camera Group
const cameraGroup = new THREE.Group
cameraGroup.add(camera)
cameraGroup.position.set(0,0,15)
scene.add(cameraGroup)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    scrollY = bodyScrollBar.scrollTop
    const elapsedTime = clock.getElapsedTime()

    offset.x = lerp(offset.x, mouse.x, 0.1)
    offset.y = lerp(offset.y, mouse.y, 0.1)

    scrollCurrent = lerp(scrollCurrent, scrollY, 0.075)
    scrollOffset.x = lerp(offset.x, mouse.x, 0.1)

    m1.uniforms.uOffset.value.set((mouse.x - offset.x) * offsetGains.mx , (-(mouse.y - offset.y) * offsetGains.my * 16/9) + (-(scrollY- scrollCurrent) * offsetGains.sy ))
    m1.uniforms.uTime.value = elapsedTime

    m2.uniforms.uOffset.value.set((mouse.x - offset.x) * offsetGains.mx , (-(mouse.y - offset.y) * offsetGains.my * 16/9) + (-(scrollY- scrollCurrent) * offsetGains.sy ))
    m2.uniforms.uTime.value = elapsedTime

    m3.uniforms.uOffset.value.set((mouse.x - offset.x) * offsetGains.mx , (-(mouse.y - offset.y) * offsetGains.my * 16/9) + (-(scrollY- scrollCurrent) * offsetGains.sy ))
    m3.uniforms.uTime.value = elapsedTime

    // Update controls
    if (controls.enabled == true) {
        controls.update()
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

// Scroll Triggers
gsap.fromTo(camera.position, {x: 0, y: 0}, {x: 0, y: 0})

gsap.fromTo(camera.position, {x: parameters.sectionDistance * 0 * Math.sin(parameters.rotationAngle), y: -parameters.sectionDistance * 0 * Math.cos(parameters.rotationAngle)}, {
    scrollTrigger: {
        trigger: '#section1',
        start: () =>  window.innerHeight*1 + ' bottom',
        end: () =>  window.innerHeight*1 + ' top',
        snap: 1, 
        scrub: true,
        // pin: false,
        // markers: true
    },
    x: parameters.sectionDistance * 1 * Math.sin(parameters.rotationAngle),
    y: -parameters.sectionDistance * 1 * Math.cos(parameters.rotationAngle),
    ease: 'none'
})

gsap.fromTo(camera.position, {x: parameters.sectionDistance * 1 * Math.sin(parameters.rotationAngle), y: -parameters.sectionDistance * 1 * Math.cos(parameters.rotationAngle)}, {
    scrollTrigger: {
        trigger: '#section2',
        start: () =>  window.innerHeight*1 + ' bottom',
        end: () =>  window.innerHeight*1 + ' top',
        snap: 1, 
        scrub: true,
        // pin: false,
        // markers: true
    },
    x: parameters.sectionDistance * 2 * Math.sin(parameters.rotationAngle),
    y: -parameters.sectionDistance * 2 * Math.cos(parameters.rotationAngle),
    ease: 'none'
})

// Event Listeners
const mouse = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
})

tick()