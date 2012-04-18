var views;
var viewportWidth;
var spectralKitten;

$(document).ready(function() {
	$("#set_list").list();
	$(".nav").click(function(event) {
		$(".active").removeClass("active");
		$(event.target).parent().addClass("active");
		slideViewport($(event.target).data().view);
	});
	
    $(".viewcontainer").removeClass("viewhidden");
    
    viewportWidth = $("#viewport").width();

	var numberOfViews = $("#slidecontainer").children().length;
	$("#slidecontainer").width(numberOfViews * viewportWidth);
	$("#slidecontainer").children().each(function() {
		$(this).width(viewportWidth);
	});
	
	spectralKitten = new SpectralKitten();
	
	spectralKitten = new SpectralKitten();
	spectralKitten.apiVersionName = "version.json";
	spectralKitten.apiCardsName = "all_cards.json";
	
	spectralKitten.initializeData(
		function() {
			var source = $('#card-list-template').html();
			var template = Handlebars.compile(source);

			var context = {cards: spectralKitten.cards};
			var html = template(context);
			
			$('#set_list').html(html);
			
			$('#set_list_container').list();
			
			/*
			$('#myList').bind(
				"change", 
				function( event ){ 
					console.log(event);
				}
			);
			*/
			
			/*
			s.checkForUpdates(
				function(newDataFound, data){
					console.log("New data found? : " + newDataFound);
				},
				function (error){
					console.log("error checking for data update");
				},
				true //auto update if there is new data
			);
			*/
		},
		function(error) {
			console.log('could not initialize data');
		},
		false /* force loading of data from server*/
	);
	
});


function slideViewport(index) {
	var pixelsToMove = (((index-1) * viewportWidth)*-1)-1;
	
    $("#slidecontainer").css("left", pixelsToMove);
	
}

function onSelectView(event) {

}
