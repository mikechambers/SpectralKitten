;(function(){

"use strict";

define(["config"],
	function(config){

		var s = {
			imageBaseURL:null,
			dataVersion:null
		}
				
		var parse = function(o){
			if (o) {
				if (o.imageBaseURL) {
					s.imageBaseURL = o.imageBaseURL;
				}
				
				if(o.dataVersion)
				{
					s.dataVersion = o.dataVersion;
				}
			}
		}
		
		//NOTE : this can throw a QUOTA_EXCEEDED_ERR if we go over 5 megs (which we shouldnt)
		s.save = function(){
			localStorage[config.SETTINGS_STORAGE_NAME] = JSON.stringify({
					imageBaseURL:this.imageBaseURL,
					dataVersion:this.dataVersion
				});
		}

		s.clear = function(){
			localStorage.removeItem(config.SETTINGS_STORAGE_NAME);
		}

		var o = localStorage[config.SETTINGS_STORAGE_NAME];

		if(o !== undefined){
			try{
				o = JSON.parse(o);
				parse(o);
			}
			catch(e){
				console.log("Settings are corrupted : reinitializing");
				s.clear();
			}
		}
			
		return s;
	}
);

})();