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

function updateWeightFilter() {
    CUnitCluster.traverse( function (child) {
        if(child instanceof CUnit) {
            if (child.getZScore() >= zScoreLowerBound && child.getZScore() <= zScoreUpperBound ) {
                if (child.getTimeStep() >= timeStepLowerBound && child.getTimeStep() <= timeStepUpperBound)
                    child.getMesh().visible = true;
                else if(child.getTimeStep() === extrudeLayer)
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

function updateTimeStepFilter() {
    resetScene();
    CUnitCluster.traverse(function (child) {
        if (child instanceof CUnit) {
            if (child.getTimeStep() >= timeStepLowerBound && child.getTimeStep() <= timeStepUpperBound ) {
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

function updateTimeStepScale(scale, offset){
    CUnitCluster.traverse(function (child) {
        if(child instanceof CUnit){
            child.getMesh().position.y = (child.getTimeStep() - TIME_STEP_LOWER_BOUND)*scale/Y_SCALE - offset;
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
                   child.getMesh().scale.y = child.getScalePerWeight() * 0.5;
                   child.getMesh().position.y = child.getScalePerWeight() - (size/2 + child.getMesh().scale.y*child.getDimension()/2);
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
