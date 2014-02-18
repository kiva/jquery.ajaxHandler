var $ = Backbone.$


/**
 * Implement our own version of Backbone.Ajax that wraps the original.
 * This way we can add a default handler for ajax failures.
 *
 * @returns {Promise}
 */
, bbAjax = function () {
	var args = Array.prototype.slice.call(arguments)
	, options = args[0]
	, deferred = new $.Deferred()

	// The default error handler fires before any promise callbacks.
	// Store a reference to the default error handler and prevent the error from firing until we want it to.
	, errorHandler = options.error;

	options.error = null;

	Backbone.ajaxApi.ajax.apply(this, args)
		.done(function (response, statusText, jqXhr) {
			deferred.resolve(response, statusText, jqXhr);
		})
		.fail(function (jqXhr, statusText, error) {
			// Add the error handler
			this.error = errorHandler;

			if (jqXhr.status == 401) {
				Backbone.ajaxApi._settings.on401.call(this, deferred, jqXhr, statusText, error);
			} else {
				Backbone.ajaxApi.onFail.call(this, deferred, jqXhr, statusText, error);
			}
		});

	return deferred.promise();
};


Backbone.ajaxApi = {
	_settings: {
		useCorsFallback: false
	}


	/**
	 *
	 * @param {Object} options
	 * @param {Object} options.requestHeaders
	 * @param {Function} options.on401
	 * @returns {Object}
	 */
	, config: function (options) {
		$.extend(this._settings, options);
		return this._settings;
	}


	/**
	 * Wraps Backbone.ajax with some our custom ajax logic
	 *
	 * @param {Object} Backbone
	 * @returns {Object}
	 */
	, wrapAjax: function (options) {
		if (options) {
			this.config(options);
		}

		Backbone.origAjax = Backbone.ajax;
		Backbone.ajax = bbAjax;

		return Backbone;
	}


	/**
	 * Wrapper around $.Ajax() that adds some custom headers as well as a fallback
	 *
	 * {Object} options
	 */
	, ajax: function (options) {
		var settings = Backbone.ajaxApi._settings
		, url = options.url;

		options.beforeSend = function (request) {
			if (settings.corsUrl) {
				options.url = settings.corsUrl.call(this, options);
			}

			// Add any custom request headers
			_.each(settings.requestHeaders, function (header, name) {
				request.setRequestHeader(name, typeof header == 'function' ? header.call(this, options, request) : header);
			});
		};

		return Backbone.$.ajax(url, options);
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

		if (typeof Backbone.ajaxApi._settings.onFail == 'function') {
			Backbone.ajaxApi._settings.onFail.call(this, deferred, jqXhr, statusText, error);
		}

		return deferred.reject(jqXhr, statusText, error);
	}


	/**
	 * Convenience method for resetting the Backbone object back to its pre Backbone.ajaxApi state
	 */
	, _reset: function () {
		Backbone.ajax = Backbone.origAjax;
		Backbone._settings = {};

		delete Backbone.origAjax;
	}
};