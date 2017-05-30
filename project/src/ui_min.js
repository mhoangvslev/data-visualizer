/**
 * Created by Minh Hoang DANG on 30/05/2017.
 */
function updateZoomSpeedFilter(zspeed){zoomFactor=zspeed}
function updateCameraFOVFilter(fov){var fovAmount=fov;camera.setFov(fovAmount)}
function updateBrushSizeFilter(bsize){CUnitCluster.traverse(function(child){if(child instanceof CUnit){if(mustExtrude){child.setCunitSize(bsize,child.getScalePerWeight()*0.5,bsize)}
else child.setCunitSize(bsize,bsize,bsize)}})}
function updateSceneFilters(){resetScene();CUnitCluster.traverse(function(child){if(child instanceof CUnit){if(((child.getTimeStep()>=timeStepLowerBound&&child.getTimeStep()<=timeStepUpperBound)&&(child.getCellY()>=xLowerBound&&child.getCellY()<=xUpperBound)&&(child.getCellX()>=yLowerBound&&child.getCellX()<=yUpperBound)&&(child.getZScore()>=zScoreLowerBound&&child.getZScore()<=zScoreUpperBound))||(extrudeLayer!==-1&&child.getTimeStep()===extrudeLayer)){child.getMesh().visible=!0}
else{child.getMesh().visible=!1}
    if(mustExtrude){child.getMesh().scale.y=child.getScalePerWeight();child.getMesh().position.y=(size/2+child.getMesh().scale.y*child.getDimension()/2)-sizeY}
    else{child.getMesh().scale.y=1}}})}
function updateMapAlphaFilter(val){mapMesh.material.opacity=val;document.getElementById("OSMLayer").style.opacity=val}
function updateGeometryFilter(newGeo){CUnitCluster.traverse(function(child){if(child instanceof CUnit){child.changeGeometry(newGeo)}})}
function updateOneLayerFilter(){resetScene();CUnitCluster.traverse(function(child){if(child instanceof CUnit){if(child.getTimeStep()===extrudeLayer){child.getMesh().visible=!0;if(mustExtrude){child.getMesh().scale.y=child.getScalePerWeight();child.getMesh().position.y=(size/2+child.getMesh().scale.y*child.getDimension()/2)-sizeY}
    updateSceneFilters()}
else{child.getMesh().visible=!1}}})}
function updateDynamicMapFilter(b){if(b){mapMesh.visible=!0;document.getElementById("OSMLayer").style.display="none"}
else{mapMesh.visible=!1;document.getElementById("OSMLayer").style.display="block"}}
function updateInteractiveMapFilter(b){if(b){document.getElementById("OSMLayerBlocker").style.display="none"}
else{document.getElementById("OSMLayerBlocker").style.display="block"}}
function updateMapScaleXFilter(val){mapLayer.scale.x=val}
function updateMapScaleYFilter(val){mapLayer.scale.y=val}
function updateMapOffsetX(val){mapLayer.position.x=baseOXYGridHelper.position.x+val}
function updateMapOffsetZ(val){mapLayer.position.z=baseOXYGridHelper.position.z+val}
function updateMapOffsetY(val){mapLayer.position.y=baseOXYGridHelper.position.y+val}
function updateMapLayerDisplay(bScale){var newLoc;if(bScale){CUnitCluster.traverse(function(child){if(child instanceof CUnit){child.getMesh().position.z=-(child.getCellX()-yLowerBound)*(sizeZ/newSizeZ)-offsetZ;child.getMesh().position.y=(child.getTimeStep()-timeStepLowerBound)*(sizeY/newSizeY)-offsetY;child.getMesh().position.x=(child.getCellY()-xLowerBound)*(sizeX/newSizeX)-offsetX;child.update();if(child.getCellX()==yLowerBound){newLngMin=child.getLongitude()}
    if(child.getCellX()==yUpperBound){newLngMax=child.getLongitude()}
    if(child.getCellY()==xLowerBound){newLatMin=child.getLatitude()}
    if(child.getCellY()==xUpperBound){newLatMax=child.getLatitude()}}});newLoc=encodeURIComponent(`${newLngMin},${newLatMin},${newLngMax},${newLatMax}`)}
else{newLoc=encodeURIComponent(`${LNG_MIN},${LAT_MIN},${LNG_MAX},${LAT_MAX}`);resetScene()}
    console.log(decodeURIComponent(newLoc));var url=("http://www.openstreetmap.org/export/embed.html?bbox=LOCATION&amp;layers=MAPTYPE").replace("LOCATION",newLoc).replace("MAPTYPE",maptype);document.getElementById("OSMLayer").setAttribute("src",url)}
function updateMapLayerType(val){}