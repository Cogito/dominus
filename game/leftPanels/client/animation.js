leftPanelAnimation = {
	insertElement: function(node, next) {
		$(node).hide().insertBefore(next).effect('blind', {direction:'left', mode:'show'}, 150).show()
	},
	removeElement: function(node) {
		$(node).effect('blind', {direction:'left', mode:'hide', complete: function() {
			$(node).remove()
		}}, 150)
	}
}