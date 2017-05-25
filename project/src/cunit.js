/* eslint-disable space-in-parens,padded-blocks,space-before-function-paren,space-before-function-paren,semi,space-before-blocks */
/**
 * Created by Minh Hoang DANG on 04/19/2017.
 */
function CUnit(dimension, latitude, longitude, time_step, zscore, pvalue) {
	THREE.Object3D.call( this );

    // Operations
    this.getColorPerWeight = function(zscore){
        if(zscore < -2.58)
            return new THREE.Color(0x3366cc);
        else if(zscore >= -2.58 && zscore < -1.96)
            return new THREE.Color(0x9999cc);
        else if(zscore >= -1.96 && zscore < -1.65)
            return new THREE.Color(0xc0c0c0);
        else if(zscore >= -1.65 && zscore < 1.65)
            return new THREE.Color(0xffffcc);
        else if(zscore >= 1.65 && zscore < 1.96)
            return new THREE.Color(0xffcc99);
        else if(zscore >= 1.96 && zscore < 2.58)
            return new THREE.Color(0xff6666);
        else
            return new THREE.Color(0xcc3333);
    };

	// Attributes
	this.type = 'CUnit';
    this.color = this.getColorPerWeight(zscore);
	this.opacity = 1;
	this.geometry = GEO_CUBE;
	this.cell_x = latitude; this.cell_y = longitude; this.time_step = time_step, this.zscore = zscore; this.dimension = dimension;

	this.mesh = new THREE.Mesh(this.geometry, new THREE.MeshPhongMaterial({
        color: this.color,
        transparent: true,
        opacity: this.opacity,
    }));
    this.mesh.name = `Longitude: ${longitude} | Latitude: ${latitude} | Time step: ${time_step} | ZScore: ${zscore} | PValue: ${pvalue}`;
    this.mesh.position.x = this.cell_x - offsetX;
    this.mesh.position.z = -this.cell_y - offsetZ;
    this.mesh.position.y = this.time_step - offsetY;
	this.mesh.renderOrder = 2;
	this.latitude = this.calcLatitude();
	this.longitude = this.calcLongitude();
}

CUnit.prototype = Object.create( THREE.Mesh.prototype );
CUnit.prototype.constructor = CUnit;

CUnit.prototype.getMesh = function() {
	return this.mesh;
};

CUnit.prototype.changeGeometry = function(newGeo){
  this.mesh.geometry = newGeo;
};

CUnit.prototype.reinitiate = function () {
    this.mesh.material = new THREE.MeshPhongMaterial({
        color: this.getColorPerWeight(this.zscore),
        transparent: true,
        opacity: this.opacity
    });

    /*this.mesh.position.x = (this.cell_x - X_LOWER_BOUND)*size/X_SCALE - offsetX;
    this.mesh.position.z = -(this.cell_y - Y_LOWER_BOUND)*size/Z_SCALE - offsetZ;
    this.mesh.position.y = (this.time_step - TIME_STEP_LOWER_BOUND)*size/Y_SCALE - offsetY;*/
    this.mesh.position.x = this.cell_x - offsetX;
    this.mesh.position.z = -this.cell_y - offsetZ;
    this.mesh.position.y = this.time_step - offsetY;

    //this.setCunitSize(1, 1, 1);
};

/*CUnit.prototype.setOpacity = function (value) {
    this.mesh.material = new THREE.MeshPhongMaterial({
        color: this.color,
        transparent: true,
        opacity: value
    });
};*/

CUnit.prototype.setCunitSize = function (x, y, z) {
    this.mesh.scale.set(x, y, z) ;

    // Recalculate the offset
    offsetZ = -size/2 + this.mesh.scale.z*this.dimension/2;
    offsetX = size/2 - this.mesh.scale.x*this.dimension/2;
    offsetY = size/2 - this.mesh.scale.y*this.dimension/2;

    // Recalculate the position
    this.mesh.position.x = this.cell_x - offsetX;
    this.mesh.position.z = -this.cell_y - offsetZ;
    this.mesh.position.y = this.time_step - offsetY;
};

CUnit.prototype.getCellY = function () {
    return this.cell_y;
};

CUnit.prototype.getCellX = function () {
    return this.cell_x;
};

CUnit.prototype.getTimeStep = function () {
    return this.time_step;
};

CUnit.prototype.getZScore = function () {
    return this.zscore;
};

CUnit.prototype.getDimension = function () {
    return this.dimension;
};

CUnit.prototype.getScalePerWeight = function () {
    return (this.zscore - ZSCORE_LOWER_BOUND)*sizeY*0.1/ZSCORE_SCALE;
};

CUnit.prototype.calcLatitude = function () {
    return Math.asin(THREE.Math.degToRad(LAT_MIN) * Math.cos(200*this.cell_x*0.001/6371) + Math.cos(THREE.Math.degToRad(LAT_MIN)) * Math.sin(200*this.cell_x*0.001/6371) * Math.cos(Math.PI/2));
};

CUnit.prototype.calcLongitude = function () {
    return THREE.Math.degToRad(LNG_MIN) + Math.atan2(Math.sin(Math.PI/2) * Math.sin(200*this.cell_x*0.001/6371) * Math.cos(THREE.Math.degToRad(LAT_MIN)), Math.cos(200*this.cell_x*0.001/6371) - Math.sin(THREE.Math.degToRad(LAT_MIN))*Math.sin(this.latitude) )
};

CUnit.prototype.getLongitude = function () {
    return THREE.Math.radToDeg(this.longitude);
};

CUnit.prototype.getLatitude = function () {
    return THREE.Math.radToDeg(this.latitude);
};

