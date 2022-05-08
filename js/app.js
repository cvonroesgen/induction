let container;
let camera;
let controls;
let renderer;
let scene;
let electrons;
let electrons2;
let electrons3;
let arrow;
let pivot;
let pivotCoil;
var numMagFluxLoops = 12;
var lengthMagFluxLoops = 6;
var spiralWraps = 100;
let fluxLoops = new THREE.Group();;
    
function init() {

    container = document.querySelector('#scene-container');

    // create a Scene
    scene = new THREE.Scene();

    // Set the background color
    scene.background = new THREE.Color('grey');

    //helper functions
    createCamera();
    createControls();
    createLights();
    createMeshes();
    createRenderer();
    renderer.render(scene, camera);
    //start the animation loop
    renderer.setAnimationLoop(() => {

        update();
        render();

    });
}


function createCamera() {

    camera = new THREE.PerspectiveCamera(
        35, // FOV
        container.clientWidth / container.clientHeight, // aspect

        0.1, // near clipping plane
        1000, // far clipping plane
    );

    camera.position.set(-40, 40, 100);


}

function createControls() {

  controls = new THREE.OrbitControls( camera, container );

}

function createLights() {

    const light = new THREE.PointLight(0xffffff, 100, 100);
    light.position.set( -50, 50, 50 );
    scene.add(light);
    const ambientLight = new THREE.AmbientLight( 0xffffff); // soft white light
    scene.add( ambientLight );

}

function createMeshes() {
    

    class CustomSpiral extends THREE.Curve {

        constructor( wraps = 1 ) {
    
            super();
            this.wraps = wraps;
        }
    
        getPoint( t, optionalTarget = new THREE.Vector3() ) {
    
            const tx = Math.cos( 2 * Math.PI * t  * this.wraps);
            const ty = 0;
            const tz = Math.sin( 2 * Math.PI * t  * this.wraps);
    
            return optionalTarget.set( tx, ty, tz ).multiplyScalar( t * 20 * lengthMagFluxLoops/2 );
    
        }
    
    }

    const ellipseTemplate = makeEllipse();
    const ellipseArrow = makeArrow(10, 1, 0xFF0000);
    ellipseArrow.rotation.z = Math.PI/2;
    ellipseArrow.position.y = 5;
    ellipseTemplate.add(ellipseArrow);
    for(var i = 0; i < numMagFluxLoops; i++)
    {
    const ellipse = ellipseTemplate.clone();
    var angle = 2 * Math.PI * i/numMagFluxLoops;
    ellipse.rotation.y = (angle);
    angle +=  2 * Math.PI/4;
    ellipse.position.x = Math.sin(angle) * lengthMagFluxLoops * 5;
    ellipse.position.z = Math.cos(angle) * lengthMagFluxLoops * 5;
    fluxLoops.add(ellipse);    
    }
    scene.add( fluxLoops );

    {
    const geometry = new THREE.CylinderGeometry( lengthMagFluxLoops * 7.5, lengthMagFluxLoops * 7.5, .05, 32 );
    const material = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
    const cylinder = new THREE.Mesh( geometry, material );
    
    cylinder.position.y = 2;
    scene.add( cylinder );
    }
    {
    const path = new CustomSpiral(spiralWraps);
    const geometry = new THREE.TubeGeometry( path, 10000, .5, 8, true );
    const material = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
    const spiral = new THREE.Mesh( geometry, material );
    scene.add( spiral );
    }
    {
    const dir = new THREE.Vector3( clockWise * 1, 0, 0 );

    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();

    const origin = new THREE.Vector3( 0, 2, 0 );
    const length = 4;
    const hex = 0xffff00;
    pivot = new THREE.Object3D();
    pivotCoil = new THREE.Object3D();
    electrons = makeArrow(10, 1, 0xFFFFFF);
    electrons.rotation.z = Math.PI/2;
    electrons.rotation.y = -Math.PI/2;
    electrons2 = electrons.clone();
    electrons3 = electrons.clone();
    electrons3.rotation.z = Math.PI;
    electrons.position.set( lengthMagFluxLoops * 3, 2, 0 );
    electrons2.position.set( lengthMagFluxLoops * 6, 2, 0 );
    electrons3.position.set( lengthMagFluxLoops * 9, 2, 0 );
    pivot.add(electrons)
    pivot.add(electrons2);
    pivotCoil.add(electrons3);
    scene.add(pivot);
    scene.add(pivotCoil);
    }

}

function makeEllipse()
{
    class CustomEllipse extends THREE.Curve {

        constructor( scale = 1 ) {
    
            super();
    
            this.scale = scale;
    
        }
    
        getPoint( t, optionalTarget = new THREE.Vector3() ) {
    
            const tx = Math.cos( 2 * Math.PI * t ) * lengthMagFluxLoops;
            const ty = Math.sin( 2 * Math.PI * t );
            const tz = 0;
    
            return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
    
        }
    
    }
    const path = new CustomEllipse( 5 );
    const geometry = new THREE.TubeGeometry( path, 100, .5, 8, true );
    const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
    return new THREE.Mesh( geometry, material );

}

function makeArrow(length, radius, color)
{
    const cylinder = new THREE.CylinderGeometry( radius, radius, length, 32 );
    
    const material = new THREE.MeshBasicMaterial( {color: color} );
    const shaft = new THREE.Mesh( cylinder, material );    
    const cone = new THREE.CylinderGeometry( radius*2, .1, length/4, 32 );
    const head = new THREE.Mesh( cone, material );
    const group = new THREE.Group();
    group.add( shaft );
    group.add( head );
    head.position.set(0, -length/2, 0);
    return group;    
}


function createRenderer() {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);

    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.physicallyCorrectLights = true;
    container.appendChild(renderer.domElement);

}

let time = 0;
let timeSteps = 500;
let clockWise = 1;
// perform any updates to the scene, called once per frame
// avoid heavy computation here

function update()
{
time++;
var angle = -clockWise * 2 * Math.PI * Math.sin(Math.PI * time/timeSteps);
pivot.rotation.y = angle;
pivotCoil.rotation.y = -angle;
for(var i = 0; i < fluxLoops.children.length; i++)
    {
    fluxLoops.children[i].children[0].scale.set( 1, Math.sin(Math.PI * time/timeSteps), 1 );;  
    }
fluxLoops.children;
}

// render, or 'draw a still image', of the scene
function render() {
    renderer.render(scene, camera);
}

function onWindowResize() {

    console.log('You resized the browser window!');
    // set the aspect ratio to match the new browser window aspect ratio
    camera.aspect = container.clientWidth / container.clientHeight;

    // update the camera's frustum
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener('resize', onWindowResize);

init();