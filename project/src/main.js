/* eslint-disable padded-blocks,space-unary-ops,space-infix-ops,space-in-parens,computed-property-spacing */
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

init();
animate();

function init() {
	var container = document.getElementById( 'container' );
	document.body.appendChild(container);

    // Renderer
    WebGLRenderer = new THREE.CanvasRenderer({alpha: true});
    WebGLRenderer.setClearColor( 0xf0f0f0 );
    WebGLRenderer.setPixelRatio( window.devicePixelRatio );
    WebGLRenderer.setSize( window.innerWidth, window.innerHeight );
    //WebGLRenderer.domElement.style.position = 'absolute';
    WebGLRenderer.domElement.style.top = 0;
    // make sure original renderer appears on top of CSS renderer
    WebGLRenderer.domElement.style.zIndex   = 1;
    container.appendChild( WebGLRenderer.domElement );

    cssRenderer = new THREE.CSS3DRenderer();
    cssRenderer.setSize( window.innerWidth, window.innerHeight );
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = 0;
    cssRenderer.domElement.style.margin = 0;
    cssRenderer.domElement.style.padding = 0;
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

    /*var mapLayerPlane = new THREE.Mesh(mapGeo, new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0, blending: THREE.NoBlending}));
    mapLayerPlane.rotation.copy(mapMesh.rotation);
    mapLayerPlane.position.copy(mapMesh.position);
    mapLayerPlane.position.y = baseOXYGridHelper.position.y - 10;
    WebGLScene.add(mapLayerPlane);*/

    mapLayer = createCSS3DObject(iframe.replace("MAPTYPE", maptype).replace("LOCATION",loc));
    mapLayer.rotation.copy(mapMesh.rotation);
    mapLayer.position.copy(mapMesh.position);
    mapLayer.position.z = baseOXYGridHelper.position.z + 10;
    mapLayer.position.x = baseOXYGridHelper.position.x -10;
    mapLayer.position.y = baseOXYGridHelper.position.y - 25;

    var percentBorder = 0.05;
    /*mapLayer.scale.x /= (1 + percentBorder) * (689 / size); MAP_SCALE_FACTOR_X = mapLayer.scale.x;
    mapLayer.scale.y /= (1 + percentBorder) * (661 / size); MAP_SCALE_FACTOR_Y = mapLayer.scale.y;*/
    mapLayer.scale.x = 0.46;
    mapLayer.scale.y = 0.46;
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
	camera = new THREE.CombinedCamera(window.innerWidth/2, window.innerHeight/2, 90, 1, 1000, -500, 1000);
	camera.isPerspectiveCamera = true; camera.isOrthographicCamera = false;
	camera.position.copy(CAMERA_SPAWN);
	camera.lookAt(new THREE.Vector3(size/2, size/2, size/2));

    /*camera1 = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
    camera1.position.set( 500, 350, 750 );*/

	controls = new THREE.OrbitControls( camera, cssRenderer.domElement );
	controls.addEventListener( 'change', render ); // remove when using animation loop
	controls.enableZoom = true;

    /*controls = new THREE.TrackballControls( camera );
    controls.rotateSpeed = 4;*/

	// Event
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'contextmenu', onDocumentLMB, false );
	document.addEventListener( 'mouseup', onDocumentMouseReset, false );
	document.addEventListener( 'wheel', onDocumentMouseWheel, false);

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
}



