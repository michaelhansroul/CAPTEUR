define([
	"dojo/Evented",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"esri/request",
	"esri/urlUtils"
], function(Evented,declare,on,lang,esriRequest,urlUtils){
    return declare([Evented], {
		constructor: function(url){
			this.loaded = false;
			this.url = url;
		},
		
		load: function()
		{
			var self = this;
			return new Promise(function(resolve, reject) {
				
				esriRequest({url:self.url+"?f=json"}).then(
					function(response){
						self.loaded=true;
						self.fields = response.fields;
						resolve(response);
					},
					function(error){
						reject(error);
					}
				);
			
			});
		},
		
		applyEdits: function(addFeatures,updateFeatures,deleteFeatures)
		{
			var adds = [];
			if(addFeatures)
			{
				for(var i=0;i<addFeatures.length;i++)
				{
					adds.push({attributes:addFeatures[i].attributes});
				}
			}
			
			var updates = [];
			if(updateFeatures)
			{
				for(var i=0;i<updateFeatures.length;i++)
				{
					updates.push({attributes:updateFeatures[i].attributes});
				}
			}
			
			var addsString = JSON.stringify(adds);
			var updatesString = JSON.stringify(updates);
			
			var url = urlUtils.urlToObject(this.url+"/applyEdits?adds=" + addsString + "&updates="+updatesString+"&f=json");  
			
			return esriRequest(
				{
					url:this.url+"/applyEdits",
					content:url.query
				},
				{
					usePost:true
				}
				);
			
			
			/*esriRequest('<feature layer/table url>/applyEdits',{
			  query: {
				method: 'post', // POST request
				adds: [  // this is an array of JSON from a graphic:
						 // you can get it using graphic.toJSON()
						 // or construct the JSON manually
						 // if the 'layer' is a table, do not specify
						 // a geometry
				  {
					geometry: {"x" : -118.15, "y" : 33.80},  
					attributes: {
					  OWNER: "Joe Smith",
					  VALUE: 94820.37,
					  APPROVED: true,
					  LASTUPDATE: 1227663551096
					}
				  },
				  {
				  ... // feature to add #2
				  }
				],
				updates: [
				  {
				  ... // same as adds, except you must include an
					  // object id, which is the unique id for this feature
					  // the object id field can be anything, but it's usually
					  // objectId or OBJECTID, you can check on the layer
				  }
				],
				deletes: <object1, objectid2, ...>, // deletes just needs a comma-delimited
													// list of object ids
				token: <user token>, // token
				f:"json" // format
			  },
			}).then(function(r){
			  console.log(r);
			});*/
		}
    });
});