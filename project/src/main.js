/* eslint-disable padded-blocks,space-unary-ops,space-infix-ops,space-in-parens,computed-property-spacing */
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

init();
//initCSS3D();
animate();

function init() {
	var container = document.getElementById( 'container' );
	document.body.appendChild(container);

    // Renderer
    container.appendChild( WebGLRenderer.domElement );
    container.appendChild( cssRenderer.domElement );

    //cssRenderer.domElement.appendChild( WebGLRenderer.domElement );

    // World
	// Grid

	// Base OXY Grid
    WebGLScene.add(baseOXYGridHelper);

    // Base OYZ Grid
	WebGLScene.add(baseOYZGridHelper);

    // Base OXZ Grid
    WebGLScene.add(baseOXZGridHelper);

    labelOrigin = makeTextSprite("O"); labelOrigin.position.copy(LABEL_ORIGIN_SPAWN);
	WebGLScene.add( labelOrigin );
	labelT = makeTextSprite("Time"); labelT.position.copy(LABEL_TIME_SPAWN);
	WebGLScene.add( labelT );
	labelLng = makeTextSprite("Lng"); labelLng.position.copy(LABEL_LNG_SPAWN);
	WebGLScene.add(labelLng);
	labelLat = makeTextSprite("Lat"); labelLat.position.copy(LABEL_LAT_SPAWN);
	WebGLScene.add(labelLat);

	// Berlin map below the Grid
	textureGeoLoader = new THREE.TextureLoader();
	var textureGeo = textureGeoLoader.load('./data/nyc_location_map_raster.png');
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
    mapMesh.visible = false;
    //mapMeshBBox = new THREE.Box3().setFromObject(mapMesh);
    WebGLScene.add( mapMesh );

    // Open street map layer
    mapLayer = createCSS3DObject(OSMFrame.replace("MAPTYPE", maptype).replace("LOCATION",loc).replace("ZOOM", 10));
    mapLayer.rotation.copy(mapMesh.rotation);
    mapLayer.position.copy(baseOXYGridHelper.position);
    mapLayer.scale.copy(baseOXYGridHelper.scale);

    mapLayer.scale.x = 0.36;
     mapLayer.scale.y = 0.34;
    mapLayer.renderOrder = 0;
    cssScene.add(mapLayer);

	// Cubes
    for (var entry of processedData) {
        var cunit = new CUnit(size/step, entry['cell_x'], entry['cell_y'], entry['time_step'], entry['zscore'], entry['pvalue']);
        CUnitCluster.add(cunit);
        WebGLScene.add(cunit.getMesh());
    }

	// lights
	var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
	WebGLScene.add( ambientLight );

	// Stats
	stats = new Stats();
	container.appendChild( stats.dom );

	// Camera
	camera = perspectiveCamera;

	controls = new THREE.OrbitControls( camera, cssRenderer.domElement );
	controls.addEventListener( 'change', render ); // remove when using animation loop
	controls.enableZoom = true;

	// Event
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'contextmenu', onDocumentLMB, false );
	document.addEventListener( 'mouseup', onDocumentMouseReset, false );
	document.addEventListener( 'wheel', onDocumentMouseWheel, true);

	window.addEventListener( 'resize', onWindowResize, false );

    THREEx.WindowResize(cssRenderer, camera);
    THREEx.WindowResize(WebGLRenderer, camera);
}

function animate() {
	requestAnimationFrame( animate );
    update();
	render();
}

function update() {
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( WebGLScene.children );
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
    cssRenderer.render( cssScene, camera );
    WebGLRenderer.render( WebGLScene, camera );

    /*setCSSWorld();
    setCSSCamera(camera, fovValue);*/
}



