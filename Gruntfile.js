'use strict';


module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')


		, meta: {
			version: '<%= pkg.version %>'
			, banner:
				'/*\n' +
					'* jquery.ajaxHandler v<%= meta.version %>\n' +
					'*\n' +
					'* Copyright (c) <%= grunt.template.today("yyyy") %> Kiva Microfunds\n' +
					'* Licensed under the MIT license.\n' +
					'* https://github.com/kiva/jquery.ajaxHandler/blob/master/license.txt\n' +
					'*/\n'
		}


		, buster: {
			dev: {
				test: {
					'config-group': 'development'
					, reporter: 'specification'
				}
			}
			, dist_amd: {
				test: {
					'config-group': 'dist_amd'
					, reporter: 'specification'
				}
			}
			, dist_iife: {
				test: {
					'config-group': 'dist_iife'
					, reporter: 'specification'
				}
			}
		}


		, jshint: {
			options: {
				jshintrc: '.jshintrc'
			}
			, all: ['src/*.js', 'test/spec/**/*.js']
		}


		, uglify: {
			minify: {
				options: {
					banner: '<%= meta.banner %>'
				}
				, files: {
					'dist/iife/jquery.ajaxHandler.min.js': ['dist/iife/jquery.ajaxHandler.js']
					, 'dist/amd/jquery.ajaxHandler.min.js': ['dist/amd/jquery.ajaxHandler.js']
				}
			}
		}


		, rig: {
			compile: {
				options: {
					banner: '<%= meta.banner %>'
				},
				files: {
					'dist/iife/jquery.ajaxHandler.js': ['build/_iife.js']
					, 'dist/amd/jquery.ajaxHandler.js': ['build/_amd.js']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-buster');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-rigger');

	grunt.registerTask('test', ['jshint', 'buster:dev']);
	grunt.registerTask('build', ['rig', 'uglify']);
};