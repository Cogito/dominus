alertSharedEvents = {
    'click .openAlertButton': function(event, template) {
        if (Template.instance().isOpen.get()) {
            Template.instance().isOpen.set(false)
        } else {
            Template.instance().isOpen.set(true)
        }
    },

    'click .userLink': function(event, template) {
        var x = parseInt(event.currentTarget.getAttribute('data-x'))
        var y = parseInt(event.currentTarget.getAttribute('data-y'))
        var castle_id = event.currentTarget.getAttribute('data-castle_id')

        center_on_hex(x,y)
        Session.set('selected_type', 'castle')
        Session.set('selected_id', castle_id)
        Session.set('selected_coords', {x:x, y:y})
    },
}
