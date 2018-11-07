define([
	"dojo/Evented",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
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
	"esri/config",
	"js/config"
], function(
		Evented,
		declare,
		on,
		lang,
		Map,
		ArcGISDynamicMapServiceLayer,
		ArcGISTiledMapServiceLayer,
		VectorTileLayer,
		Extent,
		GeometryService,
		ProjectParameters,
		SpatialReference,
		Graphic,
		SimpleMarkerSymbol,
		esriConfig,
		config){
    return declare([Evented], {
		layers:[],
		constructor: function(splashController){
			this.splashController = splashController;
			
			this.map = new Map("map");
			
			//var ortholayer = new VectorTileLayer("https://www.arcgis.com/sharing/rest/content/items/af6063d6906c4eb589dfe03819610660/resources/styles/root.json");
			var orthoLayer = new ArcGISTiledMapServiceLayer("https://geoservices.wallonie.be/arcgis/rest/services/IMAGERIE/ORTHO_LAST/MapServer");
			var labelLayer = new ArcGISTiledMapServiceLayer("https://geoservices.wallonie.be/arcgis/rest/services/DONNEES_BASE/FOND_PLAN_ANNOTATIONS_RW/MapServer");
          
			this.map.addLayer(orthoLayer);
			this.map.addLayer(labelLayer);
			
			this.map.on("click", lang.hitch(this,function(event){
				 this.emit("click",event.mapPoint);
			}));
			
			on(document.getElementById("basemap-button"),"click",lang.hitch(this,function(){
				if(document.getElementById("basemap-button").className == "button basemap streets")
				{
					document.getElementById("basemap-button").className = "button basemap satellite";
					this.map.setBasemap("streets");
				}
				else
				{
					document.getElementById("basemap-button").className = "button basemap streets";
					this.map.setBasemap("satellite");
				}
			}));
		},
		
		initialize:function(entity,user)
		{
			this.clear();
			this.entity = entity;
			this.entity.layer = new ArcGISDynamicMapServiceLayer(entity.service);
			this.entity.layer.setVisibleLayers(entity.layerIdsOnMap);
			var layerDefinitions = [];
			for(var i=0;i<entity.layerIdsOnMap.length;i++)
				layerDefinitions[entity.layerIdsOnMap[i]] = "commune_ins_str = '"+user.ins()+"'";
			this.entity.layer.setLayerDefinitions(layerDefinitions);
			this.entity.layer.setDisableClientCaching(true);
			
			this.map.addLayer(this.entity.layer);
			this.layers.push(this.entity.layer);
			
			var extent  =  user.geometry().getExtent();
			
			/*var outSR =  new SpatialReference(102100);//SpatialReference.WebMercator;
			
			var geomSer = esriConfig.geometryService;//new GeometryService( esriConfig.geometryServiceUrl );
			var params = new ProjectParameters();
			params.geometries = [extent];
			params.outSR  = outSR;
			//params.transformForward;
			//params.transformation = transformation;
			geomSer.project(params).then( lang.hitch(this,function(event){
				this.map.setExtent(event[0]);
			}));*/

			this.map.setExtent(extent);
		},
		
		track:function(track)
		{
			window.console.log("TRACK");
		},
		
		addGraphic:function(graphic)
		{
			this.map.graphics.add(graphic);
		},
		
		removeGraphic:function(graphic)
		{
			this.map.graphics.remove(graphic);
		},
		
		clear:function()
		{
			for(var i=0;i<this.layers.length;i++)
			{
				this.map.removeLayer(this.layers[i]);
			}
			
			this.layers = [];
		}
    });
});