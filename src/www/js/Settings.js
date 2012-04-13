; (function (exports) {
	"use strict";
    
    function Settings(o)
    {
        if(o) {
            if(o.imageBaseURL) {
                this.imageBaseURL = o.imageBaseURL;
            }
        }
    }
    
    Settings.prototype.imageBaseURL = null;
    
    exports.Settings = Settings;
}(this));