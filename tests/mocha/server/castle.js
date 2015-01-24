if (!(typeof MochaWeb === 'undefined')){
    MochaWeb.testOnly(function(){
        describe("castle", function(){
            it("should create castle for user", function(){

                var player1 = Meteor.users.findOne({username:'player1'}, {fields: {_id:1}})

                chai.assert.isUndefined(player1.x)
                chai.assert.isUndefined(player1.y)

                create_castle(player1._id)
                var castle = Castles.findOne({user_id:player1._id})

                chai.assert.isNumber(castle.x)
                chai.assert.isNumber(castle.y)

                var player1 = Meteor.users.findOne({username:'player1'})

                chai.assert.isObject(castle)
                chai.assert.equal(player1.x, castle.x)
                chai.assert.equal(player1.y, castle.y)
                chai.assert.equal(player1.castle_id, castle._id)
            });
        });
    });
}
