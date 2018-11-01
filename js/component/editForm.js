define([
	"dojo/Evented",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang"
], function(Evented,declare,on,lang){
    return declare([Evented], {
		constructor: function(){
			this.container = document.getElementById("edit-wrapper-page");
			this.hide();
		},
		
		clear:function(){
			while (this.container.firstChild) {
				this.container.removeChild(this.container.firstChild);
			}
		},
		
		show:function(data,options)
		{
			this.clear();
			this.handlerClose = on(document.getElementById("edit-close"), "click", lang.hitch(this, "hide"));
			this.handlerEdit = on(document.getElementById("edit-form-button"),"click",lang.hitch(this,"valid"));
			
			this.initialize(data,options);
			this.isShow = true;
			document.getElementById("edit-form").className = "form active";
			this.title(data.title);
			this.afterShow();
		},
		
		afterShow:function()
		{
			
		},
	
		hide:function()
		{
			if(this.handlerClose)
			{
				this.handlerClose.remove();
				this.handlerClose =null;
			}
			if(this.handlerEdit)
			{
				this.handlerEdit.remove();
				this.handlerEdit =null;
			}
			this.isShow = false;
			document.getElementById("edit-form").className = "form";
			this.emit("hide");
		},
		
		initialize:function(data)
		{
			
		},
		
		title:function(value)
		{
			document.getElementById("edit-title").innerHTML = value;
		},
		
		subTitle:function(value)
		{
			document.getElementById("edit-subtitle").innerHTML = value;
		},
		
		valid:function()
		{
		}
    });
});