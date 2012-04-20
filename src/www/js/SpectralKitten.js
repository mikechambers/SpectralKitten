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
		
		//private
		var _series;
		
		var scope = this;

		Object.defineProperty(
			this,
			'cards', {
				get: function() {
					return _cards;
				}
			}
		);
		
		Object.defineProperty(
			this,
			'series', {
				get: function() {
					return _series;
				}
			}
		);

		this.initializeData = function(successCallback, errorCallback, forceUpdate) {
			this.loadSettings(
				function() {
					loadCards(
						function(appData) {
							if (successCallback) {
								successCallback(appData);
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
		
		this.getSeries = function(series_id){
			
			if(!_series){
				return;
			}
			
			//todo: should we cache results internally? for faster future lookup?
			//would be super fast second time, but at expense of memory (maybe a lot)
			
			var len = _series.length;
			
			var s;
			for(var i = 0; i < len; i++){
				s = _series[i];
				if(s.id === series_id){
					return s;
				}
			}
			
			return;
		}
			
		this.getCardsBySet = function(id){
			var out = [];
			
			if(!_cards){
				return out;
			}
			
			//todo: should we cache results internally? for faster future lookup?
			//would be super fast second time, but at expense of memory (maybe a lot)
			
			var len = _cards.length;
			
			var c;
			for(var i = 0; i < len; i++){
				c = _cards[i];
				
				if(c.series.id === id){
					//todo: possible area for optimization out[counter] = c;
					out.push(c);
				}
			}
			
			return out;
		}
            
        this.getCard = function(id) {
            var out = null;
            
            if(!_cards) {
                return out;
            }
            
            var len = _cards.length;
            
            var c;
            for(var i = 0; i < len; i++) {
                c = _cards[i];
                
                
                if(c.id === id){
                    return c;
                }
            }
        }

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
					_series = data.series;

					if (!SpectralKitten.settings)
					{
						SpectralKitten.settings = new Settings();
					}

					SpectralKitten.settings.imageBaseURL = data.configuration.imageBaseURL;
					SpectralKitten.settings.dataVersion = data.configuration.dataVersion;

					scope.saveSettings();

					var appData = {"cards":_cards, "series":_series};
					
					scope.requestQuota(
						function(){
							scope.fileSystemManager.writeObject(
								SpectralKitten.APP_DATA_FILE_NAME,
								appData,//todo: make this into a class?
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
						successCallback(appData);
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
					SpectralKitten.APP_DATA_FILE_NAME,
					function(data) {
						//todo: check if data includes anything, if not, loadRemote
						//data
						
						_cards = data.cards;
						_series = data.series;

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
					
					//make sure we have loaded the data first
					if(
						//make sure that the app understands the API Version / format
						data.apiVersion === SpectralKitten.API_VERSION &&
						
						//check and see if there is a newer version of data on the server
						data.dataVersion > SpectralKitten.settings.dataVersion)
					{
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
					if(errorCallback)
					{
						errorCallback(e);
					}
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

		this.getCardImagePath = function(imageName, imageReadyCallback, errorCallback) {

			var out = "/assets/cards/" + imageName;
			
			if(imageReadyCallback){
				imageReadyCallback(out);
			}
			
			//todo: impliment errorCallback
			//todo: impliment caching and cache checks
			
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

	SpectralKitten.parseCardRules = function(rules){
		
		var keywordsRegEx = [
			{re:/(Dual Wield)/g,rw:""},
			{re:/(Ongoing)/g,rw:""},
			{re:/(Protector)/g,rw:""},
			{re:/(Ferocity)/g,rw:""},
			{re:/(Elusive)/g,rw:""},
			{re:/(Totem)/g,rw:""},
			{re:/(Air)/g,rw:""},
			{re:/(Earth)/g,rw:""},
			{re:/(Fire)/g,rw:""},
			{re:/(Water)/g,rw:""},
			{re:/(Stealth)/g,rw:""},
			{re:/(Untargetable)/g,rw:""},
			{re:/(Thrown)/g,rw:""},
			{re:/(Shadowmeld)/g,rw:""},
			{re:/(Death Rattle)/g,rw:""},
			{re:/(Conspicuous)/g,rw:""},
			{re:/(Inspire)/g,rw:""},
			{re:/(Sabotage)/g,rw:""},
			{re:/(Diplomacy)/g,rw:""},
			{re:/(Long-Range)/g,rw:""},
			{re:/(Reward)/g,rw:""},
			{re:/(Trap)/g,rw:""},
			{re:/(Sextuple Wield)/g,rw:""},
			{re:/(Finishing Move)/g,rw:""},
			{re:/(War Stomp)/g,rw:""},
			{re:/(Berserking)/g,rw:""},
			{re:/(AWESOME)/g,rw:""},
			{re:/(Inspiring Presence)/g,rw:""},
			{re:/(Hardiness)/g,rw:""},
			{re:/(Arcane Torrent)/g,rw:""},
			{re:/(Escape Artist)/g,rw:""},
			{re:/(Find Treasure)/g,rw:""},
			{re:/(Will of the Forsaken)/g,rw:""},
			{re:/(irradiated)/g,rw:""},
			{re:/(Preparation)/g,rw:""},
			{re:/(Invincible)/g,rw:""},
			{re:/(Bear Form)/g,rw:""},
			{re:/(Cat Form)/g,rw:""}
		];
			
		var len = keywordsRegEx.length;
		var k;
		for(var i = 0; i < len; i++){
			k = keywordsRegEx[i];
			k.rw = "<span class=\"rules_keyword\">$1</span>";
		}
		
		keywordsRegEx.push(
			{re:/\n/g,rw:"<br class=\"rules_break\" />"},
			{re:/>>>/g,rw:"<img src=\"/assets/payment_result.png\" />"},
			{re:/\[Horde\]/g,rw:"<img src=\"/assets/horde_ally.png\" />"},
			{re:/\[Alliance\]/g,rw:"<img src=\"/assets/alliance_ally.png\" />"},
			{re:/\[Activate\]/g,rw:"<img src=\"/assets/activate.png\" />"},
			{re:/\(/g,rw:"<span class=\"rules_sidenote\">"},
			{re:/\)/g,rw:"</span>"},
			{re:/(Pay[s]? )([0-9]|[x])|(Pay[s]? )([0-9][0-9])/im,rw:"$1<span class=\"rules_pay\">&nbsp;<b>$2</b>&nbsp;</span>"},
			{re:/Mend ([0-9]|[0-9][0-9]|X)/m,rw:"<span class=\"rules_mends\">Mend $1</span>"},
			{re:/Assault ([0-9]|[0-9][0-9]|X)/m,rw:"<span class=\"rules_assault\">Assault $1</span>"},
			{re:/([[:<:]][A-Z][a-z]*[[:>:]] [[:<:]][A-Z][a-z]*[[:>:]]|[[:<:]][A-Z][a-z]*[[:>:]])( Hero Required)/,rw:"<span class=\"rules_required_hero\">$1$2</span>"},
			{re:/([[:<:]][A-Z][a-z]*[[:>:]])( Resistance)/m,rw:"<span class=\"rules_resistance\">$1$2</span>"},
			{re:/([[:<:]][A-Z][a-z]*[[:>:]])( Reputation)/m,rw:"<span class=\"rules_reputation\">$1$2</span>"}
		);
			
		len = keywordsRegEx.length;
		
		var f = function(p){
			var out = p;		

			var k;
			for(var i = 0; i < len; i++){
				k = keywordsRegEx[i];
				out = out.replace(k.re,k.rw);
			}

			return out;
		}
		
		//basically, we replace this function with f, which contains the keyword
		//variable in its scope. That way we dont have to recreate it each time
		//or make it a static class variable
		SpectralKitten.parseCardRules = f;
		return f(rules);	
	}
	
	SpectralKitten.APP_DATA_FILE_NAME = 'cards.json';
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


