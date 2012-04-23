(function(){
"use strict";


define(["FileSystemManager"],
	function(FileSystemManager){
	
		var _APP_DATA_FILE_NAME = "cards.json";
		var _SETTINGS_FILE_NAME = "settings.json";
		var _API_VERSION = 1;
		var _API_CARDS_NAME = "cards/";
		var _API_VERSION_NAME = "version/";
		var _STORAGE_SIZE = 15 * FileSystemManager.MB;
		var _SETTINGS_STORAGE_NAME = "settings";
		
		var c = {};
	
		Object.defineProperty(
			c,
			'APP_DATA_FILE_NAME', {
				get: function() {
					return _APP_DATA_FILE_NAME;
				}
			}
		);
	
		Object.defineProperty(
			c,
			'SETTINGS_FILE_NAME', {
				get: function() {
					return _SETTINGS_FILE_NAME;
				}
			}
		);
	
		Object.defineProperty(
			c,
			'API_VERSION', {
				get: function() {
					return _API_VERSION;
				}
			}
		);
	
		Object.defineProperty(
			c,
			'API_CARDS_NAME', {
				get: function() {
					return _API_CARDS_NAME;
				}
			}
		);
	
		Object.defineProperty(
			c,
			'API_VERSION_NAME', {
				get: function() {
					return _API_VERSION_NAME;
				}
			}
		);
	
		Object.defineProperty(
			c,
			'STORAGE_SIZE', {
				get: function() {
					return _STORAGE_SIZE;
				}
			}
		);
	
		Object.defineProperty(
			c,
			'SETTINGS_STORAGE_NAME', {
				get: function() {
					return _SETTINGS_STORAGE_NAME;
				}
			}
		);
		
		return c;
	}
);

}());