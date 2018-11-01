define([
	"js/component/editForm",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang"
], function(EditForm,declare,on,lang){
    return declare([EditForm], {
		constructor: function(poubelleController){
			this.poubelleController = poubelleController;
			String.prototype.capitalize = function() {    return (this ? this.charAt(0).toUpperCase() + this.slice(1):"");}
		},
		
		
		compare: function(a, b) {
			if (a.name.toLowerCase() == "autre" && b.name.toLowerCase() == "autre")
			 return 0;
			if (a.name.toLowerCase() == "autre")
			 return 1;
			if (b.name.toLowerCase() == "autre")
			 return -1;
		  // a doit être égal à b
		  return -1;
		},
				
		initialize:function(data,subTypeCodedValues)
		{
			this.selectChange = null;
			this.value = null;
			this.currentIcon=null;
			
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
			
			var list = document.createElement("div");
			list.className = "list";
			
			var codedValues = []
			
			if(data.configField && data.configField.codedValues)
			{
				codedValues = data.configField.codedValues;
			}
			else if(subTypeCodedValues)
			{
				codedValues = subTypeCodedValues;
			}
			else if(data.isSubtype)
			{
				for(var i=0;i<data.types.length;i++)
				{
					codedValues.push({
						code:data.types[i].id,
						name:data.types[i].name
					});
				}
			}
			else
				codedValues = data.configField.codedValues ? data.configField.codedValues : data.field.domain.codedValues;
			
			/*if(data.configField && data.configField.sort)
			{
				codedValues = codedValues.sort(function (a, b) {
				  if (a < b) return -1;
				  else if (a > b) return 1;
				  return 0;
				});
			}
			
			codedValues.sort(this.compare);*/
			
			for(var i=0;i<codedValues.length;i++)
			{	
				list.appendChild(this.createItem(codedValues[i]));
			}
			
			if(data.configField && data.configField.enableOther)
			{
				var item = document.createElement("div");
				item.className = "item";
				
				var icon = document.createElement("div");
				
				if(data.isMultipleSelection)
				{
					icon.className="icon check";
				}
				else
				{
					icon.className="icon radio";
				}
				
				var value = document.createElement("div");
				value.className = "value";
				
				var input = document.createElement("input");
				input.type="text";
				input.placeholder = "Autre";
				
				if(!this.currentIcon && this.data.value)
				{
					this.currentIcon = icon;
					icon.className+=" active";
					input.value = this.data.value;
				}
				
				$(input).on('input',lang.hitch(this,"otherChange",input,icon));
				on(item,"click",lang.hitch(this,"otherSelect",input,icon));
				
				value.appendChild(input);
				
				var clear = document.createElement("div");
				clear.className = "clear";
				
				item.appendChild(icon);
				item.appendChild(value);
				item.appendChild(clear);
				list.appendChild(item);
			}

			wrapper.appendChild(description);
			wrapper.appendChild(list);
			this.container.appendChild(wrapper);
		},
		
		createItem:function(codedValue)
		{
			var item = document.createElement("div");
			item.className = "item";
				
			var divIcon = document.createElement("div");
			divIcon.className = "containerIcon";
			var icon = document.createElement("span");
			icon.className="icon radio";
			divIcon.appendChild(icon);
				
			if(this.data.value == codedValue.code)
			{
				icon.className+=" active";
				this.currentIcon = icon;
			}
				
			on(item,"click",lang.hitch(this,"select",codedValue,icon));
			
			var value = document.createElement("div");
			value.className = "value";
			value.innerHTML = codedValue.name.capitalize();
			
			item.appendChild(divIcon);
			item.appendChild(value);
			return item;
		},
		
		otherSelect:function(input,otherIcon)
		{
			this.selectChange = true;
			if(this.currentIcon)
			{
				this.currentIcon.className = "icon radio"
			}
			this.value = input.value;
			this.currentIcon = otherIcon;
			otherIcon.className = "icon radio active";
		},
		
		otherChange:function(input,otherIcon)
		{
			if(this.currentIcon === otherIcon)
			{
				
			}
			else
			{
				this.currentIcon.className = "icon radio";
				this.currentIcon = otherIcon;
				otherIcon.className = "icon radio active";
			}
			
			this.selectChange = true;
			this.value = input.value;
		},
		
		select:function(codedValue,icon)
		{
			this.selectChange = true;
			if(!this.data.isMultipleSelection)
			{
				if(this.currentIcon)
				{
					this.currentIcon.className = "icon radio"
				}
				this.value = codedValue.code;
				this.currentIcon = icon;
				icon.className = "icon radio active";
			}
		},
				
		
		valid:function()
		{
			if(this.selectChange)
			{
				this.data.isChange = true;
				this.data.value = this.value;
				if(this.data.isSubtype)
				{
					//Change other value
					for(var i=0;i<this.data.types.length;i++)
					{
						if(this.data.types[i].id==this.data.value)
						{
							for(var fieldName in this.data.types[i].domains)
							{
								if(this.data.types[i].domains[fieldName].type == "codedValue")
								{
									var subTypeData = null;
									if(this.data.isFeature)
										subTypeData = this.poubelleController.getFeatureDataByName(fieldName);
									else
										subTypeData = this.poubelleController.getTableDataByName(fieldName);
									
									if(subTypeData)
									{
										subTypeData.value = null;
										subTypeData.isChange = true;
									}
								}
							}
							break;
						}
					}
				}
				
				if(this.data.configField && this.data.configField.updateField)
				{
						if(this.data.value == this.data.configField.updateField.logic.value)
						{
							var constraintData;
							if(this.data.isFeature)
								constraintData = this.poubelleController.getFeatureDataByName(this.data.configField.updateField.fieldName);
							else 
								constraintData = this.poubelleController.getTableDataByName(this.data.configField.updateField.fieldName);
							
							///TODO SEARCH SUBTYPE ID
							constraintData.value = this.data.configField.updateField.value;
							constraintData.isChange = true;
							if(constraintData.isSubtype)
							{
								//Change other value
								for(var i=0;i<constraintData.types.length;i++)
								{
									var types = constraintData.types[i];
									var id = types.id;
									
									console.log(id);
									if(id==constraintData.value)
									{
										console.log(">>"+id);
										debugger;
										for(var fieldName in types.domains)
										{
											if(types.domains[fieldName].type == "codedValue")
											{
												var subTypeData = null;
												if(constraintData.isFeature)
													subTypeData = this.poubelleController.getFeatureDataByName(fieldName);
												else
													subTypeData = this.poubelleController.getTableDataByName(fieldName);
												
												if(subTypeData)
												{
													subTypeData.value = null;
													subTypeData.isChange = true;
												}
											}
										}
										break;
									}
								}
							}
						}
				}
			}
			
			this.hide();
		}
	
	});
});