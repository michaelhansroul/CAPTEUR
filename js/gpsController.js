define([
	"dojo/Evented",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"esri/map",
	"esri/geometry/Extent",
	"esri/tasks/GeometryService",
	"esri/tasks/ProjectParameters",
	"esri/SpatialReference",
	"esri/geometry/webMercatorUtils",
	"esri/geometry/Point",
	"esri/graphic",
	"esri/symbols/SimpleMarkerSymbol",
	"js/config",
	"esri/config"
], function(Evented,declare,on,lang,Map,Extent,GeometryService,ProjectParameters,SpatialReference,webMercatorUtils, Point,Graphic,SimpleMarkerSymbol, config,esriConfig){
    return declare([Evented], {
		 
		constructor: function(mapController,splashController){
			this.mapController = mapController;
			this.splashController = splashController;
			this.isOk = navigator.geolocation;
			if(this.isOk){
				on(document.getElementById("gps-button"),"click",lang.hitch(this,"zoomToLocation"));
			}
			else
			{
				document.getElementById("gps-button").style.display = "none";
			}
		},

		watchPosition:function(){
			if(this.isWatch)return;
			this.isWatch = true;
			if(this.isOk)
				navigator.geolocation.watchPosition(lang.hitch(this,"showLocation"), lang.hitch(this,"locationError"));
			else
				this.showError("Le GPS n'est pas supporté.");	
		},
		
		zoomToLocation:function()
		{
			this.splashController.wait();
			this.getCurrentPosition().then(
				lang.hitch(this,function(mapPoint){
					this.mapController.map.centerAndZoom(mapPoint, 14);
					this.splashController.hide();
				}),
				lang.hitch(this,function(error){
					this.showError(error);
				})
			);
		},
		
		showLocation:function(location)
		{
			if(this.mapController.map.loaded)
			{
				var mapPoint = webMercatorUtils.geographicToWebMercator(new Point(location.coords.longitude, location.coords.latitude));
				
				//TODO TRANSFORM TO LAMBERT 72 313700
				//new SpatialReference(102100);

				var geomSer = esriConfig.geometryService;
				var params = new ProjectParameters();
				params.geometries = [mapPoint];
				//params.geometries = [new Point(location.coords.longitude, location.coords.latitude,new SpatialReference(4326))];
				params.outSR  = new SpatialReference(31370);
				//params.transformForward=false;
				//params.transformation = {"wkid":1610};
				geomSer.project(params).then( lang.hitch(this,function(result){
					mapPoint = result[0];
					if(this.graphic)
						this.mapController.removeGraphic(this.graphic);
				
					var markerSymbol = new SimpleMarkerSymbol({
						color: [226, 119, 40,64],

						outline: { // autocasts as new SimpleLineSymbol()
						color: [255, 255, 255],
						width: 2
						}
					});

					this.graphic = new Graphic();
					this.graphic.geometry = mapPoint;
					this.graphic.symbol = markerSymbol;
			
					this.mapController.addGraphic(this.graphic);
				}));
			}	
		},
		
		locationError:function(error)
		{
			this.showError(this.getErrorMessage(error));
		},
		
		getErrorMessage:function(error)
		{
			var message = "";
			switch (error.code) {
			   case error.PERMISSION_DENIED:
				 message = "Location not provided";
				 break;
			   case error.POSITION_UNAVAILABLE:
				 message = "Current location not available";
				 break;
			   case error.TIMEOUT:
				 message = "Timeout";
				 break;
			   default:
				 message = "Unknown error";
				 break;
			}
			 
			return message;
		},
		
		getCurrentPosition:function()
		{
			var self = this;
			return new Promise(function(resolve, reject) {
				navigator.geolocation.getCurrentPosition(
				function(location){
					var mapPoint = webMercatorUtils.geographicToWebMercator(new Point(location.coords.longitude,location.coords.latitude)); 

					var geomSer = esriConfig.geometryService;
					var params = new ProjectParameters();
					params.geometries = [mapPoint];
					params.outSR  = new SpatialReference(31370);
					//params.transformForward;
					//params.transformation = transformation;
					geomSer.project(params).then( lang.hitch(this,
						function(result){
							resolve(result[0]);
						}),
						lang.hitch(this,function(error){reject(error);})
					);
				}, 
				function(error){
					reject(self.getErrorMessage(error));
				},
				{maximumAge:60000, timeout:5000, enableHighAccuracy:false});
			});
		},

		showError:function(message){
			this.splashController.info({
				"text":"Signal GPS introuvable. ("+message+")",
				"button":
					{
						"text":"OK",
						"callback":lang.hitch(this,function(){
							this.splashController.hide();
						})
					}
				
			});
		}
    });
});