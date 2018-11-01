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
			this.value=null;
			this.isChange = false;
			this.currentIcon = null;
			
			codedValueOk = this.getCodedValueOk();
			
			this.title("Poubelle");
			this.subTitle(data.field.alias);
			
			var wrapper = document.createElement("div");
			wrapper.className = "wrapper-form";
			
			
			//OK/PROBLEME
			
			this.page1 = document.createElement("div");
			this.page1.className = "pageForm";
			var buttonOK = document.createElement("div");
			buttonOK.className = "button ok";
			
			this.iconOK = document.createElement("div");
			this.iconOK.className = "icon success";
			
			on(buttonOK,"click",lang.hitch(this,function(){
				this.isChange = true;
				this.value = codedValueOk.code;
				this.iconOK.className = "icon success active";
			}));
			
			
			var valueOK = document.createElement("div");
			valueOK.className = "value";
			valueOK.innerHTML = codedValueOk.name;
			var clear = document.createElement("div");
			clear.className = "clear";
			
			buttonOK.appendChild(this.iconOK);
			buttonOK.appendChild(valueOK);
			buttonOK.appendChild(clear);
			
			var buttonProbleme = document.createElement("div");
			buttonProbleme.className = "button probleme";
			
			var iconProbleme = document.createElement("div");
			iconProbleme.className = "icon close";
			
			on(buttonProbleme,"click",lang.hitch(this,function(){
				this.showPage2();
			}));
			
			var valueProbleme = document.createElement("div");
			valueProbleme.className = "value";
			valueProbleme.innerHTML = "Problème"
			var clearProbleme = document.createElement("div");
			clearProbleme.className = "clear";
			
			buttonProbleme.appendChild(iconProbleme);
			buttonProbleme.appendChild(valueProbleme);
			buttonProbleme.appendChild(clearProbleme);
			
			this.page1.appendChild(buttonOK);
			this.page1.appendChild(buttonProbleme);
			
			//LIST PROBLEME
			
			this.page2 = document.createElement("div");
			this.page2.className = "pageForm";
			
			var description = document.createElement("div");
			description.className="description";
			description.innerHTML = "Problémes ?";
			
			var list = document.createElement("div");
			list.className = "list";
			
			this.page2.appendChild(description);
			this.page2.appendChild(list);
			
			var codedValues = data.configField.codedValues ? data.configField.codedValues : data.field.domain.codedValues;
			for(var i=0;i<codedValues.length;i++)
			{
				if(codedValues[i].code == codedValueOk.code)
					continue;
				
				var item = document.createElement("div");
				item.className = "item";
				
				var icon = document.createElement("div");
				
				icon.className="problem icon check";
				
				if(this.data.value == codedValues[i].code)
				{
					icon.className+=" active";
					this.currentIcon = icon;
				}
				
				on(item,"click",lang.hitch(this,"select",codedValues[i],icon));
				
				var value = document.createElement("div");
				value.className = "problem value";
				value.innerHTML = codedValues[i].name;
				
				var clear = document.createElement("div");
				clear.className = "clear";
				
				item.appendChild(icon);
				item.appendChild(value);
				//item.appendChild(clear);
				list.appendChild(item);
			}

			
			wrapper.appendChild(this.page1);
			wrapper.appendChild(this.page2);
			this.container.appendChild(wrapper);
			
			if(!this.data.value || this.data.value ==codedValueOk.code){
				this.showPage1()
				if(this.data.value ==codedValueOk.code)
				{
					this.iconOK.className = "problem icon success active";
				}
			}
			else{
				this.showPage2();
			}
		},
		
		getCodedValueOk:function()
		{
			var codedValues = this.data.configField.codedValues ? this.data.configField.codedValues : this.data.field.domain.codedValues;
			for(var i=0;i<codedValues.length;i++)
			{
				if(codedValues[i].code == this.data.configField.codeCodedValueOk)
					return codedValues[i];
			}
			return null;
		},
		
		showPage1:function()
		{
			this.page1.style.display = "block";
			this.page2.style.display = "none";
		},
		
		showPage2:function()
		{
			this.page1.style.display = "none";
			this.page2.style.display = "block";
		},
		
		select:function(codedValue,icon)
		{
			this.isChange = true;
			
			if(this.currentIcon){
				this.currentIcon.className = "problem icon check"
			}
			
			if(this.currentIcon === icon)
			{
				this.currentIcon = null;
				this.value=this.data.configField.codeCodedValueOk;
				this.iconOK.className = "problem icon success active";
				this.showPage1();
			}
			else
			{
				this.value = codedValue.code;
				this.currentIcon = icon;
				icon.className = "problem icon check active";
			}
		},
		
		valid:function()
		{
			if(this.isChange)
			{
				this.data.isChange = true;
				this.data.value = this.value;
			}
			
			this.hide();
		}
				
    });
});