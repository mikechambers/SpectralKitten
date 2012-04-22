//check version of data to see if we need to update it

//have to think about if we exceed storage quota, so we would need to check for how much space
//we need before we write, and then, if we need more, request more from the user before we write.
//of course, that is async, so somehow we have to save the state while we wait for the user to respond

define(["jquery", "settings", "FileSystemManager", "config"],
	function($, settings, FileSystemManager, config){
		
		var sk = {			
			//instance variables
			fileSystemManager:null,
			apiBaseURL:"/api/",
			apiVersionName:config.API_CARDS_NAME,
			apiCardsName:config.API_VERSION_NAME,
		};
		
		//private vars
		var _cards;
		var _series;
		var scope; //todo: rename this to _scope
		
		sk.initialize = function(apiBaseURL){
			   
			scope = this;
			if(apiBaseURL){
				this.apiBaseURL = apiBaseURL;
			}
			
			this.fileSystemManager = new FileSystemManager(window.PERSISTENT, config.STORAGE_SIZE);
		}
			
		Object.defineProperty(
			sk,
			'cards', {
				get: function() {
					return _cards;
				}
			}
		);
		
		Object.defineProperty(
			sk,
			'series', {
				get: function() {
					return _series;
				}
			}
		);

		sk.initializeData = function(successCallback, errorCallback, forceUpdate) {	
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
		};
		
		sk.getSeries = function(series_id){
			
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
			
		sk.getCardsBySet = function(id){
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
            
        sk.getCard = function(id) {
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
					if (data.configuration.apiVersion !== config.API_VERSION) {
						if (errorCallback) {
							var e = '';
								e.msg = 'Invalid API Version.';
							errorCallback(e);
						}

						return;
					}

					_cards = data.cards;
					_series = data.series;

					settings.imageBaseURL = data.configuration.imageBaseURL;
					settings.dataVersion = data.configuration.dataVersion;

					settings.save();

					var appData = {"cards":_cards, "series":_series};
					
					scope.requestQuota(
						function(){
							scope.fileSystemManager.writeObject(
								config.APP_DATA_FILE_NAME,
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
					config.APP_DATA_FILE_NAME,
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

		sk.checkForUpdates = function(successCallback, errorCallback, update) {
			
			$.ajax({
				url: scope.apiBaseURL + scope.apiVersionName,
				dataType: 'json',
				success: function(data, code, jqXHR){
					
					//make sure we have loaded the data first
					if(
						//make sure that the app understands the API Version / format
						data.apiVersion === config.API_VERSION &&
						
						//check and see if there is a newer version of data on the server
						data.dataVersion > settings.dataVersion)
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

		sk.requestQuota = function(successCallback, errorCallback) {
			this.fileSystemManager.requestQuota(
				config.STORAGE_SIZE,
				successCallback,
				errorCallback
			);
		}

		sk.getCardImagePath = function(imageName, imageReadyCallback, errorCallback) {

			var out = "/assets/cards/" + imageName;
			
			if(imageReadyCallback){
				imageReadyCallback(out);
			}
			
			//todo: impliment errorCallback
			//todo: impliment caching and cache checks
			
		};
			
		return sk;
	}
);