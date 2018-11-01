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
			this.selectChange = null;
			this.value = null;
			
			this.data = data;
			this.title("Poubelle");
			this.subTitle(data.field.alias);
			
			var wrapper = document.createElement("div");
			wrapper.className = "wrapper-form";
			
			var description = document.createElement("div");
			description.className="description";
			
			if(!data.isMultipleSelection)
				description.innerHTML = "Sélectionner une valeur";
			else
				description.innerHTML = "Sélectionner une ou plusieurs valeur";
			
			var items = document.createElement("div");
			items.className = "items";
			
			for(var i=0;i<data.configField.codedValues.length;i++)
			{
				var item = document.createElement("div");
				item.className = "item";
				
				if(this.data.value ==data.configField.codedValues[i].code)
				{
					item.className+=" active";
					this.item=item;
				}
				
				var icon = document.createElement("div");
				icon.className="icon";
				
				var img = document.createElement("img");
				img.src = data.configField.codedValues[i].icon;
				
				icon.appendChild(img);
				
				on(item,"click",lang.hitch(this,"select",data.configField.codedValues[i],item));
				
				var value = document.createElement("div");
				value.className = "value";
				value.innerHTML = data.configField.codedValues[i].name;
				
				item.appendChild(icon);
				item.appendChild(value);
				
				items.appendChild(item);
			}
			
			var clear = document.createElement("div");
			clear.className = "clear";
			items.appendChild(clear);	
			
			wrapper.appendChild(description);
			wrapper.appendChild(items);
			this.container.appendChild(wrapper);
		},
		
		select:function(codedValue,item)
		{
			this.selectChange = true;
			if(!this.data.isMultipleSelection)
			{
				if(this.item)
				{
					this.item.className = "item"
				}
				this.value = codedValue.code;
				this.item = item;
				item.className = "item active";
			}
		},
				
		
		valid:function()
		{
			if(this.selectChange)
			{
				this.data.isChange = true;
				this.data.value = this.value;
			}
			
			this.hide();
		}
	
	});
});