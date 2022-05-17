let container;
let camera;
let controls;
let renderer;
let scene;
let panElectrons1;
let panElectrons2;
let coilElectrons;
let arrow;
let pivotPanElectrons;
let pivotCoilElectrons;
var numMagFluxLoops = 12;
var lengthMagFluxLoops = 20;
var radialDisplacementFluxLoops = 10;
var panRadius = 80;
var coilRadius = 100;
var spiralWraps = 100;
let fluxLoops = new THREE.Group();
let panBottom;
let spiral;
let panColor = new THREE.Color();
const panColorWarm = new THREE.Color("red");
const panColorCold = new THREE.Color("lightgrey");
    
    
function init() {
    document.getElementById("coil").addEventListener("click", function(){spiral.visible = !spiral.visible});
    document.getElementById("coilcurrent").addEventListener("click", function(){pivotCoilElectrons.visible = !pivotCoilElectrons.visible});
    document.getElementById("flux").addEventListener("click", function(){fluxLoops.visible = !fluxLoops.visible});
    document.getElementById("panbottom").addEventListener("click", function(){panBottom.visible = !panBottom.visible});
    document.getElementById("fluxcurrent").addEventListener("click", function(){pivotPanElectrons.visible = !pivotPanElectrons.visible});
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

    camera.position.set(-80, 80, 200);


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

        constructor( wraps = 1, outerRadius = 1, holeRadius = 0 ) {
    
            super();
            this.wraps = wraps;
            this.outerRadius = outerRadius;
            this.holeRadius = holeRadius;
        }
    
        getPoint( t, optionalTarget = new THREE.Vector3() ) {
    
            const tx = Math.cos( 2 * Math.PI * t  * this.wraps);
            const ty = 0;
            const tz = Math.sin( 2 * Math.PI * t  * this.wraps);
    
            return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.holeRadius + (t * this.outerRadius ));
    
        }
    
    }

    const ellipseTemplate = makeElongatedCircle(5, lengthMagFluxLoops);
    const ellipseArrow = makeArrow(10, 1, 0x00FF00);
    ellipseArrow.rotation.z = Math.PI/2;
    ellipseArrow.position.y = 5;
    ellipseArrow.position.x = radialDisplacementFluxLoops + lengthMagFluxLoops;
    ellipseTemplate.add(ellipseArrow);
    for(var i = 0; i < numMagFluxLoops; i++)
    {
    const ellipse = ellipseTemplate.clone();
    var angle = 2 * Math.PI * i/numMagFluxLoops;
    ellipse.rotation.y = (angle);
    angle +=  2 * Math.PI/4;
    ellipse.position.x = Math.sin(angle) * radialDisplacementFluxLoops;
    ellipse.position.z = Math.cos(angle) * radialDisplacementFluxLoops;
    fluxLoops.add(ellipse);    
    }
    scene.add( fluxLoops );

    {
    const geometry = new THREE.CylinderGeometry( panRadius, panRadius, .05, 32 );
    const material = new THREE.MeshBasicMaterial( {color: panColor} );
    panBottom = new THREE.Mesh( geometry, material );
    
    panBottom.position.y = 2;
    scene.add( panBottom );
    }
    {
    const path = new CustomSpiral(spiralWraps, coilRadius, 10);
    const geometry = new THREE.TubeGeometry( path, 10000, .5, 8, true );
    const material = new THREE.MeshPhongMaterial( { color: 0xad490e } );
    spiral = new THREE.Mesh( geometry, material );
    scene.add( spiral );
    }
    {
    const dir = new THREE.Vector3( clockWise * 1, 0, 0 );

    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();

    const origin = new THREE.Vector3( 0, 2, 0 );
    const length = 4;
    const hex = 0xffff00;
    pivotPanElectrons = new THREE.Object3D();
    pivotCoilElectrons = new THREE.Object3D();
    panElectrons1 = makeArrow(10, 1, 0x0000FF);
    panElectrons1.rotation.z = Math.PI/2;
    panElectrons1.rotation.y = -Math.PI/2;
    panElectrons2 = panElectrons1.clone();
    coilElectrons = panElectrons1.clone();
    coilElectrons.rotation.z = Math.PI;
    panElectrons1.position.set( panRadius * .3, 2, 0 );
    panElectrons2.position.set( panRadius * .6, 2, 0 );
    coilElectrons.position.set( coilRadius * .9, 2, 0 );
    pivotPanElectrons.add(panElectrons1)
    pivotPanElectrons.add(panElectrons2);
    pivotCoilElectrons.add(coilElectrons);
    scene.add(pivotPanElectrons);
    scene.add(pivotCoilElectrons);
    }

}

function makeEllipse(scale, majorAxis)
{
    class CustomEllipse extends THREE.Curve {

        constructor( scale = 1, majorAxis = 1 ) {
    
            super();
    
            this.scale = scale;
            this.majorAxis = majorAxis;
    
        }
    
        getPoint( t, optionalTarget = new THREE.Vector3() ) {
    
            const angle = 2 * Math.PI * t ;
            const tx = Math.cos( angle ) * this.majorAxis;
            const ty = Math.sin( angle );
            const tz = 0;
    
            return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
    
        }
    
    }
    const path = new CustomEllipse( scale, majorAxis );
    const geometry = new THREE.TubeGeometry( path, 100, .5, 8, true );
    const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
    return new THREE.Mesh( geometry, material );

}


function makeElongatedCircle(radius, len)
{
    class CustomElongatedCircle extends THREE.Curve {

        constructor( radius = 1, len = 1) {
    
            super();
    
            this.radius = radius;
            this.len = len;
    
        }
    
        getPoint( t, optionalTarget = new THREE.Vector3() ) {
            const angle = (2 * Math.PI * t);
            let tx = -Math.sin( angle );
            if(angle >= Math.PI)
                {
                tx += this.len;
                }
            const ty = Math.cos( angle );
            const tz = 0;
    
            return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.radius );
    
        }
    
    }
    const path = new CustomElongatedCircle( radius, len );
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
var scaleAngle = Math.PI * time/timeSteps;
pivotPanElectrons.rotation.y = angle;
pivotCoilElectrons.rotation.y = -angle;
panElectrons1.scale.set( 1, Math.cos(scaleAngle), 1 )
panElectrons2.scale.set( 1, Math.cos(scaleAngle), 1 )
coilElectrons.scale.set( 1, Math.cos(scaleAngle), 1 )
for(var i = 0; i < fluxLoops.children.length; i++)
    {
    fluxLoops.children[i].children[0].scale.set( 1, Math.cos(scaleAngle), 1 ); 
    }
panColor = new THREE.Color(panColorCold);
panColor.lerp(panColorWarm, Math.abs(Math.cos(scaleAngle)));
panBottom.material.color = panColor;
}

// render, or 'draw a still image', of the scene
function render() {
    renderer.render(scene, camera);
}

function onWindowResize() {
    // set the aspect ratio to match the new browser window aspect ratio
    camera.aspect = container.clientWidth / container.clientHeight;

    // update the camera's frustum
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener('resize', onWindowResize);

init();