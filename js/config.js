define(
    function(){
        return {
            proxy:null,
            tokenUrl:"https://applications.bewapp.be/administration/generateToken",
            insUrl:"https://applications.bewapp.be/wss/service/ags-relay/Municipalties/agstoken/arcgis/rest/services/bewapp/BEWAPP_Poubelle/FeatureServer/1",
            entities:[
                {
                    name:"Poubelle",
                    service: "https://applications.bewapp.be/ags/rest/services/bewappdev/BEWAPP_Poubelle/MapServer",
                    layerId:0,
                    feature:{
                        id:"Typologie",
                        name:"Typologie",
                        service:"https://applications.bewapp.be/ags/rest/services/bewappdev/BEWAPP_Poubelle/FeatureServer/0",
                        relateFieldName:"globalid",
                        fields:[
                        ]
                    },
                    table:{
                        id:"Capteur",
                        name:"Capteur",
                        service:"https://applications.bewapp.be/ags/rest/services/bewappdev/BEWAPP_Poubelle/FeatureServer/6",
                        relateFieldName:"poubelle_id",
                        fields:[
                            {name:"capteur_id"}
                        ]
                    },
                    capteurBrut:{
                        service:"https://applications.bewapp.be/ags/rest/services/bewappdev/BEWAPP_Poubelle/FeatureServer/9"
                    },
                    layerIdsOnMap:[9,7,0]
                }
            ]
        };
    });