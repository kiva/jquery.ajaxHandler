buster.spec.expose();

define(function (require) {
	'use strict';

	var expect = buster.expect
	, Backbone = require('jquery.ajaxHandler');

	describe('jquery.ajaxHandler', function () {

		it('has a settings object', function () {
			expect($.ajaxHandler._settings).toBeObject();
		});


		describe('.config', function () {
			it('modifies the settings object and returns it', function () {
				var result = jquery.ajaxHandler.config({blah: true});

				expect($.ajaxHandler._settings).toMatch(result);
				expect($.ajaxHandler._settings).toMatch({
					blah: true
				});
			});
		});


		describe('._reset', function () {
			it('resets the Backbone object back to its pre jquery.ajaxHandler state', function () {
				$.ajaxHandler.wrapAjax({why: 'peaches'});
				$.ajaxHandler._reset();

				expect($.ajaxHandler.ajax).toBeDefined();
				expect($.ajaxHandler.origAjax).not.toBeDefined();
				expect($.ajaxHandler._settings).toMatch({});
			});
		});


		describe('.wrapAjax', function () {
			it('wraps Backbone.ajax with our custom method', function () {
				Backbone.ajaxApi.wrapAjax();

				expect(Backbone.origAjax).toBeDefined();
				expect(Backbone.ajax).toBeDefined();
				expect(Backbone.ajaxApi.ajax).toBeDefined();
				expect(Backbone.ajaxApi._settings).toMatch({});

				Backbone.ajaxApi._reset();
			});


			it('configures ajaxApi if passed an "options" object', function () {
				this.spy(Backbone.ajaxApi, 'config');

				Backbone.ajaxApi.wrapAjax({what: 'dynoMITE!'});
				expect(Backbone.ajaxApi.config).toHaveBeenCalledWith({what: 'dynoMITE!'});

				Backbone.ajaxApi._reset();
			});
		});

	});
});