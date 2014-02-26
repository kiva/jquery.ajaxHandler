[![Build Status](https://travis-ci.org/kiva/jquery.ajaxHandler.png)](https://travis-ci.org/kiva/jquery.ajaxHandler)
[![Coverage Status](https://coveralls.io/repos/kiva/jquery.ajaxHandler/badge.png?branch=master)](https://coveralls.io/r/kiva/jquery.ajaxHandler?branch=master)
# jquery.ajaxHandler

Post-processing for jquery.ajax requests

## Basic Use

```
// Configure jquery.ajaxHandler
$.ajaxHandler.install({
	isAjaxHandlerEnabled: Boolean
	, url: Function
	, requestHeaders: Object
	, on401: Function
	, onFail: Function
});


// Set per request options.  Will override any existing options.
$.ajax(url, {
	ajaxHandlerOptions: {
		isAjaxHandlerEnabled: true
	}
});
```

