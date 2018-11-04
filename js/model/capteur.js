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
        
        update: function(){
            var attributes = {};
            var graphic =  new Graphic({
                attributes: attributes
            });
            
            var OIDName = this.getTableFieldByType("esriFieldTypeOID").name;
            attributes["modifie_date"] = Date.now();
            //attributes["modifie_nom"] = this.user.userName;
            attributes[this.entity.table.relateFieldName] = this.data.feature.attributes[this.entity.feature.relateFieldName];
            attributes["capteur_id"] = this.data.barCode.code;
            attributes[OIDName] = this.data.row.attributes[OIDName];

            return this.entity.table.layer.applyEdits([],[graphic],[])
        },

        add: function(){
            var attributes = {};
            var graphic =  new Graphic({
                attributes: attributes
            });
            
            attributes["modifie_date"] = Date.now();
            //attributes["modifie_nom"] = this.user.userName;
            attributes[this.entity.table.relateFieldName] = this.data.feature.attributes[this.entity.feature.relateFieldName];
            attributes["capteur_id"] = this.data.barCode.code;
            attributes["commune_ins_str"] = this.user.ins();

            return this.entity.table.layer.applyEdits([graphic],[],[])
        },

        getTableFieldByType:function(type)
		{
			for(var i=0;i<this.entity.table.layer.fields.length;i++)
			{
				if(this.entity.table.layer.fields[i].type==type){
					return this.entity.table.layer.fields[i];
				}
			}
			return null;
		}

    });
});