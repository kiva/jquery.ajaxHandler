buster.spec.expose();

define(function (require) {
	'use strict';

	var expect = buster.expect
	, Backbone = require('backbone.ajaxApi');

	describe('backbone.ajaxApi', function () {

		it('has a settings object', function () {
			expect(Backbone.ajaxApi._settings).toBeObject();
		});


		describe('.config', function () {
			it('modifies the settings object and returns it', function () {
				var result = Backbone.ajaxApi.config({blah: true});

				expect(Backbone.ajaxApi._settings).toMatch(result);
				expect(Backbone.ajaxApi._settings).toMatch({
					blah: true
				});
			});
		});


		describe('._reset', function () {
			it('resets the Backbone object back to its pre Backbone.ajaxApi state', function () {
				Backbone.ajaxApi.wrapAjax({why: 'peaches'});
				Backbone.ajaxApi._reset();

				expect(Backbone.ajax).toBeDefined();
				expect(Backbone.origAjax).not.toBeDefined();
				expect(Backbone.ajaxApi._settings).toMatch({});
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