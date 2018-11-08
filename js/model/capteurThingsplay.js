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
				var capteurIdElement = document.createElement("input");
				capteurIdElement.type = "hidden";
				capteurIdElement.name = "capteurId";
				capteurIdElement.value = this.data.barCode.code;
				this.data.attachment.formElement.appendChild(capteurIdElement);
				var locationElement = document.createElement("input");
				locationElement.type = "hidden";
				locationElement.name = "location";
				locationElement.value = this.data.feature.geometry.x+";"+this.data.feature.geometry.y;
				this.data.attachment.formElement.appendChild(locationElement);
				var formData = new FormData(this.data.attachment.formElement);
				//formData.append('file', this.data.attachment.file);
				$.ajax({
				    url: "thingsplay.ashx",
					type: "POST",
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