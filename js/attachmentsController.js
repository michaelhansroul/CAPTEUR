define([
	"dojo/Evented",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"js/config",
	"esri/graphic"
], function(Evented,declare,on,lang,config,Graphic){
    return declare([Evented], {
		isShow:false,
		constructor: function(core){
			this.core = core;
			this.splashController = this.core.splashController;
			this.user = this.core.loginController.user;
			this.container = document.getElementById("attachments-form");
			this.image = document.getElementById("attachments-image");
			this.hide();
			
			//on(window, 'resize', lang.hitch(this, "refresh"));
			on(document.getElementById("attachments-close"), "click", lang.hitch(this, "hide"));
			on(document.getElementById("attachments-form-valid-button"), "click", lang.hitch(this, "valid"));
			on(document.getElementById("attachments-form-photo-button"), "click", lang.hitch(this, "photo"));
		},
		
		initialize:function(entity)
		{
			this.entity = entity;
		},
		
		show:function(data)
		{
			this.data = data;
			this.isShow = true;
			this.image.src = "";
			this.src = "";
			this.form = "";
			this.file = null;
			this.refreshSizeImage();
			document.getElementById("attachments-form").className = "form active";
			//document.getElementById("scan-title").innerHTML = this.entity.name;
		},

		photo:function(){
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
						//self.addLocalImage(fr.result,formElement);
						self.src = URL.createObjectURL(files[0]);
						self.form = formElement;
						self.file = files[0];
						self.image.src=self.src;
						self.refreshSizeImage();
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
		
		hide:function()
		{
			this.splashController.hide();
			this.isShow = false;
			document.getElementById("attachments-form").className = "form";
			this.emit("hide");
		},
		
		valid:function()
		{
			if(this.form){
				this.data["attachment"]={
					formElement:this.form,
					src:this.src,
					file:this.file
				};
				this.hide();
				this.emit("next",{"next":"validation","data":this.data});
			}else {
				this.splashController.info({
					"text":"Ajouter une photo de la poubelle.",
					"button":
						{
							"text":"OK",
							"callback":lang.hitch(this,function(){
								this.splashController.hide();
							})
						}
					
				});
			}
		},

		refreshSizeImage:function()
		{
			var height = this.container.offsetHeight - 54*2;
			var width = this.container.offsetWidth;

			this.image.style.maxHeight  = height.toString()+"px";
			this.image.style.maxWidth  = width.toString()+"px";
		}
    });
});