/* eslint-disable padded-blocks,space-unary-ops,space-infix-ops,space-in-parens,computed-property-spacing */
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

init();
animate();

function initCP(){
	// Control panel
	var gui = new dat.GUI({
		height: 5 * 32 - 1
	});
	gui.add( params, 'time_step', 0, 100 ).name('Time step').onFinishChange(function () {
		//console.log("lol");
		CUnitCluster.traverse(function (child) {
			if(child instanceof CUnit ) {
				if (child.getTimeStep() > params['time_step'])
					child.getMesh().visible = false;
				else
					child.getMesh().visible = true;
			}
		});
	});
	gui.add( params, 'cunit_size', 0, 1).name('Brush size').onFinishChange(function () {
		CUnitCluster.traverse(function (child) {
			if(child instanceof CUnit){
				child.setCunitSize(params['cunit_size']);
			}
		});
	});
	gui.add( params, 'weight', 3.920, 3.999).name('Weight filter').onFinishChange(function () {
		CUnitCluster.traverse( function (child) {
			if(child instanceof CUnit) {
				if (child.getZScore() < params['weight'])
					child.getMesh().visible = false;
				else
					child.getMesh().visible = true;
			}
		});
	});
	gui.add( params, 'camera_fov', 50, 100).name('Camera FOV').onFinishChange(function () {
		var fovAmount = params['camera_fov'];
		camera.setFov(fovAmount);
	});
	gui.open();
}

function init() {
	var container = document.getElementById( 'container' );
	document.body.appendChild(container);

	renderer = new THREE.CanvasRenderer();

	// World

	// Grid
	// Base XY Grid
	var baseXYGridHelper = new THREE.GridHelper(size, step);
	baseXYGridHelper.position.z = 0;
	baseXYGridHelper.position.x = 0;
	baseXYGridHelper.position.y = -size/2;
    baseXYGridHelper.renderOrder = 1;
    scene.add(baseXYGridHelper);

	// Base XZ Grid
	var baseXZGridHelper = new THREE.GridHelper(size, step);
	baseXZGridHelper.rotation.z = (Math.PI/2);
	baseXZGridHelper.position.x = baseXYGridHelper.position.x -size/2;
	baseXZGridHelper.position.z = baseXYGridHelper.position.z;
	baseXZGridHelper.position.y = baseXYGridHelper.position.y + size/2;
    baseXZGridHelper.renderOrder = 1;
    scene.add(baseXZGridHelper);

	var spritey = makeTextSprite("O"); spritey.position.set(baseXYGridHelper.position.x -50 , baseXYGridHelper.position.y - 10, baseXYGridHelper.position.z + 50);
	scene.add( spritey );
	var spritey = makeTextSprite("Time step"); spritey.position.set(baseXZGridHelper.position.x, baseXZGridHelper.position.y + 50, baseXZGridHelper.position.z + 50);
	scene.add( spritey );
	var spritey = makeTextSprite("Longitude"); spritey.position.set(baseXYGridHelper.position.x - 50, baseXYGridHelper.position.y - 10, -baseXYGridHelper.position.z - 100);
	scene.add(spritey);
	var spritey = makeTextSprite("Latitude"); spritey.position.set(baseXYGridHelper.position.x + 75, baseXYGridHelper.position.y - 10, baseXYGridHelper.position.z + 50);
	scene.add(spritey);

	// Berlin map below the Grid
	var textureGeoLoader = new THREE.TextureLoader();
	textureGeoLoader.load(
		'./berlin-map-1.jpg',
		function (textureGeo) {
			textureGeo.minFilter = THREE.LinearFilter;
			var mapMat = new THREE.MeshPhongMaterial( { map: textureGeo } );
			mapMat.needsUpdate = true;
			textureGeo.wrapS = THREE.RepeatWrapping;
			textureGeo.wrapT = THREE.RepeatWrapping;
			var mapGeo = new THREE.PlaneGeometry( size, size );
			var mapMesh = new THREE.Mesh( mapGeo, mapMat );

			mapMesh.rotation.x = - ( Math.PI / 2 );
			mapMesh.position.x = baseXYGridHelper.position.x;
			mapMesh.position.z = baseXYGridHelper.position.z;
			mapMesh.position.y = baseXYGridHelper.position.y - 0.5;
            mapMesh.renderOrder = 0;
            scene.add( mapMesh );
		}
	);

	// Cubes
	var processedData;
	var CSVLoader = new THREE.FileLoader();
	//scene.add(CUnitCluster);
	CSVLoader.setResponseType('text');
	CSVLoader.load('gistar_output_a.json', function ( text ) {
		processedData = JSON.parse(text);

		for (var entry of processedData) {
			//console.log(entry);
			var cunit = new CUnit(size/step, entry['cell_x'], entry['cell_y'], entry['time_step'], entry['zscore'], entry['pvalue']);
			CUnitCluster.add(cunit);
			scene.add(cunit.getMesh());
		}
	});

	// lights
	var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
	scene.add( ambientLight );

	/*if ( webglAvailable() ) {
	 renderer = new THREE.WebGLRenderer( { antialias: true } );
	 } else {
	 renderer = new THREE.CanvasRenderer();
	 }*/

	renderer.setClearColor( 0xf0f0f0 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	
	// Stats
	stats = new Stats();
	container.appendChild( stats.dom );

	// Camera
	camera = new THREE.CombinedCamera(window.innerWidth/2, window.innerHeight/2, 90, 1, 1000, -500, 1000);
	camera.isPerspectiveCamera = true; camera.isOrthographicCamera = false;
	camera.position.z = 100; camera.position.x = 100; camera.position.y = 100;
	camera.lookAt(new THREE.Vector3(size/2, size/2, size/2));

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', render ); // remove when using animation loop
	controls.enableZoom = true;

	// Event
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'contextmenu', onDocumentLMB, false );
	document.addEventListener( 'mouseup', onDocumentMouseReset, false );
	document.addEventListener( 'wheel', onDocumentMouseWheel, false);

	window.addEventListener( 'resize', onWindowResize, false );

	/*var canvas1 = document.createElement('canvas');
	tooltipContext = canvas1.getContext('2d');
	tooltipContext.font = "Bold 20px Arial";
	tooltipContext.fillStyle = "rgba(0,0,0,0.95)";
	tooltipContext.fillText('Hello, world!', 0, 20);

	// canvas contents will be used for a texture
	tooltipTex = new THREE.Texture(canvas1);
	tooltipTex.minFilter = THREE.LinearFilter;
	tooltipTex.needsUpdate = true;*/

	/*var spriteMaterial = new THREE.SpriteMaterial( { map: tooltipTex, depthWrite: true} );
	spriteToolTip = new THREE.Sprite( spriteMaterial );
	spriteToolTip.scale.set(100,50,1.0);
	spriteToolTip.position.set( 50, 50, 0 );
	scene.add( spriteToolTip );*/

	initCP();
}

