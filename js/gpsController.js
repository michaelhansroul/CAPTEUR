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
], function(Evented,declare,on,lang,Map,Extent,GeometryService,ProjectParameters,SpatialReference,webMercatorUtils, Point,Graphic,SimpleMarkerSymbol, config){
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
					this.mapController.map.centerAndZoom(mapPoint, 16);
					this.splashController.hide();
					/*var markerSymbol = new SimpleMarkerSymbol({
						color: [226, 119, 40],

						outline: { // autocasts as new SimpleLineSymbol()
						  color: [255, 255, 255],
						  width: 2
						}
					  });

					if(this.graphic)
					  this.mapController.removeGraphic(this.graphic);
				  
					this.graphic = new Graphic();
					this.graphic.geometry = mapPoint;
					this.graphic.symbol = markerSymbol;
			
					this.mapController.addGraphic(this.graphic);*/
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
					var pt = webMercatorUtils.geographicToWebMercator(new Point(location.coords.longitude, location.coords.latitude));
					resolve(pt);
				}, 
				function(error){
					reject(self.getErrorMessage(error));
				},
				{maximumAge:600000, timeout:0});
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