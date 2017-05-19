/**
 * Created by Minh Hoang DANG on 05/05/2017.
 */

var size = 300, step = 50, newSize = size;
var processedData, dataAmount;
var fileName = 'gistar_output_b.json';

var TIME_STEP_LOWER_BOUND, TIME_STEP_UPPER_BOUND, ZSCORE_LOWER_BOUND, ZSCORE_UPPER_BOUND, ZSCORE_SCALE, X_LOWER_BOUND, X_UPPER_BOUND, Y_LOWER_BOUND, Y_UPPER_BOUND;
var timeStepLowerBound, timeStepUpperBound, zScoreLowerBound, zScoreUpperBound;
var axisXScale, axisYScale, axisZScale;
var X_SCALE, Y_SCALE, Z_SCALE;

var CSVLoader = new THREE.FileLoader();
CSVLoader.setResponseType('text');
CSVLoader.load(`./data/${fileName}`, function ( text ) {
    processedData = JSON.parse(text);
    dataAmount = processedData.length;

    // Sorting algorithm
    TIME_STEP_LOWER_BOUND = (processedData[0])['time_step'], TIME_STEP_UPPER_BOUND = (processedData[processedData.length - 1])['time_step'];
    ZSCORE_LOWER_BOUND = (processedData[0])['zscore'], ZSCORE_UPPER_BOUND = (processedData[processedData.length - 1])['zscore'];
    X_LOWER_BOUND = (processedData[0])['cell_x'], X_UPPER_BOUND = (processedData[processedData.length - 1])['cell_x'];
    Y_LOWER_BOUND = (processedData[0])['cell_y'], Y_UPPER_BOUND = (processedData[processedData.length - 1])['cell_y'];

    for(var entry of processedData){
        if(entry['time_step'] < TIME_STEP_LOWER_BOUND)
            TIME_STEP_LOWER_BOUND = entry["time_step"];
        if(entry["time_step"] > TIME_STEP_LOWER_BOUND)
            TIME_STEP_UPPER_BOUND = entry["time_step"];

        if(entry["zscore"] < ZSCORE_LOWER_BOUND)
            ZSCORE_LOWER_BOUND = entry["zscore"];
        if(entry["zscore"] > ZSCORE_UPPER_BOUND)
            ZSCORE_UPPER_BOUND = entry["zscore"];

        if(entry["cell_x"] < X_LOWER_BOUND)
            X_LOWER_BOUND = entry["cell_x"];
        if(entry["cell_x"] > X_UPPER_BOUND)
            X_UPPER_BOUND = entry["cell_x"];

        if(entry["cell_y"] < Y_LOWER_BOUND)
            Y_LOWER_BOUND = entry["cell_y"];
        if(entry["cell_y"] > Y_UPPER_BOUND)
            X_UPPER_BOUND = entry["cell_y"];
    }

    console.log(`Time_step: ${TIME_STEP_LOWER_BOUND} - ${TIME_STEP_UPPER_BOUND}`);
    console.log(`zScore: ${ZSCORE_LOWER_BOUND} - ${ZSCORE_UPPER_BOUND}`);
    console.log(`cell_x: ${X_LOWER_BOUND} - ${X_UPPER_BOUND}`);
    console.log(`cell_y: ${Y_LOWER_BOUND} - ${Y_UPPER_BOUND}`);

    timeStepLowerBound = TIME_STEP_LOWER_BOUND; timeStepUpperBound = TIME_STEP_UPPER_BOUND;
    zScoreLowerBound = ZSCORE_LOWER_BOUND; zScoreUpperBound = ZSCORE_UPPER_BOUND;

    X_SCALE = X_UPPER_BOUND - X_LOWER_BOUND;
    Y_SCALE = TIME_STEP_UPPER_BOUND - TIME_STEP_LOWER_BOUND;
    Z_SCALE = Y_UPPER_BOUND - Y_LOWER_BOUND;

    axisXScale = (X_SCALE > size) ? size/(X_SCALE + 1) : 1;
    axisYScale = (Y_SCALE > size) ? size/(Y_SCALE + 1) : (Y_SCALE + 1)/size;
    axisZScale = (Z_SCALE > size) ? size/(Z_SCALE + 1) : 1;

    ZSCORE_SCALE = ZSCORE_UPPER_BOUND - ZSCORE_LOWER_BOUND;

    console.log(`X Scale: ${axisXScale} | ${X_SCALE}`);
    console.log(`Z Scale: ${axisZScale} | ${Z_SCALE}`);
    console.log(`Y Scale: ${axisYScale} | ${Y_SCALE}`);

});

