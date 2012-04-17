var views;
var elementWidth = 250;
var numOfElements;

function onBodyLoad() {
	$("#viewport").click(onViewPortClick);
	
	var counter = 0;
	$("#slidecontainer").children().each(function() {
		$(this).css("left", counter * $(this).width());
		counter++;
	});
	numOfElements = counter;
}

function onViewPortClick(event) {
	var endReached = false;
	$("#slidecontainer").children().each(function(e) {
		var leftvalue = parseInt($(this).css("left"),10);
		if(e == numOfElements-1 && leftvalue == 0) {
			endReached = true;
		}
		// Adding the animation class here because if I add it onBodyLoad 
		// it plays when it resizes the container. But this seems kind of
		// innefficient. 
		if(!endReached) {
			$(this).addClass("viewcontaineranimation");
			$(this).css("left", leftvalue - elementWidth);
		}
	});
}
