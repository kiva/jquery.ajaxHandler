$.ajaxHandler = {

	defaults: {
		isAjaxHandlerEnabled: false
	}


	, install: function (options) {
		$.ajaxHandler.config(options || {});

		$.ajaxHandler.origAjax = $.ajax;
		$.ajax = $.ajaxHandler.ajaxWrapper;
	}


	/**
	 * Convenience method for removing the custom jQuery.ajaxHandler behavior
	 * (used by unit tests)
	 */
	, remove: function () {
		$.ajax = this.origAjax;
		this.options = {};

		delete this.origAjax;
	}


	/**
	 *
	 * @param {Object} options
	 * @param {Object} options.requestHeaders
	 * @param {Function} options.on401
	 * @returns {Object}
	 */
	, config: function (options) {
		$.ajaxHandler.options = $.extend({}, $.ajaxHandler.defaults, options);
		return this.options;
	}


	/**
	 *
	 * @returns {Promise}
	 */
	, ajaxWrapper: function () {
		var args = Array.prototype.slice.call(arguments)
		, optionsIndex = typeof args[0] == 'string' ? 1 : 2
		, options = args[optionsIndex] || {}
		, ajaxHandlerOptions = options.ajaxHandlerOptions;

		// Merge per-request options with the runtime options
		ajaxHandlerOptions = $.extend({}, $.ajaxHandler.options, ajaxHandlerOptions);

		if (ajaxHandlerOptions.isAjaxHandlerEnabled) {
			if (optionsIndex == 1) {
				options.url = 	args[0];
			}

			return $.ajaxHandler.handleAjaxRequest.call(this, options);
		} else {
			return $.ajax.apply(this, args);
		}
	}


	/**
	 * Implement our own version of jQuery.Ajax that wraps the original.
	 * This way we can add a default handler for ajax failures.
	 *
	 * @returns {Promise}
	 */
	, handleAjaxRequest: function () {
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

				if (jqXhr.status == 401 && options.ajaxHandlerOptions.on401) {
					options.ajaxHandlerOptions.on401.call(this, deferred, jqXhr, statusText, error);
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

		if (options.beforeSend) {
			options.ajaxHandlerOptions.origBeforeSend = options.beforeSend
		}
		options.beforeSend = $.ajaxHandler.onBeforeSend;

		return $.ajaxHandler.origAjax(options.url, options);
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

		if (typeof $.ajaxHandler.options.onFail == 'function') {
			$.ajaxHandler.options.onFail.call(this, deferred, jqXhr, statusText, error);
		}

		return deferred.reject(jqXhr, statusText, error);
	}


	/**
	 *
	 * @param jqXhr
	 */
	, onBeforeSend: function (jqXhr, options) {
		var ajaxHandlerOptions = options.ajaxHandlerOptions;

		if (typeof ajaxHandlerOptions.url == 'function') {
			options.url = ajaxHandlerOptions.url.call(this, options);
		}

		// Add any custom request headers
		_.each(ajaxHandlerOptions.requestHeaders, function (header, name) {
			jqXhr.setRequestHeader(name, typeof header == 'function' ? header.call(this, jqXhr, options) : header);
		});

		// Make sure to call any pre-existing .beforeSend() callbacks
		if (typeof ajaxHandlerOptions.origBeforeSend == 'function') {
			ajaxHandlerOptions.origBeforeSend.call(this, jqXhr, options);
		}
	}
};