Template.battle_report_unit.helpers({
    unit_type: function(name) {
        if (this.type == name) {
            return true
        }
        return false
    },

    won_this_round: function() {
        return this.dif > 0
    },

    hasAllies: function() {
        return this.allies.length > 0
    },

    icon_name: function() {
        if (this.isAttacker) {
            return 'fa-gavel'
        } else {
            return 'fa-shield'
        }
    },

    wasDestroyed: function() {
        var data = Template.parentData(1)
        if (data) {
            return data.dead
        }
    },

    destroyedText: function() {
        var data = Template.parentData(1)
        if (data) {
            return _.humanize(data.type+' was destroyed.')
        }
    }
})


Template.battle_report_unit.events({
    'click .battle_report_goto_user': function(event, template) {
        Session.set('selected_type', 'castle')

        if (this.type == 'castle') {
            center_on_hex(this.x, this.y)
            Session.set('selected_id', this._id)
        } else {
            center_on_hex(this.castle_x, this.castle_y)
            Session.set('selected_id', this.castle_id)
        }
    },
})
