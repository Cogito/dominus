Future = Npm.require('fibers/future')

BrowserPolicy.content.allowOriginForAll("http://www.google-analytics.com")
BrowserPolicy.content.allowOriginForAll("http://netdna.bootstrapcdn.com")
BrowserPolicy.content.allowOriginForAll("https://*.stripe.com")
BrowserPolicy.content.allowEval("https://*.stripe.com")