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
            return new THREE.Color(`rgb(255, ${zcolor}, 0)`);
        }
        else if( zscore < 3.96 && zscore > 3.94) {
            return new THREE.Color(`rgb(0, 255, ${zcolor})`);
        }
        return new THREE.Color(`rgb(${zcolor}, 0, 255)`);
    };

	// Attributes
	this.type = 'CUnit';
	this.color = this.getColorPerWeight(zscore);
	this.opacity = this.getOpacityPerWeight(zscore);
	this.geometry = new THREE.BoxGeometry( dimension, dimension, dimension);
	this.latitude = latitude; this.longitude = longitude; this.time_step = time_step, this.zscore = zscore; this.dimension = dimension;

	this.mesh = new THREE.Mesh(this.geometry, new THREE.MeshPhongMaterial({
        color: this.color,
        transparent: true,
        opacity: this.opacity
    }));
	this.mesh.name = `lng: ${longitude}, lat: ${latitude}, t: ${time_step}, w: ${zscore}`;
	this.mesh.position.x = longitude;
	this.mesh.position.z = - latitude;
	this.mesh.position.y = time_step;
}

CUnit.prototype = Object.create( THREE.Mesh.prototype );
CUnit.prototype.constructor = CUnit;

CUnit.prototype.getMesh = function() {
	return this.mesh;
}

CUnit.prototype.reinitiate = function () {
    this.mesh.material = new THREE.MeshPhongMaterial({
        color: this.getColorPerWeight(this.zscore),
        transparent: true,
        opacity: this.getOpacityPerWeight(this.zscore)
    });
}

CUnit.prototype.setOpacity = function (value) {
    this.mesh.material = new THREE.MeshPhongMaterial({
        color: this.color,
        transparent: true,
        opacity: value
    });
}

CUnit.prototype.setCunitSize = function (value) {
    var newDim = this.dimension * value;
    this.mesh.geometry = new THREE.BoxGeometry(newDim, newDim, newDim);
}

CUnit.prototype.getLongitude = function () {
    return this.longitude;
}

CUnit.prototype.getLatitude = function () {
    return this.latitude;
}

CUnit.prototype.getTimeStep = function () {
    return this.time_step;
}

CUnit.prototype.getZScore = function () {
    return this.zscore;
}

CUnit.prototype.getDimension = function () {
    return this.dimension;
}


