"use strict"

var FACILITY_TYPES = {
	COAL : 'coal',
	NUCLEAR : 'nuclear',
	GAS : 'gas',
	WIND : 'wind',
	SOLAR : 'solar',
	HYDRO : 'hydro'
};

var GLOBAL_COST_TYPES = {
	LOBBY : 'lobby',
	RESEARCH : 'research', 
	ADVERTISE : 'advertise'
}

function Resources(initialLevels, resourceCosts) {
	
	// Amount of that resource left in the world
	var levels = {};
	for(var key in initialLevels) {
		levels[key] = initialLevels[key];
	}

	// Request to use amount of resourceType. Returns amount you can use  
	this.use = function(resourceType, amount) {
		var actualAmount = Math.min(amount, levels[resourceType]);
		levels[resourceType] -= actualAmount;
		return actualAmount;
	}

	// Gets the cost of one unit of resourceType
	this.getCost = function(resourceType) {
		if(resourceType == FACILITY_TYPES.WIND
				|| resourceType == FACILITY_TYPES.SOLAR 
				|| resourceType == FACILITY_TYPES.HYDRO) {
			return 0;
		} else {
			return resourceCosts[resourceType];
		}
	}

	this.getLevel = function(resourceType) {
		return levels[resourceType];
	}

	this.getState = function() {
		return {
			[FACILITY_TYPES.COAL] : levels[FACILITY_TYPES.COAL] / initialLevels[FACILITY_TYPES.COAL],
			[FACILITY_TYPES.NUCLEAR] : levels[FACILITY_TYPES.NUCLEAR] / initialLevels[FACILITY_TYPES.NUCLEAR],
			[FACILITY_TYPES.GAS] : levels[FACILITY_TYPES.GAS] / initialLevels[FACILITY_TYPES.GAS],
		}
	}
}

function MyQueue() {

	var arr = [];

	this.isEmpty = function() {
		return arr.length == 0;
	}
	
	this.push = function(obj) {
		arr.push(obj);
	}

	this.pop = function() {
		var obj = arr[0];
		arr.splice(0, 1);
		return obj;
	}
}

