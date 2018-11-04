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
            var attributes = {};
            var graphic =  new Graphic({
                attributes: attributes
            });
            graphic.geometry = this.data.feature.geometry;
            //attributes["modifie_date"] = Date.now();
            //attributes["modifie_nom"] = this.user.userName;
            attributes["capteur_id"] = this.data.barCode.code;
            attributes["commune_ins_str"] = this.user.ins();
            attributes["capteur_status"] = 0;
            return this.entity.capteurBrut.layer.applyEdits([graphic],[],[]);
        },
             
        addAttachment: function(){
            var oid = this.data.capteurBrut.attributes[this.getFieldByType("esriFieldTypeOID").name];
            return this.entity.capteurBrut.attachmentsLayer.addAttachment(oid,this.data.attachment.formElement)
        },

        OIDName:function(){
            return this.getFieldByType("esriFieldTypeOID").name;
        },

        getFieldByType:function(type)
		{
			
			for(var i=0;i<this.entity.capteurBrut.layer.fields.length;i++)
			{
				var field = this.entity.capteurBrut.layer.fields[i];
				if(field.type==type)
				{
					return field;
				}
			}
			return null;
		}

    });
});