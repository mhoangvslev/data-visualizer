/* eslint-disable padded-blocks */

/**
 * Created by Minh Hoang DANG on 08/05/2017.
 */
$(document).ready(function() {

	// Add drag and resize option to panel
	$("#toolbox-tools").draggable({
		handle: ".panel-heading"
	}).resizable({
		handles: "e, w, s, se"
	});

    $('#dynamic_map').click(function () {
        updateDynamicMapFilter(this.checked);
    });

    $('#map_interactive').click(function () {
        updateInteractiveMapFilter(this.checked);
    });

	$('#time_step_scale').click(function () {
		mustScale = this.checked;
        updateSceneFilters();
        updateMapLayerDisplay(mustScale);
    });

	// Dropdown
    $('#map_type').change(function () {
        updateMapLayerType($(this).find(':selected').val());
    });

    /*$('#map_markers').click(function () {
        mapoption.replace("N", '');
        if(this.checked) {
            mapoption += 'N';
            maptype += mapoption;
        }
        updateMapLayerDisplay(mustScale);
    });

    $('#map_data').click(function () {
        mapoption.replace("D", '');
        if(this.checked) {
            mapoption += 'D';
            maptype += mapoption;
        }
        updateMapLayerDisplay(mustScale);
    });

    $('#map_gps_trace').click(function () {
        mapoption.replace("G", '');
        if(this.checked) {
            mapoption += 'G';
            maptype += mapoption;
        }
        updateMapLayerDisplay(mustScale);
    });*/

    //Sliders
	$( "#time_step_int" ).slider({
		range: true,
		min: TIME_STEP_LOWER_BOUND,
		max: TIME_STEP_UPPER_BOUND,
		values: [ TIME_STEP_LOWER_BOUND, TIME_STEP_UPPER_BOUND ],
		slide: function( event, ui ) {
			timeStepLowerBound = ui.values[0]; timeStepUpperBound = ui.values[1];
            updateSceneFilters();
			$('#time_step_int_value').text(ui.values[0] + " - " + ui.values[1]);
			newSizeY = Math.abs(ui.values[1] - ui.values[0]); offsetNY = ui.values[0];
			$('#one_layer_extrusion').prop('checked', false); mustExtrude = false; extrudeLayer = -1;
			updateMapLayerDisplay(mustScale);
			updateSceneFilters();
		}
	});

    $( "#cell_x_int" ).slider({
        range: true,
        min: X_LOWER_BOUND,
        max: X_UPPER_BOUND,
        values: [ X_LOWER_BOUND, X_UPPER_BOUND ],
        slide: function( event, ui ) {
            xLowerBound = ui.values[0]; xUpperBound = ui.values[1];
            $('#cell_x_int_value').text(ui.values[0] + " - " + ui.values[1]);
            newSizeZ = Math.abs(ui.values[1] - ui.values[0]); offsetNX = ui.values[0];
            updateMapLayerDisplay(mustScale);
            updateSceneFilters();
        }
    });

    $( "#cell_y_int" ).slider({
        range: true,
        min: X_LOWER_BOUND,
        max: X_UPPER_BOUND,
        values: [ X_LOWER_BOUND, X_UPPER_BOUND ],
        slide: function( event, ui ) {
            yLowerBound = ui.values[0]; yUpperBound = ui.values[1];
            $('#cell_y_int_value').text(ui.values[0] + " - " + ui.values[1]);
            newSizeX = Math.abs(ui.values[1] - ui.values[0]); offsetNZ = ui.values[0];
            updateMapLayerDisplay(mustScale);
            updateSceneFilters();
        }
    });

    $( "#zscore_int" ).slider({
        range: true,
        min: ZSCORE_LOWER_BOUND * 1000,
        max: ZSCORE_UPPER_BOUND * 1000,
        values: [ ZSCORE_LOWER_BOUND*1000, ZSCORE_UPPER_BOUND*1000 ],
        slide: function( event, ui ) {
            zScoreLowerBound = ui.values[0]/1000;
            zScoreUpperBound = ui.values[1]/1000
            $('#zscore_int_value').text(zScoreLowerBound + " - " + zScoreUpperBound);
            updateSceneFilters();
        }
    });

	$( "#brush_size" ).slider({
		min: 1,
		max: 5,
		create: function() {
            $( "#brush_size_handle" ).text( $( this ).slider( "value" ) );
		},
		slide: function( event, ui ) {
			BRUSH_SIZE = ui.value;
            $( "#brush_size_handle" ).text( BRUSH_SIZE );
			updateBrushSizeFilter();
		}
	});

    $('#one_layer_extrusion').click(function () {
        mustExtrude = this.checked;
        updateOneLayerFilter();
        updateBrushSizeFilter();
    });

    $( "#one_layer" ).slider({
        min: TIME_STEP_LOWER_BOUND,
        max: TIME_STEP_UPPER_BOUND,
        create: function() {
            $( "#one_layer_handle" ).text( $( this ).slider( "value" ) );
        },
        slide: function( event, ui ) {
            $( "#one_layer_handle" ).text( ui.value );
            extrudeLayer = ui.value;
            newSizeY = 1; offsetNY = ui.value;
            //updateSceneFilters();
            updateOneLayerFilter();
        }
    });

    $( "#map_opacity" ).slider({
        min: 1,
        max: 10,
        create: function() {
            $( "#map_opacity_handle" ).text( $( this ).slider( "value" ) );
        },
        slide: function( event, ui ) {
            $( "#map_opacity_handle" ).text( ui.value/10 );
            updateMapAlphaFilter(ui.value/10);
        }
    });

    $( "#map_offset_x" ).slider({
        min: -200,
        max: sizeLng,
        create: function() {
            $( "#map_offset_x_handle" ).text( $( this ).slider( "value" ) );
        },
        slide: function( event, ui ) {
            $( "#map_offset_x_handle" ).text( ui.value);
            updateMapOffsetX(ui.value);
        }
    });

    $( "#map_offset_y" ).slider({
        min: -200,
        max: sizeTime,
        create: function() {
            $( "#map_offset_y_handle" ).text( $( this ).slider( "value" ) );
        },
        slide: function( event, ui ) {
            $( "#map_offset_y_handle" ).text( ui.value);
            updateMapOffsetY(ui.value);
        }
    });

    $( "#map_offset_z" ).slider({
        min: -200,
        max: sizeLat,
        create: function() {
            $( "#map_offset_z_handle" ).text( $( this ).slider( "value" ) );
        },
        slide: function( event, ui ) {
            $( "#map_offset_z_handle" ).text( ui.value);
            updateMapOffsetZ(ui.value);
        }
    });

    $( "#map_display" ).slider({
        min: 0,
        max: 10,
        create: function() {
            $( "#map_display_handle" ).text( $( this ).slider( "value" ) );
        },
        slide: function( event, ui ) {
            $( "#map_display_handle" ).text( ui.value/10 );
            updateMapAlphaFilter(ui.value/10);
        }
    });

	$( "#camera_fov" ).slider({
		min: 50,
		max: 100,
		value: 90,
		create: function() {
            $('#camera_fov_handle').text( $( this ).slider( "value" ) );
		},
		slide: function( event, ui ) {
            $('#camera_fov_handle').text( ui.value );
			updateCameraFOVFilter(ui.value);
		}
	});

	$( "#zoom_speed" ).slider({
		min: 1,
		max: 10,
		create: function() {
            $('#zoom_speed_handle').text( $( this ).slider( "value" ) );
		},
		slide: function( event, ui ) {
            $('#zoom_speed_handle').text( ui.value );
			updateZoomSpeedFilter(ui.value);
		}
	});

    $( "#map_scale_x" ).slider({
        min: 1,
        max: 1000,
        create: function() {
            $('#map_scale_x_handle').text( $( this ).slider( "value" ) );
        },
        slide: function( event, ui ) {
            $('#map_scale_x_handle').text( ui.value/100 );
            updateMapScaleXFilter(ui.value/100);
        }
    });

    $( "#map_scale_y" ).slider({
        min: 1,
        max: 1000,
        create: function() {
            $('#map_scale_y_handle').text( $( this ).slider( "value" ) );
        },
        slide: function( event, ui ) {
            $('#map_scale_y_handle').text( ui.value/100 );
            updateMapScaleYFilter(ui.value/100);
        }
    });

	// Expand and collaps the toolbar
	$("#toggle-toolbox-tools").on("click", function() {
		var panel = $("#toolbox-tools");

		if ($(panel).data("org-height") == undefined) {
			$(panel).data("org-height", $(panel).css("height"));
			$(panel).css("height","41px");
		} else {
			$(panel).css("height", $(panel).data("org-height"));
			$(panel).removeData("org-height");
		}

		$(this).toggleClass('fa-chevron-down').toggleClass('fa-chevron-right');
	});


	// Make toolbar groups sortable
	$( "#sortable" ).sortable({
		stop: function (event, ui) {
			var ids = [];
			$.each($(".draggable-group"), function(idx, grp) {
				ids.push($(grp).attr("id"));
			});

			// Save order of groups in cookie
			//$.cookie("group_order", ids.join());
		}
	});
	$( "#sortable" ).disableSelection();


	// Make Tools panel group minimizable
	$.each($(".draggable-group"), function(idx, grp) {
		var tb = $(grp).find(".toggle-button-group");

		$(tb).on("click", function() {
			$(grp).toggleClass("minimized");
			$(this).toggleClass("fa-caret-down").toggleClass("fa-caret-up");

			// Save draggable groups to cookie (frue = Minimized, false = Not Minimized)
			var ids = [];
			$.each($(".draggable-group"), function(iidx, igrp) {
				var itb = $(igrp).find(".toggle-button-group");
				var min = $(igrp).hasClass("minimized");

				ids.push($(igrp).attr("id") + "=" + min);
			});

			$.cookie("group_order", ids.join());
		});
	});


	// Close thr panel
	$(".close-panel").on("click", function() {
		$(this).parent().parent().hide();
	});


	// Add Tooltips
	$('button').tooltip();
	$('.toggle-button-group').tooltip();


});

let cleanMap = function () {
	var elem = document.getElementById("OSMLayer")/*.contentWindow.document*/;
	//console.log(elem);
};
