/*
	Filters an array of objects based on property name and string to filterby
	Object properties being filtered must contain strings.
*/
;(function(){
"use strict";

define(
	function(){
		
		var filter = {};
		
		/**
		*	Filters an array of objects to only include Objects
		* 	where the specified property value contains the specified
		*	String.
		*
		*	@param arr Array of Objects to filter
		*	@param prop Property name on Object to search on.
		*	@param filterStr String that will be used to filter
		*	@param caseSensitive Boolean Whether filter should be case sensitive (default false).
		*/
		filter.byObject = function(arr, prop, filterStr, caseSensitive){
			
			//check for null and undefined
			if(arr == undefined){
				return arr;
			}
			
			if(caseSensitive === undefined){
				caseSensitive = false;
			}
			
			if(!caseSensitive){
				filterStr = filterStr.toLowerCase();
			}
			
			var len = arr.length;
			var out = [];
			var o;
			var p;
			for(var i = 0; i < len; i++){
				o = arr[i];
				p = o[prop];
				
				if(!caseSensitive){
					p = p.toLowerCase();
				}
				
				if(p.indexOf(filterStr) > -1){
					out.push(o)
				}
			}
			
			return out;
		}
		
		return filter;
	}
);

})();