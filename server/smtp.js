Meteor.startup(function () {
	process.env.MAIL_URL = 'smtp://user:pass@smtp.sendgrid.net:587';
});