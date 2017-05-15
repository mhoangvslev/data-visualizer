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

var fileName = 'gistar_output_c.json';
var size = 100, step = 50, newSize = size;
var processedData, dataAmount, axisLength = 10;
var CSVLoader = new THREE.FileLoader();
CSVLoader.setResponseType('text');
CSVLoader.load(`./data/${fileName}`, function ( text ) {
    processedData = JSON.parse(text);
    dataAmount = processedData.length;
});

var camera, controls, renderer;

var scene = new THREE.Scene();
var raycaster = new THREE.Raycaster();

var mouse = new THREE.Vector2(), INTERSECTED;
var CUnitCluster = new THREE.Object3D();
//var tooltipContext, tooltipTex, spriteToolTip;
var zoomAmount = 1;
var zoomFactor = 1;
var isLMB = false, isRMB = false;

var offsetZ = -size/2 + (size/step)/2;
var offsetX = size/2 - (size/step)/2;
var offsetY = size/2 - (size/step)/2;

var mapMesh;
var dimension = size/step;

var timeStepLowerBound = 0, timeStepUpperBound = axisLength;
var zScoreLowerBound = 3.920, zScoreUpperBound = 3.999;

var extrudeLayer = -1, mustExtrude = false;

var withWeightFilter = true, withTimeFilter = true, withOneLayer = false;

var baseOXYGridHelper = new THREE.GridHelper(size, step);
baseOXYGridHelper.position.z = 0;
baseOXYGridHelper.position.x = 0;
baseOXYGridHelper.position.y = -size/2;
baseOXYGridHelper.renderOrder = 1;

var baseOYZGridHelper = new THREE.GridHelper(size, step);
baseOYZGridHelper.rotation.z = (Math.PI/2);
baseOYZGridHelper.rotation.y = (Math.PI/2);
baseOYZGridHelper.position.x = baseOXYGridHelper.position.x;
baseOYZGridHelper.position.z = baseOXYGridHelper.position.z + size/2;
baseOYZGridHelper.position.y = baseOXYGridHelper.position.y + size/2;
baseOYZGridHelper.renderOrder = 1;

var baseOXZGridHelper = new THREE.GridHelper(size, step);
baseOXZGridHelper.rotation.z = (Math.PI/2);
baseOXZGridHelper.position.x = baseOXYGridHelper.position.x -size/2;
baseOXZGridHelper.position.z = baseOXYGridHelper.position.z;
baseOXZGridHelper.position.y = baseOXYGridHelper.position.y + size/2;
baseOXZGridHelper.renderOrder = 1;

var GEO_PRISM = new THREE.CylinderGeometry( dimension, dimension, dimension, 6, 4 );
var GEO_CUBE = new THREE.BoxGeometry( dimension, dimension, dimension);
var BRUSH_SIZE = size/step;

var CAMERA_SPAWN = new THREE.Vector3(100, 100, 100);

var LABEL_ORIGIN_SPAWN = new THREE.Vector3( baseOXYGridHelper.position.x - 50, baseOXYGridHelper.position.y - 10, baseOXYGridHelper.position.z + 50 );
var LABEL_TIME_SPAWN = new THREE.Vector3( baseOXZGridHelper.position.x, baseOXZGridHelper.position.y + 50, baseOXZGridHelper.position.z + 50 );
var LABEL_LNG_SPAWN = new THREE.Vector3( baseOXYGridHelper.position.x - 50, baseOXYGridHelper.position.y - 10, - baseOXYGridHelper.position.z - 75 );
var LABEL_LAT_SPAWN = new THREE.Vector3( baseOXYGridHelper.position.x + 75, baseOXYGridHelper.position.y - 10, baseOXYGridHelper.position.z + 50 );

var labelOrigin, labelT, labelLng, labelLat;