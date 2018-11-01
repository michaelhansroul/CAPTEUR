define([
	"js/component/editForm",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang"
], function(EditForm,declare,on,lang){
    return declare([EditForm], {
		constructor: function(){
		},
		
		initialize:function(data)
		{
			this.data = data;
			this.inputChange=false;
			this.value=null;
			
			this.title("Poubelle");
			this.subTitle(data.field.alias);
			
			var wrapper = document.createElement("div");
			wrapper.className = "wrapper-form";
			
			var description = document.createElement("div");
			description.className="description";
			description.innerHTML = "Saisie d'un nombre entier.";

			this.input = document.createElement("input");
			this.input.className="input";
			this.input.value = data && data.value ? data.value : "";
			this.input.type = "text";
			
			wrapper.appendChild(description);
			wrapper.appendChild(this.input);
			this.container.appendChild(wrapper);
			
			$(this.input).on('input',lang.hitch(this,"change"));
		},
		
		change:function()
		{
			
			this.input.value=this.input.value.replace(/[^0-9]/g,'');
			this.inputChange = true;
			this.value = this.input.value;
		},
		
		valid:function()
		{
			if(this.inputChange)
			{
				this.data.isChange = true;
				this.data.value = this.value;
			}
			
			this.hide();
		}
				
    });
});