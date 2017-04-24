/* eslint-disable padded-blocks,space-unary-ops,space-infix-ops */
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var stats;
var params = {
	time_step: 100
}
var camera, controls, scene, renderer;

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function webglAvailable() {
	try {
		var canvas = document.createElement( 'canvas' );
		return !!( window.WebGLRenderingContext && (
			canvas.getContext( 'webgl' ) ||
			canvas.getContext( 'experimental-webgl' ) )
		);
	} catch ( e ) {
		return false;
	}
}

function init() {

	var size = 100, step = 100;

	scene = new THREE.Scene();

	if ( webglAvailable() ) {
		renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
	} else {
		renderer = new THREE.CanvasRenderer();
	}

    renderer.setClearColor( 0xf0f0f0 );
	renderer.setSize( window.innerWidth, window.innerHeight );

	var container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );

	// World

	// Grid

	// Base XY Grid
	var baseXYGridHelper = new THREE.GridHelper(size, step);
	baseXYGridHelper.position.z = -size/2 + size/step/2;
	baseXYGridHelper.position.x = size/2 - size/step/2;
	baseXYGridHelper.position.y = -size/step/2;
	scene.add(baseXYGridHelper);

	// Base XZ Grid
	var baseXZGridHelper = new THREE.GridHelper(size, step);
	baseXZGridHelper.rotation.z = (Math.PI/2);
	baseXZGridHelper.position.x = baseXYGridHelper.position.x -size/2;
	baseXZGridHelper.position.z = baseXYGridHelper.position.z;
	baseXZGridHelper.position.y = baseXYGridHelper.position.y + size/2;
	scene.add(baseXZGridHelper);

	// Berlin map below the Grid
	var textureGeoLoader = new THREE.TextureLoader();
	textureGeoLoader.load(
		'./berlin-map-1.jpg',
		function (textureGeo) {
			var mapMat = new THREE.MeshBasicMaterial( { map: textureGeo } );
			textureGeo.wrapS = THREE.RepeatWrapping;
			textureGeo.wrapT = THREE.RepeatWrapping;
			var mapGeo = new THREE.PlaneGeometry( size, size );
			var mapMesh = new THREE.Mesh( mapGeo, mapMat );
			mapMesh.rotation.x = - ( Math.PI / 2 );
			mapMesh.position.x = baseXYGridHelper.position.x;
			mapMesh.position.z = baseXYGridHelper.position.z;
			mapMesh.position.y = baseXYGridHelper.position.y - 0.5;
			mapMesh.doubleSided = true;
			scene.add( mapMesh );
		}
	);

	// Cubes
	var processedData;
	var CSVLoader = new THREE.FileLoader();
	var CUnitCluster = new THREE.Object3D();
	//scene.add(CUnitCluster);
	CSVLoader.setResponseType('text');
	CSVLoader.load('gistar_output.json', function ( text ) {
		processedData = JSON.parse(text);

        for (var entry of processedData) {
            //console.log(entry);
			var cunit = new CUnit(size/step, entry['cell_x'], entry['cell_y'], entry['time_step'], entry['zscore']);
			CUnitCluster.add(cunit);
			scene.add(cunit.getMesh());

            /*var cunit = new THREE.Mesh(cunitGeo, new THREE.MeshBasicMaterial({
				color: getColorPerWeight(entry['zscore']),
				opacity: getOpacityPerWeight(entry['zscore'])
            }));
            cunit.position.x = entry['cell_x'];
            cunit.position.z = - entry['cell_y'];
            cunit.position.y = entry['time_step'];
            scene.add(cunit);*/

            //console.log(cunit);
        }
	});

	// lights
    scene.add( new THREE.AmbientLight( 0x444444 ) );
	
	// Stats
	stats = new Stats();
	container.appendChild( stats.dom );

	// Camera
	camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = size;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', render ); // remove when using animation loop
	controls.enableZoom = true;

	window.addEventListener( 'resize', onWindowResize, false );

	// Control panel
	var gui = new dat.GUI({
		height: 5 * 32 - 1
	});
	gui.add( params, 'time_step', 0, 100 ).name('Time step').onFinishChange(function () {
		//console.log("lol");
		CUnitCluster.traverse(function (child) {
			if(child instanceof CUnit ) {
                if (child.getTimeStep() < params['time_step']) {
                    console.log('hi');
                    child.setOpacity(0);
                }
                else
                	child.reinitiate();

                controls.update();
            }
        });
    });
	gui.open();


}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );

	controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

	stats.update();

	render();

}

function render() {
	renderer.render( scene, camera );
}

