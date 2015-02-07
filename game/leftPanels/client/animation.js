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

landingLoginFormAnimation = {
	insertElement: function(node, next) {
		if (node.className.indexOf('alert') == -1) {
			$(node).hide().delay(51).insertBefore(next).fadeIn(100)
		} else {
			$(node).insertBefore(next)
		}
	},
	removeElement: function(node) {
		$(node).fadeOut(50, function() {
			$(node).remove()
		})
	}
}
