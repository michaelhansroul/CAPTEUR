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
            return new Promise(lang.hitch(this,function(resolve, reject){
                var attributes = {};
				var graphic =  new Graphic({
					attributes: attributes
				});
                
                var OIDName = this.getFeatureFieldByType("esriFieldTypeOID").name;
				attributes["modifie_date"] = Date.now();
                attributes["modifie_nom"] = this.user.userName;
                attributes[OIDName] = this.data.feature.attributes[OIDName];

                this.countAttachments().then(
                    lang.hitch(this,function(result){
                        attributes["photo_number"] = result;
                        this.entity.feature.layer.applyEdits([],[graphic],[]).then(
                            lang.hitch(this,function(result){resolve();}),
                            lang.hitch(this,function(error){reject(error);})
                        );
                    }),
                    lang.hitch(this,function(error){reject(error);})
                );

            }));
        },
        
        addAttachment: function(){
            var oid = this.data.feature.attributes[this.getFeatureFieldByType("esriFieldTypeOID").name];
            return this.entity.feature.attachmentsLayer.addAttachment(oid,this.data.attachment.formElement)
        },

        countAttachments: function(){
			var oid = this.data.feature.attributes[this.getFeatureFieldByType("esriFieldTypeOID").name];
            return new Promise(lang.hitch(this,function(resolve, reject){
                this.entity.feature.attachmentsLayer.queryAttachmentInfos(oid).then(
                    lang.hitch(this,function(attachments){resolve(attachments.length);}),
                    lang.hitch(this,function(error){reject(error);})
                );
            }));
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
		}

    });
});