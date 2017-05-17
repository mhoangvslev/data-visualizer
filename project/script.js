/* eslint-disable padded-blocks */
let offsetN = 0;
let checkTimeStepScale = function (b) {
	if(b){
		var scale = size/newSize;
		updateTimeStepScale(newSize, offsetY + offsetN*scale);
		$('#time_step_unit').text(scale.toFixed(2) + ' unit(s)');
	}
	else{
		updateTimeStepScale(size, offsetY);
        $('#time_step_unit').text('1 unit');

    }
}
/**
 * Created by Minh Hoang DANG on 08/05/2017.
 */
$(document).ready(function() {
    // Include svg
    //$('#svgContainer').load("./data/nyc_location_map.svg");

	// Add drag and resize option to panel
	$("#toolbox-tools").draggable({
		handle: ".panel-heading"
	}).resizable({
		handles: "e, w, s, se"
	});

	$('#time_step_scale').click(function () {
		mustScale = this.checked;
		checkTimeStepScale(this.checked);
	});

	//Sliders
    $( "#texture_offset" ).slider({
        min: 1,
        max: 10,
        create: function() {
            $( "#texture_offset_handle" ).text( $( this ).slider( "value" ) );
        },
        slide: function( event, ui ) {
            $( "#texture_offset_handle" ).text( ui.value );
            updateTextureOffsetFilter(ui.value);
        }
    });

    $( "#texture_zoom" ).slider({
        min: 1,
        max: 10,
        create: function() {
            $( "#texture_zoom_handle" ).text( $( this ).slider( "value" ) );
        },
        slide: function( event, ui ) {
            $( "#texture_zoom_handle" ).text( ui.value );
            updateTextureScaleFilter(ui.value);
        }
    });

	$( "#time_step_int" ).slider({
		range: true,
		min: TIME_STEP_LOWER_BOUND,
		max: TIME_STEP_UPPER_BOUND,
		values: [ TIME_STEP_LOWER_BOUND, TIME_STEP_UPPER_BOUND ],
		slide: function( event, ui ) {
			timeStepLowerBound = ui.values[0]; timeStepUpperBound = ui.values[1];
            updateTimeStepFilter();
			$('#time_step_int_value').text(ui.values[0] + " - " + ui.values[1]);
			newSize = Math.abs(ui.values[1] - ui.values[0]); offsetN = ui.values[0];
			$('#one_layer_extrusion').prop('checked', false); mustExtrude = false; extrudeLayer = -1;
			checkTimeStepScale(mustScale);
		}
	});

	$( "#brush_size" ).slider({
		min: 1,
		max: 50,
		create: function() {
            $( "#brush_size_handle" ).text( $( this ).slider( "value" ) );
		},
		slide: function( event, ui ) {
			BRUSH_SIZE = ui.value/10;
            $( "#brush_size_handle" ).text( BRUSH_SIZE );
			updateBrushSizeFilter(BRUSH_SIZE);
		}
	});

    $('#one_layer_extrusion').click(function () {
        mustExtrude = this.checked;
        if(this.checked && extrudeLayer != -1) {
            updateOneLayerFilter();
            $('#time_step_scale').prop('checked', false);
        }
        else if(!this.checked)
        	resetScene();
    });

    $( "#one_layer" ).slider({
        min: TIME_STEP_LOWER_BOUND,
        max: TIME_STEP_UPPER_BOUND,
        create: function() {
            $( "#one_layer_handle" ).text( $( this ).slider( "value" ) );
        },
        slide: function( event, ui ) {
            $('#time_step_scale').prop('checked', false);
            $( "#one_layer_handle" ).text( ui.value );
            extrudeLayer = ui.value;
            newSize = 1; offsetN = ui.value;
            checkTimeStepScale(true);
            updateOneLayerFilter();
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

	$( "#zscore_int" ).slider({
		range: true,
		min: ZSCORE_LOWER_BOUND * 1000,
		max: ZSCORE_UPPER_BOUND * 1000,
		values: [ ZSCORE_LOWER_BOUND, ZSCORE_UPPER_BOUND ],
		slide: function( event, ui ) {
			zScoreLowerBound = ui.values[0]/1000;
			zScoreUpperBound = ui.values[1]/1000
			$('#zscore_int_value').text(zScoreLowerBound + " - " + zScoreUpperBound);
            updateWeightFilter();
        }
	});

	var handle = $( "#camera_fov_handle" );
	$( "#camera_fov" ).slider({
		min: 50,
		max: 100,
		value: 90,
		create: function() {
			handle.text( $( this ).slider( "value" ) );
		},
		slide: function( event, ui ) {
			handle.text( ui.value );
			updateCameraFOVFilter(ui.value);
		}
	});

	var handle = $( "#zoom_speed_handle" );
	$( "#zoom_speed" ).slider({
		min: 1,
		max: 10,
		create: function() {
			handle.text( $( this ).slider( "value" ) );
		},
		slide: function( event, ui ) {
			handle.text( ui.value );
			updateZoomSpeedFilter(ui.value);
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
