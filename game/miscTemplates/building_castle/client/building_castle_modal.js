Template.building_castle_modal.helpers({
    show: function() {
        return Session.get('show_building_castle_modal')
    }
})


Template.building_castle_modal.rendered = function() {
    var canvasSize = Session.get('canvas_size')
    if (canvasSize) {
        $('#buildingCastlePositioner').css('left', canvasSize.width/2 - 200)
        $('#buildingCastlePositioner').css('top', canvasSize.height/2 - 30)
    }

    this.autorun(function() {
        var canvasSize = Session.get('canvas_size')
        if (canvasSize) {
            $('#buildingCastlePositioner').css('left', canvasSize.width/2 - 200)
            $('#buildingCastlePositioner').css('top', canvasSize.height/2 - 30)
        }
    })
}