function Player(name, model, initialMoney, facilityFactory, globalCosts, 
	regions, socket) {

	var self = this;

	// Amount of money this player has
	var money = initialMoney;

	// Reputations of this player per region
	var reputation = [];

	// Level of research per resourceType
	var researchLevels = {};
	
	// Array of arrays listing facilities per region
	var facilities = [];

	var isPaused = false;

	var commandQueue = new MyQueue();

	for(var i = 0; i < 6; i++) {
		reputation[i] = 0;
		facilities[i] = [];
	}
	for(var facilityType in FACILITY_TYPES) {
		researchLevels[FACILITY_TYPES[facilityType]] = 0;
	}

	this.pause = function() {
		isPaused = true;
	}

	this.start = function() {
		isPaused = false;
		doThings();
	}

	this.getTotalReputation = function() {
		var total = 0;
		for(var i = 0; i < 6; i++) {
			total += reputation[i];
		}
		return total;
	}

	this.notify = function(event, data) {
		socket.emit(event, data);
	}

	var doThings = function() {
		while(!commandQueue.isEmpty()) {
			var obj = commandQueue.pop();
			socketFunctions[obj.event](obj.data);
		}
	}

	socket.on('build', function(data) {
		commandQueue.push({
			'event' : 'build',
			'data' : data
		});
		if(!isPaused) doThings();
	});

	socket.on('demolish', function(data) {
		commandQueue.push({
			'event' : 'demolish',
			'data' : data
		});
		if(!isPaused) doThings();
	});

	socket.on('lobby', function(data) {
		commandQueue.push({
			'event' : 'lobby',
			'data' : data
		});
		if(!isPaused) doThings();
	});

	socket.on('research', function(facility_type) {
		commandQueue.push({
			'event' : 'research',
			'data' : facility_type
		});
		if(!isPaused) doThings();
	});

	socket.on('advertise', function(region_id) {
		commandQueue.push({
			'event' : 'advertise',
			'data' : region_id
		});
		if(!isPaused) doThings();
	});

	var socketFunctions = {
		'build' : function(data) {
			var facility = facilityFactory.build(data.facility_type, 
				regions[data.region_id], 
				self);
			if(money >= facility.getBuildCost()) {
				money -= facility.getBuildCost();
				facilities[data.region_id].push(facility);
				model.notifyChange();
				console.log(name + ' built a ' + data.facility_type 
					+ ' facility in region with id ' + data.region_id);
			}
		},
		'demolish' : function(data){
			var found = false; 
			for(var i = 0; i < facilities[data.region_id].length; i++) {
				var facility = facilities[data.region_id][i];
				if(facility.getType() == data.facility_type) {
					facilities[data.region_id].splice(i, 1);
					found = true;
					break;
				}
			}
			if(found) {
				model.notifyChange();
				console.log(name + ' demolished a ' + data.facility_type 
					+ ' facility in region with id ' + data.region_id);
			}
		},
		'lobby' : function(data) {
			if(money >= globalCosts[GLOBAL_COST_TYPES.LOBBY]) {
				regions[data.region_id].lobby(data.facility_type);
				money -= globalCosts[GLOBAL_COST_TYPES.LOBBY];
				model.notifyChange();
				console.log(name + ' lobbied in region with id ' + data.region_id 
					+ ' to reduce taxes on ' + data.facility_type + ' facilities.');
			}
		},
		'research' : function(facility_type){
			if(money >= globalCosts[GLOBAL_COST_TYPES.RESEARCH]) {
				researchLevels[facility_type]++;
				money -= globalCosts[GLOBAL_COST_TYPES.RESEARCH];
				model.notifyChange();
				console.log(name + ' researched ' + facility_type + ' facilities.');
			}
		},
		'advertise' : function(region_id){
			if(money >= globalCosts[GLOBAL_COST_TYPES.ADVERTISE]) {
				money -= globalCosts[GLOBAL_COST_TYPES.ADVERTISE];
				reputation[region_id] += 1;
				model.notifyChange();
				console.log(name + ' advertised in region with id ' + region_id + '.');
			}
		}
	};

	this.demolish = function(facility) {
		var regionId = facility.getRegion().getId();
		for(var i = 0; i < facilities[regionId].length; i++) {
			if(facility == facilities[regionId][i]) {
				facilities[regionId].splice(i, 1);
				break;
			}
		}
	}

	// returns the name of this user
	this.getName = function() {
		return name;
	}

	// Returns the research level of this user for given facilityType
	this.getResearchLevel = function(facilityType) {
		return researchLevels[facilityType];
	}

	// Returns array of facilities player has in region region
	this.getFacilities = function(region) {
		return facilities[region.getId()];
	}

	// Gives player amount money
	this.pay = function(amount) {
		money += amount;
	}

	// Deducts amount money from player
	this.charge = function(amount) {
		money -= amount;
	}

	this.getScore = function(totalDemand) {
		var score = 0;
		for(var i = 0; i < 6; i++) {
			for(var j = 0; j < facilities[i].length; j++) {
				var facility = facilities[i][j];
				if(facility.isRenewable()) {
					score += facility.getOutput();
				}
			}
		}
		return score / totalDemand;
	}

	// Returns players reputation
	this.getReputation = function(region) {
		return reputation[region];
	}

	this.getMoney = function() {
		return money;
	}

	this.getState = function(totalDemand) {
		return {
			'name' : name,
			'money' : money,
			'score' : this.getScore(totalDemand),
			'reputation' : reputation,
			'research' : researchLevels
		}
	}

	// Returns a comparator that will order players based on reputation
	// (low to high)
	Player.getComparitor = function(region) {
		return function(a, b) {
			if(a.getReputation(region) < b.getReputation(region)) {
				return -1;
			} else if(a.getReputation(region) > b.getReputation(region)) {
				return 1;
			} else if(a.getTotalReputation() < b.getTotalReputation()) {
				return -1
			} else if(a.getTotalReputation() > b.getTotalReputation()) {
				return 1 
			} else {
				return 0;
			}
		}
	}	

}