var stats, camera, camera1, controls, renderer1, renderer2;
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

var mapMesh, mapMat;
var dimension = size/step;

var svgCanvas, svgContext;

var extrudeLayer = -1, mustExtrude = false, mustScale = false;

var sizeX = 235, sizeY = size, sizeZ = 237;

var baseOXYGridHelper = new THREE.GridHelper(size, step);
baseOXYGridHelper.position.z = (size - sizeZ)/2;
baseOXYGridHelper.position.x = -(size - sizeX)/2;
baseOXYGridHelper.position.y = -size/2;
baseOXYGridHelper.scale.x = (sizeX/size);
baseOXYGridHelper.scale.z = (sizeZ/size);
baseOXYGridHelper.renderOrder = 1;

var baseOYZGridHelper = new THREE.GridHelper(size, step);
baseOYZGridHelper.rotation.z = (Math.PI/2);
baseOYZGridHelper.rotation.y = (Math.PI/2);
baseOYZGridHelper.position.x = baseOXYGridHelper.position.x;
baseOYZGridHelper.position.z = baseOXYGridHelper.position.z + size/2 - (size - sizeZ)/2;
baseOYZGridHelper.position.y = baseOXYGridHelper.position.y + size/2;
baseOYZGridHelper.scale.z = (sizeX/size);
baseOYZGridHelper.renderOrder = 1;

var baseOXZGridHelper = new THREE.GridHelper(size, step);
baseOXZGridHelper.rotation.z = (Math.PI/2);
baseOXZGridHelper.position.x = baseOXYGridHelper.position.x -size/2 + (size - sizeX)/2;
baseOXZGridHelper.position.z = baseOXYGridHelper.position.z;
baseOXZGridHelper.position.y = baseOXYGridHelper.position.y + size/2;
baseOXZGridHelper.scale.z = (sizeX/size);
baseOXZGridHelper.renderOrder = 1;

var GEO_PRISM = new THREE.CylinderGeometry( dimension, dimension, dimension, 6, 4 );
var GEO_CUBE = new THREE.BoxGeometry( dimension, dimension, dimension);
var BRUSH_SIZE = size/step;

var CAMERA_SPAWN = new THREE.Vector3(size, size, size);

var LABEL_ORIGIN_SPAWN = new THREE.Vector3( baseOXYGridHelper.position.x - (size - sizeX/2), baseOXYGridHelper.position.y, baseOXYGridHelper.position.z + (size - sizeZ/2));
var LABEL_TIME_SPAWN = new THREE.Vector3( baseOXZGridHelper.position.x, baseOXZGridHelper.position.y + (size - sizeY/2), baseOXZGridHelper.position.z + (size - sizeZ/2) );
var LABEL_LNG_SPAWN = new THREE.Vector3( baseOXYGridHelper.position.x - (size - sizeX/2), baseOXYGridHelper.position.y - size*0.1, - baseOXYGridHelper.position.z - (size - sizeZ/2) );
var LABEL_LAT_SPAWN = new THREE.Vector3( baseOXYGridHelper.position.x + (size - sizeX/2), baseOXYGridHelper.position.y - size*0.1, baseOXYGridHelper.position.z + (size - sizeZ/2) );

var labelOrigin, labelT, labelLng, labelLat;

var iframe= '<iframe width="600" height="450" frameborder="0"' +
    ' style="border:0" src="https://www.google.com/maps/embed/' +
    'v1/view?zoom=10&maptype=satellite&center=LOCATION' +
    '&key=AIzaSyAVUZTKZz1e6hbEwZOT8CmWfoMhegHL7bs"></iframe>';
var loc = "52.3702%2C4.8952";

var sides = [];