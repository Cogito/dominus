_store = {}
_store.castles = {
	types: [
		'castle_01',
		'castle_02_keep',
		'castle_03_skull',
		'castle_04_arabian',
		'castle_05_waterfall'
		],
	types_not_free: [
		'castle_01',
		'castle_03_skull',
		'castle_04_arabian',
		'castle_05_waterfall'
		],
}

_store.castles.castle_01 = {
	name: 'Castle',
	image:  'castle_01.png',
	flag_offset_x: 3,
	flag_offset_y: -26,
	price: 2
}

_store.castles.castle_02_keep = {
	name: 'Keep',
	image: 'castle_02_keep.png',
	flag_offset_x: 3,
	flag_offset_y: -26,
	price: 0
}

_store.castles.castle_03_skull = {
	name: 'Skull Keep',
	image: 'castle_03_skull.png',
	flag_offset_x: -1,
	flag_offset_y: -28,
	price: 6
}

_store.castles.castle_04_arabian = {
	name: 'Arabian Palace',
	image: 'castle_04_arabian.png',
	flag_offset_x: 5,
	flag_offset_y: -29,
	price: 3
}

_store.castles.castle_05_waterfall = {
	name: 'Falling Water',
	image: 'castle_05_waterfall.png',
	flag_offset_x: -15,
	flag_offset_y: -26,
	price: 3
}
