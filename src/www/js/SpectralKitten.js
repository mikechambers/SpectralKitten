//check version of data to see if we need to update it

//have to think about if we exceed storage quota, so we would need to check for how much space
//we need before we write, and then, if we need more, request more from the user before we write.
//of course, that is async, so somehow we have to save the state while we wait for the user to respond

;(function(exports){
	"use strict";

	function SpectralKitten(){
		this.init();
		
		//check for new card data in the background
		//if new data, load and cache
		this.fileSystemManager = new FileSystemManager(window.PERSISTENT, FileSystemManager.MB * 15);
	}
	
	SpectralKitten.prototype.init = function(){
		//private
		var _cards;
		var scope = this;
		
		Object.defineProperty(
			this,
			"cards",{
				get:function(){
					return _cards;
				}
			}
		);
		
		this.initializeData = function(successCallback, errorCallback, forceUpdate) {
			this.loadSettings(
				function() {
					loadCards(
						function () {
							if(successCallback) {
								successCallback();
							}
						},
						function (error) {
							if (errorCallback) {
								errorCallback(error);
							}
						},
						forceUpdate
					);
				},
				function (error) {
					if (errorCallback) {
						errorCallback(error);
					}
				}
			);
			
		}
		
		//private
		var loadCards = function(successCallback, errorCallback, forceUpdate) {
			//option to override cache / force update
	
			//check if card data has been cached
	
			//have to cache images, need to figure out
			//phone gap can only write text files (from javascript)
			//might need to write a plugin to cache binary files
			//maybe from base64 string, or from a URL
	
			var loadRemoteData = function() {
				
				$.ajax({
					url:"all_cards.json",
					dataType:"json",
					success:function(data, code, jqXHR ) {
						_cards = data.cards;
						
						//todo : this will fail if we havent loaded settings yet
						
						if(!SpectralKitten.settings)
						{
							SpectralKitten.settings = new Settings();
						}
						
						SpectralKitten.settings.imageBaseURL = data.configuration.imageBaseURL;
						
						scope.saveSettings();
						
						scope.fileSystemManager.writeObject(
							SpectralKitten.CARD_FILE_NAME,
							_cards,
							function(){
								console.log("Card data saved.");
							},
							function(){
								console.log("Error : Could not save card data.");
							},
							true
						);
						
						if(successCallback) {
							successCallback(_cards);
						}
						
					},
					error:function(jqXHR, msg, e) {
						console.log("c");

						errorCallback(msg, e);
					}
				});			
			};
	
			
			if(forceUpdate) {
				loadRemoteData();
			}
			else {
				scope.fileSystemManager.readObject(
					SpectralKitten.CARD_FILE_NAME,
					function(data){
						//todo: check if data includes anything, if not, loadRemote
						//data
		   
						_cards = data;
						
						if(successCallback) {
							successCallback(data);
						}
					},
					function(error){
						
						//if an error occurs here, then the data either doesnt exists, or is
						//corrupt
						
						//so, we should delete the file and then load the remote data
						
						console.log("error loading remote data");
						loadRemoteData();
					}
				);				
			}
		};
		
		this.getCardImage = function(imageName, imageReadyCallback, errorCallback) {
			//check if image is already local, if so, return that path, otherwise
			//retrieve image, cache it and then return
		};
		
		this.loadSettings = function(successCallback) {
			
			this.fileSystemManager.readObject(
				SpectralKitten.SETTINGS_FILE_NAME,
				function(data) {
					SpectralKitten.settings = new Settings(data);
					
					if(successCallback) {
						successCallback(SpectralKitten.settings);
					}
				}, 
				function(error) {
   
					console.log("Could not load settings. Using default settings.");
					SpectralKitten.settings = new Settings();
					scope.saveSettings();
					
					
					//if an error occurs trying to load settings, then we create
					//default settings
					if(sucessCallback) {
						sucessCallback(SpectralKitten.settings);
					}
									 
					/*
					if(errorCallback) {
						errorCallback(error);
					}
					*/
					
				}
			);
		};
			
		this.saveSettings = function(sucessCallback, errorCallback) {

			console.log("saveSettings");
			
			this.fileSystemManager.writeObject(
				SpectralKitten.SETTINGS_FILE_NAME,
				SpectralKitten.settings,
				function(){
					console.log("settings saved");
					if(sucessCallback){
							sucessCallback();
					}
				},
				function(error){
					console.log(error);
					if(errorCallback){
						errorCallback(error);
					}
				}
			);			
		}		
	}
		
	SpectralKitten.CARD_FILE_NAME = "cards.json";
	SpectralKitten.SETTINGS_FILE_NAME = "settings.json";
	SpectralKitten.prototype.fileSystemManager = null;
	
	
	/* Settings */
	SpectralKitten.settings = null;
	
	exports.SpectralKitten = SpectralKitten;
}(this));



