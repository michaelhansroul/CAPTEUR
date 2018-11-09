
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
        isShow: false,
        patchSizeList: ['medium','x-small', 'small', 'large', 'x-large'],
        sizeList: [800,320, 640, 1280, 1600, 1900],
        indexPatchSize: 0,
        indexSizeList: 0,
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

			var self = this;
			$(document.getElementById("fileBarcode")).on("change", function (e) {
			    if (e.target.files && e.target.files.length) {
			        self.decode(URL.createObjectURL(e.target.files[0]));
			    }
			});
		},
		
		initialize:function(entity)
		{
			this.entity = entity;
		},
		
		show:function(data)
		{
			document.getElementById("scan-code").innerHTML = "";
			this.code = "";
			this.image.src = "";

			this.data = data;
			this.isShow = true;
	
			document.getElementById("scan-form").className = "form active";
			this.refreshSizeImage();
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
			if(this.code){
				this.data["barCode"]={
					code:this.code,
				};
				this.hide();
				this.emit("next",{"next":"attachments","data":this.data});
			}
			else{
				this.splashController.info({
					"text":"Scanner un code-barres.",
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

		scan:function(){
		    var self = this;
		    this.indexPatchSize = 0;
		    this.indexSizeList = 0;
			
			/*var formElement = document.createElement("form");
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
			fileJson.type = "hidden";
			fileJson.name = "f";
			fileJson.value = "json";
			
			formElement.asppendChild(fileJson);
			
			document.body.appendChild(formElement);*/
			var fileElement = document.getElementById("fileBarcode");
			fileElement.click();
			event.preventDefault();
			this.splashController.wait();
		},

		decode: function (src) {
		    console.log("Decode:" + this.patchSizeList[this.indexPatchSize]);
            var self = this;

            scanConfig.numOfWorkers = this.core.numOfWorkers;
            scanConfig.locator.patchSize = this.patchSizeList[this.indexPatchSize];
            scanConfig.inputStream.size = this.sizeList[this.indexSize];

            var config = $.extend({}, scanConfig, { src: src });

            Quagga.decodeSingle(config, function (result) {
				if(result && result.codeResult && result.codeResult.code) {
					self.code = result.codeResult.code;
					var canvas = Quagga.canvas.dom.image;
					document.getElementById("scan-code").innerHTML = self.code;
					self.image.src = canvas.toDataURL();
					self.refreshSizeImage();
					self.splashController.hide();
				} else {
				    self.indexPatchSize++;
				    if (self.indexPatchSize < self.patchSizeList.length)
				    {
				        self.decode(src);
				        return;
				    }

				    self.indexPatchSize = 0;
				    self.indexSizeList++;
				    if (self.indexSizeList < self.sizeList.length) {
				        self.decode(src);
				        return;
				    }

					self.splashController.info({
						"text":"Code-barres non détecté.",
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