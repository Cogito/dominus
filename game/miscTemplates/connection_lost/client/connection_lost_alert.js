Template.connection_lost_alert.helpers({
    show: function() {
        return !Meteor.status().connected
    }
})


Template.connection_lost_alert.rendered = function() {
var canvasSize = Session.get('canvas_size')
    if (canvasSize) {
        $('#connectionLostPositioner').css('left', canvasSize.width/2 - 200)
        $('#connectionLostPositioner').css('top', canvasSize.height/2 - 150)
    }

    this.autorun(function() {
        var canvasSize = Session.get('canvas_size')
        if (canvasSize) {
            $('#connectionLostPositioner').css('left', canvasSize.width/2 - 200)
            $('#connectionLostPositioner').css('top', canvasSize.height/2 - 150)
        }
    })
}
