define([
	"dojo/Evented",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"esri/tasks/QueryTask", "esri/tasks/query",
	"esri/graphic","esri/geometry/Point","esri/symbols/PictureMarkerSymbol"
], function(Evented,declare,on,lang,QueryTask,Query,Graphic,Point,PictureMarkerSymbol){
    return declare([Evented], {

		constructor: function(mapController,splashController){
			this.mapController = mapController;
			this.splashController = splashController;
			
			this.hide();
			on(document.getElementById("search-results-container-add"), "click", lang.hitch(this,"update",false));
		},
		
		initialize:function(entity)
		{
			this.entity = entity;
		},
		
		activate:function()
		{
			this.mapHandler = this.mapController.on("click",lang.hitch(this,"search"));
			this.showInfo();
		},
		
		deactivate:function()
		{
			document.getElementById("search-results-info-container").style.display = "none";
			if(this.mapHandler)
				this.mapHandler.remove();
			if(this.graphic)
				this.mapController.removeGraphic(this.graphic);
			this.hide();
		},
		
		search:function(mapPoint)
		{
			this.mapPoint = mapPoint;
			
			if(this.graphic)
				this.mapController.removeGraphic(this.graphic);
			
			var queryTask = new QueryTask(this.entity.feature.service);
			
			var query = new Query();
			query.geometry = mapPoint; // mapPoint obtained from view-click event.
			query.returnGeometry = true;
			query.outFields = ["*"];
			query.units = "meters";
			query.distance = 100;
		
			this.showLoader();
			// When resolved, returns features and graphics that satisfy the query.
			queryTask.execute(query).then(lang.hitch(this,function(results){
				this.results = results;
				if(results && results.features.length>0)
				{
					this.showResult();
				}
				else
				{
					this.hide();
					this.showInfo();
				}
			}),
			function(err){
				this.splashController.info({
					"text":err,
					"button":
						{
							"text":"OK",
							"callback":lang.hitch(this,function(){
								this.splashController.hide();
							})
						}
					
				});
			});
		},
		
		update:function()
		{
			this.splashController.hide();
			
			///Load FeatureLayer Info
			if(!this.entity.feature.layer.loaded)
			{
				this.splashController.wait();
				console.log("load feature layer");
				this.entity.feature.layer.load().then(lang.hitch(this,"update"), function(){alert("Feature layer load error");});
				return;
			}
			
			///Load TableLayer Info
			if(this.entity.table && !this.entity.table.layer.loaded)
			{
				this.splashController.wait();
				this.entity.table.layer.load().then(lang.hitch(this,"update"), function(){alert("Table layer load error");});
				return;
			}
			
			this.getRelate();
		},
		
		getRelate:function()
		{
			if(this.entity.table)
			{
				var queryTask = new QueryTask(this.entity.table.service);
				var query = new Query();
				query.returnGeometry = false;
				query.outFields = ["*"];
				query.where = this.entity.table.relateFieldName+" = '"+this.feature.attributes[this.entity.feature.relateFieldName]+"'";
				this.splashController.wait();
				
				// When resolved, returns features and graphics that satisfy the query.
				queryTask.execute(query).then(lang.hitch(this,function(results){
					this.splashController.hide();
					var bestFeature;
					if(results && results.features.length>0)
					{
						bestFeature = results.features[0];
					}
					this.emit("update",{
						type:"update",
						feature:this.feature,
						row:bestFeature ? bestFeature : null
					});
					
					this.hide();
				}));
			}
			else
			{
				this.emit("update",{
						type:"update",
						feature:this.feature,
						row: null
				});
				
				this.hide();
			}
		},
		
		getFeature:function()
		{
			if(!this.results || !this.results.features || this.results.features.length == 0) return null;
			
			var bestFeature = this.results.features[0];
			var bestDistance = this.calculDistance(this.mapPoint,this.results.features[0].geometry);
			
			for(var i=1;i<this.results.features.length;i++)
			{
				var distance = this.calculDistance(this.mapPoint,this.results.features[i].geometry);
				if(distance < bestDistance)
				{
					bestFeature = this.results.features[i];
					bestDistance = distance;
				}
			}
			
			return bestFeature;
		},
		
		calculDistance:function(mapPointA, mapPointB)
		{
			return Math.sqrt(Math.pow((mapPointB.x-mapPointA.x),2)+Math.pow((mapPointB.y-mapPointA.y),2));
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
			  yoffset: 22
			});
			
			this.mapController.addGraphic(this.graphic);
		},
		
		showResult:function()
		{
			this.feature = this.getFeature();
			
			///CREATE SYMBOL
			
			this.addGraphic(this.feature.geometry);
			
			this.hideLoader();
			this.hideInfo();
			this.show();
			document.getElementById("search-results-container").style.display = "block";
		},
		
		hideResult:function()
		{
			document.getElementById("search-results-container").style.display = "none";
		},
		
		showLoader:function()
		{
			this.hideResult();
			this.hideInfo();
			this.show();
			document.getElementById("search-results-loader").style.display = "block";
		},
		
		hideLoader:function()
		{
			document.getElementById("search-results-loader").style.display = "none";
		},

		showInfo:function(){
			this.hideResult();
			this.hideLoader();
			this.show();
			document.getElementById("search-results-info-container").style.display = "block";
		},

		hideInfo:function(){
			document.getElementById("search-results-info-container").style.display = "none";
		},
		
		show:function()
		{
			document.getElementById("search-results").style.display = "block";
		},
		
		hide:function()
		{
			this.hideLoader();
			this.hideResult();
			this.hideInfo();
			document.getElementById("search-results").style.display = "none";
			if(this.graphic)
				this.mapController.removeGraphic(this.graphic);
		}
    });
});