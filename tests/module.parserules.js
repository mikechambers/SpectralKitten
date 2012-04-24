var requirejs = require('./r.js');
var fs = require('fs');

var cards;

requirejs.config({
		nodeRequire: require,
		baseUrl:"../src/www/js/"
	});

requirejs(['assert', 'parserules'],
	function(assert, parserules) {
		"use strict";

		suite('parserules',
			function() {
				setup(
					function(done){
						fs.readFile("../src/www/api/all_cards.json",
							"utf8",
							function (err, data) {
								if (err) {
									console.log(err);
									throw err;
								}
								
								var d = JSON.parse(data);
								cards = d.cards;
								done();
							}
						);
					}
				);

				teardown(
					function(){

					}
				);

				/************** Hero Required Parsing Tests *******************/

				test(
					'Hero Required Full Data Pass',
					function() {
						var len = cards.length;
						
						var rules;
						var out;
						var contains;
						var c;
						for(var i = 0; i < len; i++){
							c = cards[i];
							rules = c.rules;
							contains = false;
							
							if(rules !== null){
								contains = (rules.toLowerCase().indexOf("hero required") > -1);
							}
							
							out = parserules(rules);
							
							if(contains){
								//make sure ever rules with Hero Required is captured
								assert.ok(out.indexOf("rules_required_hero") > -1,
										"Missed capture\nid:+" + c.id+ "\nInput :\n" + rules + "\nOutput :\n" + out );
							}
							else {
								//make sure that every rule that does not contain Hero Required is NOT
								//captured
								assert.ok(out.indexOf("rules_required_hero") == -1,
										"False capture\nid:+" + c.id+"\nInput :\n" + rules + "\nOutput :\n" + out );
							}
							
						}
					}
				);
	
				test(
					"Leading Resotration Hero Required",
					function(){
						var d = "Restoration Hero Required\nYou pay 5 less to play your next card this turn.";
						var result = parserules(d);
						
						assert.ok(result.indexOf("<span class=\"rules_required_hero\">Restoration Hero Required</span>" === 0),"Leading Resotration Hero Required failed");
					}
				);
				
				test(
					"Leading Beast Mastery Hero Required",
					function(){
						var d = "Beast Mastery Hero Required\nTarget Pet has +3 ATK this turn. Prevent all damage that would be dealt to it this turn.";
						var result = parserules(d);
						
						assert.ok(result.indexOf("<span class=\"rules_required_hero\">Beast Mastery Hero Required</span>" === 0),"Leading Beast Mastery Hero Required failed");
					}
				);
				
				test(
					"A Beast Mastery Hero Required",
					function(){
						var d = "A Beast Mastery Hero Required\nTarget Pet has +3 ATK this turn. Prevent all damage that would be dealt to it this turn.";
						var result = parserules(d);

						assert.ok(result.indexOf("A <span class=\"rules_required_hero\">Beast Mastery Hero Required</span>") === 0,"A Beast Mastery Hero Required failed");
					}
				);
				
				
				test(
					"Restoration Hero Required Solo",
					function(){
						var d = "Restoration Hero Required";
						var expected = "<span class=\"rules_required_hero\">Restoration Hero Required</span>";
						var result = parserules(d);

						assert.ok(expected === result,"Restoration Hero Required Solo failed");
					}
				);
				
				test(
					"Beast Mastery Hero Required Solo",
					function(){
						var d = "Beast Mastery Hero Required";
						var expected = "<span class=\"rules_required_hero\">Beast Mastery Hero Required</span>";
						var result = parserules(d);
						assert.ok(expected === result,"Beast Mastery Hero Required Solo failed");
					}
				);
			}
		)
	}
);
