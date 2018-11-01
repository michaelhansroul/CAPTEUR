define([
	"dojo/Evented",
    "dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"js/config",
	"js/component/formPager",
	'js/component/inputTextForm',
	'js/component/inputDoubleForm',
	'js/component/inputIntForm',
	'js/component/listForm',
	'js/component/multiSelectionListForm',
	'js/component/iconListForm',
	'js/component/problemeForm',
	'js/component/garbageForm',
	'js/component/attachments',
	"esri/graphic"
], function(Evented,declare,on,lang,config,FormPager,InputTextForm,InputDoubleForm,InputIntForm,ListForm,MultiSelectionListForm,IconListForm,ProblemeForm,GarbageForm,Attachments,Graphic){
    return declare([Evented], {
		isShow:false,
		constructor: function(core){
			this.core = core;
			this.splashController = this.core.splashController;
			this.user = this.core.loginController.user;
			this.container = document.getElementById("poubelle-form");
			this.hide();
			this.formPager = new FormPager(
				document.getElementById("poubelle-wrapper-page"),
				[],
				this
			);
			
			this.formPager.on("beforeChange",lang.hitch(this,"refreshTopBar"));
			this.formPager.on("edit",lang.hitch(this,"edit"));
			
			this.inputTextForm = new InputTextForm();
			this.inputDoubleForm = new InputDoubleForm();
			this.inputIntForm = new InputIntForm();
			this.listForm = new ListForm(this);
			this.multiSelectionListForm = new MultiSelectionListForm(this);
			this.iconListForm = new IconListForm();
			this.problemeForm = new ProblemeForm();
			this.garbageForm = new GarbageForm();
			this.attachments = new Attachments(this.splashController);
			on(this.inputTextForm,'hide',lang.hitch(this, "refresh"));
			on(this.inputDoubleForm,'hide',lang.hitch(this, "refresh"));
			on(this.inputIntForm,'hide',lang.hitch(this, "refresh"));
			on(this.listForm,'hide',lang.hitch(this, "refresh"));
			on(this.multiSelectionListForm,'hide',lang.hitch(this, "refresh"));
			on(this.iconListForm,'hide',lang.hitch(this, "refresh"));
			on(this.problemeForm,'hide',lang.hitch(this, "refresh"));
			on(this.garbageForm,'hide',lang.hitch(this, "refresh"));
			on(this.attachments,'hide',lang.hitch(this, "refresh"));
			
			on(window, 'resize', lang.hitch(this, "refresh"));
			on(document.getElementById("poubelle-close"), "click", lang.hitch(this, "hide",true));
			on(document.getElementById("poubelle-form-valid-button"), "click", lang.hitch(this, "valid"));
		},
		
		initialize:function(entity)
		{
			this.entity = entity;
		},
		
		nbrChange:function()
		{
			if(!this.formPager || !this.formPager.data)return 0;
			var nbrChange = 0;
			for(var i=0;i<this.formPager.data.length;i++)
			{
				for(var j=0;j<this.formPager.data[i].data.length;j++)
				{
					if(this.formPager.data[i].data[j].isChange)
					{
						nbrChange++;
					}
				}
			}
			return nbrChange;
		},
		
		nbrTableChangeWhitOutAttachments:function()
		{
			if(!this.formPager || !this.formPager.data)return 0;
			var nbrChange = 0;
			for(var i=0;i<this.formPager.data.length;i++)
			{
				if(this.formPager.data[i].isFeature) continue;
				for(var j=0;j<this.formPager.data[i].data.length;j++)
				{
					if(this.formPager.data[i].data[j].isChange && this.formPager.data[i].data[j].field.type != "attachments")
					{
						nbrChange++;
					}
				}
			}
			return nbrChange;
		},
		
		refreshBottomBar:function()
		{
			var nbrChange = this.nbrChange()>0 ? this.nbrChange():0
			document.getElementById("poublelle-number-of-change").innerHTML = nbrChange.toString()+"/"+(this.formPager.count());
		},
		
		refreshTopBar:function()
		{
			var slide = this.formPager.currentSlide();
			document.getElementById("poubelle-subtitle").innerHTML = slide.groupName;
			document.getElementById("poubelle-pager").innerHTML = (this.formPager.currentSlideIndex+1).toString()+"/"+(this.formPager.slides.length).toString();
		},
		
		edit:function(data)
		{
			/*if(data.type=="text")
				this.inputTextForm.show(data);
			else if(data.type=="double")
				this.inputDoubleForm.show(data);
			else if(data.type=="int")
				this.inputIntForm.show(data);
			else if(data.type=="list")
				this.listForm.show(data);*/
			
			
			if(data.configField && data.configField.openConstraint)
			{
				var constraintData;
				if(data.isFeature)
					constraintData = this.getFeatureDataByName(data.configField.openConstraint.logic.fieldName);
				else 
					constraintData = this.getTableDataByName(data.configField.openConstraint.logic.fieldName);
				if(!constraintData.value)
				{
					this.splashController.info({
					"text":"Compléter le champ " + constraintData.field.alias + " !!!",
					"button":
						{
							"text":"OK",
							"callback":lang.hitch(this,function(){
								this.splashController.hide();
							})
						}
					
					});
					return;
				}
			}
			
			var subTypeCodedValue = this.getSubtypeCodedValue(data);
			
			if(data.configField && data.configField.form && data.configField.form=="problemeForm")
			{
				this.problemeForm.show(data);
			}
			else if(data.configField && data.configField.form && data.configField.form=="iconListForm")
			{
				this.iconListForm.show(data);
			}
			else if(data.configField && data.configField.form && data.configField.form=="listForm")
			{
				this.listForm.show(data);
			}
			else if(data.configField && data.configField.form && data.configField.form=="garbageForm")
			{
				this.garbageForm.show(data);
			}
			else if(data.configField && data.configField.form && data.configField.form=="multiSelectionListForm")
			{
				if(subTypeCodedValue)
					this.multiSelectionListForm.show(data,subTypeCodedValue.codedValues);
				else
					this.multiSelectionListForm.show(data);
			}
			else if(data.isSubtype)
			{
				this.listForm.show(data);
			}
			else if(subTypeCodedValue)
			{
				this.listForm.show(data,subTypeCodedValue.codedValues);
			}
			else if(data.field.domain && data.field.domain.codedValues)
			{
				this.listForm.show(data);
			}
			else if(data.field.type=="string" || data.field.type=="esriFieldTypeString")
			{
				this.inputTextForm.show(data);
			}
			else if(data.field.type=="int" || data.field.type=="esriFieldTypeSmallInteger" || data.field.type=="esriFieldTypeInteger")
			{
				this.inputIntForm.show(data);
			}
			else if(data.field.type=="double" || data.field.type=="esriFieldTypeDouble")
			{
				this.inputDoubleForm.show(data);
			}
			else if(data.field.type=="attachments")
			{
				this.attachments.show(data);
			}
			
		},
		
		getFeatureFieldByName:function(name)
		{
			
			for(var i=0;i<this.entity.feature.layer.fields.length;i++)
			{
				var field = this.entity.feature.layer.fields[i];
				if(field.name==name)
				{
					return field;
				}
			}
			return null;
		},
		
		getFeatureFieldByType:function(type)
		{
			
			for(var i=0;i<this.entity.feature.layer.fields.length;i++)
			{
				var field = this.entity.feature.layer.fields[i];
				if(field.type==type)
				{
					return field;
				}
			}
			return null;
		},
		
		getFeatureValueByName:function(name)
		{
			if(!this.data || !this.data.feature)return null;
			if(this.data.feature.attributes && this.data.feature.attributes[name])
				return this.data.feature.attributes[name];
			return null;
		},
		
		getTableValueByName:function(name)
		{
			if(!this.data || !this.data.row)return null;
			if(this.data.row.attributes && this.data.row.attributes[name])
				return this.data.row.attributes[name];
			return null;
		},
		
		getTableFieldByName:function(name)
		{
			for(var i=0;i<this.entity.table.layer.fields.length;i++)
			{
				if(this.entity.table.layer.fields[i].name==name){
					return this.entity.table.layer.fields[i];
				}
			}
			return null;
		},
		
		getTableFieldByType:function(type)
		{
			for(var i=0;i<this.entity.table.layer.fields.length;i++)
			{
				if(this.entity.table.layer.fields[i].type==type){
					return this.entity.table.layer.fields[i];
				}
			}
			return null;
		},
		
		getFeatureDataByName:function(name)
		{
			for(var i=0;i<this.formPager.data.length;i++)
			{
				if(!this.formPager.data[i].isFeature) continue;
				for(var j=0;j<this.formPager.data[i].data.length;j++)
				{
					if(this.formPager.data[i].data[j].field.name==name)
						return this.formPager.data[i].data[j];
				}
			}
			
			return null;
		},
		
		getTableDataByName:function(name)
		{
			for(var i=0;i<this.formPager.data.length;i++)
			{
				if(this.formPager.data[i].isFeature) continue;
				for(var j=0;j<this.formPager.data[i].data.length;j++)
				{
					if(this.formPager.data[i].data[j].field.name==name)
						return this.formPager.data[i].data[j];
				}
			}
			
			return null;
		},
		
		getSubtypeCodedValue:function(data)
		{
			//if(!data.value)return;
			
			var subtypeData;
			if(data.isFeature)
				subtypeData = this.getFeatureSubtypeData();
			else
				subtypeData = this.getTableSubtypeData();
			
			if(subtypeData==null)return;
			
			var domain = this.getSubtypeDomain(subtypeData.types,subtypeData.value,data.field.name);
			return domain;
		},
		
		getSubtypeDomain:function(types,typeId,fieldName)
		{
			for(var i=0;i<types.length;i++)
			{
				if(types[i].id==typeId)
				{
					if(types[i].domains && types[i].domains[fieldName] && types[i].domains[fieldName].type=="codedValue")
						return types[i].domains[fieldName];
				}
			}
			return null;
		},
		
		getFeatureSubtypeData:function()
		{
			for(var i=0;i<this.formPager.data.length;i++)
			{
				if(!this.formPager.data[i].isFeature) continue;
				for(var j=0;j<this.formPager.data[i].data.length;j++)
				{
					if(this.formPager.data[i].data[j].isSubtype)
						return this.formPager.data[i].data[j];
				}
			}
			
			return null;
		},
		
		getTableSubtypeData:function()
		{
			for(var i=0;i<this.formPager.data.length;i++)
			{
				if(this.formPager.data[i].isFeature) continue;
				for(var j=0;j<this.formPager.data[i].data.length;j++)
				{
					if(this.formPager.data[i].data[j].isSubtype)
						return this.formPager.data[i].data[j];
				}
			}
			
			return null;
		},
		
		getFeatureAttachmentsData:function()
		{
			for(var i=0;i<this.formPager.data.length;i++)
			{
				if(!this.formPager.data[i].isFeature) continue;
				for(var j=0;j<this.formPager.data[i].data.length;j++)
				{
					if(this.formPager.data[i].data[j].field.type=="attachments")
						return this.formPager.data[i].data[j];
				}
			}
			
			return null;
		},
		
		getTableAttachmentsData:function()
		{
			for(var i=0;i<this.formPager.data.length;i++)
			{
				if(this.formPager.data[i].isFeature) continue;
				for(var j=0;j<this.formPager.data[i].data.length;j++)
				{
					if(this.formPager.data[i].data[j].field.type=="attachments")
						return this.formPager.data[i].data[j];
				}
			}
			
			return null;
		},
		
		show:function(data)
		{
			this.data = data;
			this.isShow = true;
	
			document.getElementById("poubelle-form").className = "form active";
			document.getElementById("poubelle-title").innerHTML = this.entity.name;
			
			var formDataArray = [];
			
			var formDataFeature = {};
			formDataArray.push(formDataFeature);
			
			formDataFeature.name = this.entity.feature.name;
			formDataFeature.data = [];
			formDataFeature.isFeature = true;
			
			for(var i=0;i<this.entity.feature.fields.length;i++)
			{
				formDataFeature.data.push({
					title:this.entity.name,
					field:this.getFeatureFieldByName(this.entity.feature.fields[i].name),
					value:this.getFeatureValueByName(this.entity.feature.fields[i].name),
					isSubtype: this.entity.feature.fields[i].name == this.entity.feature.layer.typeIdField,
					types:this.entity.feature.layer.types,
					isFeature:true,
					configField:this.entity.feature.fields[i]
					});
			}
			
			if(this.entity.feature.layer.hasAttachments)
			{
				formDataFeature.data.push({
					title:this.entity.name,
					field:{name:"attachments",alias:"photo",type:"attachments"},
					attachments:[],
					removeAttachments:[],
					layer:this.entity.feature.layer,
					attachmentsLayer:this.entity.feature.attachmentsLayer,
					isFeature:true,
					oid:this.data.type=="update" ? this.data.feature.attributes[this.getFeatureFieldByType("esriFieldTypeOID").name] : null
					});
			}
			
			
			if(this.entity.table)
			{
				var formDataTable = {};
				formDataArray.push(formDataTable);
				formDataTable.name = this.entity.table.name;
				formDataTable.data = [];
				formDataTable.isFeature = false;
				for(var i=0;i<this.entity.table.fields.length;i++)
				{
					formDataTable.data.push({
						title:this.entity.name,
						field:this.getTableFieldByName(this.entity.table.fields[i].name),
						isSubtype: this.entity.table.fields[i].name == this.entity.table.layer.typeIdField,
						types:this.entity.table.layer.types,
						value:this.getTableValueByName(this.entity.table.fields[i].name),
						isFeature:false,
						configField:this.entity.table.fields[i]
						});
				}
			}
			
			
			this.formPager.data = formDataArray;
			this.formPager.currentSlideIndex = 0;
			
			this.refresh();
			
		},
		
		hide:function(checkChange)
		{
			if(checkChange && this.nbrChange()>0)
			{
				this.splashController.info({
					"text":"Les changements ne seront pas sauvegardés",
					"buttons":[
						{
							"text":"CONTINUER",
							"callback":lang.hitch(this,"hide",false)
						},
						{"text":"RETOUR","callback":lang.hitch(this,function(){this.splashController.hide();})}
					]
				});
				return;
			}
			
			if(this.data)
				this.core.searchController.addGraphic(this.data.feature.geometry);
			this.splashController.hide();
			this.isShow = false;
			document.getElementById("poubelle-form").className = "form";
			this.emit("hide");
		},
		
		required:function()
		{
			if(!this.formPager || !this.formPager.data)return 0;
			var required = false;
			for(var i=0;i<this.formPager.data.length;i++)
			{
				for(var j=0;j<this.formPager.data[i].data.length;j++)
				{
					if(!this.formPager.data[i].data[j].isChange && this.formPager.data[i].data[j].configField && this.formPager.data[i].data[j].configField.required)
					{
						if(!this.formPager.data[i].data[j].value)
							required = true;
					}
				}
			}
			return required;
		},
		
		valid:function()
		{
			if(this.required()){
				this.splashController.info({
					"text":"Compléter les champs obligatoires (*)",
					"button":
						{
							"text":"OK",
							"callback":lang.hitch(this,function(){
								this.splashController.hide();
							})
						}
					
				});
				return
			};
			if(this.nbrChange()==0 && this.data.type == "update")return;
			this.splashController.info({
					"text":"Sauvegarder les modifications et revenir à la carte ?",
					"buttons":[
						{
							"text":"OK",
							"callback":lang.hitch(this,"save")
						},
						{"text":"ANNULER","callback":lang.hitch(this,function(){this.splashController.hide();})}
					]
				});
		},
		
		save:function()
		{
			this.splashController.wait();
			this.__saveFeature().then(
				lang.hitch(this,function(){
					
					this.__saveTable().then(
						lang.hitch(this,function(){
							this.entity.layer.refresh();
							this.splashController.hide();
							this.hide(false);
						}),
						lang.hitch(this,function(error){alert(error);})
					);
				}),
				lang.hitch(this,function(error){alert(error);})
			);
			/*this.__save(true,this.entity.feature.layer,this.getFeatureFieldByType("esriFieldTypeOID").name,this.data.type).then(
				lang.hitch(this,function(){
					var promise = this.__save(false,this.entity.table.layer,this.getTableFieldByType("esriFieldTypeOID").name,"add");
					promise.then(lang.hitch(this,function(){
							this.attachments.save(this.getFeatureAttachmentsData(),this.data.feature.attributes[this.getFeatureFieldByType("esriFieldTypeOID").name]).then(
								lang.hitch(this,function(){
									var tableOid = this.data.row && this.data.row.attributes ? this.data.row.attributes[this.getTableFieldByType("esriFieldTypeOID").name]:null; 
									this.attachments.save(this.getTableAttachmentsData(),tableOid).then(
										lang.hitch(this,function(){
											this.entity.layer.refresh();
											this.splashController.hide();
											this.hide(false);
										})
									);
								})
							);
						}));
				})
			);*/
		},
		
		__saveFeature:function()
		{
			return new Promise(lang.hitch(this,function(resolve, reject){
					var promise = this.__save(true,this.entity.feature.layer,this.getFeatureFieldByType("esriFieldTypeOID").name,this.data.type);
					promise.then(
						lang.hitch(this,function(){
							this.__saveHistoric(this.entity.feature,this.data.feature).then(
								lang.hitch(this,function(){
									this.attachments.save(this.getFeatureAttachmentsData(),this.data.feature.attributes[this.getFeatureFieldByType("esriFieldTypeOID").name]).then(
										lang.hitch(this,function(){/*resolve();*/
											this.__saveHistoricV2(this.entity.feature,this.data.feature).then(
												lang.hitch(this,function(){resolve();}),
												lang.hitch(this,function(error){reject(error);})
											);
										}),
										lang.hitch(this,function(error){reject(error);})
									);
								}),
								lang.hitch(this,function(error){reject(error);})
							);
						}),
						lang.hitch(this,function(error){reject(error);})
					);
			}));
		},
		
		__saveTable:function()
		{
			if(!this.entity.table) return Promise.resolve();
			return new Promise(lang.hitch(this,function(resolve, reject){
				var promise = this.__save(false,this.entity.table.layer,this.getTableFieldByType("esriFieldTypeOID").name,"add");
				promise.then(
					lang.hitch(this,function(){
						var tableOid = this.data.row && this.data.row.attributes ? this.data.row.attributes[this.getTableFieldByType("esriFieldTypeOID").name]:null; 
						this.attachments.save(this.getTableAttachmentsData(),tableOid).then(
							lang.hitch(this,function(){
								resolve();
							}),
							lang.hitch(this,function(error){reject(error);})
						);
					}),
					lang.hitch(this,function(error){reject(error);})
				);
			}));	
		},
		
		__saveHistoricV2:function(entity,feature)
		{
			if(!entity.historicv2) return Promise.resolve();
			
			var changement;
			var found = false;
			for(var i=0;i<entity.historicv2.conditions.length;i++)
			{
				var data = this.getFeatureDataByName(entity.historicv2.conditions[i].fieldName);
				if(data.isChange)
				{
					var to = data.value;
					var from = feature.attributes[entity.historicv2.conditions[i].fieldName];
					if(entity.historicv2.conditions[i].from == from && entity.historicv2.conditions[i].to ==to)
					{
						changement = entity.historicv2.conditions[i].changement;
						found = true;
						break;
					}
				}
			}
			
			if(!found) return Promise.resolve();
			
			var attributes = {};
			
			attributes[entity.historicv2.relateFieldName] = this.data.feature.attributes[this.entity.feature.relateFieldName];
			attributes["modifie_date"] = Date.now();
			attributes["modifie_nom"] = this.user.userName;
			attributes["cree_date"] = Date.now();
			attributes["cree_nom"] = this.user.userName;
			attributes["commune_ins_str"] = this.user.ins();
			attributes["changement"] = changement;
			
			///SPECIFIQUE
			for(var i=0;i<entity.historicv2.fields.length;i++)
			{
				attributes[entity.historicv2.fields[i].oldName] = feature.attributes[entity.historicv2.fields[i].name];
				var data = this.getFeatureDataByName(entity.historicv2.fields[i].name);
				if(data.isChange)
					attributes[entity.historicv2.fields[i].newName] = data.value;
				else
					attributes[entity.historicv2.fields[i].newName] = feature.attributes[entity.historicv2.fields[i].name];
			}
			
			
			var graphic =  new Graphic({
				attributes: attributes
			});
			
			return entity.historicv2.layer.applyEdits([graphic],[],[]);
		},
		
		__saveHistoric:function(entity,feature)
		{
			if(!entity.historic) return Promise.resolve();
			
			var data = this.getFeatureDataByName(entity.historic.logic.fieldName);
			if(data.isChange)
			{
				if(data.value != entity.historic.logic.value)
				{
					return Promise.resolve();
				}
			}
			else if(feature.attributes[entity.historic.logic.fieldName] != entity.historic.logic.value)
			{
				return Promise.resolve();
			}
			
			var attributes = {};
			
			attributes[entity.historic.relateFieldName] = this.data.feature.attributes[this.entity.feature.relateFieldName];
			attributes["modifie_date"] = Date.now();
			attributes["modifie_nom"] = this.user.userName;
			attributes["cree_date"] = Date.now();
			attributes["cree_nom"] = this.user.userName;
			attributes["commune_ins_str"] = this.user.ins();

			var graphic =  new Graphic({
				attributes: attributes
			});
			
			return entity.historic.layer.applyEdits([graphic],[],[]);
		},
		
		__save:function(isFeature,layer,OIDName,saveType)
		{
			return new Promise(lang.hitch(this,function(resolve, reject){
				
				var attributes = {};
				
				//// CLONE LES ATTRIBUTS DE LA TABLE 
				if(!isFeature && this.data.row)
				{
					for(var i=0;i<this.entity.table.fields.length;i++)
					{
						attributes[this.entity.table.fields[i].name]=this.data.row.attributes[this.entity.table.fields[i].name];
					}
				}
				
				/// NBR CHANGEMENT DANS LA TABLE SANS COMPTER LES PHOTOS
				var nbrChange = 0;
				for(var i=0;i<this.formPager.data.length;i++)
				{
					if(this.formPager.data[i].isFeature != isFeature) continue;
					for(var j=0;j<this.formPager.data[i].data.length;j++)
					{
						if(this.formPager.data[i].data[j].isChange && this.formPager.data[i].data[j].field.type != "attachments")
						{
							var data  = this.formPager.data[i].data[j];
							attributes[data.field.name] = data.value;		
							nbrChange++;
						}
					}
				}
				
				var attachmentsChange = false;
				if(isFeature)
					attachmentsChange = this.attachments.isChange(this.getFeatureAttachmentsData());
				else 
					attachmentsChange = this.attachments.isChange(this.getTableAttachmentsData());
				
				///saveType update jamais pour les tables
				///TODO verifier une update de feature si nbrChange==0
				if(nbrChange == 0){
					if(saveType == "update" || !isFeature)
					{
						if(!isFeature && saveType == "add" && attachmentsChange && !this.data.row)
						{
							//RELATE NON EXISITANTE A AJOUTER CAR AVEC DES PHOTOS 
						}
						else
						{
							//DOIT UPDATE NUMBER OF ATTACH
							if(!attachmentsChange)
							{
								resolve();
								return;
							}
							else if(saveType == "add" && !isFeature && this.data.row)
							{
								//SI ON A JUSTE LES PHOTOS QUI CHANGE POUR LA TABLE
								debugger;
								saveType = "update";
							}
						}
					}
				}
				
				var graphic =  new Graphic({
					attributes: attributes
				});
				
				if(saveType=="update")
				{
					///UPDATE
					attributes["modifie_date"] = Date.now();
					attributes["modifie_nom"] = this.user.userName;
					
					if(!isFeature)
						attributes["photo_number"] = this.attachments.count(this.getTableAttachmentsData());
					else
						attributes["photo_number"] = this.attachments.count(this.getFeatureAttachmentsData());
					
					if(isFeature)
						attributes[OIDName] = this.data.feature.attributes[OIDName];
					else
						attributes[OIDName] = this.data.row.attributes[OIDName];
					
					promise = layer.applyEdits([],[graphic],[]);
				}
				else
				{
					///ADD
					if(isFeature)
						graphic.geometry = this.data.feature.geometry;
					else 
					{
						attributes[this.entity.table.relateFieldName] = this.data.feature.attributes[this.entity.feature.relateFieldName];
					}
					
					attributes["modifie_date"] = Date.now();
					attributes["modifie_nom"] = this.user.userName;
					attributes["cree_date"] = Date.now();
					attributes["cree_nom"] = this.user.userName;
					attributes["commune_ins"] = this.user.ins();
					attributes["commune_ins_str"] = this.user.ins();
					
					if(!isFeature)
						attributes["photo_number"] = this.attachments.count(this.getTableAttachmentsData());
					else
						attributes["photo_number"] = this.attachments.count(this.getFeatureAttachmentsData());

					promise = layer.applyEdits([graphic],[],[]);
				}
				
				promise.then(
					lang.hitch(this,function(result){
						
						if(saveType=="add")
						{
							if(isFeature)
							{
								this.data.feature.attributes = {};
								///WORKAROUND RESPONSE (objectId && globalId)
								this.data.feature.attributes[OIDName] = this.getValueByFieldName(result[0],OIDName);
								this.data.feature.attributes[this.entity.feature.relateFieldName] = this.getValueByFieldName(result[0],this.entity.feature.relateFieldName);
							}
							else
							{
								if(!this.data.row)
									this.data.row = {};
								this.data.row.attributes = {};
								///WORKAROUND RESPONSE (objectId && globalId)
								this.data.row.attributes[OIDName] = this.getValueByFieldName(result[0],OIDName);
							}
						}
						resolve();
					}),
					lang.hitch(this,function(error){
						reject(error);
					})
				);
			}));
		},
		
		getValueByFieldName:function(results,name)
		{
			for(var key in results)
			{
				if(key.toUpperCase() == name.toUpperCase())
				{
					return results[key];
				}
			}
			
			return null;
		},
		
		refresh:function()
		{
			if(this.attachments.isShow)
			{
				this.attachments.refreshSizeAttachments(this.getTableAttachmentsData().attachments);
				this.attachments.refreshSizeAttachments(this.getFeatureAttachmentsData().attachments);
			}
			
			if(this.nbrTableChangeWhitOutAttachments()>0)
			{
				var tableAttachments = this.getTableAttachmentsData();
				if(tableAttachments!=null)
				{
					tableAttachments.oid = null;
					this.attachments.removeServerAttachments(tableAttachments);
				}
			}
			
			this.garbageForm.resize();
			
			if(this.isShow)
			{
				this.formPager.refresh();
				this.refreshTopBar();
				this.refreshBottomBar();
			}
		}
    });
});