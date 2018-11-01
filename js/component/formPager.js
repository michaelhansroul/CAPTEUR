/*
data = [
{name:"",alias:"",value:"",type:""}
]
*/
define([
	"dojo/Evented",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang"
], function(Evented,declare,on,lang){
    return declare([Evented], {
		rowHeight: 57,
		currentSlideIndex:0,
		constructor: function(container,data,poubelleController){
			this.container = container;
			this.data = data;
			this.poubelleController = poubelleController;
		},
		
		count:function()
		{
			var nbr = 0;
			for(var i=0;i<this.data.length;i++)
			{
				var group = this.data[i];
				for(var j=0;j<group.data.length;j++)
				{
					nbr++;
				}
			}
			return nbr;
		},
		
		countAttachments:function(data)
		{
			var value;
			var dataAttachment;
			if(data.isFeature){
				value = this.poubelleController.getFeatureValueByName("photo_number");
				dataAttachment = this.poubelleController.getFeatureAttachmentsData();
			}
			else
			{
				value = this.poubelleController.getTableValueByName("photo_number");
				dataAttachment = this.poubelleController.getTableAttachmentsData();
			}
			
			if(dataAttachment && (dataAttachment.attachments.length>0 || dataAttachment.removeAttachments.length>0))
				return dataAttachment.attachments.length;
			
			return (value ? value : 0);
		},
		
		refresh:function(){

			this.clear();
			var numberOfItemByPage = Math.floor((this.container.offsetHeight-54-54)/this.rowHeight)
			
			numberOfItemByPage = numberOfItemByPage;
			if(numberOfItemByPage<1)
				numberOfItemByPage =1;
			
			var slider = document.createElement("div");
			slider.className="slider";
			this.container.appendChild(slider);
			var nbrPage = 0;
			for(var i=0;i<this.data.length;i++)
			{
				var group = this.data[i];
				var page;
				for(var j=0;j<group.data.length;j++)
				{
					if(j % numberOfItemByPage==0)
					{
						this.slides.push({groupName:group.name});
						page = document.createElement("div");
						page.className="page";
						slider.appendChild(page);
						nbrPage++;
					}
					
					var row = this.create(group.data[j]);
					
					page.appendChild(row);
				}
				
				for(var j=(group.data.length%numberOfItemByPage);j<numberOfItemByPage;j++)
				{
					var row = this.create(null);
					page.appendChild(row);
				}
				
			}
			
			$(".slider").slick({
			dots: false,
			infinite: true,
			speed: 500,
			slidesToShow: 1,
			slidesToScroll: 1,
			adaptiveHeight: false,
			nextArrow: document.getElementById("pagerNext"),
			prevArrow: document.getElementById("pagerBack")
			});
			
			// On before slide change match active thumbnail to current slide
			$('.slider').on('beforeChange',lang.hitch(this,"beforeChange"));

			//$('.slider').slick('refresh');
			
			if(this.currentSlideIndex>0 && this.currentSlideIndex<nbrPage)
			{
				$('.slider').slick('slickGoTo', this.currentSlideIndex);
			}
			else
			{
				this.currentSlideIndex = 0;
			}
		},
		
		create:function(data)
		{
			var row = document.createElement("div");
			row.className="row"+(data && data.isChange ? " change":"");
			if(data)
				on(row, "click", lang.hitch(this, "edit",data));
			else
				row.className="row empty";
			

			var name = document.createElement("div");
			name.className="name";
			
			if(data && !data.field){
				console.log("pas de field !!!");
			}
			
			if(data && data.configField && data.configField.required)
				name.innerHTML = data ? data.field.alias+" <span style='color:red;'>*</span>" : "";
			else
				name.innerHTML = data ? (data.field.alias ? data.field.alias:data.field.name ) : "";
			
			var value = document.createElement("div");
			value.className="value";
			
			if(data)
			{
				if(data.isSubtype)
				{
					var found = false;
					for(var i=0;i<data.types.length;i++)
					{
						if(data.value == data.types[i].id)
						{
							value.innerHTML = data.types[i].name;
							found = true;
							break;
						}
					}
					
					if(!found)
					{
						value.innerHTML = data.value ? data.value : "&nbsp;" ;
					}
				}
				else if(data.field && data.field.type=="attachments")
				{
					value.innerHTML = this.countAttachments(data);
				}
				else if(data.value && data.field && data.field.domain && data.field.domain.codedValues)
				{
					var found = false;
					for(var i=0;i<data.field.domain.codedValues.length;i++)
					{
						if(data.value == data.field.domain.codedValues[i].code)
						{
							value.innerHTML = data.field.domain.codedValues[i].name;
							found = true;
							break;
						}
					}
					
					if(!found)
					{
						value.innerHTML = data.value;
					}
				}
				else if(data.value && data.configField && data.configField.codedValues)
				{
					var found = false;
					for(var i=0;i<data.configField.codedValues.length;i++)
					{
						if(data.value == data.configField.codedValues[i].code)
						{
							value.innerHTML = data.configField.codedValues[i].name;
							found = true;
							break;
						}
					}
					
					if(!found)
					{
						value.innerHTML = data.value;
					}
				}
				else
					value.innerHTML =  data.value ? data.value : "&nbsp;" ;
			}
			
			row.appendChild(name);
			row.appendChild(value);
			
			var editButton = document.createElement("div");
			editButton.className = "icon next"
			if(data)
				row.appendChild(editButton);
			
			return row;
		},
		
		edit:function(data)
		{
			this.emit("edit",data);
		},
		
		currentSlide:function()
		{
			return this.slides[this.currentSlideIndex];
		},
		
		beforeChange:function (event, slick, currentSlide, nextSlide) 
		{
			this.currentSlideIndex = nextSlide;
			this.emit("beforeChange", this.slides[nextSlide]);
		},

		clear:function(){
			//this.currentSlideIndex = 0;
			while (this.container.firstChild) {
				this.container.removeChild(this.container.firstChild);
			}
			this.slides = [];
		}
		
    });
});