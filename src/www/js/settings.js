; (function(exports) {
	'use strict';

	function Settings(o)
	{
		if (o) {
			if (o.imageBaseURL) {
				this.imageBaseURL = o.imageBaseURL;
			}
			
			if(o.dataVersion)
			{
				this.dataVersion = o.dataVersion;
			}
		}
	}

	Settings.prototype.imageBaseURL = null;
	Settings.prototype.dataVersion = null;

	exports.Settings = Settings;
}(this));
