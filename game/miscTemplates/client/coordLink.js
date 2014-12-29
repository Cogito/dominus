Template.coordLink.events({
  'click .coordLink': function(event, template) {
    event.preventDefault()
    center_on_hex(template.data.x, template.data.y)
  }
})
