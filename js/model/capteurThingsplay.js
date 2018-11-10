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
	"esri/symbols/SimpleMarkerSymbol",
	"esri/config"
], function(Evented,declare,on,lang,config,Graphic,Map,ArcGISDynamicMapServiceLayer,
	ArcGISTiledMapServiceLayer,
	VectorTileLayer,
	Extent,
	GeometryService,
	ProjectParameters,
	SpatialReference,
	Graphic,
	SimpleMarkerSymbol,esriConfig){
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

				var mapPoint = this.data.feature.geometry;
				var geomSer = esriConfig.geometryService;
				var params = new ProjectParameters();
				params.geometries = [mapPoint];
				params.outSR  = new SpatialReference(4326);
				params.transformForward = true;
				params.transformation = {"wkid":1610};
				geomSer.project(params).then( lang.hitch(this,
					function(result){
						mapPoint = result[0];
						var formData = new FormData(/*this.data.attachment.formElement*/);
						formData.append('file', this.data.attachment.file);
						
						$.ajax({
							url: "http://ecms.ugr.be:8080/bewapp/add-details",
							type: "POST",
							headers: {
								'Device-ID':'000000000000001',//this.data.barCode.code,
								'Device-Loc':mapPoint.y.toString().replace(".",",")+";"+mapPoint.x.toString().replace(".",",")
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
					}),
					lang.hitch(this,function(error){reject(error);})
				);				
			}));
		}
    });
});