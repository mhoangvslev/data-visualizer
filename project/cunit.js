/* eslint-disable space-in-parens,padded-blocks,space-before-function-paren,space-before-function-paren,semi,space-before-blocks */
/**
 * Created by Minh Hoang DANG on 04/19/2017.
 */
function CUnit(dimension, latitude, longitude, time_step, zscore) {
	THREE.Object3D.call( this );
	this.type = 'CUnit';
	this.geometry = new THREE.BoxGeometry( dimension, dimension, dimension);
	this.getOpacityPerWeight = function(zscore){
        var result = (zscore - 3.9) * 10;
        console.log(result);
        return result;
	};

	this.getColorPerWeight = function(zscore){
        var zcolor;
        zcolor = Math.floor((zscore - 3) * 100);
        if(zscore > 3.96) {
            return new THREE.Color(`rgb(255, ${zcolor}, 0)`);
        }
        else if( zscore < 3.96 && zscore > 3.94) {
            return new THREE.Color(`rgb(0, 255, ${zcolor})`);
        }
        return new THREE.Color(`rgb(${zcolor}, 0, 255)`);
	};

	this.mesh = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({
        color: this.getColorPerWeight(zscore),
        transparent: true,
        opacity: this.getOpacityPerWeight(zscore)
    }));
	this.mesh.position.x = longitude;
	this.mesh.position.z = - latitude;
	this.mesh.position.y = time_step;
}

CUnit.prototype = Object.create( THREE.Mesh.prototype );
CUnit.prototype.constructor = CUnit;

CUnit.prototype.getMesh = function() {
	return this.mesh;
}


