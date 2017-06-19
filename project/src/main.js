/* eslint-disable padded-blocks,space-unary-ops,space-infix-ops,space-in-parens,computed-property-spacing */
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

init();
//initCSS3D();
animate();

/**
 * Create and manipulate the scene
 */
function init() {
	var container = document.getElementById( 'container' );
	document.body.appendChild(container);

    // Renderer
    WebGLRenderer = new THREE.CanvasRenderer({alpha: true, antialias: true});
    WebGLRenderer.setClearColor( 0xf0f0f0 );
    WebGLRenderer.setPixelRatio( window.devicePixelRatio );
    WebGLRenderer.setSize( window.innerWidth, window.innerHeight );
    //WebGLRenderer.domElement.style.position = 'absolute';
    WebGLRenderer.domElement.style.top = 0;
    // make sure original renderer appears on top of CSS renderer
    WebGLRenderer.domElement.style.zIndex = 1;
    container.appendChild( WebGLRenderer.domElement );

    cssRenderer = new THREE.CSS3DRenderer();
    cssRenderer.setSize( window.innerWidth, window.innerHeight );
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = 0;
    cssRenderer.domElement.style.margin = 0;
    cssRenderer.domElement.style.padding = 0;
    WebGLRenderer.domElement.style.zIndex = 0;
    container.appendChild( cssRenderer.domElement );

    //cssRenderer.domElement.appendChild( WebGLRenderer.domElement );

    // World
	// Grid

    labelOrigin = makeTextSprite("O"); labelOrigin.position.copy(LABEL_ORIGIN_SPAWN);
	WebGLScene.add( labelOrigin );
	labelT = makeTextSprite("Time"); labelT.position.copy(LABEL_TIME_SPAWN);
	WebGLScene.add( labelT );
	labelLng = makeTextSprite("Lng"); labelLng.position.copy(LABEL_LNG_SPAWN);
	WebGLScene.add(labelLng);
	labelLat = makeTextSprite("Lat"); labelLat.position.copy(LABEL_LAT_SPAWN);
	WebGLScene.add(labelLat);

	//Height map
	// Useful example: https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_colors.html
    // Berlin map below the Grid
    textureGeoLoader = new THREE.TextureLoader();
    var textureGeo = textureGeoLoader.load('./data/nyc_location_map_raster.png');
    textureGeo.minFilter = THREE.LinearFilter;
    mapMat = new THREE.MeshPhongMaterial( { map: textureGeo } );
    mapMat.needsUpdate = true;
    textureGeo.wrapS = THREE.RepeatWrapping;
    textureGeo.wrapT = THREE.RepeatWrapping;
    var mapGeo = new THREE.PlaneGeometry( sizeLat, sizeLng );
    mapMesh = new THREE.Mesh( mapGeo, mapMat );
    mapMesh.rotation.x = - ( Math.PI / 2 );
    mapMesh.position.x = baseOXYGridHelper.position.x;
    mapMesh.position.z = baseOXYGridHelper.position.z;
    mapMesh.position.y = baseOXYGridHelper.position.y - 0.5;
    mapMesh.scale.x = (sizeLng/size);
    mapMesh.scale.y = (sizeLat/size);
    mapMesh.renderOrder = 0;
    mapMesh.visible = false;
    //mapMeshBBox = new THREE.Box3().setFromObject(mapMesh);
    WebGLScene.add( mapMesh );


    // Open street map layer
    var s = OSMFrame.replace("MAPTYPE", maptype).replace("LOCATION",loc);
    console.log(s);
    mapLayer = createCSS3DObject(s);
    mapLayer.rotation.copy(mapMesh.rotation);
    mapLayer.position.copy(baseOXYGridHelper.position);
    mapLayer.scale.copy(baseOXYGridHelper.scale);

    updateMapScaleXFilter(0.582245 * mapScaleOffsetX);
    updateMapScaleYFilter(0.561175 * mapScaleOffsetY);
    updateMapOffsetX(-1);
    updateMapOffsetZ(0);
    mapLayer.renderOrder = 0;
    cssScene.add(mapLayer);

	// Cubes
    for (var entry of processedData) {
        var cunit = new CUnit(entry['cell_x'], entry['cell_y'], entry['time_step'], entry['zscore'], entry['pvalue']);
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

    /*controls = new THREE.TrackballControls( camera );
    controls.rotateSpeed = 4;*/

	// Event
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'contextmenu', onDocumentLMB, false );
	document.addEventListener( 'mouseup', onDocumentMouseReset, false );
	document.addEventListener( 'wheel', onDocumentMouseWheel, true);
    //document.getElementById('time_step_unit').innerHTML = `Lat: ${(200*newSizeX/sizeLat).toFixed(2)}m | Lng: ${(200*newSizeZ/sizeLng).toFixed(2)}m`;

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



