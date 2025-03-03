import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Sizes
const sizes = {
  width: 1200,
  height: 1000,
};

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 5000);


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialiasing: true 
});
renderer.setSize(sizes.width, sizes.height);


//Orbit control
const control = new OrbitControls(camera, canvas);
control.enableDamping = true;

//---------------------------------------------------------------------------------------------

//input data for walls
const input = [
    [0, 0, 1000, 0],
    [1000, 0, 1000, 1000],
    [1000, 1000, 0, 1000],
    [0, 1000, 0, 0]
];


let floor;
let vertices = [];

const wallThickness = 10;
const wallHeight = 200;



// Create walls
input.forEach(wall => {

    const [x1, y1, x2, y2] = wall;

    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const wallGeometry = new THREE.BoxGeometry(length, wallHeight, wallThickness);
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);

    wallMesh.position.set((x1 + x2) / 2, wallHeight / 2, (y1 + y2) / 2);
    wallMesh.rotation.y = Math.atan2(y2 - y1, x2 - x1);
    scene.add(wallMesh);


    //Add into vertices array
    vertices.push(new THREE.Vector2(x1, y1));
    vertices.push(new THREE.Vector2(x2, y2));

});


//create floor
function createFloor(wallsData) {

    const floorMaterial = new THREE.MeshBasicMaterial({

        map: new THREE.TextureLoader().load('wood.jpg'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1
    });


    const shape = new THREE.Shape(vertices);
    const floorGeometry = new THREE.ShapeGeometry(shape);


    //set UV coordinates
    setFloorUVs(floorGeometry);

    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;  
    floor.position.y = -1.4;            //avoid z fitting
    
    scene.add(floor);
}

function setFloorUVs(geometry) {

    const uvAttribute = geometry.attributes.uv;
    const vertices = geometry.attributes.position.array;

    const minX = Math.min(...vertices.filter((_, index) => index % 3 === 0));
    const maxX = Math.max(...vertices.filter((_, index) => index % 3 === 0));
    const minY = Math.min(...vertices.filter((_, index) => index % 3 === 1));
    const maxY = Math.max(...vertices.filter((_, index) => index % 3 === 1));


    //set UVs for each vertex 
    for (let i = 0; i < uvAttribute.count; i++) {

        const x = vertices[i * 3];  
        const y = vertices[i * 3 + 1];  

        // Map (x, y) coordinates to UV space [0, 1]
        const u = (x - minX) / (maxX - minX);
        const v = (y - minY) / (maxY - minY);

        uvAttribute.setXY(i, u, v);
    }
}

createFloor(input);


//camera
camera.position.set(500, 500, 2000);
camera.lookAt(new THREE.Vector3(500, 0, 500));
scene.add(camera);




// Animate
const clock = new THREE.Clock();

const animation = () => {

  const elapsedTime = clock.getElapsedTime();

  control.update();

  renderer.render(scene, camera);
    
  window.requestAnimationFrame(animation);

};

animation();