function Facility(facilityType, buildCost, baseCost, baseOutput, owner, region, 
	resources, researchStep) {

	var output = 0;

	// Returns true iff facility is renewable
	this.isRenewable = function() {
		return facilityType == FACILITY_TYPES.WIND
			|| facilityType == FACILITY_TYPES.SOLAR 
			|| facilityType == FACILITY_TYPES.HYDRO
	}

	// Returns cost of building facility
	this.getBuildCost = function() {
		return buildCost;
	}

	// returns true iff facility is providing the grid
	this.isActive = function() {
		return (output > 0);
	}

	// Returns type of facility
	this.getType = function() {
		return facilityType;
	}

	// Returns base maintenance cost
	this.getBaseCost = function() {
		return baseCost;
	}

	// Returns base energy output
	this.getBaseOutput = function() {
		return baseOutput;
	}

	// Returns region this facility is in
	this.getRegion = function() {
		return region;
	}

	this.getOutput = function() {
		return output;
	}

	this.getMaxOutput = function() {
		var outputMultiplyer = 1 + researchStep * owner.getResearchLevel(facilityType);
		var toReturn = baseOutput * outputMultiplyer
		if(!this.isRenewable())toReturn = Math.min(toReturn, resources.getLevel(facilityType));
		return toReturn;
	}

	// Causes facility to produce energy up to energyRequired. Returns amount of
	// energy produced
	this.produceEnergy = function(energyRequired) {
		var outputMultiplyer = 1 + 0.1 * owner.getResearchLevel(facilityType)
		output = Math.min(baseOutput * outputMultiplyer, energyRequired);
		if(!this.isRenewable()) {
			output = resources.use(facilityType, output);
		}
		var cost = output 
			* resources.getCost(facilityType) 
			* region.getTax(facilityType)
			+ baseCost;
		var income = output * region.getPrice();
		if(cost - income > owner.getMoney()) {
			owner.demolish(this);
			return 0;
		} else{
			owner.charge(cost);
			owner.pay(income);
			return output;
		}
	}
}

function FacilitiesFactory(buildCosts, baseCosts, baseOutputs, resources, researchStep) {

	// Builds a facility of type facilityType in region region belonging 
	// to owner
	this.build = function(facilityType, region, owner) {
		return new Facility(facilityType, 
			buildCosts[facilityType],
			baseCosts[facilityType],
			baseOutputs[facilityType],
			owner,
			region,
			resources,
			researchStep);
	}

	this.getState = function() {
		var state = {};
		for(var key in FACILITY_TYPES) {
			var facilityType = FACILITY_TYPES[key]
			state[facilityType] = {
				'fuel_cost' : resources.getCost(facilityType),
				'base_cost' : baseCosts[facilityType],
				'base_output' : baseOutputs[facilityType],
				'building_costs' : buildCosts[facilityType]
			}
		}
		return state;
	}
}

function Region(id, energyRequired, initialTaxes, taxStep, price) {

	// Dictionary of players keyed by name
	var players = {};

	// Array of players
	var playersArray = [];

	// dictionary of initial taxes
	var taxes = initialTaxes;

	// returns id associated with region
	this.getId = function() {
		return id;
	}

	// Adds player to region
	this.addPlayer = function(player) {
		players[player.getName()] = player;
		playersArray.push(player);
	}

	// Returns price that grid will pay per unit of energy
	this.getPrice = function() {
		return price;
	}

	// Returns tax associated with facilityType in this region
	this.getTax = function(facilityType) {
		if(facilityType == FACILITY_TYPES.WIND
				|| facilityType == FACILITY_TYPES.SOLAR 
				|| facilityType == FACILITY_TYPES.HYDRO) {
			return 0;
		} else {
			return taxes[facilityType];
		}
	}

	// Lobbies region to decrement tax on facilityType
	this.lobby = function(facilityType) {
		if(taxes[facilityType] >= 1 + taxStep) {
			taxes[facilityType] -= taxStep;
		}
	}

	// Makes region consume energy from facilities on it
	this.consumeEnergy = function() {
		var enegryLeft = energyRequired;
		playersArray.sort(Player.getComparitor(this));
		for(var i = playersArray.length - 1; i >= 0; i--) {
			var player = playersArray[i];
			var facilities = player.getFacilities(this);
			for(var j = 0; j < facilities.length; j++) {
				var facility = facilities[j];
				if(facility.isRenewable()) {
					enegryLeft -= facility.produceEnergy(enegryLeft);
				}
			}
		}
		for(var i = playersArray.length - 1; i >= 0; i--) {
			var player = playersArray[i];
			var facilities = player.getFacilities(this);
			for(var j = 0; j < facilities.length; j++) {
				var facility = facilities[j];
				if(!facility.isRenewable()) {
					enegryLeft -= facility.produceEnergy(enegryLeft);
				}
			}
		}
	}

	this.getState = function() {
		var supply = 0;
		var p = {};
		for(var name in players) {
			p[name] = { 'active' : {}, 'total' : {}};
			for(var key in FACILITY_TYPES) {
				var facilityType = FACILITY_TYPES[key];
				p[name].active[facilityType] = 0;
				p[name].total[facilityType] = 0;
			}
			var facilities = players[name].getFacilities(this);
			for(var i = 0; i < facilities.length; i++) {
				var facility = facilities[i];
				supply += facility.getMaxOutput();
				p[name].total[facility.getType()]++;
				if(facility.isActive()) {
					p[name].active[facility.getType()]++;
				}
			}
		}
		return {
			'players' : p,
			'demand' : energyRequired,
			'supply' : supply,
			'taxes' : taxes,
			'price' : this.getPrice()
		}
	}
}

