/* eslint-disable padded-blocks,space-unary-ops,space-infix-ops,space-in-parens,computed-property-spacing */
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

init();
animate();

function init() {
	var container = document.getElementById( 'container' );
	document.body.appendChild(container);

    // Renderer
    renderer1 = new THREE.CanvasRenderer();
    renderer1.setClearColor( 0xf0f0f0 );
    renderer1.setPixelRatio( window.devicePixelRatio );
    renderer1.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer1.domElement );

    renderer2 = new THREE.CSS3DRenderer();
    renderer2.setSize( window.innerWidth, window.innerHeight );
    renderer2.domElement.style.position = 'absolute';
    renderer2.domElement.style.top = 0;
    container.appendChild( renderer2.domElement );

    // World
	// Grid

	// Base OXY Grid
    scene.add(baseOXYGridHelper);

    // Base OYZ Grid
	scene.add(baseOYZGridHelper);

    // Base OXZ Grid
    scene.add(baseOXZGridHelper);

    labelOrigin = makeTextSprite("O"); labelOrigin.position.copy(LABEL_ORIGIN_SPAWN);
	scene.add( labelOrigin );
	labelT = makeTextSprite("Time"); labelT.position.copy(LABEL_TIME_SPAWN);
	scene.add( labelT );
	labelLng = makeTextSprite("Lng"); labelLng.position.copy(LABEL_LNG_SPAWN);
	scene.add(labelLng);
	labelLat = makeTextSprite("Lat"); labelLat.position.copy(LABEL_LAT_SPAWN);
	scene.add(labelLat);

	// Berlin map below the Grid
	/*textureGeoLoader = new THREE.TextureLoader();
	textureGeoLoader.load(
		'./data/nyc_location_map_raster.png',
		function (textureGeo) {
			textureGeo.minFilter = THREE.LinearFilter;
			mapMat = new THREE.MeshPhongMaterial( { map: textureGeo } );
			mapMat.needsUpdate = true;
			textureGeo.wrapS = THREE.RepeatWrapping;
			textureGeo.wrapT = THREE.RepeatWrapping;
			var mapGeo = new THREE.PlaneGeometry( size, size );
			mapMesh = new THREE.Mesh( mapGeo, mapMat );

			mapMesh.rotation.x = - ( Math.PI / 2 );
			mapMesh.position.x = baseOXYGridHelper.position.x;
			mapMesh.position.z = baseOXYGridHelper.position.z;
			mapMesh.position.y = baseOXYGridHelper.position.y - 0.5;
            mapMesh.scale.x = (sizeX/size);
            mapMesh.scale.y = (sizeZ/size);
            mapMesh.renderOrder = 0;
            scene.add( mapMesh );
		}
	);*/

	var mapMesh = createCSS3DObject(iframe.replace("LOCATION",loc));
    mapMesh.rotation.x = - ( Math.PI / 2 );
    mapMesh.position.x = baseOXYGridHelper.position.x;
    mapMesh.position.z = baseOXYGridHelper.position.z;
    mapMesh.position.y = baseOXYGridHelper.position.y - 0.5;
    mapMesh.scale.x = (sizeX/size);
    mapMesh.scale.y = (sizeZ/size);
    mapMesh.renderOrder = 0;
	scene.add(mapMesh);

	// Cubes
    for (var entry of processedData) {
        var cunit = new CUnit(size/step, entry['cell_x'], entry['cell_y'], entry['time_step'], entry['zscore'], entry['pvalue']);
        CUnitCluster.add(cunit);
        scene.add(cunit.getMesh());
    }

	// lights
	var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
	scene.add( ambientLight );

	// Stats
	stats = new Stats();
	container.appendChild( stats.dom );

	// Camera
	camera = new THREE.CombinedCamera(window.innerWidth/2, window.innerHeight/2, 90, 1, 1000, -500, 1000);
	camera.isPerspectiveCamera = true; camera.isOrthographicCamera = false;
    //camera1 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.copy(CAMERA_SPAWN);
	camera.lookAt(new THREE.Vector3(size/2, size/2, size/2));

	controls = new THREE.OrbitControls( camera, renderer1.domElement );
	controls.addEventListener( 'change', render ); // remove when using animation loop
	controls.enableZoom = true;

	// Event
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'contextmenu', onDocumentLMB, false );
	document.addEventListener( 'mouseup', onDocumentMouseReset, false );
	document.addEventListener( 'wheel', onDocumentMouseWheel, false);

	window.addEventListener( 'resize', onWindowResize, false );
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
				document.getElementById("cunit_info").innerHTML = `Information: ${intersects[0].object.name}`;
		}
	} else {
		if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
		INTERSECTED = null;
	}
	controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
	stats.update();
}

function render() {
	renderer1.render( scene, camera );
	//renderer2.render( scene, camera1 );
}



