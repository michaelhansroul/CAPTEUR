define([
	"dojo/Evented",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"esri/tasks/QueryTask", "esri/tasks/query",
	"esri/graphic","esri/geometry/Point","esri/symbols/PictureMarkerSymbol"
], function(Evented,declare,on,lang,QueryTask,Query,Graphic,Point,PictureMarkerSymbol){
    return declare([Evented], {
		constructor: function(mapController,splashController,searchController){
			this.mapController = mapController;
			this.splashController = splashController;
			this.searchController = searchController;
			this.hide();
			on(document.getElementById("move-results-save"), "click", lang.hitch(this,"save",true));
			on(document.getElementById("move-results-cancel"), "click", lang.hitch(this,"cancel"));
		
		},
		
		initialize:function(entity)
		{
			this.entity = entity;
		},
		
		activate:function()
		{
			this.mapHandler = this.mapController.on("click",lang.hitch(this,"move"));
		},
		
		deactivate:function()
		{
			if(this.mapHandler)
				this.mapHandler.remove();
			if(this.graphic)
				this.mapController.removeGraphic(this.graphic);
			this.hide();
		},
		
		cancel:function()
		{
			this.emit("cancel");
		},
		
		save:function(showSplash)
		{
			if(showSplash)
			{
				this.splashController.info({
					"text":"Sauvegarder la nouvelle position ?",
					"buttons":[
						{
							"text":"CONTINUER",
							"callback":lang.hitch(this,"save",false)
						},
						{"text":"ANNULER","callback":lang.hitch(this,function(){this.splashController.hide();})}
					]
				});
				return;
			}
			
			var OIDName = this.getFeatureFieldByType("esriFieldTypeOID").name;
			var attributes = {};
			attributes[OIDName] = this.data.feature.attributes[OIDName];
			var graphic =  new Graphic({
				geometry:this.graphic.geometry,
				attributes: attributes
			});
			
			this.splashController.wait();
			this.entity.feature.layer.applyEdits([],[graphic],[]).then(
				lang.hitch(this,function(){
					this.splashController.hide();
					//REFRESH CARTE
					this.entity.layer.refresh();
					
					this.searchController.addGraphic(this.graphic.geometry);
					
					this.cancel();
					
				}),
				lang.hitch(this,function(error){alert(error);}),
			);
		},
		
		getFeatureFieldByType:function(type)
		{
			
			for(var i=0;i<this.entity.feature.layer.fields.length;i++)
			{
				var field = this.entity.feature.layer.fields[i];
				if(field.type==type)
				{
					return field;
				}
			}
			return null;
		},
		
		move:function(mapPoint)
		{
			this.addGraphic(mapPoint);
		},
		
		addGraphic:function(mapPoint)
		{
			if(this.graphic)
				this.mapController.removeGraphic(this.graphic);
			
			this.graphic = new Graphic();
			this.graphic.geometry = mapPoint;
			this.graphic.symbol = new PictureMarkerSymbol({
			  url: "image/locate.png",
			  width: 24,
			  height: 24,
			  yoffset: 11
			});
			
			this.mapController.addGraphic(this.graphic);
		},
		
		show:function(data)
		{
			this.data=data;
			document.getElementById("move-results").style.display = "block";
			this.addGraphic(data.feature.geometry);
		},
		
		hide:function()
		{
			document.getElementById("move-results").style.display = "none";
		}
    });
});