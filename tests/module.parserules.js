var requirejs = require('./r.js');
requirejs.config({
		nodeRequire: require,
		baseUrl:"../src/www/js/"
	});

requirejs(['assert', 'parserules'],
	function(assert, parserules) {

	    suite('parserules',
	    	function() {

	    		setup(
	    			function(){

	    			}
	    		);

	    		teardown(
	    			function(){

	    			}
	    		);

	        	test(
	        		'is function', 
	        		function() {
	            		assert.ok(typeof parserules === "function", "parserules is not a function");
	        		}
	        	);


	    	}
	    )
	}
);
