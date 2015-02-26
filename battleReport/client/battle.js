Template.battle.helpers({
    battle: function() {
        return Battles.findOne(this._id)
    }
})

Template.battle.created = function() {
    this.autorun(function() {
        if (Template.currentData()) {
            Meteor.subscribe('battle', Template.currentData()._id)
        }
    })
}

Template.battle.rendered = function() {
    document.body.style.backgroundColor = '#333';
}

Template.battleLoading.rendered = function() {
    document.body.style.backgroundColor = '#333';
}
