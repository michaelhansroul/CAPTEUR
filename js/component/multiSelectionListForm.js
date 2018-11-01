define([
	"js/component/editForm",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"dojo/dom-class"
], function(EditForm,declare,on,lang,domClass){
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
			
		isJsonString:function(str) {
			try {
				JSON.parse(str);
			} catch (e) {
				return false;
			}
			return true;
		},
				
		initialize:function(data,subTypeCodedValues)
		{			
			this.isChange = false;
			this.values = [];
			this.currentOtherValue=null;
			this.items = {};
			
			this.data = data;
			this.title("Poubelle");
			this.subTitle(data.field.alias);
			
			if(this.data.value)
			{
				if(this.isJsonString(this.data.value))
				{
					this.values = JSON.parse(this.data.value);
				}
				else
				{
					this.values.push(this.data.value);
				}
			}
			
			var wrapper = document.createElement("div");
			wrapper.className = "wrapper-form";
			
			var description = document.createElement("div");
			description.className="description";
			description.innerHTML = "Sélectionner une ou plusieurs valeur";
			
			var list = document.createElement("div");
			list.className = "list";
			
			var codedValues = []
			if(subTypeCodedValues)
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
			
			codedValues.sort(this.compare);
			
			for(var i=0;i<codedValues.length;i++)
			{
				var item = this.createItem(codedValues[i]);
			
				if(data.configField && data.configField.enableOther && codedValues[i].code ==  data.configField.otherDefaultValue)
				{
					continue;
				}
				
				list.appendChild(item);
				this.items[codedValues[i].code] = item;
			}
			
			if(data.configField && data.configField.enableOther)
			{
				this.currentOtherValue = "";
				
				for(var t=0;t<this.values.length;t++)
				{
					var found = false;
					for(var i=0;i<codedValues.length;i++)
					{
						if(codedValues[i].code==this.values[t])
						{
							found = true;
							break;
						}
					}
					
					if(!found)
					{
						this.currentOtherValue = this.values[t];
						break;
					}
				}
				
				var item = document.createElement("div");
				item.className = "item other";
				
				var divIcon = document.createElement("div");
				divIcon.className = "containerIcon";
				var icon = document.createElement("span");
				if(this.currentOtherValue)
					icon.className="icon check active";
				else
					icon.className="icon check";
				divIcon.appendChild(icon);

				var value = document.createElement("div");
				value.className = "value";
				
				var input = document.createElement("input");
				input.type="text";
				input.placeholder = "Autre";
				
				if(this.currentOtherValue)
					input.value=this.currentOtherValue;
				
				$(input).on('input',lang.hitch(this,"otherChange",input,icon));
				on(divIcon,"click",lang.hitch(this,"otherSelect",input,icon));
				
				value.appendChild(input);
				
				var clear = document.createElement("div");
				clear.className = "clear";
				
				item.appendChild(divIcon);
				item.appendChild(value);
				item.appendChild(clear);
				list.appendChild(item);
				this.items['_other_'] = item;
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
			icon.className="icon check";
			divIcon.appendChild(icon);
				
			on(item,"click",lang.hitch(this,"select",codedValue,icon));
			
			var value = document.createElement("div");
			value.className = "value";
			value.innerHTML = codedValue.name.capitalize();
			
			var index = this.values.indexOf(codedValue.code);
			if(index>=0)
			{
				domClass.add(icon,'active');
			}
			
			item.appendChild(divIcon);
			item.appendChild(value);
			return item;
		},
		
		otherSelect:function(input,otherIcon)
		{
			this.isChange = true;
			var item = this.items["_other_"];
			var icon = item.firstElementChild.firstElementChild;
			
			if(domClass.contains(icon,'active'))
			{
				domClass.remove(icon,'active');
				if(this.currentOtherValue){
					var index = this.values.indexOf(this.currentOtherValue);
					if(index==-1)
					{
						alert("Code not found !!!");
						return;
					}
					
					this.values.splice(index,1);
				}
			}
			else
			{
				var value = input.value;
				this.currentOtherValue = value;
				if(value)
					this.values.push(value);
				domClass.add(icon,'active');
			}
		},
		
		otherChange:function(input)
		{
			this.isChange = true;
			var item = this.items["_other_"];
			var icon = item.firstElementChild.firstElementChild;
			var value = input.value;
			if(domClass.contains(icon,'active'))
			{
				//domClass.remove(icon,'active');
				
				if(this.currentOtherValue){
					var index = this.values.indexOf(this.currentOtherValue);
					if(index==-1)
					{
						alert("Code not found !!!");
						return;
					}
					
					this.values.splice(index,1);
				}
				
				var value = input.value;
				this.currentOtherValue = value;
				if(value)
					this.values.push(value);
			}
			/*else
			{
				this.values.push(value);
				domClass.add(icon,'active');
			}*/
		},
		
		select:function(codedValue)
		{
			this.isChange = true;
			var item = this.items[codedValue.code];
			var icon = item.firstElementChild.firstElementChild;
			
			if(domClass.contains(icon,'active'))
			{
				domClass.remove(icon,'active');
				var index = this.values.indexOf(codedValue.code);
				if(index==-1)
				{
					alert("Code not found !!!");
					return;
				}
				
				this.values.splice(index,1);
			}
			else
			{
				this.values.push(codedValue.code);
				domClass.add(icon,'active');
			}
		},
		
		valid:function()
		{
			if(this.data.configField && this.data.configField.validConstraint)
			{
				var constraintData;
				if(this.data.isFeature)
					constraintData = this.poubelleController.getFeatureDataByName(this.data.configField.validConstraint.logic.fieldName);
				else 
					constraintData = this.poubelleController.getTableDataByName(this.data.configField.validConstraint.logic.fieldName);
				
				if(constraintData.value == this.data.configField.validConstraint.logic.value && this.values.length<3)
				{
					this.poubelleController.splashController.info({
					"text":this.data.configField.validConstraint.message,
					"button":
						{
							"text":"OK",
							"callback":lang.hitch(this,function(){
								this.poubelleController.splashController.hide();
							})
						}
					
					});
					return;
				}
			}
			
			if(this.isChange)
			{
				this.data.isChange = true;
				if(this.values.length>0)
					this.data.value = JSON.stringify(this.values);
				else
					this.data.value = null;
				/*if(this.data.isSubtype)
				{
					//Change other value
					for(var i=0;i<this.data.types.length;i++)
					{
						if(this.data.types[i].id==this.data.value)
						{
							debugger;
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
				}*/
			}
			
			this.hide();
		}
	
	});
});