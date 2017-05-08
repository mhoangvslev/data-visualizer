/**
 * Created by Minh Hoang DANG on 05/05/2017.
 */
var stats;
var params = {
    cube_size: 100,
    cube_step: 50,
    time_step: 0,
    cunit_size: 1,
    weight: 0,
    camera_fov: 90,
    zoom_factor: 1
};

var size = 100, step = 50;

var camera, controls, renderer;

var scene = new THREE.Scene();
var raycaster = new THREE.Raycaster();

var mouse = new THREE.Vector2(), INTERSECTED;
var CUnitCluster = new THREE.Object3D();
//var tooltipContext, tooltipTex, spriteToolTip;
var zoomAmount = 1;
var zoomFactor = 1;
var isLMB = false, isRMB = false;

var offsetZ = -size/2 + size/step/2;
var offsetX = size/2 - size/step/2;
var offsetY = size/2 - size/step/2;

var baseOXYGridHelper = new THREE.GridHelper(size, step);
baseOXYGridHelper.position.z = 0;
baseOXYGridHelper.position.x = 0;
baseOXYGridHelper.position.y = -size/2;
baseOXYGridHelper.renderOrder = 1;

var baseOYZGridHelper = new THREE.GridHelper(size, step);
baseOYZGridHelper.rotation.z = (Math.PI/2);
baseOYZGridHelper.rotation.y = (Math.PI/2);
baseOYZGridHelper.position.x = baseOXYGridHelper.position.x;
baseOYZGridHelper.position.z = baseOXYGridHelper.position.z - size/2;
baseOYZGridHelper.position.y = baseOXYGridHelper.position.y + size/2;
baseOYZGridHelper.renderOrder = 1;

var baseOXZGridHelper = new THREE.GridHelper(size, step);
baseOXZGridHelper.rotation.z = (Math.PI/2);
baseOXZGridHelper.position.x = baseOXYGridHelper.position.x -size/2;
baseOXZGridHelper.position.z = baseOXYGridHelper.position.z;
baseOXZGridHelper.position.y = baseOXYGridHelper.position.y + size/2;
baseOXZGridHelper.renderOrder = 1;

var CAMERA_SPAWN = new THREE.Vector3(100, 100, 100);

var LABEL_ORIGIN_SPAWN = new THREE.Vector3( baseOXYGridHelper.position.x - 50, baseOXYGridHelper.position.y - 10, baseOXYGridHelper.position.z + 50 );
var LABEL_TIME_SPAWN = new THREE.Vector3( baseOXZGridHelper.position.x, baseOXZGridHelper.position.y + 50, baseOXZGridHelper.position.z + 50 );
var LABEL_LNG_SPAWN = new THREE.Vector3( baseOXYGridHelper.position.x - 50, baseOXYGridHelper.position.y - 10, - baseOXYGridHelper.position.z - 75 );
var LABEL_LAT_SPAWN = new THREE.Vector3( baseOXYGridHelper.position.x + 75, baseOXYGridHelper.position.y - 10, baseOXYGridHelper.position.z + 50 );

var labelOrigin, labelT, labelLng, labelLat;