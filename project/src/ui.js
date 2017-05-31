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
                (child.getCellY() >= xLowerBound && child.getCellY() <= xUpperBound ) &&
                (child.getCellX() >= yLowerBound && child.getCellX() <= yUpperBound ) &&
                (child.getZScore() >= zScoreLowerBound && child.getZScore() <= zScoreUpperBound)
            ) /*|| (extrudeLayer !== -1 && child.getTimeStep() === extrudeLayer))*/ {
                child.getMesh().visible = true;
                if (mustExtrude) {
                    child.getMesh().scale.y = child.getScalePerWeight();
                    child.getMesh().position.y = (size/2 + child.getMesh().scale.y*child.getDimension()/2) - sizeY;
                }
            }
            else {
                child.getMesh().visible = false;
            }
        }
    });

    if(mustScale)
        document.getElementById('time_step_unit').innerHTML = `X: ${(200*newSizeX/sizeX).toFixed(2)}m Y: ${(sizeY/newSizeY).toFixed(2)}x Z: ${(200*newSizeZ/sizeZ).toFixed(2)}m` + ' unit(s)';
    else
        document.getElementById('time_step_unit').innerHTML = '1 unit';
}

function updateOneLayerFilter() {
    CUnitCluster.traverse(function (child) {
        if(child instanceof CUnit){
            if(child.getTimeStep() === extrudeLayer) {
                child.getMesh().visible = true;
                if (mustExtrude) {
                    child.getMesh().scale.y = child.getScalePerWeight();
                    child.getMesh().position.y = (size/2 + child.getMesh().scale.y*child.getDimension()/2) - sizeY;
                }
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

function updateMapLayerDisplay(bScale) {
    var newLoc;
    if(bScale) {
        CUnitCluster.traverse(function (child) {
            if (child instanceof CUnit) {
                // Reposition
                child.getMesh().position.z = -(child.getCellX() - yLowerBound) * (sizeZ / newSizeZ) - offsetZ;
                child.getMesh().position.y = (child.getTimeStep() - timeStepLowerBound) * (sizeY / newSizeY) - offsetY;
                child.getMesh().position.x = (child.getCellY() - xLowerBound) * (sizeX / newSizeX) - offsetX;

                //Recalculate lng and alt
                child.update();

                // Calculate new bounding box for OSM Layer

                if (child.getCellX() == yLowerBound) {
                    newLngMin = child.getLongitude();
                }

                if (child.getCellX() == yUpperBound) {
                    newLngMax = child.getLongitude();
                }

                if (child.getCellY() == xLowerBound) {
                    newLatMin = child.getLatitude();
                }

                if (child.getCellY() == xUpperBound) {
                    newLatMax = child.getLatitude();
                }
            }
        });

        /*newLatMin = calcLatitude(xLowerBound);
        newLatMax = calcLatitude(xUpperBound);
        newLngMin = calcLongitude(yLowerBound, newLatMin);
        newLngMax = calcLongitude(yUpperBound, newLatMax);*/

        newLoc = encodeURIComponent(`${newLngMin},${newLatMin},${newLngMax},${newLatMax}`);
    }
    else {
        newLoc = encodeURIComponent(`${LNG_MIN},${LAT_MIN},${LNG_MAX},${LAT_MAX}`);
        resetScene();
    }
    console.log(decodeURIComponent(newLoc));
    var url = ("http://www.openstreetmap.org/export/embed.html?bbox=LOCATION&amp;layers=MAPTYPE").replace("LOCATION", newLoc).replace("MAPTYPE", maptype);
    //console.log(url);
    document.getElementById("OSMLayer").setAttribute("src", url);
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