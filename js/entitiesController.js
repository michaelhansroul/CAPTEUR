define([
	"dojo/Evented",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"js/config",
], function(Evented,declare,on,lang,config){
    return declare([Evented], {
		constructor: function(){
			this.container = document.getElementById("entities-form");
			var child=(this.container.firstElementChild||this.container.firstChild)
				
			for(var i=0;i<config.entities.length;i++)
			{
				child.appendChild(this.create(config.entities[i]));
			}
			this.hide();
		},
		
		create:function(entity)
		{
			var entityButton = document.createElement("INPUT");
			entityButton.type="button";
			entityButton.value = entity.name;
			on(entityButton,"click",lang.hitch(this,function(){
				this.select(entity);
				this.hide();
			}));
			return entityButton;
		},

		select:function(entity){
			this.entity = entity;
			this.emit("select",entity);
		},
		
		show:function()
		{
			document.getElementById("entities-form").style.display = "block";
		},
		
		hide:function()
		{
			document.getElementById("entities-form").style.display = "none";
		}
    });
});