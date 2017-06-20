var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.findInternal=function(a,b,c){a instanceof String&&(a=String(a));for(var d=a.length,e=0;e<d;e++){var f=a[e];if(b.call(c,f,e,a))return{i:e,v:f}}return{i:-1,v:void 0}};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)};
$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);$jscomp.polyfill=function(a,b,c,d){if(b){c=$jscomp.global;a=a.split(".");for(d=0;d<a.length-1;d++){var e=a[d];e in c||(c[e]={});c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&$jscomp.defineProperty(c,a,{configurable:!0,writable:!0,value:b})}};
$jscomp.polyfill("Array.prototype.find",function(a){return a?a:function(a,c){return $jscomp.findInternal(this,a,c).v}},"es6-impl","es3");$jscomp.SYMBOL_PREFIX="jscomp_symbol_";$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};$jscomp.symbolCounter_=0;$jscomp.Symbol=function(a){return $jscomp.SYMBOL_PREFIX+(a||"")+$jscomp.symbolCounter_++};
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var a=$jscomp.global.Symbol.iterator;a||(a=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));"function"!=typeof Array.prototype[a]&&$jscomp.defineProperty(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return $jscomp.arrayIterator(this)}});$jscomp.initSymbolIterator=function(){}};$jscomp.arrayIterator=function(a){var b=0;return $jscomp.iteratorPrototype(function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}})};
$jscomp.iteratorPrototype=function(a){$jscomp.initSymbolIterator();a={next:a};a[$jscomp.global.Symbol.iterator]=function(){return this};return a};$jscomp.iteratorFromArray=function(a,b){$jscomp.initSymbolIterator();a instanceof String&&(a+="");var c=0,d={next:function(){if(c<a.length){var e=c++;return{value:b(e,a[e]),done:!1}}d.next=function(){return{done:!0,value:void 0}};return d.next()}};d[Symbol.iterator]=function(){return d};return d};
$jscomp.polyfill("Array.prototype.values",function(a){return a?a:function(){return $jscomp.iteratorFromArray(this,function(a,c){return c})}},"es6","es3");
$(document).ready(function(){$("#toolbox-tools").draggable({handle:".panel-heading"}).resizable({handles:"e, w, s, se"});$("#dynamic_map").click(function(){updateDynamicMapFilter(this.checked)});$("#map_interactive").click(function(){updateInteractiveMapFilter(this.checked)});$("#time_step_scale").click(function(){mustScale=this.checked;updateSceneFilters();updateMapLayerDisplay(mustScale)});$("#map_type").change(function(){updateMapLayerType($(this).find(":selected").val())});$("#time_step_int").slider({range:!0,
min:TIME_STEP_LOWER_BOUND,max:TIME_STEP_UPPER_BOUND,values:[TIME_STEP_LOWER_BOUND,TIME_STEP_UPPER_BOUND],slide:function(a,b){timeStepLowerBound=b.values[0];timeStepUpperBound=b.values[1];updateSceneFilters();$("#time_step_int_value").text(getTimeStampFromStep(timeStepLowerBound).toLocaleString()+" ~ "+getTimeStampFromStep(timeStepUpperBound).toLocaleString());newSizeY=Math.abs(timeStepUpperBound-timeStepLowerBound);offsetNY=timeStepLowerBound;$("#one_layer_extrusion").prop("checked",!1);mustExtrude=
!1;extrudeLayer=-1;updateMapLayerDisplay(mustScale);updateSceneFilters()}});$("#cell_y_int").slider({range:!0,min:X_LOWER_BOUND,max:X_UPPER_BOUND,values:[X_LOWER_BOUND,X_UPPER_BOUND],slide:function(a,b){yLowerBound=b.values[0];yUpperBound=b.values[1];$("#cell_y_int_value").text(getLatitudeFromY(yLowerBound,!1).toFixed(4)+" ~ "+getLatitudeFromY(yUpperBound).toFixed(4));newSizeX=Math.abs(yUpperBound-yLowerBound);offsetNZ=yLowerBound;updateMapLayerDisplay(mustScale);updateSceneFilters()}});$("#cell_x_int").slider({range:!0,
min:X_LOWER_BOUND,max:X_UPPER_BOUND,values:[X_LOWER_BOUND,X_UPPER_BOUND],slide:function(a,b){xLowerBound=b.values[0];xUpperBound=b.values[1];$("#cell_x_int_value").text(getLongitudeFromX(xLowerBound,yLowerBound,!1).toFixed(4)+" ~ "+getLongitudeFromX(xUpperBound,yUpperBound,!1).toFixed(4));newSizeZ=Math.abs(xUpperBound-xLowerBound);offsetNX=xLowerBound;updateMapLayerDisplay(mustScale);updateSceneFilters()}});$("#zscore_int").slider({range:!0,min:1E3*ZSCORE_LOWER_BOUND,max:1E3*ZSCORE_UPPER_BOUND,values:[1E3*
ZSCORE_LOWER_BOUND,1E3*ZSCORE_UPPER_BOUND],slide:function(a,b){zScoreLowerBound=b.values[0]/1E3;zScoreUpperBound=b.values[1]/1E3;$("#zscore_int_value").text(zScoreLowerBound+" ~ "+zScoreUpperBound);updateSceneFilters()}});$("#brush_size").slider({min:1,max:5,create:function(){$("#brush_size_handle").text($(this).slider("value"))},slide:function(a,b){BRUSH_SIZE=b.value;$("#brush_size_handle").text(BRUSH_SIZE);updateBrushSizeFilter()}});$("#one_layer_extrusion").click(function(){mustExtrude=this.checked;
updateOneLayerFilter();updateBrushSizeFilter()});$("#one_layer").slider({min:TIME_STEP_LOWER_BOUND,max:TIME_STEP_UPPER_BOUND,slide:function(a,b){offsetNY=extrudeLayer=b.value;$("#one_layer_handle").text(getTimeStampFromStep(extrudeLayer).toLocaleString());updateOneLayerFilter()}});$("#map_opacity").slider({min:1,max:10,create:function(){$("#map_opacity_handle").text($(this).slider("value"))},slide:function(a,b){$("#map_opacity_handle").text(b.value/10);updateMapAlphaFilter(b.value/10)}});$("#map_offset_x").slider({min:-200,
max:sizeLng,create:function(){$("#map_offset_x_handle").text($(this).slider("value"))},slide:function(a,b){$("#map_offset_x_handle").text(b.value);updateMapOffsetX(b.value)}});$("#map_offset_y").slider({min:-200,max:sizeTime,create:function(){$("#map_offset_y_handle").text($(this).slider("value"))},slide:function(a,b){$("#map_offset_y_handle").text(b.value);updateMapOffsetY(b.value)}});$("#map_offset_z").slider({min:-200,max:sizeLat,create:function(){$("#map_offset_z_handle").text($(this).slider("value"))},
slide:function(a,b){$("#map_offset_z_handle").text(b.value);updateMapOffsetZ(b.value)}});$("#map_display").slider({min:0,max:10,create:function(){$("#map_display_handle").text($(this).slider("value"))},slide:function(a,b){$("#map_display_handle").text(b.value/10);updateMapAlphaFilter(b.value/10)}});$("#camera_fov").slider({min:50,max:100,value:90,create:function(){$("#camera_fov_handle").text($(this).slider("value"))},slide:function(a,b){$("#camera_fov_handle").text(b.value);updateCameraFOVFilter(b.value)}});
$("#zoom_speed").slider({min:1,max:10,create:function(){$("#zoom_speed_handle").text($(this).slider("value"))},slide:function(a,b){$("#zoom_speed_handle").text(b.value);updateZoomSpeedFilter(b.value)}});$("#map_scale_x").slider({min:1,max:1E3,create:function(){$("#map_scale_x_handle").text($(this).slider("value"))},slide:function(a,b){$("#map_scale_x_handle").text(b.value/100);updateMapScaleXFilter(b.value/100)}});$("#map_scale_y").slider({min:1,max:1E3,create:function(){$("#map_scale_y_handle").text($(this).slider("value"))},
slide:function(a,b){$("#map_scale_y_handle").text(b.value/100);updateMapScaleYFilter(b.value/100)}});$("#toggle-toolbox-tools").on("click",function(){var a=$("#toolbox-tools");void 0==$(a).data("org-height")?($(a).data("org-height",$(a).css("height")),$(a).css("height","41px")):($(a).css("height",$(a).data("org-height")),$(a).removeData("org-height"));$(this).toggleClass("fa-chevron-down").toggleClass("fa-chevron-right")});$("#sortable").sortable({stop:function(a,b){var c=[];$.each($(".draggable-group"),
function(a,b){c.push($(b).attr("id"))})}});$("#sortable").disableSelection();$.each($(".draggable-group"),function(a,b){a=$(b).find(".toggle-button-group");$(a).on("click",function(){$(b).toggleClass("minimized");$(this).toggleClass("fa-caret-down").toggleClass("fa-caret-up");var a=[];$.each($(".draggable-group"),function(b,c){$(c).find(".toggle-button-group");b=$(c).hasClass("minimized");a.push($(c).attr("id")+"="+b)});$.cookie("group_order",a.join())})});$(".close-panel").on("click",function(){$(this).parent().parent().hide()});
$("button").tooltip();$(".toggle-button-group").tooltip()});var cleanMap=function(){document.getElementById("OSMLayer")};
