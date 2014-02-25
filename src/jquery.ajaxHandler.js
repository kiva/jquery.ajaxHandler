/**
 *
 * @param options
 * @constructor
 */
$.AjaxHandler = function (options) {
	$.AjaxHandler.config(options || {});

	$.origAjax = $.ajax;
	$.ajax = this.ajaxWrapper;
};


$.AjaxHandler.defaults = {
	isAjaxHandlerEnabled: false
};


$.AjaxHandler.prototype = {

	/**
	 *
	 * @param {Object} options
	 * @param {Object} options.requestHeaders
	 * @param {Function} options.on401
	 * @returns {Object}
	 */
	config: function (options) {
		this._settings = $.extend($.ajaxHandler.defaults, options);
		return this._settings;
	}


	/**
	 * Convenience method for removing the custom jQuery.ajaxHandler behavior
	 * (used by unit tests)
	 */
	, remove: function () {
		$.ajax = $.ajaxHandler.origAjax;
		$.ajaxHandler._settings = {};

		delete $.ajaxWrapper.origAjax;
	}


	/**
	 * Implement our own version of jQuery.Ajax that wraps the original.
	 * This way we can add a default handler for ajax failures.
	 *
	 * @returns {Promise}
	 */
	, ajaxWrapper: function () {
		var args = Array.prototype.slice.call(arguments)
		, options = args[0]
		, deferred = new $.Deferred()

		// The default error handler fires before any promise callbacks.
		// Store a reference to the default error handler and prevent the error from firing until we want it to.
		, errorHandler = options.error;

		options.error = null;

		$.ajaxHandler.ajax.apply(this, args)
			.done(function (response, statusText, jqXhr) {
				deferred.resolve(response, statusText, jqXhr);
			})
			.fail(function (jqXhr, statusText, error) {
				// Add the error handler
				this.error = errorHandler;

				if (jqXhr.status == 401) {
					$.ajaxHandler._settings.on401.call(this, deferred, jqXhr, statusText, error);
				} else {
					$.ajaxHandler.onFail.call(this, deferred, jqXhr, statusText, error);
				}
			});

		return deferred.promise();
	}


	/**
	 * Wraps $.Ajax() with some headers and modifies the url
	 *
	 * {Object} options
	 */
	, ajax: function (options) {
		var settings = $.ajaxHandler._settings
			, url = options.url
			, prevBeforeSend = options.beforeSend;

		if (options.isAjaxHandlerEnabled) {
			options.beforeSend = function (request) {
				if (typeof settings.url == 'function') {
					options.url = settings.url.call(this, options);
				}

				// Add any custom request headers
				_.each(settings.requestHeaders, function (header, name) {
					request.setRequestHeader(name, typeof header == 'function' ? header.call(this, request, options) : header);
				});

				// Make sure to call any pre-existing .beforeSend() callbacks
				if (typeof prevBeforeSend == 'function') {
					prevBeforeSend.call(this, request, options);
				}
			};
		}

		return $.ajax(url, options);
	}


	/**
	 *
	 * @param {Promise} deferred
	 * @param {Promise} jqXhr
	 * @param {String} statusText
	 * @param {String} error
	 * @returns {Promise}
	 */
	, onFail: function (deferred, jqXhr, statusText, error) {
		if (this.error) {
			this.error.call(this, jqXhr, statusText, error);
		}

		if (typeof $.ajaxHandler._settings.onFail == 'function') {
			$.ajaxHandler._settings.onFail.call(this, deferred, jqXhr, statusText, error);
		}

		return deferred.reject(jqXhr, statusText, error);
	}
};