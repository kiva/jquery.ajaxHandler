[![Build Status](https://travis-ci.org/kiva/backbone.ajaxApi.png)](https://travis-ci.org/kiva/backbone.ajaxApi)
[![Coverage Status](https://coveralls.io/repos/kiva/backbone.ajaxApi/badge.png?branch=master)](https://coveralls.io/r/kiva/backbone.ajaxApi?branch=master)
# Backbone.ajaxApi

Post-processing for jquery.ajax requests

## Basic Use

```
// Configure our custom Backone.ajax wrapper
Backbone.ajaxApi.config({
	corsUrl: function (options) {
		if (envUtils.hasFullCorsSupport()) {
			return options.url;
		}

		return qi.model.get('api_host') + options.url.slice(options.url.indexOf('org/api/') + 7);
	}
	, requestHeaders: {
		Authorization: function (options) {
			return  qi.oauth.generateHeader(options.type, options.url /* @Todo OauthAccess does not currently support adding body data , JSON.parse(options.data || null)*/);
		}
	}
	, on401: function (deferred) {
		var ajaxArgs = this;

		// We call reissue for new oauth tokens, and make another attempt.
		qi.reissueApiTokens()
			.done(function () {
				// The reissue was succesful, and the new tokens have been updated...make a final attempt before puking...
				Backbone.ajaxApi.ajax(ajaxArgs)
					.done(function (response, statusText, jqXhr) {
						deferred.resolve(response, statusText, jqXhr);
					})
					.fail(function (jqXhr, statusText, error) {
						Backbone.ajaxApi.onFail.call(this, deferred, jqXhr, statusText, error);
					});
			})
			.fail(function () {
				// The token reissue failed, which means the user is logged out.  Refresh the page and have them log back in...
				location.reload(true);
			});
	}
});
```

