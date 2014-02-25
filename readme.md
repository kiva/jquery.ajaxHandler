[![Build Status](https://travis-ci.org/kiva/jquery.ajaxHandler.png)](https://travis-ci.org/kiva/jquery.ajaxHandler)
[![Coverage Status](https://coveralls.io/repos/kiva/jquery.ajaxHandler/badge.png?branch=master)](https://coveralls.io/r/kiva/jquery.ajaxHandler?branch=master)
# jquery.ajaxHandler

Post-processing for jquery.ajax requests

## Basic Use

```
// Configure our custom Backone.ajax wrapper

var options = {
	url: function (options) {
		if (envUtils.hasFullCorsSupport()) {
			return options.url;
		}

		return fallbackAPIUrl(url);
	}
	, requestHeaders: {
		Authorization: function (options) {
			return  generateOauthHeader(options);
		}
	}
	, on401: function (deferred) {
		var ajaxArgs = this;

		doStuff();
	}
};

new jquery.ajaxHandler(options);
```

