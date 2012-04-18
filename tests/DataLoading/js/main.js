(function () {
   "use strict";

	//this assumes you run the webserver from the root of the repository
	var s = new SpectralKitten("http://127.0.0.1:8000/tests/DataLoading/");
		s.apiVersionName = "version.json";
		s.apiCardsName = "all_cards.json";

	//s.initializeData

	s.initializeData(
		function(appData) {
			console.log(appData.cards.length);
			console.log('Cards Loaded : ' + s.cards.length);

			var source = $('#card-list-template').html();
			var template = Handlebars.compile(source);

			var context = {cards: s.cards};
			var html = template(context);
			$('#card-list').html(html);
			
			s.checkForUpdates(
				function(newDataFound, data){
					console.log("New data found? : " + newDataFound);
				},
				function (error){
					console.log("error checking for data update");
				},
				true /* auto update if there is new data */
			);
		},
		function(error) {
			console.log('could not initialize data');
		},
		false /* force loading of data from server*/
	);

	function checkQuota()
	{
		FileSystemManager.getStorageQuota(
			function(a,b) {
				console.log(a + ' out of ' + b);
			},
			function(e) {
				console.log(e);
			},
			window.PERSISTENT
		);
	}

	checkQuota();
	
	s.getCardImagePath(
		"foo.jsp",
		function(path){
			console.log(path);
		})

}());