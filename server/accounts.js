Accounts.validateNewUser(function(user) {
	if (process.env.DOMINUS_WORKER == 'true') {
		return true
	} else {
		throw new Meteor.Error(503,'Dominus is full.  Please come back later.')
	}
})


Accounts.onCreateUser(function(options, user) {
	if (options.profile) {
		user.profile = options.profile;
	} else {
		user.profile = {};
	}

	// set admin
	user.admin = false;

	// if using a service to sign in put that email into user.emails
	// create username
	if (user.services) {
		if (user.services.google) {
			var email = user.services.google.email
			var verified = user.services.google.verified_email
			user.emails = [{address:email, verified:verified}]
			user.username = user.profile.name

			if (user.services.google.email == process.env.DOMINUS_ADMIN_EMAIL) {
				user.admin = true
			}
		}

		if (user.services.facebook) {
			var email = user.services.facebook.email
			user.emails = [{address:email, verified:true}]
			user.username = user.profile.name
		}
	}

	// if (Meteor.isServer && process.env.NODE_ENV == 'development') {
	// 	user.emails[0].verified = true
	// }

	user = setupNewUser(user)

	Cue.addTask('subscribeToNewsletter', {isAsync:true, unique:true}, {email:user.emails[0].address, name:user.username})

	// if someone was dominus make them not dominus
	remove_dominus()

	return user
})


Cue.addJob('subscribeToNewsletter', {retryOnError:true, maxMs:1000*60*5}, function(task, done) {
	subscribeToNewsletter(task.data.email, task.data.name)
	done()
})

// subscribe to mailchimp
subscribeToNewsletter = function(email, name) {
	if (Meteor.isServer && process.env.NODE_ENV != 'development') {
		var mailingLists = new MailChimpLists()

		var params = {
			email:{"email": email},
			id: Meteor.settings.private.MailChimp.listId,
			merge_vars: {
				fname: name,
				username: name
			},
			double_optin: false,
			update_existing: true,
			send_welcome: false
		}

		mailingLists.subscribe(params, function(error, data) {
			if (error) {
				console.log(error)
			}
		})
	}
}



// check when user logs in if they have a castle
// if not then they are a new user
// this gets called multiple times per user, careful
Accounts.onLogin(function(data) {
	if (data.user && !data.user.castle_id) {
		onCreateUser(data.user._id)
	}
})


onCreateUser = function(userId) {
	check(userId, String)
	Cue.addTask('create_castle', {isAsync:false, unique:true}, {user_id:userId})
	init_dailystats_for_new_user(userId)
	Cue.addTask('setupEveryoneChatroom', {isAsync:false, unique:true}, {})
}


Meteor.startup(function() {
	Accounts.loginServiceConfiguration.remove({service:'google'})
	Accounts.loginServiceConfiguration.remove({service:'facebook'})
	Accounts.loginServiceConfiguration.insert(Meteor.settings.googleLogin)
	Accounts.loginServiceConfiguration.insert(Meteor.settings.facebookLogin)
})


// also called in tests
setupNewUser = function(user) {
	user.gold = s.starting_resources.gold
	user.grain = s.starting_resources.grain
	user.lumber = s.starting_resources.lumber
	user.ore = s.starting_resources.ore
	user.clay = s.starting_resources.clay
	user.glass = s.starting_resources.glass
	user.wool = s.starting_resources.wool
	user.created_at = new Date()
	user.lord = null
	user.vassals = []
	user.allies = []
	user.allies_below = []
	user.allies_above = []
	user.team = []
	user.siblings = []
	user.is_king = true
	user.is_dominus = false
	user.show_welcome_screen = true
	user.num_vassals = 0
	user.num_allies = 0
	user.num_allies_above = 0
	user.num_allies_below = 0
	user.res_update = {
		gold: 0,
		grain: 0,
		lumber: 0,
		ore: 0,
		wool: 0,
		clay: 0,
		glass: 0
	}
	user.lp_show_armies = true
	user.lp_show_lords = true
	user.lp_show_allies = true
	user.hex_scale = 1
	user.income = 0
	user.purchases = {
		castles: [s.castle.starting_image]
	}
	user.losses = {}
	user.losses_worth = 0
	user.losses_num = 0
	user.sp_show_coords = false
	user.sp_show_minimap = true

	return user
}


Accounts.config({
	sendVerificationEmail:true,
	loginExpirationInDays: null
})

Accounts.emailTemplates.siteName = 'Dominus'
Accounts.emailTemplates.from = 'Dominus <dan@dominusgame.net>'
Accounts.emailTemplates.verifyEmail.subject = function() {
	return 'Email verification for Dominus'
}
