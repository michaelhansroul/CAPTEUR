define([
	"dojo/Evented",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang"
], function(Evented,declare,on,lang){
    return declare([Evented], {
		
		constructor: function(splashController){
			this.splashController = splashController;
			this.container = document.getElementById("attachments-wrapper-page");
			on(document.getElementById("attachments-close"), "click", lang.hitch(this, "hide"));
			on(document.getElementById("attachments-add"), "click", lang.hitch(this, "add"));
			on(document.getElementById("attachments-remove"), "click", lang.hitch(this, "remove",false));
		},
		
		clear:function(){
			while (this.container.firstChild) {
				this.container.removeChild(this.container.firstChild);
			}
		},
		
		show:function(data)
		{
			this.clear();
			this.data=data;
			this.isShow = true;
			this.currentPhotoIndex = 0;
			
			document.getElementById("attachments").className = "form active";
			document.getElementById("attachments-title").innerHTML = this.data.title;
			document.getElementById("attachments-subtitle").innerHTML = data.field.alias;
			
			var slider = document.createElement("div");
			slider.className="attachmentsslider";
			this.container.appendChild(slider);
			
			$(".attachmentsslider").slick({
				dots: false,
				infinite: true,
				speed: 500,
				slidesToShow: 1,
				slidesToScroll: 1,
				adaptiveHeight: false,
				nextArrow: document.getElementById("attachments-pager-next"),
				prevArrow: document.getElementById("attachments-pager-back")
			});
			$('.attachmentsslider').on('beforeChange',lang.hitch(this,"beforeChange"));
			
			this.splashController.wait();
			this.load().then(lang.hitch(this,function(){
				this.initializeAttachments();
				this.splashController.hide();
			}));
		},
		
		hide:function()
		{
			this.data.isChange = this.isChange(this.data);
			this.isShow = false;
			document.getElementById("attachments").className = "form";
			this.emit("hide");
		},
		
		load:function()
		{
			return new Promise(lang.hitch(this,function(resolve, reject) {
				if(!this.data.oid){ resolve(); return;}
			if(this.data.attachmentsLoad){ resolve(); return;}
				this.data.layer.queryAttachmentInfos(this.data.oid).then(
					lang.hitch(this,function(attachments){
						for(var i=0;i<attachments.length;i++)
						{
							this.addRemoteImage(attachments[i]);
						}
						this.data.attachmentsLoad=true;
						resolve();
						}),
					lang.hitch(this,function(error){alert("error");reject();})
				);
			}));
		},
		
		currentAttachment:function()
		{
			if(this.data.attachments.length>0)
				return this.data.attachments[this.currentPhotoIndex];
			else 
				return null;
		},
		
		initializeAttachments:function()
		{
			for(var i=0;i<this.data.attachments.length;i++)
			{
				this.addAttachment(this.data.attachments[i]);
			}
			
			this.refreshPager();
			this.refreshSizeAttachments(this.data.attachments);
		},
		
		add:function(event)
		{
			var self = this;
			
			var formElement = document.createElement("form");
			formElement.enctype = "multipart/form-data";
			formElement.method = "post";
			
			var fileElement = document.createElement("input");
			fileElement.type = "file";
			fileElement.name = "attachment";
			fileElement.accept = "image/*";
			fileElement.capture = "true";
			fileElement.style.display = "none";
			formElement.appendChild(fileElement);
			
			var fileJson = document.createElement("input");
			fileJson.name = "f";
			fileJson.value = "json";
			
			formElement.appendChild(fileJson);
			
			document.body.appendChild(formElement);
			
			on(fileElement,"click",lang.hitch(this,function(files){
				fileElement.value = null;
			}));
			
			on(fileElement,"change",lang.hitch(this,function(evt){
				var tgt = evt.target || window.event.srcElement,
				files = tgt.files;
				// FileReader support
				if (FileReader && files && files.length) {
					var fr = new FileReader();
					self.splashController.wait();
					fr.onload = function () {
						self.addLocalImage(fr.result,formElement);
						self.splashController.hide();
					}
					fr.readAsDataURL(files[0]);
				}

				// Not supported
				else {
					// fallback -- perhaps submit the input to an iframe and temporarily store
					// them on the server until the user's session ends.
				}
			}));
			
			fileElement.click();
			event.preventDefault();
		},
		
		addRemoteImage:function(attachment)
		{
			var div = document.createElement("div");
			div.className = "imageContainer";
			var img = document.createElement("img");
			img.src = attachment.url;
			div.appendChild(img);
			
			this.data.attachments.push({
				info:attachment,
				element:div,
				isLocal:false
			});
		},
		
		addLocalImage:function(image,formElement)
		{
			var div = document.createElement("div");
			div.className = "imageContainer";
			var img = document.createElement("img");
			img.src = image;
			div.appendChild(img);
			//this.container.appendChild(div);
			//$('.attachmentsslider').slickAdd(div);
			//this.refreshSlider();
			$('.attachmentsslider').slick('slickAdd',div);
			//var currentSlide = $('.attachmentsslider').slick('slickCurrentSlide');
			//$('.attachmentsslider').slick('setPosition');
			
			this.data.attachments.push({
				element:div,
				formElement:formElement,
				isLocal:true
			});
			
			this.currentPhotoIndex = this.data.attachments.length-1;
			this.refreshSizeAttachment(this.data.attachments[this.currentPhotoIndex]);
			$('.attachmentsslider').slick('slickGoTo', this.currentPhotoIndex);
			this.refreshPager();
			
		},
		
		addAttachment:function(attachment)
		{
			$('.attachmentsslider').slick('slickAdd',attachment.element);
		},
		
		removeServerAttachments:function(data)
		{
			var newAttachments = [];
			for(var i=0;i<data.attachments.length;i++)
			{
				if(data.attachments[i].isLocal)
				{
					newAttachments.push(data.attachments[i]);
				}
			}
			
			data.attachments = newAttachments;
			
			data.removeAttachments = [];
			data.isChange = this.isChange(data);
		},
		
		remove:function(removeDirect)
		{
			if(this.currentAttachment())
			{
				if(!removeDirect)
				{
					this.splashController.info({
						"text":"Supprimer la photo ?",
						"buttons":[
							{
								"text":"OK",
								"callback":lang.hitch(this,function(){
									this.splashController.hide();
									this.remove(true);
								})
							},
							{"text":"ANNULER","callback":lang.hitch(this,function(){
								this.splashController.hide();
							})}
						]
					});
					return;
				}
				
				var saveCurrent = this.currentAttachment();
				$('.attachmentsslider').slick('slickRemove',this.currentPhotoIndex);
				this.data.attachments.splice(this.currentPhotoIndex, 1);
				
				if(this.currentPhotoIndex-1>=0)
					this.currentPhotoIndex--;
				else if(this.data.attachments.length>0)
					this.currentPhotoIndex = this.data.attachments.length-1;
				else
					this.currentPhotoIndex = 0;
				
				this.refreshPager();
				
				if(!saveCurrent.isLocal)
				{
					this.data.removeAttachments.push(saveCurrent);
				}
			}
		},
		
		refreshPager:function()
		{
			if(this.data.attachments.length>0)
				document.getElementById("attachments-pager").innerHTML = (this.currentPhotoIndex+1).toString()+"/"+(this.data.attachments.length).toString();		
			else 
				document.getElementById("attachments-pager").innerHTML = "";
		},
		
		refreshSizeAttachments:function(attachments)
		{
			if(attachments.length==0)return;
			for(var i=0;i<attachments.length;i++)
			{
				this.refreshSizeAttachment(attachments[i]);
			}
		},
		
		refreshSizeAttachment:function(attachment)
		{
			
			var height = this.container.offsetHeight - 54*2;
			var width = this.container.offsetWidth;

			var image = attachment.element.firstChild;
			//image.style.maxWidth  = width.toString()+"px";
			attachment.element.style.width = width.toString()+"px";
			attachment.element.style.height = height.toString()+"px";
			image.style.maxHeight  = height.toString()+"px";
			image.style.maxWidth  = width.toString()+"px";
			
		},
		
		beforeChange:function (event, slick, currentSlide, nextSlide) 
		{
			this.currentPhotoIndex = nextSlide;
			this.refreshPager();
		},
		
		refresh:function()
		{
			
		},
		
		initialize:function(data)
		{
			
		},
		
		count:function(data)
		{
			if(!data)return 0;
			return data.attachments.length;
		},
		
		isChange:function(data)
		{
			for(var i=0;i<data.attachments.length;i++)
			{
				if(data.attachments[i].isLocal)
					return true;
			}
			
			for(var i=0;i<data.removeAttachments.length;i++)
			{
				if(!data.removeAttachments[i].isLocal)
					return true;
			}
		},
		
		save:function(data,oid)
		{
			if(!data || !oid)
			{
				return Promise.resolve();
			}
			
			var promises = [];
			for(var i=0;i<data.attachments.length;i++)
			{
				if(data.attachments[i].isLocal){
					var formData = new FormData(data.attachments[i].formElement);
					promises.push(data.attachmentsLayer.addAttachment(oid,formData));
				}
			}
			
			var removeIds = [];
			for(var i=0;i<data.removeAttachments.length;i++)
			{
				if(!data.removeAttachments[i].isLocal){
					removeIds.push(data.removeAttachments[i].info.id);
				}
			}
			
			if(removeIds.length>0)
			{
				promises.push(data.attachmentsLayer.deleteAttachments(oid,removeIds));
			}
			
			return Promise.all(promises);
		},
    });
});