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

    //Sliders
    $( "#time_step_int" ).slider({
        range: true,
        min: 0,
        max: size,
        values: [ 0, size ],
        slide: function( event, ui ) {
            updateTimeStepFilter(ui.values[0], ui.values[1]);
            $('#time_step_int_value').text(ui.values[0] + " - " + ui.values[1]);
        }
    });

    var handle = $( "#brush_size_handle" );
    $( "#brush_size" ).slider({
        min: 0.5,
        max: 10,
        create: function() {
            handle.text( $( this ).slider( "value" ) );
        },
        slide: function( event, ui ) {
            handle.text( ui.value );
            updateBrushSizeFilter(ui.value);
        }
    });

    $( "#zscore_int" ).slider({
        range: true,
        min: 3920,
        max: 3999,
        values: [ 3920, 3999 ],
        slide: function( event, ui ) {
            updateWeightFilter(ui.values[0]/1000, ui.values[1]/1000);
            $('#zscore_int_value').text(ui.values[0]/1000 + " - " + ui.values[1]/1000);
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
