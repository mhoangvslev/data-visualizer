/* eslint-disable space-in-parens,padded-blocks,space-before-function-paren,space-before-function-paren,semi,space-before-blocks */
/**
 * Created by Minh Hoang DANG on 04/19/2017.
 */
function CUnit(dimension, latitude, longitude, time_step, zscore, pvalue) {
	THREE.Object3D.call( this );

    // Operations
    this.getOpacityPerWeight = function(zscore){
        var result = (zscore - 3.9) * 10;
        //console.log(result);
        return result.toFixed(4);
    };

    this.getColorPerWeight = function(zscore){
        var zcolor;
        zcolor = Math.ceil((zscore - 3) * 100);
        if(zscore > 3.96) {
            return new THREE.Color(`rgb(${zcolor}, 0 , 0)`);
        }
        else if( zscore < 3.96 && zscore > 3.94) {
            return new THREE.Color(`rgb(${zcolor}, 0, ${zcolor})`);
        }
        return new THREE.Color(`rgb(0, 0, ${zcolor})`);
    };

	// Attributes
	this.type = 'CUnit';
	this.color = this.getColorPerWeight(zscore);
	this.opacity = this.getOpacityPerWeight(zscore);
	this.geometry = GEO_CUBE;
	this.latitude = latitude; this.longitude = longitude; this.time_step = time_step, this.zscore = zscore; this.dimension = dimension;

	this.mesh = new THREE.Mesh(this.geometry, new THREE.MeshPhongMaterial({
        color: this.color,
        transparent: true,
        opacity: this.opacity,
    }));
	//this.mesh.name = `lng: ${longitude}, lat: ${latitude}, t: ${time_step}, w: ${zscore}`;
	this.mesh.name = `Longitude: ${longitude} | Latitude: ${latitude} | Time step: ${time_step} | ZScore: ${zscore} | PValue: ${pvalue}`;
	this.mesh.position.x = longitude * axisLength - offsetX;
	this.mesh.position.z = - latitude * axisLength - offsetZ;
	this.mesh.position.y = time_step * axisLength - offsetY;
	this.mesh.renderOrder = 2;
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
        opacity: this.getOpacityPerWeight(this.zscore)
    });

    this.mesh.position.x = this.longitude * axisLength - offsetX;
    this.mesh.position.z = - this.latitude * axisLength - offsetZ;
    this.mesh.position.y = this.time_step * axisLength - offsetY;

    this.setCunitSize(BRUSH_SIZE, BRUSH_SIZE, BRUSH_SIZE);
};

CUnit.prototype.setOpacity = function (value) {
    this.mesh.material = new THREE.MeshPhongMaterial({
        color: this.color,
        transparent: true,
        opacity: value
    });
};

CUnit.prototype.setCunitSize = function (x, y, z) {
    this.mesh.scale.set(x, y, z) ;

    // Recalculate the offset
    offsetZ = -size/2 + this.mesh.scale.z*this.dimension/2;
    offsetX = size/2 - this.mesh.scale.x*this.dimension/2;
    offsetY = size/2 - this.mesh.scale.y*this.dimension/2;

    // Recalculate the position
    this.mesh.position.x = this.longitude * axisLength - offsetX;
    this.mesh.position.z = - this.latitude * axisLength - offsetZ;
    this.mesh.position.y = this.time_step * axisLength - offsetY;
};

CUnit.prototype.getLongitude = function () {
    return this.longitude;
};

CUnit.prototype.getLatitude = function () {
    return this.latitude;
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

CUnit.prototype.isOffGrid = function () {
    return (this.mesh.position.x > size || this.mesh.position.y > size || this.mesh.position.z > size);
};

CUnit.prototype.getScalePerWeight = function () {
    return Math.ceil((this.zscore - 3.9) * 1000)*(79/size);
};

