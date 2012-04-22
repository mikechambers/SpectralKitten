define(function(){
	
	var s = {
		imageBaseURL:null,
		dataVersion:null
	}
	
	s.save = function(){
	}
	
	s.parse = function(o){
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
		
	return s;
});

