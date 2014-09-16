// this is old and not used

var army_types = ['footmen', 'archers', 'pikemen', 'cavalry', 'catapults']


Tinytest.add('battle - numDead', function(test) {
	battle = new Fight(0,0)
	test.equal(battle.numDead(1, 1, 0), 0, 'no enemies')
	test.equal(battle.numDead(-1, 1, 0), 0, 'no enemies')

	test.equal(battle.numDead(0, 2, 0), s.battle_dead_per_round_lose, 'tie battle')
	test.equal(battle.numDead(-1, 2, 0), s.battle_dead_per_round_lose, 'lose battle')
	test.equal(battle.numDead(0, 2, 10), s.battle_dead_per_round_lose, 'tie battle')
	test.equal(battle.numDead(-1, 2, 10), s.battle_dead_per_round_lose, 'lose battle')

	var percentageOfEnemyUnits = Math.floor(10 * s.battle_dead_per_round_win_percentage)
	var percentageOfLoserLosses = Math.floor(s.battle_dead_per_round_lose * s.battle_dead_per_round_win_percentage)
	var num_dead = Math.min(percentageOfEnemyUnits, percentageOfLoserLosses)
	test.equal(battle.numDead(1, 2, 10), num_dead, 'lose battle')
})



Tinytest.add('battle - findSurvivors', function(test) {
	battle = new Fight(0,0)
	battle.addToDead = function(unit, armyType, numDead) {}
	battle.numPartiesInBattle = 2

	var army = {_id:1, name:'armie', user_id:1, x:0, y:0, last_move_at:new Date(), username:'tester', castle_x:1, castle_y:1, castle_id:100, type:'army'}
	var enemy1 = {_id:2, name:'iname', user_id:2, x:0, y:0, last_move_at:new Date(), username:'test', castle_x:1, castle_y:1, castle_id:100, type:'army'}
	
	var survivors = {total:0}
	var numEnemySoldiers = 0
	_.each(s.army.types, function(type) {
		army[type] = 100
		enemy1[type] = 100
		survivors.total += 100
		numEnemySoldiers += 100
	})

	battle.defender = army
	battle.attackers = [enemy1]
	battle.allUnits = [army, enemy1]

	army.enemies = [battle.getDataForEnemy(enemy1)]

	army.dif = -1 	// lose

	test.equal(battle.findSurvivors(army).total, survivors.total - s.battle_dead_per_round_lose, 'vs enemy with army')

	army.dif = 1 	// win

	var num_dead = Math.floor(s.battle_dead_per_round_lose * s.battle_dead_per_round_win_percentage)

	test.equal(battle.findSurvivors(army).total, survivors.total - num_dead, 'vs enemy with army')
})


