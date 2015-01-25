if (!(typeof MochaWeb === 'undefined')){
    MochaWeb.testOnly(function(){
        describe("castle creation", function(){

            before(function() {
                createPlayer1()

                // add some rings so that mapbaker doesn't get called
                generate_hexes(8, false)
            })

            it("should create castle for user", function(){
                var player1 = Meteor.users.findOne({username:'player1'}, {fields: {_id:1}})

                chai.assert.isUndefined(player1.x)
                chai.assert.isUndefined(player1.y)
                chai.assert.isUndefined(player1.castle_id)

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
