Template.battle.helpers({
    battle: function() {
        return Battles.findOne(this._id)
    }
})


Template.battle.rendered = function() {
    window.onresize = function() {
        $('#battlePage').css('min-height', $(window).height())
    }

    $('#battlePage').css('min-height', $(window).height())
}

Template.battleLoading.rendered = function() {
    window.onresize = function() {
        $('#battlePage').css('min-height', $(window).height())
    }

    $('#battlePage').css('min-height', $(window).height())
}
