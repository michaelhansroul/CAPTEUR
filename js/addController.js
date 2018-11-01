define([
	"dojo/Evented",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"esri/graphic","esri/geometry/Point","esri/symbols/PictureMarkerSymbol"
], function(Evented,declare,on,lang,Graphic,Point,PictureMarkerSymbol){
    return declare([Evented], {
		
		constructor: function(core){
			this.core = core;
			on(document.getElementById("add-feature-button"), "click", lang.hitch(this, "choice"));
			on(document.getElementById("add-results"), "click", lang.hitch(this,"add"));
			this.core.searchController.on("update",lang.hitch(this,"update"));
		},
		
		initialize:function(entity)
		{
			this.entity = entity;
		},
		
		activate:function()
		{
			this.isActivate = true;
			document.getElementById("add-feature-button").className="button add activate";
			if(this.type=="manually"){
				this.core.searchController.activate();
			}
		},
		
		deactivate:function()
		{
			this.isActivate = false;
			document.getElementById("add-feature-button").className="button add";
			if(this.graphic)
				this.core.mapController.removeGraphic(this.graphic);
			if(this.type=="manually"){
				this.core.searchController.deactivate();
			}
			this.hideResult();
		},
		
		choice:function()
		{
			if(this.isActivate)
			{
				//Desactivate add
				this.core.activateDeactivate(null);
				return;
			}
			
			this.core.splashController.info({
				"text":"Association d'un capteur à une poubelle existante",
				"buttons":[
					{
						"text":"OUI",
						"isEnable":true,
						"callback":lang.hitch(this,"addWithSelection")
					},
					{"text":"NON","isEnable":true,"callback":lang.hitch(this,"addWithLocation")}
				]
			});
		},
		
		addWithSelection:function()
		{
			this.type="manually";
			this.core.splashController.hide();
			this.core.activateDeactivate(this);
		},

		update:function(data){
			if(data.row){
				this.core.splashController.info({
					"text":"Etes-vous sûre de vouloir associer un nouveau capteur à la poubelle ?",
					"buttons":[
						{
							"text":"OUI",
							"isEnable":true,
							"callback":lang.hitch(this,function(){this.continue(data);})
						},
						{"text":"NON","isEnable":true,"callback":lang.hitch(this,"cancel")}
					]
				});
				return;
			}
			this.continue(data);
		},
		
		cancel:function(){
			//Deactivate add
			if(this.isActivate)
				this.core.activateDeactivate(null);
		},

		continue:function(data){
			this.emit("update",data);
			if(this.isActivate)
				this.core.activateDeactivate(null);
		},
		
		addWithLocation:function()
		{
			this.type="location";
			this.core.splashController.hide();
			this.core.gpsController.getCurrentPosition().then(
				lang.hitch(this,function(mapPoint){
					this.core.activateDeactivate(this);
					/*var point = new Point({
						x: results.coords.longitude,
						y: results.coords.latitude
					  });*/
					this.core.mapController.map.centerAndZoom(mapPoint, 16);
					this.addPoint(mapPoint);
				}),
				function(error){alert(error);}
			);
		},
		
		//ADD GRAPHIC TO THE MAP
		addGraphic:function(mapPoint)
		{
			if(this.graphic)
				this.core.mapController.removeGraphic(this.graphic);
			
			///CREATE SYMBOL
			this.graphic = new Graphic();
			this.graphic.geometry = mapPoint;
			this.graphic.symbol = new PictureMarkerSymbol({
			  url: "image/locate.png",
			  width: 24,
			  height: 24,
			  yoffset: 12
			});
			
			this.core.mapController.addGraphic(this.graphic);
		},
		
		addPoint:function(mapPoint)
		{
			this.addGraphic(mapPoint);
			this.showResult();
		},
		
		add:function()
		{
			if(!this.core.loginController.user.geometry().contains(this.graphic.geometry))
			{
				this.core.splashController.info({
					"text":"Le point est en dehors de la commune !!!",
					"button":
						{
							"text":"OK",
							"callback":lang.hitch(this,function(){
								this.core.splashController.hide();
							})
						}
					
				});
				return;
			}
			///Load FeatureLayer Info
			if(!this.entity.feature.layer.loaded)
			{
				console.log("load feature layer");
				this.core.splashController.wait();
				this.entity.feature.layer.load().then(lang.hitch(this,"add"), function(){alert("load error");});
				return;
			}
			
			///Load TableLayer Info
			if(this.entity.table && !this.entity.table.layer.loaded)
			{
				console.log("load table layer");
				this.core.splashController.wait();
				this.entity.table.layer.load().then(lang.hitch(this,"add"), function(){alert("load error");});
				return;
			}
			
			this.core.splashController.hide();
			this.emit("add",{
				type:"add",
				feature:this.graphic,
				row:null
			});
			
			if(this.isActivate)
			{
				this.core.activateDeactivate(this.core.searchController);
			}
		},
		
		showResult:function()
		{
			document.getElementById("add-results").style.display = "block";
		},
		
		hideResult:function()
		{
			document.getElementById("add-results").style.display = "none";
		}
    });
});