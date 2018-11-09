define(
	[
		"dojo/_base/declare",
		"dojo/on",
		'js/config',
		"dojo/_base/lang",
		'js/loginController',
		'js/entitiesController',
		'js/mapController',
		'js/searchController',
		'js/addController',
		'js/gpsController',
		'js/splashController',
		'js/scanController',
		'js/attachmentsController',
		'js/validationController',
		'js/layer/tableLayer',
		'esri/layers/FeatureLayer',
		"esri/config",
		"esri/tasks/GeometryService",
		"dojo/domReady!"
	],
function(
	declare,
	on,
	config,
	lang,
	LoginController,
	EntitiesController,
	MapController,
	SearchController,
	AddController,
	GpsController,
	SplashController,
	ScanController,
	AttachmentsController,
	ValidationController,
	TableLayer,
	FeatureLayer,
	esriConfig,
	GeometryService
	){
    return declare(null, {
        numOfWorkers:0,
		constructor: function(core){
			
			esriConfig.geometryService = new GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
			if(config.proxy)
			{
				esriConfig.defaults.io.proxyUrl = config.proxy;
				esriConfig.defaults.io.alwaysUseProxy = true;
			}
			
			this.splashController = new SplashController();
			
			this.mapController = new MapController(this.splashController);
			
			this.loginController = new LoginController(this.splashController,this.mapController);
			this.loginController.on("authenticate",lang.hitch(this,"authenticate"));
			
			this.entitiesController = new EntitiesController();	
			this.entitiesController.on("select",lang.hitch(this,"selectEntity"));

			this.gpsController = new GpsController(this.mapController,this.splashController);
			
			this.scanController = new ScanController(this);
			this.scanController.on("hide",lang.hitch(this,"afterHidePoubelle"));
			this.scanController.on("next",lang.hitch(this,"next"));

			this.attachmentsController = new AttachmentsController(this);
			this.attachmentsController.on("hide",lang.hitch(this,"afterHidePoubelle"));
			this.attachmentsController.on("next",lang.hitch(this,"next"));

			this.validationController = new ValidationController(this);
			this.validationController.on("hide",lang.hitch(this,"afterHidePoubelle"));
			
			this.searchController = new SearchController(this.mapController,this.splashController);
			
			this.addController = new AddController(this);
			this.addController.on("add",lang.hitch(this,"add"));
			this.addController.on("update",lang.hitch(this,"update"));
			
			on(document.getElementById("close-button"), "click", lang.hitch(this, "closeMap"));

			navigator.getHardwareConcurrency(lang.hitch(this, function () {
			    this.numOfWorkers = navigator.hardwareConcurrency;
			    //alert(this.numOfWorkers);
			}));
		},
		
		closeMap:function()
		{
			this.entitiesController.show();
			this.showForm();
			this.activateDeactivate(null);
		},
		
		activateDeactivate:function(tool)
		{			
			if(this.tool)
				this.tool.deactivate();
			this.tool = null;
			if(tool)
			{
				this.tool = tool;
				this.tool.activate();
			}
		},
		
		authenticate: function()
		{
			if(config.entities.length==1)
				this.entitiesController.select(config.entities[0]);
			else
				this.entitiesController.show();
		},
		
		selectEntity:function(entity)
		{
			this.entity = entity;
			this.mapController.initialize(entity,this.loginController.user);
			this.searchController.initialize(entity);
			this.addController.initialize(entity);
			this.scanController.initialize(entity);
			this.attachmentsController.initialize(entity);
			this.validationController.initialize(entity);
			this.hideForm();
			this.gpsController.watchPosition();
		},
		
		add:function(data)
		{
			this.showForm();
			this.scanController.show(data);
		},
		
		update:function(data)
		{
			this.showForm();
			this.scanController.show(data);
		},

		next:function(data){
			this.showForm();
			if(data.next=="scan")
				this.scanController.show(data.data);
			else if(data.next=="attachments")
				this.attachmentsController.show(data.data);
			else if(data.next=="validation")
				this.validationController.show(data.data);
		},
		
		afterHidePoubelle:function()
		{
			this.hideForm();
		},
		
		showForm:function()
		{
			document.getElementById("main").style.display = "block";
			document.getElementById("overlay").style.display = "block";
		},
		
		hideForm:function()
		{
			document.getElementById("main").style.display = "none";
			document.getElementById("overlay").style.display = "none";
		}
    });
	
});