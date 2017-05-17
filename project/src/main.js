/* eslint-disable padded-blocks,space-unary-ops,space-infix-ops,space-in-parens,computed-property-spacing */
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

init();
animate();

function init() {
	var container = document.getElementById( 'container' );
	document.body.appendChild(container);

    // Renderer
    /*if ( webglAvailable() ) {
        renderer = new THREE.WebGLRenderer( { antialias: true } );
    } else {
        renderer = new THREE.CanvasRenderer();
    }*/
    renderer = new THREE.CanvasRenderer();
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

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
	labelT = makeTextSprite("Time step"); labelT.position.copy(LABEL_TIME_SPAWN);
	scene.add( labelT );
	labelLng = makeTextSprite("Longitude"); labelLng.position.copy(LABEL_LNG_SPAWN);
	scene.add(labelLng);
	labelLat = makeTextSprite("Latitude"); labelLat.position.copy(LABEL_LAT_SPAWN);
	scene.add(labelLat);

	// Berlin map below the Grid
	/*var textureGeoLoader = new THREE.TextureLoader();
	//var textureGeoLoader = new THREE.SVGLoader();
	textureGeoLoader.load(
		'./data/nyc_location_map.svg',
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
            mapMesh.renderOrder = 0;
            scene.add( mapMesh );
		}
	);*/

    var svg = document.getElementById("svgContainer").querySelector("svg");
    var svgData = (new XMLSerializer()).serializeToString(svg);

    svgCanvas = document.createElement("canvas");
    var svgSize = svg.getBoundingClientRect();
    console.log(`${svgSize.width} | ${svgSize.height}`);
    svgCanvas.width = 541;
    svgCanvas.height = 529;
    svgContext = svgCanvas.getContext("2d");

    var img = document.createElement("img");
    img.setAttribute("src", "data:image/svg+xml;base64," + window.btoa(decodeURIComponent(encodeURIComponent(svgData))) );

    img.onload = function() {
        svgContext.drawImage(img, 0, 0);
        var textureGeo = new THREE.Texture(svgCanvas);
        textureGeo.needsUpdate = true;

        textureGeo.minFilter = THREE.LinearFilter;
        mapMat = new THREE.MeshBasicMaterial( { map: textureGeo, side: THREE.DoubleSide } );
        mapMat.needsUpdate = true;
        textureGeo.wrapS = THREE.RepeatWrapping;
        textureGeo.wrapT = THREE.RepeatWrapping;
        var mapGeo = new THREE.PlaneGeometry( size, size );
        mapMesh = new THREE.Mesh( mapGeo, mapMat );

        mapMesh.rotation.x = - ( Math.PI / 2 );
        mapMesh.position.x = baseOXYGridHelper.position.x;
        mapMesh.position.z = baseOXYGridHelper.position.z;
        mapMesh.position.y = baseOXYGridHelper.position.y - 0.5;
        mapMesh.renderOrder = 0;
        scene.add( mapMesh );
    };

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
	camera.position.copy(CAMERA_SPAWN);
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



