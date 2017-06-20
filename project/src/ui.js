/**
 * Created by Minh Hoang DANG on 05/05/2017.
 */

function updateZoomSpeedFilter(zspeed) {
    zoomFactor = zspeed;
}

function updateCameraFOVFilter(fov) {
    var fovAmount = fov;
    camera.setFov(fovAmount);
}

function updateBrushSizeFilter() {
    updateVars();
    CUnitCluster.traverse(function (child) {
        if(child instanceof CUnit) {
            if (mustExtrude)
                child.setCunitSize(dimensionX * BRUSH_SIZE, child.getScalePerWeight(), dimensionZ * BRUSH_SIZE);
            else
                child.setCunitSize(dimensionX * BRUSH_SIZE, dimensionY * BRUSH_SIZE, dimensionZ * BRUSH_SIZE);
        }
    });
}

/**
 * Prevent unwanted CUnits from being rendered
 */
function updateSceneFilters() {
    resetScene();
    updateVars();
    CUnitCluster.traverse(function (child) {
        if (child instanceof CUnit) {
            if (((child.getTimeStep() >= timeStepLowerBound && child.getTimeStep() < timeStepUpperBound ) &&
                    (child.getCellY() >= xLowerBound && child.getCellY() < xUpperBound ) &&
                    (child.getCellX() >= yLowerBound && child.getCellX() < yUpperBound ) &&
                    (child.getZScore() >= zScoreLowerBound && child.getZScore() < zScoreUpperBound)
                )) {
                child.getMesh().visible = true;
            }
            else {
                child.getMesh().visible = false;
            }
        }
    });
    //document.getElementById('time_step_unit').innerHTML = `Lat: ${(200*newSizeX/sizeLat).toFixed(2)}m | Lng: ${(200*newSizeZ/sizeLng).toFixed(2)}m`;
}

/**
 * Scale the CUnits to right place and update the map layer beneath the Cube
 * @param bScale
 */
function updateMapLayerDisplay(bScale) {
    updateVars();
    CUnitCluster.traverse(function (child) {
        if (child instanceof CUnit) {
            // Reposition
            if(bScale) {
                child.getMesh().position.z = -(child.getCellX() - yLowerBound) * dimensionX - offsetZ;
                child.getMesh().position.x = (child.getCellY() - xLowerBound) * dimensionZ - offsetX;
            }
            else{
                child.getMesh().position.z = -child.getCellX() * dimensionX - offsetZ;
                child.getMesh().position.x = child.getCellY() * dimensionZ - offsetX;
            }

            if (mustExtrude)
                child.getMesh().position.y = (child.getScalePerWeight() - sizeTime)/2;
            else
                child.getMesh().position.y = (child.getTimeStep() - timeStepLowerBound) * dimensionY - offsetY;

            updateBrushSizeFilter();

            // Calculate new bounding box for OSM Layer
            if (child.getCellX() === yLowerBound)
                newLngMin = child.getLongitude();

            if (child.getCellX() === yUpperBound)
                newLngMax = child.getLongitude();

            if (child.getCellY() === xLowerBound)
                newLatMin = child.getLatitude();

            if (child.getCellY() === xUpperBound)
                newLatMax = child.getLatitude();
        }
    });

    var newLoc;
    if(bScale) {
        newLoc = encodeURIComponent(`${newLngMin},${newLatMin},${newLngMax},${newLatMax}`);
        // Base plane (O - Lat - Lng)
        redrawDynamicGridHelper(baseOXYGridHelper, sizeLat, sizeLng, newSizeX, newSizeZ);

        // Plane along Longitude axis (O - Time - Lng)
        redrawDynamicGridHelper(baseOYZGridHelper, sizeLng, sizeTime, newSizeZ, newSizeY);

        // Plane along Latitude axis (O - Time - Lat)
        redrawDynamicGridHelper(baseOXZGridHelper, sizeLat, sizeTime, newSizeX, newSizeY);

        // Update CUnit size
        dimensionX = sizeLat/newSizeX;
        dimensionY = sizeTime/newSizeY;
        dimensionZ = sizeLng/newSizeZ;
        updateBrushSizeFilter();

    }
    else {
        newLoc = encodeURIComponent(`${LNG_MIN},${LAT_MIN},${LNG_MAX},${LAT_MAX}`);
        resetScene();
    }
    //console.log(decodeURIComponent(newLoc));
    var url = ('https://www.openstreetmap.org/export/embed.html?bbox=LOCATION&amp;layers=MAPTYPE').replace("LOCATION", newLoc).replace("MAPTYPE", maptype);
    //console.log(decodeURIComponent(url));
    document.getElementById("OSMLayer").setAttribute("src", url);
}

/**
 * Extrusion map / One layer handling
 */
function updateOneLayerFilter() {
    resetScene();
    updateVars();
    CUnitCluster.traverse(function (child) {
        if(child instanceof CUnit){
            if(
                 child.getTimeStep() === extrudeLayer &&
                (child.getTimeStep() >= timeStepLowerBound && child.getTimeStep() < timeStepUpperBound ) &&
                (child.getCellY() >= xLowerBound && child.getCellY() < xUpperBound ) &&
                (child.getCellX() >= yLowerBound && child.getCellX() < yUpperBound ) &&
                (child.getZScore() >= zScoreLowerBound && child.getZScore() < zScoreUpperBound)
                ){
                child.getMesh().visible = true;
                if (mustExtrude)
                    child.getMesh().position.y = (child.getScalePerWeight() - sizeTime)/2;
                else{
                    //console.log(dimensionX, dimensionY, dimensionZ);
                    child.getMesh().position.y = (child.getTimeStep() - timeStepLowerBound) * dimensionY - offsetY;
                }
                updateBrushSizeFilter();
            }
            else {
                child.getMesh().visible = false;
            }
        }
    });
}

/**
 * Change the opacity of the map layer
 * @param val the opacity value
 */
function updateMapAlphaFilter(val) {
    mapMesh.material.opacity = val;
    document.getElementById("outerOSM").style.opacity = val;
}

function updateGeometryFilter(newGeo) {
    CUnitCluster.traverse(function (child) {
       if(child instanceof CUnit){
           child.changeGeometry(newGeo);
       }
    });
}

function updateDynamicMapFilter(b){
    if(b){
        mapMesh.visible = true;
        document.getElementById("OSMLayer").style.display = "none";
    }
    else{
        mapMesh.visible = false;
        document.getElementById("OSMLayer").style.display = "block";
    }
}

function updateInteractiveMapFilter(b) {
    if(b){
        document.getElementById("OSMLayerBlocker").style.display = "none";
    }
    else {
        document.getElementById("OSMLayerBlocker").style.display = "block";
    }
}

function updateMapScaleXFilter(val) {
    mapLayer.scale.x = val;
}

function updateMapScaleYFilter(val) {
    mapLayer.scale.y = val;
}

function updateMapOffsetX(val) {
    mapLayer.position.x = baseOXYGridHelper.position.x + val;
}

function updateMapOffsetZ(val) {
    mapLayer.position.z = baseOXYGridHelper.position.z + val;
}

function updateMapOffsetY(val) {
    mapLayer.position.y = baseOXYGridHelper.position.y + val;
}

function updateMapLayerType(val){
    /*console.log(val);
    switch (val){
        case "Cyclable":
            maptype = 'C';
            break;

        case "Transport":
            maptype = 'T';
            break;

        case "Humanitarian":
            maptype = 'H';
            break;

        default:
            maptype = 'mapnik';
            break;
    }
    updateMapLayerDisplay(mustScale);*/
}