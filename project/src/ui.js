/**
 * Created by Minh Hoang DANG on 05/05/2017.
 */
function initCP(){
    // Control panel
    var gui = new dat.GUI({
        height: 5 * 32 - 1
    });
    gui.add( params, 'time_step', 0, 100 ).name('Time step').onFinishChange(function () {
        //console.log("lol");
        CUnitCluster.traverse(function (child) {
            if(child instanceof CUnit ) {
                if (child.getTimeStep() > params['time_step'])
                    child.getMesh().visible = false;
                else
                    child.getMesh().visible = true;
            }
        });
    });
    gui.add( params, 'cunit_size', 0, 1).name('Brush size').onFinishChange(function () {
        CUnitCluster.traverse(function (child) {
            if(child instanceof CUnit){
                child.setCunitSize(params['cunit_size']);
            }
        });
    });
    gui.add( params, 'weight', 3.920, 3.999).name('Weight filter').onFinishChange(function () {
        CUnitCluster.traverse( function (child) {
            if(child instanceof CUnit) {
                if (child.getZScore() < params['weight'])
                    child.getMesh().visible = false;
                else
                    child.getMesh().visible = true;
            }
        });
    });
    gui.add( params, 'camera_fov', 50, 100).name('Camera FOV').onFinishChange(function () {
        var fovAmount = params['camera_fov'];
        camera.setFov(fovAmount);
    });
    gui.add( params, 'zoom_factor', 1, 10 ).name('Zoom speed').onFinishChange(function () {
        zoomFactor = params['zoom_factor'];
    });
    gui.open();
}