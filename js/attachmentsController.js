define([
	"dojo/Evented",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"js/config",
	"esri/graphic"
], function(Evented,declare,on,lang,config,Graphic){
    return declare([Evented], {
		isShow:false,
		constructor: function(core){
			this.core = core;
			this.splashController = this.core.splashController;
			this.user = this.core.loginController.user;
			this.container = document.getElementById("attachments-form");
			this.hide();
			
			//on(window, 'resize', lang.hitch(this, "refresh"));
			on(document.getElementById("attachments-close"), "click", lang.hitch(this, "hide"));
			on(document.getElementById("attachments-form-valid-button"), "click", lang.hitch(this, "valid"));
		},
		
		initialize:function(entity)
		{
			this.entity = entity;
		},
		
		show:function(data)
		{
			this.data = data;
			this.isShow = true;
	
			document.getElementById("attachments-form").className = "form active";
			//document.getElementById("scan-title").innerHTML = this.entity.name;
		},
		
		hide:function()
		{
			this.splashController.hide();
			this.isShow = false;
			document.getElementById("attachments-form").className = "form";
			this.emit("hide");
		},
		
		valid:function()
		{
			this.hide();
            this.emit("next",{"next":"validation","data":this.data});
		}
    });
});