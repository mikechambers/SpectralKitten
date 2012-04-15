//change port to test first time load

var s = new SpectralKitten();

//s.initializeData

s.initializeData(
	function() {
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
			true
		);
	},
	function(error) {
		console.log('could not initialize data');
	},
	false
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