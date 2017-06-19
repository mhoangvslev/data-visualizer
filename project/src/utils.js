/**
 * Make Sprite textes easily
 * @param message String message
 * @param parameters 'fontface, fontsize, etc.'
 * @returns {defs.THREE.Sprite|Raycaster.params.Sprite|SEA3D.Sprite|*}
 */
function makeTextSprite( message, parameters )
{
    if ( parameters === undefined ) parameters = {};

    var fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Consolas";

    var fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : size * 0.25;

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
    var texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    var spriteMaterial = new THREE.SpriteMaterial(
        { map: texture, depthWrite: true} );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(50, 25, 1.0);
    return sprite;
}

/**
 * Draw rounded rectangle
 * @param ctx
 * @param x
 * @param y
 * @param w
 * @param h
 * @param r
 */
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

/**
 * Switch to orthographic mode
 */
function setOrthographic() {
    isInPerspectiveMode = false;
    camera = combinedCamera;
    resetLabel();
    camera.toOrthographic();
    camera.setZoom(5); zoomAmount = 5;
    document.getElementById('fov').innerHTML = 'Orthographic mode' ;
}

/**
 * Switch to perspective mode
 */
function setPerspective() {
    isInPerspectiveMode = true;
    camera = perspectiveCamera;
    updateMapScaleXFilter(0.582245 * mapScaleOffsetX);
    updateMapScaleYFilter(0.561175 * mapScaleOffsetY);
    updateMapOffsetX(-1);
    updateMapOffsetZ(0);
    resetLabel();
    //camera.toPerspective();
    camera.setZoom(5); zoomAmount = 5; camera.position.copy(CAMERA_SPAWN);
    document.getElementById('fov').innerHTML = 'Perspective mode' ;
}

function switchFrontCamera() {
    resetLabel();
    camera.position.x = Math.cos( 2*Math.PI ) * sizeLng;
    camera.position.z = Math.sin( 2*Math.PI ) * sizeLat;
    camera.position.y = 0;
    camera.lookAt( WebGLScene.position );
    camera.updateProjectionMatrix();
    document.getElementById('fov').innerHTML = 'Orthographic mode: Longitude/Timestep' ;
    labelLat.visible = false;
    //document.getElementById('debug_tool').innerHTML = `Camera: ${camera.rotation.x} | ${camera.position.x}`;
}

function switchBackCamera() {
    resetLabel();
    camera.position.x = Math.cos( Math.PI ) * sizeLng;
    camera.position.z = Math.sin( Math.PI ) * sizeLat;
    camera.position.y = 0;
    camera.lookAt( WebGlScene.position );
    camera.updateProjectionMatrix();
    labelLat.visible = false;
    document.getElementById('fov').innerHTML = 'Orthographic mode: Longitude / Timestep' ;
}

function switchLeftCamera() {
    resetLabel();
    camera.position.x = Math.cos( 1.5 * Math.PI ) * sizeLng;
    camera.position.z = Math.sin( 1.5 * Math.PI ) * sizeLat;
    camera.position.y = 0;
    camera.lookAt( WebGlScene.position );
    camera.updateProjectionMatrix();
    labelLng.visible = false;
    labelOrigin.position.x -= 35;
    document.getElementById('fov').innerHTML = 'Orthographic mode: Latitude / Timestep' ;
}

function switchRightCamera() {
    resetLabel();
    camera.position.x = Math.cos( Math.PI/2 ) * sizeLng;
    camera.position.z = Math.sin( Math.PI/2 ) * sizeLat;
    camera.position.y = 0;
    camera.lookAt( WebGlScene.position );
    camera.updateProjectionMatrix();
    labelLng.visible = false;
    labelOrigin.position.x += 20;
    document.getElementById('fov').innerHTML = 'Orthographic mode: Latitude / Timestep' ;
}

function switchTopCamera() {
    resetLabel();
    camera.position.x = 0;
    camera.position.z = Math.sin( 2 * Math.PI ) * sizeLat;
    camera.position.y = Math.cos( 2 * Math.PI ) * sizeTime;
    camera.lookAt( WebGLScene.position );
    camera.updateProjectionMatrix();
    labelT.visible = false;
    labelLng.position.z += 10; labelLng.position.x -= 30; labelLat.position.x -= 50; labelOrigin.position.x -= 30;
    document.getElementById('fov').innerHTML = 'Orthographic mode: Longitude / Latitude' ;

    // Adjust map layer manually
    updateMapScaleXFilter(0.522 * mapScaleOffsetX);
    updateMapScaleYFilter(0.505 * mapScaleOffsetY);
    updateMapOffsetX(-1);
    updateMapOffsetZ(0);
}

