define([
	"dojo/Evented",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"js/config",
	"esri/graphic",
	"esri/map",
	"esri/layers/ArcGISDynamicMapServiceLayer",
	"esri/layers/ArcGISTiledMapServiceLayer",
	"esri/layers/VectorTileLayer",
	"esri/geometry/Extent",
	"esri/tasks/GeometryService",
	"esri/tasks/ProjectParameters",
	"esri/SpatialReference",
	"esri/graphic",
	"esri/symbols/SimpleMarkerSymbol"
], function(Evented,declare,on,lang,config,Graphic,Map,ArcGISDynamicMapServiceLayer,
	ArcGISTiledMapServiceLayer,
	VectorTileLayer,
	Extent,
	GeometryService,
	ProjectParameters,
	SpatialReference,
	Graphic,
	SimpleMarkerSymbol){
    return declare([Evented], {
		constructor: function(entity,data,user){
			this.user = user;
            this.entity = entity;
            this.data = data;
		},
		
		add: function(){
			return new Promise(lang.hitch(this,function(resolve, reject){
				//resolve();
				//return;
				var formData = new FormData(/*this.data.attachment.formElement*/);
				formData.append('file', this.data.attachment.file);
				var mapPoint = this.data.feature.geometry;
				$.ajax({
				    url: "thingsplay.ashx",
					type: "POST",
					headers: {
						'Device-ID':this.data.barCode.code,
						'Device-Loc':mapPoint.x.toString().replace(".",",")+";"+mapPoint.y.toString().replace(".",",")
					},
					data: formData,
					processData: false,
					contentType: false,
					success: function (res) {
						resolve();
					},
					error:function(error){
						reject(error);
					}
				});
				
			}));
		}
    });
});