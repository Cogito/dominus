Template.welcome_screen.events({
	'click #close_welcome_screen_button': function(event, template) {
		Meteor.call('hide_welcome_screen')
	}
})

Template.welcome_screen.rendered = function() {
	this.autorun(function() {
		var canvasSize = Session.get('canvas_size')
		if (canvasSize) {
			$('#welcome_screen').css('left', canvasSize.width/2 - 250)
			$('#welcome_screen').css('top', canvasSize.height/2 - 150)
		}
	})

	var canvasSize = Session.get('canvas_size')
	if (canvasSize) {
		$('#welcome_screen').css('left', canvasSize.width/2 - 250)
		$('#welcome_screen').css('top', canvasSize.height/2 - 150)
	}

	var _fbq = window._fbq || (window._fbq = []);
	if (!_fbq.loaded) {
		var fbds = document.createElement('script');
		fbds.async = true;
		fbds.src = '//connect.facebook.net/en_US/fbds.js';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(fbds, s);
		_fbq.loaded = true;
	}

	window._fbq = window._fbq || [];
	window._fbq.push(['track', '6020229310431', {'value':'0.00','currency':'USD'}]);
}
