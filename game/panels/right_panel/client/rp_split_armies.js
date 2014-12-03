Template.rp_split_armies.helpers({
	num_units: function(type) {
		return get_selected_unit(type)
	},

	old_army: function(type) {
		var parentData = Template.parentData(1)
		if (parentData) {
			return Template.parentData(1)[type] - get_selected_unit(type)
		}
	},
})

Template.rp_split_armies.events({
	'click #split_cancel_button': function(event, template) {
		Session.set('rp_template', 'rp_info_army')
	},

	'change .split_units_slider, input .split_units_slider': function(event, template) {
		var type = $(event.currentTarget).attr('data-type')
		var num = Number(event.currentTarget.value)
		set_selected_unit(type, num)
	},

	'click #split_confirm_button': function(event, template) {
		var button = template.find('#split_confirm_button')
		var alert = template.find('#split_error')

		$(alert).hide()
		var error = false

		var newNum = num_selected_units()
		if (newNum == 0) {
			error = true
			$(alert).show()
			$(alert).html('New army must have at least one soldier.')
		}

		if (!error) {
			var fields = {}
			_.each(s.army.types, function(type) {
				fields[type] = 1
			})
			var res = Armies.findOne({_id: Session.get('selected_id'), user_id: Meteor.userId()}, {fields: fields})
			if (res) {
				var oldNum = 0
				_.each(s.army.types, function(type) {
					oldNum += res[type]
				})
				if (newNum >= oldNum) {
					error = true
					$(alert).show()
					$(alert).html('Old army must still have at least one soldier.')
				}
			}
		}

		if (!error) {
			var button_html = $(button).html()
			$(button).attr('disabled', true)
			$(button).html('Please Wait')

			Meteor.apply('split_armies', [Session.get('selected_id'), get_selected_units()], {wait:true, onResultReceived:function(error, result) {
				if (result) {
					Session.set('selected_id', result)
					Session.set('rp_template', 'rp_info_army')
				} else {
					$(alert).show()
					$(alert).html('Error, could not split army.')

					$(button).attr('disabled', false)
					$(button).html(button_html)
				}
			}})
		}
	}
})

Template.rp_split_armies.rendered = function() {
	var self = this

	_.each(s.army.types, function(type) {
		set_selected_unit(type, 0)
	})


	this.autorun(function() {
		var fields = {}
		_.each(s.army.types, function(type) {
			fields[type] = 1
		})
		var res = Armies.findOne(Session.get('selected_id'), {fields: fields})
		if (res) {
			_.each(s.army.types, function(type) {
				set_selected_unit(type, Math.floor(res[type] / 2))

				var slider = this.$('.split_units_slider[data-type='+type+']')

				slider.attr('max', res[type])
				slider.val(Math.floor(res[type]/2))
				slider.attr('min', 0)

				if (res[type] == 0) {
					slider.prop('disabled', true)
				} else {
					slider.prop('disabled', false)
				}
			})
		}
	})
}