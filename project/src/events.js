/**
 * Created by Minh Hoang DANG on 05/05/2017.
 */
function onDocumentMouseMove( event ) {
    //event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    /*var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
     vector.unproject(camera);

     var dir = vector.sub( camera.position ).normalize();
     var distance = - camera.position.z / dir.z;
     var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
     spriteToolTip.position.copy(pos);*/
}

function onDocumentLMB() {
    if(!isLMB)
        isLMB = true;
}

function onDocumentMouseReset() {
    isLMB = isRMB = false;
}

function onDocumentMouseWheel( event ) {
    if(event.wheelDelta < 0 && zoomAmount > 0.51)
        zoomAmount -= 0.01;
    else if (event.wheelDelta > 0 )
        zoomAmount += 0.01;
    camera.setZoom(zoomAmount);
    camera.updateProjectionMatrix();
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.setSize( window.innerWidth, window.innerHeight );
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}