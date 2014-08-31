Meteor.startup(function() {
	Deps.autorun(function() {
		$('#not_logged_in').css('left', Session.get('canvas_size').half_width - 200)
		$('#not_logged_in').css('top', Session.get('canvas_size').half_height - 150)
	})
})

Template.not_logged_in.rendered = function() {
	$('#not_logged_in').css('left', Session.get('canvas_size').half_width - 200)
	$('#not_logged_in').css('top', Session.get('canvas_size').half_height - 150)
}