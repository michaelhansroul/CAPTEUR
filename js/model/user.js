define([
    "dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/cookie",
	'js/config',
	"esri/config",
	"esri/request",
	"esri/urlUtils",
	"esri/tasks/QueryTask", "esri/tasks/query",
	"esri/Credential",
	'esri/layers/FeatureLayer',
	'esri/IdentityManager',
	'esri/ServerInfo',
	"esri/tasks/ProjectParameters",
	"esri/SpatialReference"
], function(declare,lang,cookie,Config,esriConfig,esriRequest,urlUtils,QueryTask,Query,Credential,FeatureLayer,identityManager,ServerInfo,ProjectParameters,SpatialReference){
    return declare(null, {
        userName:null,
		token:null,
		constructor: function(core){
			this.userName = cookie("userName");
		},
		authenticate:function(userName,password,successCallback,errorCallback)
		{
			esriConfig.defaults.io.corsEnabledServers.push("applications.bewapp.be");
			var timeout = 1440; //24HEURES
			var data ={
				request:"getToken",
				username:userName,
				password:password,
				expiration:timeout,
				f:"json"
			};
			
			this.userName = userName;
			cookie("userName", this.userName, { expires: 5 });
			
			var self = this;
			esriRequest({
				url:Config.tokenUrl,
				content:data
				},{usePost:true}).then(
					function(response){
						if(!response){errorCallback("Le nom d'utilisateur ou le mot de passe n'est pas correct.");return;}
						self.token = response.token;
						//self.credential = new Credential();
						//self.credential.token = self.token;
						/*var serverInfo = new ServerInfo();
						serverInfo.adminTokenServiceUrl = "";
						serverInfo.currentVersion = 10.41;
						serverInfo.server = "https://applications.bewapp.be";
						serverInfo.shortLivedTokenValidity = 60;
						serverInfo.tokenServiceUrl="http://applications.bewapp.be/administration/generateToken";
						var idObject ={};  
                                idObject.serverInfos= [serverInfo];  
                                var credentials={};  
                                credentials.userId = userName;  
                                credentials.server = "https://applications.bewapp.be";  
                                credentials.token = self.token;  
                                credentials.expires = response.expires;  
                                credentials.ssl = false;  
                                credentials.scope = "server";  
                                credentials.validity = 720;  
                                credentials.creationTime = new Date();  
                                  
                                  
                                idObject.credentials = [credentials];  
                               //credential object is correct  
                                esri.id.initialize(idObject);  
                                esri.id.tokenValidity=720;  
						//esri.id.credentials.push(self.credential);
						esri.id.credentials[0].resources.push(Config.insUrl);
						Config.insLayer = new FeatureLayer(Config.insUrl);*/
						//Config.insLayer.credential = self.credential;
						
						var hostname = "applications.bewapp.be";
						var now = +(new Date());
						var expires = now + (timeout*60000);
						var imObject = {
						"serverInfos": [
						{
						"server": hostname,
						"tokenServiceUrl": "https://applications.bewapp.be/administration/generateToken",
						"adminTokenServiceUrl": "https://applications.bewapp.be/administration/generateToken",
						"shortLivedTokenValidity": timeout,
						"currentVersion": 10.41,//update necessary
						"hasServer": true
						}
						],
						"oAuthInfos": [],
						"credentials": [
						{
						"userId": userName,
						"server": hostname,
						"token": self.token,
						"expires": expires,
						"validity": timeout,
						"ssl": false,
						"creationTime": now,
						"scope": "server",
						"resources": [
						"https://applications.bewapp.be/wss/service/ags-relay/Municipalties/agstoken/arcgis/rest/services"
						]
						}
						]
						};
						identityManager.initialize(imObject);
						esri.id.__proto__.__proto__.findCredential = function(a, b){
							if(a && a.indexOf("wss/service/ags-relay") !== -1)
								return esri.id.credentials[0]; 
							return null;
						};
						
						Config.insLayer = new FeatureLayer(Config.insUrl,{userId:userName});
						
						for(var i=0;i<Config.entities.length;i++)
						{
							if(Config.entities[i].feature && Config.entities[i].feature.service)
							{
								Config.entities[i].feature.layer = new FeatureLayer(Config.entities[i].feature.service);
								///WORKAROUND SECURE ATTACHMENTS
								Config.entities[i].feature.attachmentsLayer = new FeatureLayer(Config.entities[i].feature.service.replace('wss/service/ags-relay/Municipalties/agstoken/arcgis','ags'));
							
								if(Config.entities[i].feature.historic)
								{
									Config.entities[i].feature.historic.layer = new FeatureLayer(Config.entities[i].feature.historic.service);
								}
								
								if(Config.entities[i].feature.historicv2)
								{
									Config.entities[i].feature.historicv2.layer = new FeatureLayer(Config.entities[i].feature.historicv2.service);
								}
							}
							///https://applications.bewapp.be/wss/service/ags-relay/Municipalties/agstoken/arcgis/rest/services
							///https://applications.bewapp.be/ags/rest/services/BEWAPP_Poubelle/FeatureServer/2/
							if(Config.entities[i].table && Config.entities[i].table.service)
							{
								Config.entities[i].table.layer = new FeatureLayer(Config.entities[i].table.service);
								Config.entities[i].table.attachmentsLayer = new FeatureLayer(Config.entities[i].table.service.replace('wss/service/ags-relay/Municipalties/agstoken/arcgis','ags'));
							}

							if(Config.entities[i].capteurBrut && Config.entities[i].capteurBrut.service)
							{
								Config.entities[i].capteurBrut.layer = new FeatureLayer(Config.entities[i].capteurBrut.service);
								Config.entities[i].capteurBrut.attachmentsLayer = new FeatureLayer(Config.entities[i].capteurBrut.service.replace('wss/service/ags-relay/Municipalties/agstoken/arcgis','ags'));
							}
						}
						
						self.getIns(successCallback,errorCallback);
					},
					function(error){
						errorCallback(error);
					}
			);
		},
		
		getIns:function(successCallback,errorCallback)
		{
			var query = new Query();
			query.returnGeometry = true;
			query.outFields = ['commune_ins'];
			query.where = "1=1";
			
			Config.insLayer.queryFeatures(query).then(
			lang.hitch(this,function(results){
				if(results.features.length>0)
				{
					this.insFeature = results.features[0];
					var geomSer = esriConfig.geometryService;//new GeometryService( esriConfig.geometryServiceUrl );
					/*var params = new ProjectParameters();
					params.geometries = [this.insFeature.geometry];
					params.outSR  = new SpatialReference(102100);
					//params.transformForward;
					//params.transformation = transformation;
					geomSer.project(params).then(lang.hitch(this,function(event){
						this.insFeature.setGeometry(event[0]);
						successCallback();
					}),
					lang.hitch(this,function(error){errorCallback("Project ins error");})
					);*/
					successCallback();
				}
				else
				{
					errorCallback("No ins code");
				}
			}),
			lang.hitch(this,function(error){errorCallback(error);}));
		},
		
		ins:function()
		{
			return this.insFeature.attributes["commune_ins"];
		},
		
		geometry:function()
		{
			return this.insFeature.geometry;
		},
		
		logout:function()
		{
			token:null
		}
    });
});