// duplicate this file, rename to "stripe.js" and fill in your keys
// "stripe.js" is in the .gitignore and not checked in

stripe_publishable_key = 'pk_test_cAwCeMfcNMJcnFldsBhabfFC'

if (Meteor.isServer) {
	stripe_secret_key = 'sk_test_vIn38YEDRNnSm2f3W3SMsQKb'
}