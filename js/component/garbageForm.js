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
			this.isChange=false;
			this.value=null;

			this.subTitle(data.field.alias);
			
			this.wrapper = document.createElement("div");
			this.wrapper.className = "wrapper-form garbage";
			
			this.image = document.createElement("img");
			this.image.className = "garbage";
			this.image.src = "image/garbage1.png";
			
			
		
			this.items = [];
			var code = ["D","C","B","A"];
			var found = false;
			for(var i=0;i<code.length;i++)
			{
				var item = document.createElement("div");
				item.className = "garbage-item";
				item.innerHTML = (code.length-i).toString()+"/3";
				
				if(code[i]==this.data.value)
				{
					found = true;
				}
				
				if(found)
					item.className = "garbage-item "+this.data.value;
				
				var obj = {
					element:item,
					code:code[i]
				};
				
				this.items.push(obj);
				
				
				
				this.wrapper.appendChild(item);
			}
			
			this.wrapper.appendChild(this.image);
			
			for(var i=0;i<this.items.length;i++)
			{
				var item = document.createElement("div");
				item.className = "garbage-item";
				this.wrapper.appendChild(item);
				
				var obj = this.items[i];
				obj.selectElement = item;
				on(item,"click",lang.hitch(this,"select",obj));
			}
			
			this.container.appendChild(this.wrapper);
		},
		
		afterShow:function()
		{
			this.resize();
		},
		
		select:function(item)
		{
			var found = false;
			this.isChange = true;
			this.value = item.code;
			for(var i=0;i<this.items.length;i++)
			{
				if(this.items[i]===item)
				{
					found = true;
				}
				
				if(found)
				{
					this.items[i].element.className = "garbage-item "+this.value;
				}
				else
				{
					this.items[i].element.className = "garbage-item";
				}
			}
		},
		
		resize:function()
		{
			if(!this.isShow)return;
			var height = this.container.offsetHeight - 54*2;
			var width = this.container.offsetWidth;
			
			var imageWidth = 500;
			var imageHeight = 500;
			var imageRatio = imageHeight / imageWidth;
			
			this.wrapper.style.width = width.toString()+"px";
			this.wrapper.style.height = height.toString()+"px";
			//this.image.style.maxHeight  = height.toString()+"px";
			//this.image.style.maxWidth  = width.toString()+"px";
			
			//1. image plus petit que le container
			var resizeImageWidth = imageWidth;
			var resizeImageHeight = imageHeight;
			
			if(width <= imageWidth && height >= imageHeight)
			{
				//2. image width plus grand que le container mais height plus petit
				resizeImageWidth = width;
				resizeImageHeight = resizeImageWidth * imageRatio;
			}
			else if(width >= imageWidth && height <= imageHeight)
			{
				//3. image height plus grand que le container mais width plus petit
				resizeImageHeight = height;
				resizeImageWidth = Math.round(resizeImageHeight/imageRatio);
			}
			else if(width <= imageWidth && height <= imageHeight)
			{
				//4. container plus petit
				if(width<height)
				{
					resizeImageWidth = width;
					resizeImageHeight = resizeImageWidth * imageRatio;
				}
				else
				{
					resizeImageHeight = height;
					resizeImageWidth = Math.round(resizeImageHeight/imageRatio);
				}
			}
			
			this.image.style.height  = resizeImageHeight.toString()+"px";
			this.image.style.width  = resizeImageWidth.toString()+"px";
			
			var ratio = resizeImageWidth/imageWidth;
			
			var itemHeight = Math.round((376/4)*ratio);
			var itemWidth = Math.round(320*ratio);
			
			var centerX = width * 0.5;
			var centerY = height * 0.5;
			var left = Math.round(centerX - itemWidth*0.5)
			var top = (23 * ratio) + centerY  - 2 * itemHeight;
			
			for(var i=0;i<this.items.length;i++)
			{
				this.items[i].element.style.left = left + "px";
				this.items[i].element.style.top = top + (i * itemHeight) + "px";
				this.items[i].element.style.width =  itemWidth + "px";
				this.items[i].element.style.height = itemHeight+ "px";
				this.items[i].element.style.lineHeight = itemHeight+ "px";
				
				this.items[i].selectElement.style.left = left + "px";
				this.items[i].selectElement.style.top = top + (i * itemHeight) + "px";
				this.items[i].selectElement.style.width =  itemWidth + "px";
				this.items[i].selectElement.style.height = itemHeight+ "px";
				this.items[i].selectElement.style.lineHeight = itemHeight+ "px";
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