;(function(){

"use strict";

require(
	["jquery", "spectralkitten", "settings", "libs/domReady", "filter", "js/libs/bootstrap.min.js"],
	function($, spectralKitten, settings, domReady, filter){

		var Handlebars;
		
		var views;
		var viewportWidth;

		//reference to jquery element pointing to the filter search field
		var filterField;
		
		//current data set rendered by list.
		var currentListData = null;
		
		//seriesListTemplate (we are caching it)
		var listTemplate;

		
		var currentCardDetailView = null;
		
		domReady.withResources(
			function () {
				$(".nav").click(function(event) {
					$(".active").removeClass("active");
					$(event.target).parent().addClass("active");
					slideViewport($(event.target).data().view);
				});
				
				// Show the view containers.
                $(".viewcontainer").removeClass("viewhidden");
				
                // Set the viewport height/width 
				$('#viewport').width($(window).width());
				$('#viewport').height($(window).height()-40); //height of the header
				
				
                // The viewportWidth variable is used to track changes on resize as
                // well as keeping track of the width for moving the divs around. 
                viewportWidth = $("#viewport").width();
			
				// This figures out how many views we have and then we set up the size
                // of the #slidecontainer based on the number of views we have. 
                var numberOfViews = $("#slidecontainer").children().length;
				$("#slidecontainer").width(numberOfViews * viewportWidth);
				$("#slidecontainer").children().each(function() {
					$(this).width(viewportWidth);
				});
					
				$(window).resize(function() {
					
                    // Figure out the current window height/width after we resize it. 
                    var win_width = $(window).width();
					var win_height = $(window).height();
					
					// set the viewportWidth variable because we're going to use it to 
                    // resize the children (views) of the #slidecontainer
                    viewportWidth = $('#viewport').width();
			
					$("#slidecontainer").width(numberOfViews * viewportWidth);
					$("#slidecontainer").children().each(function() {
						$(this).width(viewportWidth);
					});
					
					var activeview = $('.active').children().data('view');
					slideViewport(activeview);
					
					// TODO: Fix annoying flash when you resize.
			
				});
				
				spectralKitten.initialize("/api/");

				spectralKitten.apiVersionName = "version.json";
				spectralKitten.apiCardsName = "all_cards.json";

				spectralKitten.initializeData(
					function() {
						require(
							[
								"js/libs/Handlebars.js",
								"js/libs/bootstrap-list.js"],
							function(){
								Handlebars = window.Handlebars;
								renderList(spectralKitten.series, seriesListHandler);
								currentListData = spectralKitten.series;
								
								filterField = $("#filter_field");
								filterField.on("input", null, null,
									function(e){
										if(!currentListData){
											return;
										}
										var input = filterField.val();
										
										var filteredData = filter.byObject(currentListData, "name", input);
										
										renderList(filteredData, currentClickHandler, false);
									}
								);								
								
							}
						)


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
			}
		);

		var clearFilterField = function(){
			if(filterField){
				filterField.val("");
			}
		}
		
		var cardDetailTemplate;
		var seriesDetailTemplate;
		
		var renderDetailTemplate = function(template, context){
					
			var html = template(context);
			
			var detail = $(html);
			var h = $(window).height();
			detail.css("top", h);
			
			$("#cards_view_content").append(detail);
		
			window.webkitRequestAnimationFrame(
				function(){
					detail.css("top", 0);
				}
			);
			
			detail.bind(
				"webkitTransitionEnd",
				function(){
					if(currentCardDetailView){
						removeDetailView(currentCardDetailView);
					}
					currentCardDetailView = detail;
					currentCardDetailView.unbind("webkitTransitionEnd");
				}
			);

			return detail;
		}
			
		var removeDetailView = function(view){
			view.remove();
		}
		
		var renderCardDetail = function(card){
			
			require(["parserules"],
				function(parserules){
					var rules = parserules(card.rules);
					
					$(".cube").unbind('mouseenter mouseleave');
					function cardPathWin(imgPath){
						
						if(!cardDetailTemplate){
							var source = $("#card-detail-template").html();
							cardDetailTemplate = Handlebars.compile(source);
						}
						
						renderDetailTemplate(
							cardDetailTemplate,
							{
								"card": card,
								"card_image":imgPath,
								"rules":rules
							}
						);
						
						$('.cube').hover(function(){
							$(this).addClass('rotate');
						},function(){
							$(this).removeClass('rotate');
						});
					}
				
					spectralKitten.getCardImagePath(card.card_image,cardPathWin,'');
				}
			);
		}
			
		var renderSeriesDetail = function(series){
			
			if(!seriesDetailTemplate){
				var source = $("#series-detail-template").html();
				seriesDetailTemplate = Handlebars.compile(source);
			}
			
			renderDetailTemplate(seriesDetailTemplate, {"series": series});
		}
		
		//current list jquery element
		var currentList;
		
		//jquery list element that will be removed when new
		//list complete animation in
		var listToRemove;
		
		//click handler for lists of cards
		var cardsListHandler = function(event){
			var item_id = $(event.srcElement).data("item_id");

			var c = spectralKitten.getCard(item_id);
			renderCardDetail(c);
		};
		
		//click handler for lists of series
		var seriesListHandler = function( event ) {
			var item_id = $(event.srcElement).data("item_id");
			var cards = spectralKitten.getCardsBySet(item_id);
			
			//todo: this is to load the detail page.
			var s = spectralKitten.getSeries(item_id);
			renderSeriesDetail(s);
			currentListData = cards;
			
			renderList(cards,cardsListHandler);
		}
		
		var currentClickHandler;
			
		//creates a new series list
		var renderList = function(items, clickHandler, animate){

			currentClickHandler = clickHandler;
			
			if(animate === undefined){
				animate = true;
			}
			
			if(!listTemplate){
				var source = $("#list-template").html();
				listTemplate = Handlebars.compile(source);
			}
			
			var id = new Date().getTime();
			var context = {"items": items, "id": id};

			var html = listTemplate(context);
			
			$('#list_container').append(html);
	
			var list = $("#" + id);	
			
			//have to add the class here or otherwise it will
			//trigger the css animate when we reset starting position.
			list.addClass("list");
			
			listToRemove = currentList;
			currentList = list;
			
			if(!animate){
				//this resets the left position to 0
				//so it doesnt animate in
				list.addClass("list_no_animate");
				
				if(listToRemove){
					listToRemove.remove();
				}
			}			
			
			list.list();
			
			list.bind("change", clickHandler);
		
			if(listToRemove){
				list.bind(
					"webkitTransitionEnd",
					function(){
						list.unbind("webkitTransitionEnd");
						//todo: do we need to remove chane handlers?
						listToRemove.remove();
					}
				);
			}
			
			if(animate){
				clearFilterField();
				list.css("left", 0);
			}
		}
		
		var slideViewport = function(index) {
			var pixelsToMove = (((index-1) * viewportWidth)*-1)-1;
			
			$("#slidecontainer").css("left", pixelsToMove);
		}
			
	//end define
	}
);

}());