Tinytest.add('battle - getEnemies', function(test) {
	battle = new Fight(0,0)

	battle.defender = {_id:1, name:'kasl', user_id:1, x:0, y:0, username:'tstor', image:1, type:'castle', footmen:1, enemies:[]}
	var attacker1 = {_id:2, name:'armie', user_id:2, x:0, y:0, last_move_at:new Date(), username:'awesometestor', castle_x:1, castle_y:1, castle_id:100, type:'army', footmen:1, enemies:[]}
	var attacker2 = {_id:3, name:'armie', user_id:3, x:0, y:0, last_move_at:new Date(), username:'awesometestor', castle_x:1, castle_y:1, castle_id:100, type:'army', footmen:1, enemies:[]}
	var attacker3 = {_id:4, name:'armie', user_id:4, x:0, y:0, last_move_at:new Date(), username:'awesometestor', castle_x:1, castle_y:1, castle_id:100, type:'army', footmen:1, enemies:[]}
	var attacker4 = {_id:5, name:'armie', user_id:5, x:0, y:0, last_move_at:new Date(), username:'awesometestor', castle_x:1, castle_y:1, castle_id:100, type:'army', footmen:1, enemies:[]}

	battle.attackers = []
	battle.attackers.push(attacker1)
	battle.attackers.push(attacker2)
	battle.attackers.push(attacker3)
	battle.attackers.push(attacker4)

	battle.allUnits = [battle.defender].concat(battle.attackers)

	test.equal(battle.getEnemies(battle.defender), [], 'defender, no enemies')

	test.equal(battle.getEnemies(attacker1), [], 'attacker, no enemies')

	battle.defender.enemies = [battle.getDataForEnemy(battle.defender)]
	test.equal(battle.getEnemies(battle.defender), [], 'defender, self as enemy, return empty array')

	battle.defender.enemies = [battle.getDataForEnemy(attacker1)]
	test.equal(battle.getEnemies(battle.defender), [attacker1], 'defender, one enemy')

	battle.defender.enemies = [battle.getDataForEnemy(attacker1), battle.getDataForEnemy(attacker2), battle.getDataForEnemy(attacker4)]
	test.equal(battle.getEnemies(battle.defender), [attacker1, attacker2, attacker4], 'defender, three enemy')

	attacker1.enemies = [battle.getDataForEnemy(attacker1)]
	test.equal(battle.getEnemies(attacker1), [], 'attacker, self as enemy, return empty array')

	attacker1.enemies = [battle.getDataForEnemy(battle.defender)]
	test.equal(battle.getEnemies(attacker1), [battle.defender], 'attacker, one enemy')

	attacker1.enemies = [battle.getDataForEnemy(attacker3)]
	test.equal(battle.getEnemies(attacker1), [attacker3], 'attacker, one enemy')

	attacker1.enemies = [battle.getDataForEnemy(battle.defender), battle.getDataForEnemy(attacker2), battle.getDataForEnemy(attacker4)]
	test.equal(battle.getEnemies(attacker1), [battle.defender, attacker2, attacker4], 'attacker, three enemy')
})




Tinytest.add('battle - findWhoGetsCastle', function(test) {

	var battle = new Fight(0, 0)

	battle.attackers = []

	battle.castle = {name:'kasl', user_id:1, x:0, y:0, username:'tstor', image:1, type:'castle'}
	battle.castle.user = {user_id: 1, allies:[], team:[], allies_below:[], allies_above:[]}
	battle.castle.survivors = {}
	battle.castle.survivors.total = 0

	var army = {name:'armie', user_id:2, x:0, y:0, last_move_at:new Date(), username:'awesometestor', castle_x:1, castle_y:1, castle_id:100, type:'army'}
	army.user = {user_id: 2, allies:[], team:[], allies_below:[], allies_above:[]}
	army.survivors = {}
	army.survivors.total = 0

	var army2 = {name:'armie2', user_id:3, x:0, y:0, last_move_at:new Date(), username:'awesometestor2', castle_x:1, castle_y:1, castle_id:100, type:'army'}
	army2.user = {user_id: 3, allies:[], team:[], allies_below:[], allies_above:[]}
	army2.survivors = {}
	army2.survivors.total = 0

	
	battle.numPartiesInBattle = 1
	battle.defender = battle.castle
	test.equal(battle.findWhoGetsCastle(), false, 'fighting self')

	battle.numPartiesInBattle = 1
	battle.defender = army
	army.survivors.total = 10
	test.equal(battle.findWhoGetsCastle(), army, 'one attacker, castle is empty')

	battle.numPartiesInBattle = 2
	army.survivors.total = 10
	battle.defender = battle.castle
	battle.castle.survivors.total = 10
	battle.attackers = [army]
	test.equal(battle.findWhoGetsCastle(), army, 'one attacker, castle not empty')

	battle.numPartiesInBattle = 1
	army.survivors.total = 0
	battle.defender = army
	battle.attackers = []
	test.equal(battle.findWhoGetsCastle(), false, 'one attacker, no survivors')

	battle.numPartiesInBattle = 3
	army.survivors.total = 10
	army2.survivors.total = 10
	battle.defender = battle.castle
	battle.castle.survivors.total = 10
	army.last_move_at = new Date(0)
	battle.attackers = [army, army2]
	test.equal(battle.findWhoGetsCastle(), army, 'two attackers')

	battle.numPartiesInBattle = 3
	army.survivors.total = 10
	army2.survivors.total = 10
	battle.defender = battle.castle
	battle.castle.survivors.total = 10
	army.last_move_at = new Date()
	army2.last_move_at = new Date(0)
	battle.attackers = [army, army2]
	test.equal(battle.findWhoGetsCastle(), army2, 'two attackers')
})



