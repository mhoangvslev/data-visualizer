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

function updateWeightFilter(interval1, interval2) {
    CUnitCluster.traverse( function (child) {
        if(child instanceof CUnit) {
            if (child.getZScore() >= interval1 && child.getZScore() <= interval2)
                child.getMesh().visible = true;
            else
                child.getMesh().visible = false;
        }
    });
}

function updateBrushSizeFilter(bsize) {
    CUnitCluster.traverse(function (child) {
        if(child instanceof CUnit){
            child.setCunitSize(bsize);
        }
    });
}

function updateTimeStepFilter(interval1, interval2) {
    CUnitCluster.traverse(function (child) {
        if (child instanceof CUnit) {
            if (child.getTimeStep() >= interval1 && child.getTimeStep() <= interval2)
                child.getMesh().visible = true;
            else
                child.getMesh().visible = false;
        }
    });
}

function updateTimeStepScale(scale, offset){
    CUnitCluster.traverse(function (child) {
        if(child instanceof CUnit){
            //console.log(scale);
            child.getMesh().position.y = child.getTimeStep()*scale - offset;
        }
    });
}
