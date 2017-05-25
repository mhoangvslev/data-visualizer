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

function updateBrushSizeFilter(bsize) {
    CUnitCluster.traverse(function (child) {
        if(child instanceof CUnit){
            if(mustExtrude){
                child.setCunitSize(bsize, child.getScalePerWeight() * 0.5, bsize);
            }
            else
                child.setCunitSize(bsize, bsize, bsize);
        }
    });
}

function updateSceneFilters() {
    resetScene();
    CUnitCluster.traverse(function (child) {
        if (child instanceof CUnit) {
            if (((child.getTimeStep() >= timeStepLowerBound && child.getTimeStep() <= timeStepUpperBound ) &&
                (child.getCellY() >= yLowerBound && child.getCellY() <= yUpperBound ) &&
                (child.getCellX() >= xLowerBound && child.getCellX() <= xUpperBound ) &&
                (child.getZScore() >= zScoreLowerBound && child.getZScore() <= zScoreUpperBound)
            ) || (extrudeLayer !== -1 && child.getTimeStep() === extrudeLayer)) {
                child.getMesh().visible = true;
            }
            else {
                child.getMesh().visible = false;
            }
        }
    });
}

function updateMapAlphaFilter(val) {
    mapMesh.material.opacity = val;
    document.getElementById("OSMLayer").style.opacity = val;
}

function updateGeometryFilter(newGeo) {
    CUnitCluster.traverse(function (child) {
       if(child instanceof CUnit){
           child.changeGeometry(newGeo);
       }
    });
}

function updateOneLayerFilter() {
    resetScene();
    CUnitCluster.traverse(function (child) {
       if(child instanceof CUnit){
           if(child.getTimeStep() === extrudeLayer) {
               child.getMesh().visible = true;
               if (mustExtrude) {
                   child.getMesh().scale.y = child.getScalePerWeight();
                   child.getMesh().position.y = (size/2 + child.getMesh().scale.y*child.getDimension()/2) - sizeY;
               }
               if(child.getZScore() >= zScoreLowerBound && child.getZScore() <= zScoreUpperBound)
                   child.getMesh().visible = true;
               else
                   child.getMesh().visible = false;
           }
           else {
               child.getMesh().visible = false;
           }
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

function updateMapLayerDisplay(bScale) {
    if(bScale) {
        CUnitCluster.traverse(function (child) {
            if (child instanceof CUnit) {
                child.getMesh().position.x = (child.getCellX() - xLowerBound) * (sizeX / newSizeX) - offsetX;
                child.getMesh().position.y = (child.getTimeStep() - timeStepLowerBound) * (sizeY / newSizeY) - offsetY;
                child.getMesh().position.z = -(child.getCellY() - yLowerBound) * (sizeZ / newSizeZ) - offsetZ;

                if (child.getCellY() == yLowerBound)
                    newLngMin = child.getLongitude();

                if (child.getCellY() == yUpperBound)
                    newLngMax = child.getLongitude();

                if (child.getCellX() == xLowerBound)
                    newLatMin = child.getLatitude();

                if (child.getCellX() == xUpperBound)
                    newLatMax = child.getLatitude();
            }
        });
        var newLoc = encodeURIComponent(`${newLngMin.toFixed(14)}, ${newLatMin.toFixed(14)},${newLngMax.toFixed(14)},${newLatMax.toFixed(14)}`);
        console.log(decodeURIComponent(newLoc));
        document.getElementById("OSMLayer").setAttribute("src", ("http://www.openstreetmap.org/export/embed.html?bbox=LOCATION&amp;layer=MAPTYPE").replace("LOCATION", newLoc).replace("MAPTYPE", maptype));
    }
    else
        resetScene();
}
