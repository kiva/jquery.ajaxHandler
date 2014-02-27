buster.spec.expose();

describe('jquery.ajaxHandler', function () {
	'use strict';

	var expect = buster.expect;

	after(function () {
		$.ajaxHandler.remove();
	});


	describe('.install()', function () {
		it('sets the options', function () {
			$.ajaxHandler.install();
			expect($.ajaxHandler.options).toBeObject();
		});


		it('replaces $.ajax and keeps a reference to the old version', function () {
			$.ajaxHandler.install();

			expect($.ajax).toBeDefined();
			expect($.ajaxHandler.origAjax).toBeDefined();
		});
	});


	describe('.config()', function () {
		it('sets the `options` object using the defaults', function () {
			$.ajaxHandler.config();
			expect($.ajaxHandler.options).toBeObject();
			expect($.ajaxHandler.options.isAjaxHandlerEnabled).toBeFalse();
		});


		it('can override the defaults with new options', function () {
			$.ajaxHandler.config({isAjaxHandlerEnabled: true});
			expect($.ajaxHandler.options.isAjaxHandlerEnabled).toBeTrue();
		});


		it('sets properties on the `options` object and returns it', function () {
			var result = $.ajaxHandler.install({blah: true});

			expect($.ajaxHandler.options).toMatch(result);
			expect($.ajaxHandler.options).toMatch({
				blah: true
			});
		});
	});


	describe('.remove()', function () {
		it('resets the Backbone object back to its pre jquery.ajaxHandler state', function () {
			$.ajaxHandler.install({why: 'peaches'});
			$.ajaxHandler.remove();

			expect($.ajaxHandler.ajax).toBeDefined();
			expect($.ajaxHandler.origAjax).not.toBeDefined();
			expect($.ajaxHandler.options).not.toBeDefined();
		});
	});


	describe('.ajaxWrapper()', function () {
		it('replaces $.ajax and calls .handleAjaxRequest() if `ajaxHandlerOptions.isAjaxHandlerEnabled` == true', function () {
			$.ajaxHandler.install();
			this.stub($.ajaxHandler, 'handleAjaxRequest');

			$.ajaxHandler.ajaxWrapper({url: 'http://blah.org', ajaxHandlerOptions:{isAjaxHandlerEnabled: true}});
			expect($.ajaxHandler.handleAjaxRequest).toHaveBeenCalled();
		});


		it('it calls the original $.ajax() method if `ajaxHandlerOptions.isAjaxHandlerEnabled` == false', function () {
			$.ajaxHandler.install();
			this.stub($.ajaxHandler, 'origAjax');

			$.ajaxHandler.ajaxWrapper({url: 'http://blah.org'});
			expect($.ajaxHandler.origAjax).toHaveBeenCalled();
		});
	});


	describe('.handleAjaxRequest()', function () {
		it('calls calls $.ajaxHandler.ajax()', function () {
			this.stub($.ajaxHandler, 'ajax');
			$.ajaxHandler.handleAjaxRequest();

			expect($.ajaxHandler.ajax).toHaveBeenCalled();
		});
	});

});