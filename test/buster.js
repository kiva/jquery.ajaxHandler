'use strict';

var config = module.exports;

config.development = {
	env: 'browser'
	, rootPath: '../'
	, deps: [
		'bower_components/jquery/jquery.js'
	]
	, sources: ['src/jquery.ajaxHandler.js']
	, specs: ['test/spec/**/*.js']
	, extensions: [ require('buster-coverage') ]
	, 'buster-coverage': {
		outputDirectory: 'test/coverage'
		, format: 'lcov'
		, combinedResultsOnly: true
	}
};