/* eslint-disable padded-blocks,space-unary-ops,space-infix-ops,space-in-parens,computed-property-spacing */
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var stats;
var params = {
	time_step: 0,
	cunit_size: 1
};

var size = 100, step = 20;

var camera, controls, scene, renderer, raycaster;
var mouse = new THREE.Vector2(), INTERSECTED;
var CUnitCluster = new THREE.Object3D();
var context1, texture1, spriteToolTip;

init();
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
	scene = new THREE.Scene();
	raycaster = new THREE.Raycaster();

	if ( webglAvailable() ) {
		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
	} else {
		renderer = new THREE.CanvasRenderer();
	}

	renderer.setClearColor( 0xf0f0f0 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;

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

	var spritey = makeTextSprite("O");
	spritey.position.set(0, baseXYGridHelper.position.y, -baseXYGridHelper.position.z - 75);
	scene.add( spritey );
	var spritey = makeTextSprite("Time step");
	spritey.position.set(baseXZGridHelper.position.x, baseXZGridHelper.position.y*2, 0);
	scene.add( spritey );
	var spritey = makeTextSprite("Longitude");
	spritey.position.set(0, baseXYGridHelper.position.y, -baseXYGridHelper.position.z - 200);
	scene.add(spritey);
	var spritey = makeTextSprite("Latitude");
	spritey.position.set(baseXYGridHelper.position.x + 75, baseXYGridHelper.position.y, 0);
	scene.add(spritey);

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

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );

	var canvas1 = document.createElement('canvas');
	context1 = canvas1.getContext('2d');
	context1.font = "Bold 20px Arial";
	context1.fillStyle = "rgba(0,0,0,0.95)";
	context1.fillText('Hello, world!', 0, 20);

	// canvas contents will be used for a texture
	texture1 = new THREE.Texture(canvas1)
	texture1.needsUpdate = true;

	////////////////////////////////////////

	var spriteMaterial = new THREE.SpriteMaterial( { map: texture1, useScreenCoordinates: true} );

	spriteToolTip = new THREE.Sprite( spriteMaterial );
	spriteToolTip.scale.set(100,50,1.0);
	spriteToolTip.position.set( 50, 50, 0 );
	scene.add( spriteToolTip );

	// Control panel
	var gui = new dat.GUI({
		height: 5 * 32 - 1
	});
	gui.add( params, 'time_step', 0, 100 ).name('Time step').onFinishChange(function () {
		//console.log("lol");
		CUnitCluster.traverse(function (child) {
			if(child instanceof CUnit ) {
				if (child.getTimeStep() < params['time_step']) {
					//console.log('hi');
					child.setOpacity(0);
				}
				else
					child.reinitiate();
			}
		});
	});
	gui.add( params, 'cunit_size', 0, 1).name('Brush size').onFinishChange(function () {
		CUnitCluster.traverse(function (child) {
			if(child instanceof CUnit){
				child.setCunitSize(params['cunit_size']);
			}
		})
	});
	gui.open();
}

function makeTextSprite( message, parameters )
{
	if ( parameters === undefined ) parameters = {};

	var fontface = parameters.hasOwnProperty("fontface") ?
		parameters["fontface"] : "Consolas";

	var fontsize = parameters.hasOwnProperty("fontsize") ?
		parameters["fontsize"] : 18;

	var borderThickness = parameters.hasOwnProperty("borderThickness") ?
		parameters["borderThickness"] : 4;

	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:0 };

	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:255, g:255, b:255, a:0 };

	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font = fontsize + "px " + fontface;

	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
	var textWidth = metrics.width;

	// background color
	context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
		+ backgroundColor.b + "," + backgroundColor.a + ")";
	// border color
	context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
		+ borderColor.b + "," + borderColor.a + ")";
	context.lineWidth = borderThickness;
	roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
	// 1.4 is extra height factor for text below baseline: g,j,p,q.

	// text color
	context.fillStyle = "rgba(0, 0, 0, 1.0)";
	context.fillText( message, borderThickness, fontsize + borderThickness);

	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas)
	texture.needsUpdate = true;
	var spriteMaterial = new THREE.SpriteMaterial(
		{ map: texture, useScreenCoordinates: false} );
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(50, 25, 1.0);
	return sprite;
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r)
{
	ctx.beginPath();
	ctx.moveTo(x+r, y);
	ctx.lineTo(x+w-r, y);
	ctx.quadraticCurveTo(x+w, y, x+w, y+r);
	ctx.lineTo(x+w, y+h-r);
	ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
	ctx.lineTo(x+r, y+h);
	ctx.quadraticCurveTo(x, y+h, x, y+h-r);
	ctx.lineTo(x, y+r);
	ctx.quadraticCurveTo(x, y, x+r, y);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );
	update();
	render();

}

function onDocumentMouseMove( event ) {
	//event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function update() {
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( scene.children );
	if ( intersects.length > 0 ) {
		if ( INTERSECTED != intersects[ 0 ].object && intersects[0].object.material.emissive != null) {
			if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
			INTERSECTED.material.emissive.setHex( 0xff0000 );

			// update text, if it has a "name" field.
			if ( intersects[ 0 ].object.name )
			{
				context1.clearRect(0,0,640,480);
				var message = intersects[ 0 ].object.name;
				var metrics = context1.measureText(message);
				var width = metrics.width;
				context1.fillStyle = "rgba(0,0,0,0.95)"; // black border
				context1.fillRect( 0,0, width+8,20+8);
				context1.fillStyle = "rgba(255,255,255,0.95)"; // white filler
				context1.fillRect( 2,2, width+4,20+4 );
				context1.fillStyle = "rgba(0,0,0,1)"; // text color
				context1.fillText( message, 4,20 );
				texture1.needsUpdate = true;
                spriteToolTip.position.set( intersects[0].object.position.x, intersects[0].object.position.y - 20, intersects[0].object.position.z );
			}
			else
			{
				context1.clearRect(0,0,256,256);
				texture1.needsUpdate = true;
			}
		}
	} else {
		if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
		INTERSECTED = null;
		context1.clearRect(0,0,256,256);
		texture1.needsUpdate = true;
	}
	controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
	stats.update();
}

function render() {
	renderer.render( scene, camera );
}

