var views;
var viewportWidth;
var spectralKitten;

$(document).ready(function() {
	$("#set_list").list();
    $("#list_container").bind('change',function(e) {
        // don't think I need this anymore. 
    });
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
	
	spectralKitten = new SpectralKitten("/api/");
	
	spectralKitten = new SpectralKitten();
	spectralKitten.apiVersionName = "version.json";
	spectralKitten.apiCardsName = "all_cards.json";
	
	spectralKitten.initializeData(
		function() {
			renderSeriesList(spectralKitten.series);
			
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
		true /* force loading of data from server*/
	);
	
});

function renderCardList(cards,series_id){
    var source = $('#card-list-template').html();
    var template = Handlebars.compile(source);

    var timestamp = new Date().getTime();
    var div_id = "series_" + series_id + "_" + timestamp;
    
    var context = {"cards":cards, "div_id":div_id};
    var cardlist = template(context);
 
    
    $(cardlist).appendTo("#list_holder");
    $("#list_holder").children().last().list();
    $("#list_holder").children().last().css("left",0);
    
    
    //$(cardlist).css("left","400px");
    
    /*
    setTimeout(function(){
        //console.log($(cardlist).css("left"));
        document.getElementById(div_id).style.left = "0px";
        console.log($(cardlist).css("left"));
    }, 1000);    
    */
      
    //$(cardlist).list();    
    
    //$(seriesdiv).css("left",0);
    
}

function renderSeriesList(series){
	var source = $('#series-list-template').html();
	var template = Handlebars.compile(source);
	
	var context = {"series": series};
	var html = template(context);
	
	$('#list_container').html(html);
	
	$('#series_list_container').list();
	
	$('#series_list_container').bind(
		"change",
		function( event ){
			var series_id = $(event.srcElement).data("series_id");
			var t = new Date().getTime();
			var cards = spectralKitten.getCardsBySet(series_id);
            renderCardList(cards,series_id);
		}
	);
    $("#list_container").css("left",0);
}


function slideViewport(index) {
	var pixelsToMove = (((index-1) * viewportWidth)*-1)-1;
	
    $("#slidecontainer").css("left", pixelsToMove);
	
}

function onSelectView(event) {

}
