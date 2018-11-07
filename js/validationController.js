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
	"js/model/poubelle",
	"js/model/capteur",
	"js/model/capteurBrut",
	"js/model/capteurThingsplay"
], function(Evented,declare,on,lang,config,Graphic,Map,ArcGISDynamicMapServiceLayer,
	ArcGISTiledMapServiceLayer,
	VectorTileLayer,
	Extent,
	GeometryService,
	ProjectParameters,
	SpatialReference,
	Graphic,
	SimpleMarkerSymbol,Poubelle,Capteur,CapteurBrut,CapteurThingsplay){
    return declare([Evented], {
		isShow:false,
		constructor: function(core){
			this.core = core;
			this.splashController = this.core.splashController;
			this.user = this.core.loginController.user;
			this.container = document.getElementById("validation-form");
			this.hide();
			
			on(document.getElementById("validation-close"), "click", lang.hitch(this, "hide"));
			on(document.getElementById("validation-form-valid-button"), "click", lang.hitch(this, "valid"));

			this.map = new Map("validation-map");
			var orthoLayer = new ArcGISTiledMapServiceLayer("https://geoservices.wallonie.be/arcgis/rest/services/IMAGERIE/ORTHO_LAST/MapServer");
			var labelLayer = new ArcGISTiledMapServiceLayer("https://geoservices.wallonie.be/arcgis/rest/services/DONNEES_BASE/FOND_PLAN_ANNOTATIONS_RW/MapServer");
          
			this.map.addLayer(orthoLayer);
			this.map.addLayer(labelLayer);

			on(window, 'resize', lang.hitch(this, "resize"));
			this.resize();
		},
		
		initialize:function(entity)
		{
			this.entity = entity;
		},
		
		show:function(data)
		{
			this.data = data;
			this.isShow = true;
	
			document.getElementById("validation-form").className = "form active";
			//document.getElementById("scan-title").innerHTML = this.entity.name;
			this.resize();
			document.getElementById("validation-code").innerHTML = this.data.barCode.code;
			document.getElementById("validation-image").src = this.data.attachment.src;

			///CREATE SYMBOL
			this.graphic = new Graphic();
			this.graphic.geometry = this.data.feature.geometry;
			this.graphic.symbol = new SimpleMarkerSymbol({
				color: [226, 119, 40],

				outline: { // autocasts as new SimpleLineSymbol()
				  color: [255, 255, 255],
				  width: 2
				}
			  });

			this.map.graphics.add(this.graphic);
			this.map.centerAndZoom(this.data.feature.geometry, 14);
		},

		resize:function(){
			var height = this.container.offsetHeight - 54*2 - 20;
			var width = this.container.offsetWidth;

			document.getElementById("validation-photo").style.height  = (height/2).toString()+"px";
			document.getElementById("validation-image").style.maxHeight  = (height/2).toString()+"px";
			document.getElementById("validation-image").style.maxWidth  = width.toString()+"px";
			document.getElementById("validation-map-container").style.height  = (height/2).toString()+"px";

			this.map.resize(true);
		},
		
		hide:function()
		{
			if(this.graphic)
				this.map.graphics.remove(this.graphic);
			this.splashController.hide();
			this.isShow = false;
			document.getElementById("validation-form").className = "form";
			this.emit("hide");
		},
		
		valid:function()
		{
			this.splashController.wait();
			var capteurThingsplay = new CapteurThingsplay(this.entity,this.data,this.user);
			if(this.data.type=="update"){
				//ASSOCIATION
				var poubelle = new Poubelle(this.entity,this.data,this.user);
				var capteur = new Capteur(this.entity,this.data,this.user);
				poubelle.addAttachment().then(
					lang.hitch(this,function(){
						poubelle.update().then(
							lang.hitch(this,function(error){
								var promise;
								if(this.data.row == null)
									promise  = capteur.add();
								else
									promise  = capteur.update();
								promise.then(
									lang.hitch(this,function(){
										capteurThingsplay.add().then(
											lang.hitch(this,function(){
												this.entity.layer.refresh();
												this.splashController.hide();
												this.hide();
											}),
											lang.hitch(this,function(error){alert(error);})
										);
									}),
									lang.hitch(this,function(error){alert(error);})
								);
							}),
							lang.hitch(this,function(error){alert(error);})
						);
					}),
					lang.hitch(this,function(error){alert(error);})
				);
			}
			else{
				///ADD TO CAPTEUR BRUT
				var capteurBrut = new CapteurBrut(this.entity,this.data,this.user);
				capteurBrut.add().then(
					lang.hitch(this,function(result){
						this.data.capteurBrut = {};
						this.data.capteurBrut.attributes = {};
						///WORKAROUND RESPONSE (objectId)
						this.data.capteurBrut.attributes[capteurBrut.OIDName()] = this.getValueByFieldName(result[0],capteurBrut.OIDName());
						capteurBrut.addAttachment().then(
							lang.hitch(this,function(result){
								capteurThingsplay.add().then(
									lang.hitch(this,function(){
										this.entity.layer.refresh();
										this.splashController.hide();
										this.hide();
									}),
									lang.hitch(this,function(error){alert(error);})
								);
							}),
							lang.hitch(this,function(error){alert(error);})
						);
					}),
					lang.hitch(this,function(error){alert(error);})
				);
			}
		},

		getValueByFieldName:function(results,name)
		{
			for(var key in results)
			{
				if(key.toUpperCase() == name.toUpperCase())
				{
					return results[key];
				}
			}
			
			return null;
		}
    });
});