/**
 * Created by Minh Hoang DANG on 05/05/2017.
 */

var size = 300;
//var sizeLng = 237, sizeTime = size, sizeLat = 235;
var sizeLng = 311, sizeTime = size, sizeLat = 245;
var newSizeZ = sizeLng, newSizeY = sizeTime, newSizeX = sizeLat;
var step = 50;
var mapScaleOffsetX = sizeLng/237, mapScaleOffsetY = sizeLat/235;
var dataChunks = [], selectedChunk = 0;
var fileName = 'gistar_output_b';

// Beginning of time 1st January 2015, 0:00:00 (year, month, day, hour, minute, seconds)
var TIME_GENESIS = new Date(2015, 0, 1, 0, 0, 0);
console.log(TIME_GENESIS.toDateString());

var TIME_STEP_LOWER_BOUND, TIME_STEP_UPPER_BOUND, ZSCORE_LOWER_BOUND, ZSCORE_UPPER_BOUND, ZSCORE_SCALE, X_LOWER_BOUND, X_UPPER_BOUND, Y_LOWER_BOUND, Y_UPPER_BOUND;
var xLowerBound, xUpperBound, yLowerBound, yUpperBound, timeStepLowerBound, timeStepUpperBound, zScoreLowerBound, zScoreUpperBound;

var CSVLoader = new THREE.FileLoader();
CSVLoader.setResponseType('text');
CSVLoader.load(`./data/${fileName}.minified.json`, function (text) {
    var processedData = JSON.parse(text);

    // Sort data per time_step (ascending order)
    processedData.sort(function (a, b) {
        return a['time_step'] - b['time_step'];
    });


    // Separate processed data into chunks
    var chunkSize = 1000;
    for (var i=0, j = processedData.length; i < j; i += chunkSize) {
        var temparray = processedData.slice(i, i + chunkSize);
        dataChunks.push(temparray);
    }
    console.log(`${dataChunks.length} data chunks from ${processedData.length} data processed`);

    // Build control panel (script.js)
    rebuildUI();
});

var stats, camera, controls, WebGLRenderer, cssRenderer;
var WebGLScene = new THREE.Scene();
var cssScene = new THREE.Scene();
var raycaster = new THREE.Raycaster();

var mouse = new THREE.Vector2(), INTERSECTED;
var CUnitCluster = new THREE.Object3D();
//var tooltipContext, tooltipTex, spriteToolTip;
var zoomAmount = 1;
var zoomFactor = 5;
var isLMB = false, isRMB = false;

var dimensionX = sizeLat/newSizeX;
var dimensionY = sizeTime/newSizeY;
var dimensionZ = sizeLng/newSizeZ;

// Offset along axis X, Z, Y
var offsetZ = (-sizeLat + dimensionX)/2;
var offsetX = (sizeLng - dimensionZ)/2 ;
var offsetY = (sizeTime - dimensionY)/2;

var mapMesh, mapMat, mapLayer;

var extrudeLayer = -1, mustExtrude = false, mustScale = false;


// Base plane (O - Lat - Lng)
var baseOXYGridHelper = createDynamicGridHelper(sizeLat, sizeLng, newSizeX, newSizeZ);
baseOXYGridHelper.position.z = 0;
baseOXYGridHelper.position.x = 0;
baseOXYGridHelper.position.y = -sizeTime/2;


// Plane along Longitude axis (O - Time - Lng)
var baseOYZGridHelper = createDynamicGridHelper(sizeLng, sizeTime, newSizeZ, newSizeY);
baseOYZGridHelper.rotation.z = (Math.PI/2);
baseOYZGridHelper.rotation.y = (Math.PI/2);
baseOYZGridHelper.position.x = baseOXYGridHelper.position.x ;
baseOYZGridHelper.position.z = baseOXYGridHelper.position.z + sizeLat/2;
baseOYZGridHelper.position.y = baseOXYGridHelper.position.y + sizeTime/2;

