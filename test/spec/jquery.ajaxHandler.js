buster.spec.expose();

describe('jquery.ajaxHandler', function () {
	'use strict';

	var expect = buster.expect;

	before(function () {
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
		it('calls $.ajaxHandler.ajax()', function () {
			$.ajaxHandler.install();
			this.stub($.ajaxHandler, 'ajax').returns(new $.Deferred());

			$.ajaxHandler.handleAjaxRequest({});

			expect($.ajaxHandler.ajax).toHaveBeenCalled();
		});


		it('throws if an `options` object is not passed in', function () {
			$.ajaxHandler.install();

			this.stub($.ajaxHandler, 'ajax');

			expect(function () {
				$.ajaxHandler.handleAjaxRequest();
			}).toThrow();
		});

		// https://github.com/kiva/jquery.ajaxHandler/issues/1
		it('responds with a jqXhr promise', function () {
			var preInstallJqXhr, postInstallJqXhr
			, server = sinon.fakeServer.create();

			server.respondWith('Some response');

			preInstallJqXhr = $.ajax();
			server.respond();

			$.ajaxHandler.install({isAjaxHandlerEnabled: true});

			postInstallJqXhr = $.ajax();
			server.respond();

			// Compare the standard jqXhr object (preInstall) to the one returns by .handleAjaxRequest()
			expect(postInstallJqXhr).toMatch(function (postInstallJqXhr) {
				var isMatch = true;

				$.each(preInstallJqXhr, function (key) {
					if (!postInstallJqXhr[key]) {
						isMatch = false;
					}
				});

				return isMatch;
			});
		});
	});


	describe('.onBeforeSend()', function () {
		it('sets request headers, as specified in the options.requestHeaders array', function () {
			var fakeXhr = sinon.useFakeXMLHttpRequest()
			, request;

			fakeXhr.onCreate = function (xhr) {
				request = xhr;
			};

			$.ajaxHandler.install({
				isAjaxHandlerEnabled: true
				, requestHeaders: {
					Authorization: function () {
						return '12345';
					}
				}
			});

			$.ajax({ url: "/my/page" });

			expect(request.requestHeaders.Authorization).toBe('12345');
			fakeXhr.restore();
		});


		it('does not set the header if the header\'s value is undefined', function () {
			var fakeXhr = sinon.useFakeXMLHttpRequest()
			, request;

			fakeXhr.onCreate = function (xhr) {
				request = xhr;
			};

			$.ajaxHandler.install({
				isAjaxHandlerEnabled: true
				, requestHeaders: {
					// Note the function returns "undefined" and thus should not be set as a header value
					Authorization: function () {}
				}
			});

			$.ajax({ url: "/my/page" });

			expect(request.requestHeaders.Authorization).not.toBeDefined();
			fakeXhr.restore();
		});
	});
});