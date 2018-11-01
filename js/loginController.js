define([
	"dojo/Evented",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"esri/graphic",
	"esri/symbols/SimpleFillSymbol",
	'js/model/user'
], function(Evented,declare,on,lang,Graphic,SimpleFillSymbol,User){
    return declare([Evented], {
		constructor: function(splashController, mapController){
			this.splashController = splashController;
			this.mapController = mapController;
			
			this.user = new User();
			this.reset();
			on(document.getElementById("login-button"), "click", lang.hitch(this, "authenticate"));
			///on(document.getElementById("logout-button"), "click", lang.hitch(this, "logout"));
			
			document.getElementById("login-button").disabled = false;
		},
		
		authenticate:function()
		{
			this.splashController.wait();
			this.user.authenticate(
				document.getElementById("login-username").value,
				document.getElementById("login-password").value,
				lang.hitch(this,"authenticateSuccess"),
				lang.hitch(this,"authenticateError")
			);
		},
		
		authenticateSuccess:function()
		{
			this.splashController.hide();
			var graphic = new Graphic();
			graphic.geometry = this.user.geometry();
			graphic.symbol = new SimpleFillSymbol(
				{
				  "type": "esriSFS",
				  "style": "esriSFSNull",
				  "color": [255,255,255,0],
					"outline": {
					 "type": "esriSLS",
					 "style": "esriSLSSolid",
					 "color": [249,178,51,255],
					 "width": 1
					 }
				}
			);
			
			
			this.mapController.addGraphic(graphic);
			this.emit("authenticate", {});
			this.hide();
		},
		
		authenticateError:function(error)
		{
			this.splashController.hide();
			document.getElementById("login-error").innerHTML = error;
		},
		
		logout:function()
		{
			this.user.logout();
			this.show();
		},
		
		reset:function()
		{
			document.getElementById("login-username").value="Nom d'utilisateur";
			if(this.user.userName)
				document.getElementById("login-username").value=this.user.userName;
			else
				document.getElementById("login-password").value="";
		},
		
		show:function()
		{
			this.reset();
			document.getElementById("login-form").style.display = "block";
		},
		
		hide:function()
		{
			document.getElementById("login-form").style.display = "none";
		}
    });
});