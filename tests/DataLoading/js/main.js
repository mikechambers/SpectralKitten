//change port to test first time load

var s = new SpectralKitten();

//s.initializeData

s.initializeData(
    function() {
        console.log("Cards Loaded : " + s.cards.length);
        console.log(SpectralKitten.settings.imageBaseURL);
        
        var source = $("#card-list-template").html();
        var template = Handlebars.compile(source);
        
        var context = {cards:s.cards};
        var html = template(context);
        $("#card-list").html(html);
    },
    function (error) {
        console.log("could not initialize data");
    },
    false
);

function checkQuota()
{
	FileSystemManager.getStorageQuota(
	    function(a,b){
			console.log(a + " out of " + b)
		},
	    function(e){
			console.log(e)
		}
	);
}