function animate() {

	requestAnimationFrame( animate );
	update();
	render();

}

function update() {
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( scene.children );
	if ( intersects.length > 0 ) {
		if ( INTERSECTED != intersects[ 0 ].object && intersects[0].object.material.emissive != null) {
			if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
			INTERSECTED.material.emissive.setHex( 0xf0f0f0 );

			// update text, if it has a "name" field.
			if ( intersects[ 0 ].object.name )
			{
				/*tooltipContext.clearRect(0,0,640,480);
				var message = intersects[ 0 ].object.name;
				var metrics = tooltipContext.measureText(message);
				var width = metrics.width;
				tooltipContext.fillStyle = "rgba(0,0,0,0.95)"; // black border
				tooltipContext.fillRect( 0,0, width+8,20+8);
				tooltipContext.fillStyle = "rgba(255,255,255,0.95)"; // white filler
				tooltipContext.fillRect( 2,2, width+4,20+4 );
				tooltipContext.fillStyle = "rgba(0,0,0,1)"; // text color
				tooltipContext.fillText( message, 4,20 );
				tooltipTex.needsUpdate = true;
				spriteToolTip.position.set( intersects[0].object.position.x, intersects[0].object.position.y, intersects[0].object.position.z );*/
				document.getElementById("cunit_info").innerHTML = `Information: ${intersects[0].object.name}`;
			}
			else
			{
				/*tooltipContext.clearRect(0,0,256,256);
				tooltipTex.needsUpdate = true;*/
			}
		}
	} else {
		if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
		INTERSECTED = null;
		/*tooltipContext.clearRect(0,0,256,256);
		tooltipTex.needsUpdate = true;*/
	}
	controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
	stats.update();
}

function render() {
	renderer.render( scene, camera );
}



