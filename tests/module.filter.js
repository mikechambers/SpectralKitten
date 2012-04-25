var requirejs = require('./r.js');
var fs = require('fs');

requirejs.config({
		nodeRequire: require,
		baseUrl:"../src/www/js/"
	});


var data = [
	{a:"XXX", b:"ddd", c:"sss"},
	{a:"asdsa", b:"XXX", c:"sds"},
	{a:"XXXHJKHJK", b:"dfsdf", c:"dfds"},
	{a:"fdsfdsXXX", b:"dfsd", c:"sdfsd"},
	{a:"fdfsd", b:"fsdfs", c:"fsdfsd"},
	{a:"sdfsd", b:"X", c:"sdfsd"},
	{a:"sdfsd", b:"xXxd", c:"fdsf"},
	{a:"sasdxxxl", b:"xxx", c:"sds"},
];

requirejs(["assert", "filter"],
	function(assert, filter) {
		"use strict";
		
		suite("filter",
			function() {
				setup(
					function(done){
						done();
					}
				);

				teardown(
					function(){
 
					}
				);

				test(
					"filterByObject default",
					function() {
						var result = filter.byObject(data, "a", "XXX");
						
						assert.ok(result.length === 4, "Returned filter count incorrect : " + result.length);
					}
				);
				
				test(
					"filterByObject caseSensitive",
					function() {
						var result = filter.byObject(data, "a", "XXX", true);
						
						assert.ok(result.length === 3, "Returned filter count incorrect : " + result.length);
					}
				);
				
				test(
					"filterByObject explicity caseInsensitive",
					function() {
						var result = filter.byObject(data, "a", "XXX", false);
						
						assert.ok(result.length === 4, "Returned filter count incorrect : " + result.length);
					}
				);	
				
			}
		);

	}
);