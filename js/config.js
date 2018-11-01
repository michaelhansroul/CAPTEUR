define(
function(){
    return {
		proxy:null,
		tokenUrl:"https://applications.bewapp.be/administration/generateToken",
		insUrl:"https://applications.bewapp.be/wss/service/ags-relay/Municipalties/agstoken/arcgis/rest/services/bewapp/BEWAPP_Poubelle/FeatureServer/1",
		entities:[
			{
				name:"Poubelle",
				service: "https://applications.bewapp.be/wss/service/ags-relay/Municipalties/agstoken/arcgis/rest/services/bewapp/BEWAPP_Poubelle/MapServer",
				layerId:0,
				feature:{
					id:"Typologie",
					name:"Typologie",
					service:"https://applications.bewapp.be/wss/service/ags-relay/Municipalties/agstoken/arcgis/rest/services/bewapp/BEWAPP_Poubelle/FeatureServer/0",
					relateFieldName:"globalid",
					fields:[
					]
				},
				table:{
					id:"Capteur",
					name:"Capteur",
					service:"https://applications.bewapp.be/wss/service/ags-relay/Municipalties/agstoken/arcgis/rest/services/bewapp/BEWAPP_Poubelle/FeatureServer/6",
					relateFieldName:"poubelle_id",
					fields:[
						{name:"capteur_id"}
					]
				},
			}
		],
		layers:{
			basemap:[
				{'name':'WorldStreetMap', 'service':'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer', 'visible':true, 'opacity':1, 'type':'tiled'},
				{'name':'WorldStreetMap', 'service':'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer', 'visible':true, 'opacity':1, 'type':'tiled'}
			],
			basemapcible:[
				{'name':'LieuxCiblesPoubelle', 'service':'http://ns333877.esribelux.eu:6080/arcgis/rest/services/FondDePlan_BeWaPP_ppo/MapServer', 'visible':true, 'opacity':1, 'type':'dynamic'},
				{'name':'LieuxCiblesProprete', 'service':'http://ns333877.esribelux.eu:6080/arcgis/rest/services/FondDePlan_BeWaPP_mppo/MapServer', 'visible':true, 'opacity':1, 'type':'dynamic'},
			],
			operational:[
				{'name':'Poubelle', 'service':'http://ns333877.esribelux.eu:6080/arcgis/rest/services/BEWAPP_Poubelle/FeatureServer', 'visible':true, 'opacity':1, 'type':'feature'},
				{'name':'Proprete', 'service':'http://ns333877.esribelux.eu:6080/arcgis/rest/services/BEWAPP_Proprete/FeatureServer', 'visible':true, 'opacity':1, 'type':'feature'},
			]
		}
    };
});