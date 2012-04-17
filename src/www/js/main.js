var views;
var viewportWidth;
var numberOfViews;


$(document).ready(function() {
	$("#set_list").list();
	$(".nav").click(function(event) {
		slideViewport($(event.target).data().view);
	});
	onBodyLoad();
});


function onBodyLoad() {
    viewportWidth = $("#viewport").width();
	
	$("#viewport").click(onViewPortClick);
	
    
    var counter = 0;
	numberOfViews = $("#slidecontainer").children().length;
	$("#slidecontainer").width(numberOfViews * viewportWidth);
	$("#slidecontainer").children().each(function() {
		$(this).width(viewportWidth);
	});
}

function slideViewport(index) {
	var pixelsToMove = ((index-1) * viewportWidth)*-1;
	
    $("#slidecontainer").css("left", pixelsToMove);
	
}

function onViewPortClick(event) {
	
	var currentLeftValue =  parseInt($("#slidecontainer").css("left"));
	
    $("#slidecontainer").css("left", currentLeftValue-viewportWidth);
}

function onSelectView(event) {

}
