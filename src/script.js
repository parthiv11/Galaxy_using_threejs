import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { BufferAttribute, Color } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// TextureLoader

const textureLoader = new THREE.TextureLoader()
const heart = textureLoader.load('textures/10.png')

// Scene
const scene = new THREE.Scene()





let geometry=null
let material=null
let points=null


/**
 * Galaxy Generator
 */
const parameters = {}
parameters.count=100000
parameters.size=0.02
parameters.radius=3
parameters.branches=3
parameters.spin=1
parameters.randomness= 0.2
parameters.randomnessPower= 4
parameters.insideColor= '#00ffff'
parameters.outsideColor= '#ff00ff'

const generateGalaxy = () => {

    if(points!==null){
        geometry.dispose()
        material.dispose( )
        scene.remove(points)

    }

    
     

    const colorInside = new THREE.Color(parameters.insideColor) 
    const colorOutside = new THREE.Color(parameters.outsideColor) 

    geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(parameters.count*3)
    const colors = new Float32Array(parameters.count*3)


    for (let i = 0; i < parameters.count; i++) {

        const branchAngle = (i%parameters.branches)/parameters.branches*2*Math.PI
        
        
        const radius = Math.random()*parameters.radius
        const spinAngle = radius*parameters.spin
        const i3 = i * 3
        const randomX= Math.pow(Math.random() , parameters.randomnessPower)*(Math.random()>0.5? 1 : -1)
        const randomY= Math.pow(Math.random() , parameters.randomnessPower)*(Math.random()>0.5? 1 : -1)
        const randomZ= Math.pow(Math.random() , parameters.randomnessPower)*(Math.random()>0.5? 1 : -1)

        positions[i3    ] = Math.cos(branchAngle + spinAngle)*radius + randomX
        positions[i3 + 1] = 0 + randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle)*radius + randomZ
        
        //colors
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside,radius/parameters.radius)
        colors[i3  ]=mixedColor.r
        colors[i3+1]=mixedColor.g
        colors[i3+2]=mixedColor.b

    }

    geometry.setAttribute(
        'position', 
        new THREE.BufferAttribute(positions,3
            ))
    geometry.setAttribute(
        'color', 
        new THREE.BufferAttribute(colors,3
            ))

     material = new THREE.PointsMaterial({
        size : parameters.size ,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        transparent:true,
        alphaMap:heart
        

    })
     points = new THREE.Points(geometry,material)

    
scene.add(points)



}

/**
 * Tweaks
 */
gui.add(parameters,'size',0.01,1,0.001).onFinishChange(generateGalaxy)
gui.add(parameters,'count',100,1000000,50).onFinishChange(generateGalaxy)
gui.add(parameters,'radius',2,8,0.5).onFinishChange(generateGalaxy)
gui.add(parameters,'branches',3,20,1).onFinishChange(generateGalaxy)
gui.add(parameters,'spin',-5,5,0.001).onFinishChange(generateGalaxy)
gui.add(parameters,'randomness',0,2,0.001).onFinishChange(generateGalaxy)
gui.add(parameters,'randomnessPower',0,10,0.1).onFinishChange(generateGalaxy)
gui.addColor(parameters,'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters,'outsideColor').onFinishChange(generateGalaxy)



generateGalaxy()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    points.rotation.y=elapsedTime*0.05
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()