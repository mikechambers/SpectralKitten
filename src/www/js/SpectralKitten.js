//check version of data to see if we need to update it

//have to think about if we exceed storage quota, so we would need to check for how much space
//we need before we write, and then, if we need more, request more from the user before we write.
//of course, that is async, so somehow we have to save the state while we wait for the user to respond

;(function(exports) {
	'use strict';

	function SpectralKitten(apiBaseURL) {

		if(apiBaseURL){
			this.apiBaseURL = apiBaseURL;
		}

		this.init();

		//check for new card data in the background
		//if new data, load and cache
		this.fileSystemManager = new FileSystemManager(window.PERSISTENT, SpectralKitten.STORAGE_SIZE);
	}

	SpectralKitten.prototype.init = function() {
		//private
		var _cards;
		var scope = this;

		Object.defineProperty(
			this,
			'cards', {
				get: function() {
					return _cards;
				}
			}
		);

		this.initializeData = function(successCallback, errorCallback, forceUpdate) {
			this.loadSettings(
				function() {
					loadCards(
						function() {
							if (successCallback) {
								successCallback();
							}
						},
						function(error) {
							if (errorCallback) {
								errorCallback(error);
							}
						},
						forceUpdate
					);
				},
				function(error) {
					if (errorCallback) {
						errorCallback(error);
					}
				}
			);
		};

		var loadRemoteData = function(successCallback, errorCallback) {

			$.ajax({
				url: scope.apiBaseURL + scope.apiCardsName,
				dataType: 'json',
				success: function(data, code, jqXHR) {

					//check to make sure that we support / understand the current API
					//version
					if (data.configuration.apiVersion !== SpectralKitten.API_VERSION) {
						if (errorCallback) {
							var e = '';
								e.msg = 'Invalid API Version.';
							errorCallback(e);
						}

						return;
					}

					_cards = data.cards;

					if (!SpectralKitten.settings)
					{
						SpectralKitten.settings = new Settings();
					}

					SpectralKitten.settings.imageBaseURL = data.configuration.imageBaseURL;
					SpectralKitten.settings.dataVersion = data.configuration.dataVersion;

					scope.saveSettings();

					scope.requestQuota(
						function(){
							console.log("about to write file");
							scope.fileSystemManager.writeObject(
								SpectralKitten.CARD_FILE_NAME,
								_cards,
								function() {
									console.log('Card data saved.');
								},
								function(error) {
									console.log(error);
									console.log('Error : Could not save card data.');
								},
								true
							);
						},
						function(error){
							console.log('Error : Could not save card data. Not enough storage');
						}

					)

					if (successCallback) {
						successCallback(_cards);
					}

				},
				error: function(jqXHR, msg, e) {
					errorCallback(e, msg);
				}
			});
		};


		//private
		var loadCards = function(successCallback, errorCallback, forceUpdate) {

			//check if card data has been cached

			//have to cache images, need to figure out
			//phone gap can only write text files (from javascript)
			//might need to write a plugin to cache binary files
			//maybe from base64 string, or from a URL

			if (forceUpdate) {
				loadRemoteData(successCallback, errorCallback);
			}
			else {
				scope.fileSystemManager.readObject(
					SpectralKitten.CARD_FILE_NAME,
					function(data) {
						//todo: check if data includes anything, if not, loadRemote
						//data

						_cards = data;

						if (successCallback) {
							successCallback(data);
						}
					},
					function(error) {

						//if an error occurs here, then the data either doesnt exists, or is
						//corrupt

						//so, we should delete the file and then load the remote data
						loadRemoteData(successCallback, errorCallback);
					}
				);
			}
		};

		this.checkForUpdates = function(successCallback, errorCallback, update) {
			
			console.log("checking for updated data");

			//settings havent been loaded so we cant check whether data is new
			if(!SpectralKitten.settings || !SpectralKitten.settings.dataVersion){
				//we only check for updates if we are able to save settings.
				//otherwise, we could get in an infinite loop of updating every
				//time
				return;
			}
			
			//var scope = this;
			
			$.ajax({
				url: scope.apiBaseURL + scope.apiVersionName,
				dataType: 'json',
				success: function(data, code, jqXHR){
					
					console.log("version data received : " + data.dataVersion);
					//make sure we have loaded the data first
					if(
						//make sure that the app understands the API Version / format
						data.apiVersion === SpectralKitten.API_VERSION &&
						
						//check and see if there is a newer version of data on the server
						data.dataVersion > SpectralKitten.settings.dataVersion)
					{
						console.log("Updated data found.");
						
						//The data on the server has been updated.
						
						//check if we should auto update
						if(update)
						{
							//load new card data. force the remote load
							loadCards(
								function(data){
									if(successCallback)
									{
										successCallback(true, data);
									}
								},
								errorCallback,
								true
							);
						}
						else
						{
							//dont load new card data. callback with true to indicate
							//new data is available
							if(successCallback)
							{
								successCallback(true);
							}
						}
						
					}
					else
					{
						//no new data. callback indicating no new data
						if(successCallback)
						{
							successCallback(false);
						}
					}
				},
				error: function(jqXHR, msg, e){
					//something went wrong loading the remote data. throw and error
					console.log(e);
				}
			});
		};

		this.requestQuota = function(successCallback, errorCallback) {
			this.fileSystemManager.requestQuota(
				SpectralKitten.STORAGE_SIZE,
				successCallback,
				errorCallback
			);
		}

		this.getCardImage = function(imageName, imageReadyCallback, errorCallback) {
			//check if image is already local, if so, return that path, otherwise
			//retrieve image, cache it and then return
		};

		this.loadSettings = function(successCallback) {

			this.fileSystemManager.readObject(
				SpectralKitten.SETTINGS_FILE_NAME,
				function(data) {
					SpectralKitten.settings = new Settings(data);

					if (successCallback) {
						successCallback(SpectralKitten.settings);
					}
				},
				function(error) {
					console.log('Could not load settings. Using default settings.');
					SpectralKitten.settings = new Settings();
					scope.saveSettings();


					//if an error occurs trying to load settings, then we create
					//default settings
					if (successCallback) {
						successCallback(SpectralKitten.settings);
					}

					/*
					if(errorCallback) {
						errorCallback(error);
					}
					*/

				}
			);
		};

		this.saveSettings = function(successCallback, errorCallback) {

			//var scope = this;
			this.requestQuota(
				function(){
					scope.fileSystemManager.writeObject(
						SpectralKitten.SETTINGS_FILE_NAME,
						SpectralKitten.settings,
						function() {
							console.log('settings saved');
							if (successCallback) {
									successCallback();
							}
						},
						function(error) {
							if (errorCallback) {
								errorCallback(error);
							}
						}
					);
				}
			);
		};
	};

	SpectralKitten.CARD_FILE_NAME = 'cards.json';
	SpectralKitten.SETTINGS_FILE_NAME = 'settings.json';
	SpectralKitten.prototype.fileSystemManager = null;

	SpectralKitten.STORAGE_SIZE = 15 * FileSystemManager.MB;

	/* Settings */
	SpectralKitten.settings = null;
	SpectralKitten.API_VERSION = 1;

	SpectralKitten.API_CARDS_NAME = "cards/";
	SpectralKitten.API_VERSION_NAME = "version/";

	SpectralKitten.prototype.apiBaseURL = "/api/";
	SpectralKitten.prototype.apiVersionName = SpectralKitten.API_CARDS_NAME;
	SpectralKitten.prototype.apiCardsName = SpectralKitten.API_VERSION_NAME;

	exports.SpectralKitten = SpectralKitten;
}(this));



