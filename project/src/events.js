/**
 * Handle mouse move event
 * @param event
 */
function onDocumentMouseMove( event ) {
    //event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

/**
 * Handle left click event
 */
function onDocumentLMB() {
    if(!isLMB)
        isLMB = true;
}

function onDocumentMouseReset() {
    isLMB = isRMB = false;
}

/**
 * Handle mouse wheel event for zooming actions
 * @param event
 */
function onDocumentMouseWheel( event ) {
    if(!isInPerspectiveMode) {
        //console.log('zomming');
        var zoomStep = 0.02;
        if (event.wheelDelta < 0 && zoomAmount - (zoomStep * zoomFactor) > 1.5)
            zoomAmount -= (zoomStep * zoomFactor);
        else if (event.wheelDelta > 0)
            zoomAmount += (zoomStep * zoomFactor);
        camera.setZoom(zoomAmount);
        camera.updateProjectionMatrix();
    }

    //console.log(camera);
}

/**
 * Update the scene based on windows dimension
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    //camera.setSize( window.innerWidth, window.innerHeight );
    camera.updateProjectionMatrix();

    WebGLRenderer.setSize( window.innerWidth, window.innerHeight );
    cssRenderer.setSize( window.innerWidth, window.innerHeight );
}