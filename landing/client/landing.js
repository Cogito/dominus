Template.landing.helpers({
	form: function() {
		return Session.get('landingForm')
	},

	
})

Template.landing.rendered = function() {
	Session.set('landingForm', 'landingCreateAccount')

	resizeBg()
	window.onresize = resizeBg
}

function resizeBg() {
	var landingBg = $("#landingBg")
	var aspectRatio = landingBg.width() / landingBg.height()

	if (($(window).width() / $(window).height()) < aspectRatio) {
		landingBg.removeClass().addClass('bgHeight')
	} else {
		landingBg.removeClass().addClass('bgwidth')
	}
}


Template.landingCreateAccount.events({
	'click #landingSigninLink': function(event, template) {
		event.preventDefault()
		Session.set('landingForm', 'landingSignin')
	}
})


Template.landingSignin.events({
	'click #landingCreateAccountLink': function(event, template) {
		event.preventDefault()
		Session.set('landingForm', 'landingCreateAccount')
	},

	'click #landingForgotPasswordLink': function(event, template) {
		event.preventDefault()
		Session.set('landingForm', 'landingForgotPassword')
	},
})


Template.landingForgotPassword.events({
	'click #landingCreateAccountLink': function(event, template) {
		event.preventDefault()
		Session.set('landingForm', 'landingCreateAccount')
	},

	'click #landingSigninLink': function(event, template) {
		event.preventDefault()
		Session.set('landingForm', 'landingSignin')
	}
})