Tinytest.add('battle - isEnemy', function(test) {

	var battle = new Fight(0, 0)

	var castle = {name:'kasl', user_id:1, x:0, y:0, username:'tstor', image:1, type:'castle'}
	var army = {name:'armie', user_id:2, x:0, y:0, last_move_at:new Date(), username:'awesometestor', castle_x:1, castle_y:1, castle_id:100, type:'army'}
	var army2 = {name:'armie2', user_id:3, x:0, y:0, last_move_at:new Date(), username:'awesometestor2', castle_x:1, castle_y:1, castle_id:100, type:'army'}

	_.each(army_types, function(type) {
		castle[type] = 1
		army[type] = 1
	})

	// can't fight your own unit
	castle.user = {user_id: 1, allies:[], team:[], allies_below:[], allies_above:[]}
	army.user_id = 1
	test.equal(battle.isEnemy(castle, army), false, 'cant fight self')

	// army vs army

	// no relationship
	army.user_id = 2
	army.user = {user_id: 2, allies:[], team:[], allies_below:[], allies_above:[]}
	test.equal(battle.isEnemy(army, army2), true, 'no relationship')

	// ally enemy
	army.user_id = 2
	army.user = {user_id: 2, allies:[], team:[3], allies_below:[], allies_above:[]}
	test.equal(battle.isEnemy(army, army2), true, 'ally enemy')

	// below
	army.user = {user_id: 2, allies:[3], team:[3], allies_below:[3], allies_above:[]}
	test.equal(battle.isEnemy(army, army2), false)

	// above
	army.user = {user_id: 2, allies:[3], team:[3], allies_below:[], allies_above:[3]}
	test.equal(battle.isEnemy(army, army2), false)

	// army vs castle

	// no relationship
	army.user = {user_id: 2, allies:[], team:[], allies_below:[], allies_above:[]}
	test.equal(battle.isEnemy(army, castle), true)

	// ally enemy
	army.user = {user_id: 3, allies:[], team:[1], allies_below:[], allies_above:[]}
	test.equal(battle.isEnemy(army, castle), true)

	// below
	army.user = {user_id: 3, allies:[1], team:[1], allies_below:[1], allies_above:[]}
	test.equal(battle.isEnemy(army, castle), false)

	// above
	army.user = {user_id: 3, allies:[1], team:[1], allies_below:[], allies_above:[1]}
	test.equal(battle.isEnemy(army, castle), true)

	// castle vs army

	// no relationship
	army.user_id = 2

	castle.user = {user_id: 1, allies:[], team:[], allies_below:[], allies_above:[]}
	test.equal(battle.isEnemy(castle, army), true, 'castle vs army - no relationship')

	// ally enemy
	castle.user = {user_id: 1, allies:[], team:[2], allies_below:[], allies_above:[]}
	test.equal(battle.isEnemy(castle, army), true, 'castle vs army - ally enemy')

	// below
	castle.user = {user_id: 1, allies:[2], team:[2], allies_below:[2], allies_above:[]}
	test.equal(battle.isEnemy(castle, army), true, 'castle vs army - below')

	// above
	castle.user = {user_id: 1, allies:[2], team:[2], allies_below:[], allies_above:[2]}
	test.equal(battle.isEnemy(castle, army), false, 'castle vs army - above')
})