function Model(initialMoney, facilitiesFactory, globalCosts, 
	energyDemands, initialTaxes, taxStep, researchStep, prices) {

	// Array of all regions
	var regions = [];

	var hasStarted = false;
	
	// Dictionary of players keyed by name
	var players = {};

	var numTicks = 0;

	var tickHandel;
	
	for(var i = 0; i < 6; i++) {
		regions[i] = new Region(i, 
			energyDemands[i], 
			initialTaxes, 
			taxStep,
			prices[i]);
	}

	// Adds a client to the game
	this.addPlayer = function(name, socket) {
		var player = new Player(name, 
			this,
			initialMoney, 
			facilitiesFactory, 
			globalCosts, 
			regions, 
			socket);
		players[player.getName()] = player;
		for(var i = 0; i < 6; i++) {
			regions[i].addPlayer(player);
		}
	}

	this.getPlayers = function() {
		return players;
	}

	// Starts game
	this.startGame = function() {
		if(!hasStarted) {
			hasStarted = true;
			var self = this;
			tickHandel = setInterval(function(){
				self.tick();
			}, 1000);
			this.notifyAllClients('game_start', generateState());
			console.log('====================');
			console.log('The game has started');
			console.log('====================');
		}
	}

	// Performs game tick
	this.tick = function() {
		for(var name in players) {
			players[name].pause();
		}
		numTicks++;
		for(var i = 0; i < 6; i++) {
			regions[i].consumeEnergy();
		}
		this.notifyChange();
		if(this.isGameOver()) {

		}
		if(this.isGameOver()) {
			var totalDemand = 0;
			for(var i = 0; i < energyDemands.length; i++) {
				totalDemand += energyDemands[i];
			}
			clearInterval(tickHandel);
			var scores = {};
			for(var name in players) {
				scores[name] = players[name].getScore(totalDemand);
			}
			notifyAllClients('game_over', scores);
			console.log('===============');
			console.log('The game is over');
			console.log('===============');
			console.log(scores);
		}
		for(var name in players) {
			players[name].start();
		}
	}

	this.isGameOver = function() {
		var totalDemand = 0;
		for(var i = 0; i < energyDemands.length; i++) {
			totalDemand += energyDemands[i];
		}
		var total = 0;
		for(var name in players) {
			total += players[name].getScore(totalDemand);
		}
		return total == totalDemand;
	}

	this.notifyAllClients = function(event, data) {
		for(var name in players) {
			players[name].notify(event, data);
		}
	}

	var generateState = function() {
		var totalDemand = 0;
		for(var i = 0; i < energyDemands.length; i++) {
			totalDemand += energyDemands[i];
		}
		var state = {
			'tax_step' : taxStep,
			'research_step' : researchStep,
			'players' : {},
			'regions' : [],
			'facilities' : {},
			'facilities' : facilitiesFactory.getState(),
			'global_costs' : globalCosts,
			'num_ticks' : numTicks,
			'resource_levels' : resources.getState()
		};
		for(var name in players) {
			state.players[name] = players[name].getState(totalDemand);
		}
		for(var i = 0; i < regions.length; i++) {
			state.regions[i] = regions[i].getState();
		}
		return state
	}

	// Sends message to all clients
	this.notifyChange = function() {
		this.notifyAllClients('notify_change', generateState());
	}
}