function switchBottomCamera() {
    resetLabel();
    camera.position.x = 0;
    camera.position.z = Math.sin( Math.PI ) * sizeLat;
    camera.position.y = Math.cos( Math.PI ) * sizeTime;
    camera.lookAt( WebGlScene.position );
    camera.updateProjectionMatrix();
    labelT.visible = false;
    labelLng.position.z += 20;
    document.getElementById('fov').innerHTML = 'Orthographic mode: Latitude / Longitude' ;
}

function resetLabel(){
    labelLat.visible = true;
    labelLat.position.copy(LABEL_LAT_SPAWN);

    labelOrigin.visible = true;
    labelOrigin.position.copy(LABEL_ORIGIN_SPAWN);

    labelT.visible = true;
    labelT.position.copy(LABEL_TIME_SPAWN);

    labelLng.visible = true;
    labelLng.position.copy(LABEL_LNG_SPAWN);
}

function resetScene() {
    CUnitCluster.traverse(function (child) {
        if(child instanceof CUnit)
            child.reinitiate();
    });
}

function createCSS3DObject(s) {
    // create outerdiv and set inner HTML from supplied string
     var div = document.createElement('div');
    //var div = document.getElementById('css-camera');
    div.innerHTML = s;
    //div.className = 'animated bounceInDown' ;

    div.style.opacity = 0.7;
    // set some values on the div to style it, standard CSS
    div.style.width = `${661}px`;
    div.style.height = `${689}px`;
    div.style.webkitTransformStyle = "preserve-3d";
    div.style.zIndex = -1;

    // create a CSS3Dobject and return it.
    var object = new THREE.CSS3DObject(div);
    object.renderOrder = 4;
    return object;
}

function createDynamicGridHelper(slng, slat, stepx, stepy) {
    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.7 } );

    for ( var i = - slng/2; i <= slng/2 ; i += slng/stepx ) {
        // Latitude lines thus sizeLng
        geometry.vertices.push( new THREE.Vector3( - slat/2, 0, i ) );
        geometry.vertices.push( new THREE.Vector3(   slat/2, 0, i ) );
    }

    for(var i = -slat/2; i <= slat/2; i+=slat/stepy){
        // Longitude line this sizeLat
        geometry.vertices.push( new THREE.Vector3( i, 0, -slng/2 ) );
        geometry.vertices.push( new THREE.Vector3( i, 0, slng/2 ) );
    }

    var o = new THREE.Line( geometry, material, THREE.LinePieces );
    o.renderOrder = 1;
    WebGLScene.add(o);
    return o;
}

function redrawDynamicGridHelper(o, slng, slat, stepx, stepy) {
    //console.log(slng, slat, stepx, stepy);
    var geometry = new THREE.Geometry();
    for ( var i = - slng/2; i <= slng/2 ; i += slng/stepx ) {
        // Latitude lines
        geometry.vertices.push( new THREE.Vector3( - slat/2, 0, i ) );
        geometry.vertices.push( new THREE.Vector3(   slat/2, 0, i ) );
    }

    for(var i = -slat/2; i <= slat/2; i+=slat/stepy){
        // Longitude lines
        geometry.vertices.push( new THREE.Vector3( i, 0, -slng/2 ) );
        geometry.vertices.push( new THREE.Vector3( i, 0, slng/2 ) );
    }

    if( o instanceof THREE.Line)
        o.geometry = geometry;
}

function updateVars() {
    dimensionX = sizeLat/newSizeX;
    dimensionY = sizeTime/newSizeY;
    dimensionZ = sizeLng/newSizeZ;

    offsetZ = (-sizeLat + dimensionX)/2;
    offsetX = (sizeLng - dimensionZ)/2 ;
    offsetY = (sizeTime - dimensionY)/2;
}

/**
 * Convert time step value to human readable time format
 * @param time_step
 * @returns {Date}
 */
function getTimeStampFromStep(time_step) {
    return new Date(TIME_GENESIS.getTime() + (time_step * 7200000));
}

function getLatitudeFromY(cell_y, rad){
    var res = LAT_MIN + (cell_y * CELL_DISTANCE* 0.001) / 111.321;
    if(rad)
        return THREE.Math.degToRad(res);
    return res;
}

function getLongitudeFromX(cell_x, cell_y, rad) {
    var res = LNG_MIN + (cell_x * CELL_DISTANCE * 0.001)/(Math.cos(getLatitudeFromY(cell_y)) * 111.321);
    if(rad)
        return THREE.Math.degToRad(res);
    return res;
}