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

/*series is a single series item*/
function renderSeriesDetail(series){

	var source = $('#series-detail-template').html();
	var template = Handlebars.compile(source);
	var context = {"series": series};
	var html = template(context);

	var detail = $(html);
	var h = $(window).height();
	detail.css("top", h);
	
	$("#view_1_content").append(detail);

	window.webkitRequestAnimationFrame(
		function(){
			detail.css("top", 0);
		}
	);
}

function renderCardList(cards,series_id){
    var source = $('#card-list-template').html();
    var template = Handlebars.compile(source);

    var timestamp = new Date().getTime();
    var div_id = "series_" + series_id + "_" + timestamp;
    
    var context = {"cards":cards, "div_id":div_id};
    var cardlist = template(context);
 
    
    var list = $(cardlist).appendTo("#list_holder");
	list.list();
    list.css("left",0);
}

/* series is an array of series */
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
			var series = spectralKitten.getCardsBySet(series_id);
            
			var s = spectralKitten.getSeries(series_id);

            renderCardList(series,series_id);
			
			renderSeriesDetail(s);
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