/*************************************
 * Change these to parameterize game *
 *************************************/

var buildCosts = {
	[FACILITY_TYPES.COAL] 		: 800,
	[FACILITY_TYPES.NUCLEAR] 	: 9000,
	[FACILITY_TYPES.GAS] 		: 990,
	[FACILITY_TYPES.WIND]		: 1010,
	[FACILITY_TYPES.SOLAR] 		: 1010,
	[FACILITY_TYPES.HYDRO] 		: 1000
};

var baseCosts = {
	[FACILITY_TYPES.COAL] 		: 100,
	[FACILITY_TYPES.NUCLEAR] 	: 200,
	[FACILITY_TYPES.GAS] 		: 100,
	[FACILITY_TYPES.WIND] 		: 100,
	[FACILITY_TYPES.SOLAR] 		: 100,
	[FACILITY_TYPES.HYDRO] 		: 100
};

var baseOutputs = {
	[FACILITY_TYPES.COAL] 		: 550,
	[FACILITY_TYPES.NUCLEAR] 	: 1100,
	[FACILITY_TYPES.GAS] 		: 550,
	[FACILITY_TYPES.WIND] 		: 130,
	[FACILITY_TYPES.SOLAR] 		: 125,
	[FACILITY_TYPES.HYDRO] 		: 110
};

var initialTaxes = {
	[FACILITY_TYPES.COAL] 		: 1.5,
	[FACILITY_TYPES.NUCLEAR] 	: 1.5,
	[FACILITY_TYPES.GAS] 		: 1.5,
	[FACILITY_TYPES.WIND]		: 0,
	[FACILITY_TYPES.SOLAR] 		: 0,
	[FACILITY_TYPES.HYDRO] 		: 0
};

var resourceCosts = {
	[FACILITY_TYPES.COAL] 		: 0.51,
	[FACILITY_TYPES.NUCLEAR] 	: 0.45,
	[FACILITY_TYPES.GAS] 		: 0.5,
	[FACILITY_TYPES.WIND]		: 0,
	[FACILITY_TYPES.SOLAR] 		: 0,
	[FACILITY_TYPES.HYDRO] 		: 0
};

var initialLevels = {
	[FACILITY_TYPES.COAL] 		: 2000000,
	[FACILITY_TYPES.NUCLEAR] 	: 2000000,
	[FACILITY_TYPES.GAS] 		: 2000000
};

var globalCosts = {
	[GLOBAL_COST_TYPES.LOBBY] 		: 201,
	[GLOBAL_COST_TYPES.RESEARCH] 	: 220, 
	[GLOBAL_COST_TYPES.ADVERTISE] 	: 190
};

var energyDemands = [
	3000,
	3000,
	3000,
	3000,
	3000,
	3000
];

var prices = [
	1,
	1,
	1,
	1,
	1,
	1
];

var taxStep = 0.1;
var researchStep = 0.1;

var initialMoney = 2000;

/******************
 * End parameters *
 ******************/

var resources = new Resources(initialLevels, resourceCosts)
var facilitiesFactory = new FacilitiesFactory(buildCosts, 
	baseCosts, 
	baseOutputs, 
	resources,
	researchStep);
var model = new Model(initialMoney, facilitiesFactory, globalCosts,
	energyDemands, initialTaxes, taxStep, researchStep, prices);

var allSockets = [];

var io = require('socket.io')(9001);
io.on('connect', function(socket) {
	allSockets.push(socket);
	socket.on('go', function(data){
		var players = model.getPlayers();
		for(var playerName in players) {
			socket.emit('notify_player_joined', playerName);
		}
		socket.on('join_request', function(playerName){
			if(model.getPlayers()[playerName]) {
				socket.emit('join_response', 0);
			} else {
				socket.emit('join_response', 1);
				//model.notifyAllClients('notify_player_joined', playerName)
				for(var i = 0; i < allSockets.length; i++) {
					var soc = allSockets[i];
					if(soc != socket) {
						soc.emit('notify_player_joined', playerName);
					}
				}
				model.addPlayer(playerName, socket);
				console.log(playerName + ' joined the game.');
			}
		});
		socket.on('start', function(){
			model.startGame();
		});
	});
});