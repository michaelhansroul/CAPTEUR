
var scanConfig = {
	inputStream: {
		size: 800,
		singleChannel: false
	},
	locator: {
		patchSize: "medium",
		halfSample: true
	},
	decoder: {
		readers: [{
			format: "code_128_reader",
			config: {}
		}]
	},
	locate: true,
	src: null
};

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
			this.container = document.getElementById("scan-form");
			this.image = document.getElementById("scan-image");
			this.hide();
			
			//on(window, 'resize', lang.hitch(this, "refresh"));
			on(document.getElementById("scan-close"), "click", lang.hitch(this, "hide",true));
			on(document.getElementById("scan-form-valid-button"), "click", lang.hitch(this, "valid"));
			on(document.getElementById("scan-form-photo-button"), "click", lang.hitch(this, "scan"));
		},
		
		initialize:function(entity)
		{
			this.entity = entity;
		},
		
		show:function(data)
		{
			this.data = data;
			this.isShow = true;
	
			document.getElementById("scan-form").className = "form active";
			this.refreshSizeImage();
			
			document.getElementById("scan-subtitle").innerHTML = "Association";
		},
		
		hide:function(checkChange)
		{
			this.splashController.hide();
			this.isShow = false;
			document.getElementById("scan-form").className = "form";
			this.emit("hide");
		},
		
		valid:function()
		{
            this.hide();
            this.emit("next",{"next":"attachments","data":this.data});
		},

		scan:function(){
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
						self.decode(URL.createObjectURL(files[0]));
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

		decode: function(src) {
            var self = this;

			scanConfig.src = src;

            Quagga.decodeSingle(scanConfig, function(result) {
				if(result && result.codeResult && result.codeResult.code) {
					var code = result.codeResult.code;
					var canvas = Quagga.canvas.dom.image;
					document.getElementById("scan-code").innerHTML = code;
					self.image.src = canvas.toDataURL();
					self.refreshSizeImage();
				} else {
					self.splashController.info({
						"text":"Code bar non détecté.",
						"button":
							{
								"text":"OK",
								"callback":lang.hitch(this,function(){
									self.splashController.hide();
								})
							}
						
					});
				}
			});
		},

		refreshSizeImage:function()
		{
			
			var height = this.container.offsetHeight - 54*2 - 20;
			var width = this.container.offsetWidth;

			this.image.style.maxHeight  = height.toString()+"px";
			this.image.style.maxWidth  = width.toString()+"px";
		}
		
    });
});