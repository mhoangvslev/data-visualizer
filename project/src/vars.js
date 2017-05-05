/**
 * Created by Minh Hoang DANG on 05/05/2017.
 */
var stats;
var params = {
    time_step: 0,
    cunit_size: 1,
    weight: 0,
    camera_fov: 90
};

var size = 100, step = 20;

var camera, controls, renderer;

var scene = new THREE.Scene();
var raycaster = new THREE.Raycaster();

var mouse = new THREE.Vector2(), INTERSECTED;
var CUnitCluster = new THREE.Object3D();
//var tooltipContext, tooltipTex, spriteToolTip;
var zoomAmount = 1;
var isLMB = false, isRMB = false;

var offsetZ = -size/2 + size/step/2;
var offsetX = size/2 - size/step/2;
var offsetY = size/2 - size/step/2;