// Plane along Latitude axis (O - Time - Lat)
var baseOXZGridHelper = createDynamicGridHelper(sizeLat, sizeTime, newSizeX, newSizeY);
baseOXZGridHelper.rotation.z = (Math.PI/2);
baseOXZGridHelper.position.x = baseOXYGridHelper.position.x - sizeLng/2;
baseOXZGridHelper.position.z = baseOXYGridHelper.position.z;
baseOXZGridHelper.position.y = baseOXYGridHelper.position.y + sizeTime/2;

var GEO_PRISM = new THREE.CylinderGeometry(dimensionX, dimensionZ, dimensionY, 6, 4);
var GEO_CUBE = new THREE.BoxGeometry(dimensionX, dimensionY, dimensionZ);
var BRUSH_SIZE = 1;

var CAMERA_SPAWN = new THREE.Vector3(size, size, size);

var LABEL_ORIGIN_SPAWN = new THREE.Vector3( baseOXYGridHelper.position.x - (size - sizeLng/2), baseOXYGridHelper.position.y, baseOXYGridHelper.position.z + (size - sizeLat/2));
var LABEL_TIME_SPAWN = new THREE.Vector3( baseOXZGridHelper.position.x, baseOXZGridHelper.position.y + (size - sizeTime/2), baseOXZGridHelper.position.z + (size - sizeLat/2) );
var LABEL_LAT_SPAWN = new THREE.Vector3( baseOXYGridHelper.position.x - (size - sizeLng/2), baseOXYGridHelper.position.y - size*0.1, - baseOXYGridHelper.position.z - (size - sizeLat/2) );
var LABEL_LNG_SPAWN = new THREE.Vector3( baseOXYGridHelper.position.x + (size - sizeLng/2), baseOXYGridHelper.position.y - size*0.1, baseOXYGridHelper.position.z + (size - sizeLat/2) );

var labelOrigin, labelT, labelLng, labelLat;

// Embed layer from OpenStreet Map

var zoom = 13;
var LNG_MIN = -74.25909, LNG_MAX = -73.70009, LAT_MIN = 40.477399, LAT_MAX = 40.917577;
var newLngMin = LNG_MIN, newLatMin = LAT_MIN, newLngMax = LNG_MAX, newLatMax = LAT_MAX;

var LENGTH_DEG_LAT = getDistanceBetweenCoordinates(LAT_MIN, LAT_MAX, LNG_MIN, LNG_MIN);
var LENGTH_DEG_LNG = getDistanceBetweenCoordinates(LAT_MIN, LAT_MIN, LNG_MIN, LNG_MAX);
var CELL_DISTANCE_LAT = LENGTH_DEG_LAT / sizeLat;
var CELL_DISTANCE_LNG = LENGTH_DEG_LNG / sizeLng;

console.log(CELL_DISTANCE_LAT);
console.log(CELL_DISTANCE_LNG);

var loc = encodeURIComponent(`${LNG_MIN},${LAT_MIN},${LNG_MAX},${LAT_MAX}`);

// A empty div is added in front of it to prevent users from interacting with the cube
var OSMFrame='<div id="outerOSM" style="opacity: 1"><div id="innerOSM">'+
    '<div id="OSMLayerBlocker" style="position:fixed;width:100%;height:100%;"></div>'+
    `<iframe id="OSMLayer" width="${661}px" height="${689}px" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" ` +
    `src="https://www.openstreetmap.org/export/embed.html?bbox=LOCATION&amp;layers=MAPTYPE" ` +
    'style="border: 1px solid black"></iframe>' +
    '</div></div>';

// Choose between roadmap, satellite, hybrid or terrain
var mapoption = '';
var maptype = 'mapnik' + mapoption;
var markers = encodeURIComponent(`${LAT_MIN},${LNG_MIN}`);
var sides = [];

// Camera types
var isInPerspectiveMode = true;

var combinedCamera = new THREE.CombinedCamera(window.innerWidth, window.innerHeight, 90, 1, 1000, -500, 1000);
combinedCamera.isPerspectiveCamera = true;
combinedCamera.isOrthographicCamera = false;
combinedCamera.position.copy(CAMERA_SPAWN);
combinedCamera.lookAt(new THREE.Vector3(sizeLng/2, sizeTime/2, sizeLat/2));

var perspectiveCamera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
perspectiveCamera.position.set( 500, 350, 750 );


