prepareTextForForum = function(text) {
	text = text.replace(/\r?\n/g, '<br />');

	// sanitize-html has been removed
	// this won't work anymore?
	// var sanitizeHtml = Meteor.require('sanitize-html')
	// var clean_message = sanitizeHtml(text, {
	// 	allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
	// })

	// trying this instead of above
	return text.replace(/<(?!br\s*\/?)[^>]+>/g, '')
}