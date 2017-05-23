/**
 * Created by Minh Hoang DANG on 04/05/2017.
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

function setOrthographic() {
    resetLabel();
    camera.toOrthographic();
    camera.setZoom(7); zoomAmount = 7;
    document.getElementById('fov').innerHTML = 'Orthographic mode' ;
}
function setPerspective() {
    resetLabel();
    camera.toPerspective();
    camera.setZoom(1); zoomAmount = 1; camera.position.copy(CAMERA_SPAWN);
    document.getElementById('fov').innerHTML = 'Perspective mode' ;
}

function switchFrontCamera() {
    resetLabel();
    camera.position.x = Math.cos( 2*Math.PI ) * size;
    camera.position.z = Math.sin( 2*Math.PI ) * size;
    camera.position.y = 0;
    camera.lookAt( WebGLScene.position );
    camera.updateProjectionMatrix();
    document.getElementById('fov').innerHTML = 'Orthographic mode: Longitude/Timestep' ;
    labelLat.visible = false;
    //document.getElementById('debug_tool').innerHTML = `Camera: ${camera.rotation.x} | ${camera.position.x}`;
}

function switchBackCamera() {
    resetLabel();
    camera.position.x = Math.cos( Math.PI ) * size;
    camera.position.z = Math.sin( Math.PI ) * size;
    camera.position.y = 0;
    camera.lookAt( WebGlScene.position );
    camera.updateProjectionMatrix();
    labelLat.visible = false;
    document.getElementById('fov').innerHTML = 'Orthographic mode: Longitude / Timestep' ;
}

function switchLeftCamera() {
    resetLabel();
    camera.position.x = Math.cos( 1.5 * Math.PI ) * size;
    camera.position.z = Math.sin( 1.5 * Math.PI ) * size;
    camera.position.y = 0;
    camera.lookAt( WebGlScene.position );
    camera.updateProjectionMatrix();
    labelLng.visible = false;
    labelOrigin.position.x -= 35;
    document.getElementById('fov').innerHTML = 'Orthographic mode: Latitude / Timestep' ;
}

function switchRightCamera() {
    resetLabel();
    camera.position.x = Math.cos( Math.PI/2 ) * size;
    camera.position.z = Math.sin( Math.PI/2 ) * size;
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
    camera.position.z = Math.sin( 2 * Math.PI ) * size;
    camera.position.y = Math.cos( 2 * Math.PI ) * size;
    camera.lookAt( WebGLScene.position );
    camera.updateProjectionMatrix();
    labelT.visible = false;
    labelLng.position.z += 10; labelLng.position.x -= 30; labelLat.position.x -= 50; labelOrigin.position.x -= 30;
    document.getElementById('fov').innerHTML = 'Orthographic mode: Longitude / Latitude' ;
}

function switchBottomCamera() {
    resetLabel();
    camera.position.x = 0;
    camera.position.z = Math.sin( Math.PI ) * size;
    camera.position.y = Math.cos( Math.PI ) * size;
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
    div.innerHTML = s;

    div.style.opacity = 0.7;
    /*// set some values on the div to style it, standard CSS
    div.style.width = `${661}px`;
    div.style.height = `${689}px`;
    div.style.zIndex = 4;*/

    // create a CSS3Dobject and return it.
    var object = new THREE.CSS3DObject(div);
    return object;
}

function createSides(s, geometry) {

    // merge these, or compensate the offset
    for (var iFace = 0 ; iFace < geometry.faces.length; iFace+=2) {

        // create a new object
        var side = createCSS3DObject(s);

        // get this face and the next which both make the cube
        var face = geometry.faces[iFace];
        var faceNext = geometry.faces[iFace+1];

        // First reposition the div elements based on the two faces
        // that make up the side of the cube
        //console.log(face);
        var centroid = new THREE.Vector3();
        centroid.copy( geometry.vertices[face.a] )
            .add( geometry.vertices[face.b] )
            .add( geometry.vertices[face.c] )
            .add( geometry.vertices[faceNext.a] )
            .add( geometry.vertices[faceNext.b] )
            .add( geometry.vertices[faceNext.c] )
            .divideScalar( 6 );

        side.position.x = centroid.x;
        side.position.y = centroid.y;
        side.position.z = centroid.z;

        // Now we need to rotate the div to the correct position
        var up = new THREE.Vector3(0,0,1);
        var normal = geometry.faces[iFace].normal;;

        // We calculate the axis on which to rotate by
        // selecting the cross of the vectors
        var axis = new THREE.Vector3();
        axis.crossVectors(up,normal);

        // based on the axis, in relation to our normal vector
        // we can calculate the angle.
        var angle = Math.atan2(axis.length(), up.dot(normal));
        axis.normalize();

        // now we can use matrix function to rotate the object so
        // it is aligned with the normal from the face
        var matrix4 = new THREE.Matrix4();
        matrix4.makeRotationAxis(axis,angle);

        side.rotation.setFromRotationMatrix(matrix4);
        cssScene.add(side);
        sides.push(side);
    }
}
