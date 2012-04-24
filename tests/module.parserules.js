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

		function fullDataPass(token, confirmStr, omitIdArr){
			var len = cards.length;
			

			var omitCache = {};

			if(omitIdArr){
				var l;
				for(var i = 0; l = omitIdArr.length, i < l; i++){
					omitCache[omitIdArr[i]] = true;
				}
			}

			var rules;
			var out;
			var contains;
			var c;
			for(var i = 0; i < len; i++){
				c = cards[i];

				if(omitCache[c.id]){
					continue;
				}

				rules = c.rules;
				contains = false;
				
				if(rules !== null){
					contains = (rules.toLowerCase().indexOf(token.toLowerCase()) > -1);
				}
				
				out = parserules(rules);
				
				if(contains){
					//make sure ever rules with Hero Required is captured
					assert.ok(out.indexOf(confirmStr) > -1,
							"Missed capture\nid: " + c.id+ "\nCard Name: "+c.name+"\nInput :\n" + rules + "\nOutput :\n" + out );
				}
				else {
					//make sure that every rule that does not contain Hero Required is NOT
					//captured
					assert.ok(out.indexOf(confirmStr) == -1,
							"False capture\nid: " + c.id+"\nCard Name: "+c.name+"\nInput :\n" + rules + "\nOutput :\n" + out );
				}
				
			}
		}


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

						var token = "Hero Required";
						var confirmStr = "rules_required_hero";

						fullDataPass(token, confirmStr);
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

				/************** Resistance Parsing Tests *******************/

				test(
					'Resistance Full Data Pass',
					function() {

						var token = "Resistance";
						var confirmStr = "rules_resistance";

						fullDataPass(token, confirmStr);
					}
				);

				test(
					"Resistance start string",
					function(){
						var d = "Nature Resistance (Prevent all nature [Nature] damage that this ally would be dealt.)";
						var expected = "<span class=\"rules_resistance\">Nature Resistance</span>";
						var result = parserules(d);
						assert.ok(result.indexOf(expected) == 0,"Resistance start string");
					}
				);

				test(
					"chosen resistance end",
					function(){
						var d = "As Addisyn enters play, choose arcane, fire, frost, nature, or shadow.\nAddisyn has the chosen resistance.";
						var expected = "\<span class=\"rules_resistance\"\>resistance\<\/span\>.";
						var result = parserules(d);

						assert.ok(new RegExp(expected + "$").test(result),"chosen resistance end");
					}
				);

				test(
					"with Resistance",
					function(){
						var d = "Opposing allies with Resistance have -1 [Health].";
						var expected = "with <span class=\"rules_resistance\">Resistance</span>";
						var result = parserules(d);

						assert.ok(result.indexOf(expected) > -1,"with Resistance");
					}
				);

				test(
					"have Resistances",
					function(){
						var d = "Opposing heroes and allies lose and can't have Resistances.";
						var expected = "Opposing heroes and allies lose and can't have <span class=\"rules_resistance\">Resistances</span>.";
						var result = parserules(d);

						assert.ok(result === expected,"with Resistance");
					}
				);

				/************** Reputation Parsing Tests *******************/

				test(
					'Reputation Full Data Pass',
					function() {

						var token = "Reputation";
						var confirmStr = "rules_reputation";

						fullDataPass(token, confirmStr, [1530,1531, 1532, 1533, 3192, 3194]);
					}
				);


				/************** Line Return Parsing Tests *******************/

				test(
					'Line Returns',
					function() {

						var token = "\n";
						var confirmStr = "<br class=\"rules_break\" />";

						fullDataPass(token, confirmStr);
					}
				);

				test(
					'Multiple Line Returns',
					function() {
						var d = "\nAAAAAAA\nBBBBBB\n";
						var expected = "<br class=\"rules_break\" />AAAAAAA<br class=\"rules_break\" />BBBBBB<br class=\"rules_break\" />";
						var result = parserules(d);

						assert.ok(result === expected,"Multiple Line Returns");
					}
				);

				test(
					'Consecutive Line Returns',
					function() {

						var d = "A\n\n\n \n";
						var expected = "A<br class=\"rules_break\" /><br class=\"rules_break\" /><br class=\"rules_break\" /> <br class=\"rules_break\" />";
						var result = parserules(d);

						assert.ok(result === expected,"Consecutive Line Returns");
					}
				);

				/************** Payment Parsing Tests *******************/

				test(
					'Payments >>>',
					function() {

						var token = ">>>";
						var confirmStr = "<img src=\"/assets/payment_result.png\" />";

						fullDataPass(token, confirmStr);
					}
				);

			}
		)
	}
);
