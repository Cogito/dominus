Template.subscription_ready_panel.rendered = function() {
    this.autorun(function() {
        var canvasSize = Session.get('canvas_size')
        if (canvasSize) {
            $('#subscription_ready_panel').css('left', canvasSize.width / 2 - 50)
        }
    })

    // show loading map panel
    this.autorun(function() {
        if (Session.get('subscription_ready')) {
            $('#subscription_ready_panel').fadeOut(50)
        } else {
            $('#subscription_ready_panel').fadeIn(50)
        }
    })
}
