Template.landing.helpers({
	form: function() {
		return Session.get('landingForm')
	},

	startText: function() {
		var start = moment(new Date(s.game_start_date))
		if (moment().isAfter(start)) {
			// game has already started
			return 'Game '+s.game_number+' started '+ start.fromNow()+'.'
		} else {
			// game has not started yet
			return 'Game '+s.game_number+' starts in '+ start.fromNow()+'.'
		}
	}
})


Template.landing.rendered = function() {

	Session.set('landingForm', 'landingCreateAccount')

	setViewport()
	setBackground()
	window.onresize = function() {
		setViewport()
		setBackground()
	}
}


Template.landing.created = function() {
	var self = this

	self.subs = new ReadyManager()

	self.autorun(function() {
		self.subs.subscriptions([{
			groupName: 'playerCount',
			subscriptions: [Meteor.subscribe('playerCount').ready()]
		}])
	})
}

var setBackground = function() {
	document.body.style.backgroundColor = '#111';
	document.body.style.backgroundImage = 'url(/landing/landingBg.jpg)';
	document.body.style.backgroundPosition = 'center top';
	document.body.style.backgroundRepeat = 'no-repeat';
	document.body.style.backgroundSize = 'cover';
	document.body.style.backgroundAttachment = 'fixed';
}


// set viewport for mobile
var setViewport = function() {
	var pageWidth = 550
	var zoom = screen.width / pageWidth
	if (zoom < 1) {
		var tag = document.getElementById('viewport')
		var content = 'initial-scale='+zoom+', maximum-scale='+zoom+', minimum-scale='+zoom+', user-scalable=no, width='+pageWidth
		tag.setAttribute('content', content)
	} else {
		var tag = document.getElementById('viewport')
		var content = 'initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, width=device-width'
		tag.setAttribute('content', content)
	}
}


Template.landingCreateAccount.helpers({
	serverAtMaxPlayers: function() {
		var numPlayers = Settings.findOne({name:'playerCount'})
		if (numPlayers) {
			if (numPlayers.value >= s.serverMaxPlayers) {
				return true
			}
		}
	}
})

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


var loginFormRendered = function() {
	this.find('.formContainer').parentNode._uihooks = landingLoginFormAnimation
}


Template.landingSignin.rendered = loginFormRendered
Template.landingCreateAccount.rendered = loginFormRendered
Template.landingForgotPassword.rendered = loginFormRendered
