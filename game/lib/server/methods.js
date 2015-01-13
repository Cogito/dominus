Meteor.methods({
  coords_to_id: function(x, y, type) {
    check(x, validNumber);
    check(y, validNumber);
    check(type, String);

    var id = false;

    switch (type) {
      case 'hex':
        var h = Hexes.findOne({x: x, y: y}, {fields: {_id: 1}});
        if (h) {
          id = h._id;
          var found = true;
        }
        break;
    }

    return id;
  }
});
