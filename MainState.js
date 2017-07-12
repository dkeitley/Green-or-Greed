function MainGameState() {
	this.gameState;
	this.scores = [];
	this.supdems = [];
	this.levels = [];
	this.contButtons = [];
	this.ContModals = [];
	this.type_lookup = ["Coal","Nuclear","Gas","Wind","Solar","Hydro-electric"];
	this.cont_lookup = ["Africa","Australasia","Asia","Europe","NorthAmerica","SouthAmerica"];
	this.contIcons = {
		Africa: [],
		Australasia: [],
		Asia: [],
		Europe:  [],
		NorthAmerica: [],
		SouthAmerica: []
	}
	
	
}

MainGameState.prototype = {
	preload: function() {
		game.load.image('map',"images/world_map.png");
		game.load.image('solar',"images/solar_icon.png");
		game.load.image('wind',"images/wind_icon.png");
		game.load.image('nuclear',"images/nuclear_icon.png");
		game.load.image('coal',"images/coal_icon.png");
		game.load.image('hydro',"images/hydro_icon.png");
		game.load.image('gas',"images/gas_icon.png");
		game.load.image('coin', "images/coin.png");


	},
	create: function() {
		var map = game.add.image(0,0,'map');
		map.scale.setTo(0.784,0.784);
		this.createIcons();
		this.createContButtons();
		this.createHud();

		this.createContModals();

	},

	update: function() {
		//update icons
		this.updateIcons();
		for(var i=0; i<this.ContModals.length; i++) {
			var modal = this.ContModals[i];
			modal.update();
		}
		for(var i=0; i<6; i++) {
			var new_supply = gameState.regions[i].supply;
			var new_demand = gameState.regions[i].demand;

			this.supdems[i].setText(this.cont_lookup[i] + ": " + this.adjustNum(new_supply) + "/" + this.adjustNum(new_demand));
		}

		var str = this.adjustNum(gameState.players[own_name].money);
		this.money.setText("Money: £" + str);

		this.scores[0].setText(own_name + ": " + (gameState.players[own_name].score*100).toFixed(2) + "%");
		for(var i=0; i<num_players-1; i++) {
			this.scores[i+1].setText(player_names[i] + ": " + (gameState.players[player_names[i]].score*100).toFixed(2) + "%");
		}
		this.levels[0].setText("Coal level: " + (gameState.resource_levels.coal*100).toFixed(2) + "%");
		this.levels[1].setText("Nuclear level: " + (gameState.resource_levels.nuclear*100).toFixed(2) + "%");
		this.levels[2].setText("Gas level: " + (gameState.resource_levels.gas*100).toFixed(2) + "%");


	},

	updateIcons: function() {
		for(var i = 0; i<6; i++) {
			this.updateCont(i);
		}
	},

	updateCont(cont) {
		//Coal
		var textfields = this.contIcons[this.cont_lookup[cont]];

		var own = textfields[0].num_facilities[0];  
		var active = gameState.regions[cont].players[own_name].active['coal'];
		own.setText( active + "/" + gameState.regions[cont].players[own_name].total['coal']);

		for(var i=1; i<num_players; i++) {
			var field = textfields[0].num_facilities[i];
			field.setText(gameState.regions[cont].players[player_names[i-1]].active['coal']);
		}

		//Nuclear
		var own = textfields[1].num_facilities[0]; 
		var active = gameState.regions[cont].players[own_name].active['nuclear'];
		own.setText( active + "/" + gameState.regions[cont].players[own_name].total['nuclear']);

		for(var i=1; i<num_players; i++) {
			var field = textfields[1].num_facilities[i];
			field.setText(gameState.regions[cont].players[player_names[i-1]].active['nuclear']);
		}

		//Gas
		var own = textfields[2].num_facilities[0]; 
		var active = gameState.regions[cont].players[own_name].active['gas'];
		own.setText( active + "/" + gameState.regions[cont].players[own_name].total['gas']);

		for(var i=1; i<num_players; i++) {
			var field = textfields[2].num_facilities[i];
			field.setText(gameState.regions[cont].players[player_names[i-1]].active['gas']);
		}

		//Wind
		var own = textfields[3].num_facilities[0]; 
		var active = gameState.regions[cont].players[own_name].active['wind'];
		own.setText( active + "/" + gameState.regions[cont].players[own_name].total['wind']);

		for(var i=1; i<num_players; i++) {
			var field = textfields[3].num_facilities[i];
			field.setText(gameState.regions[cont].players[player_names[i-1]].active['wind']);
		}

		//Solar
		var own = textfields[4].num_facilities[0]; 
		var active = gameState.regions[cont].players[own_name].active['solar'];
		own.setText( active + "/" + gameState.regions[cont].players[own_name].total['solar']);

		for(var i=1; i<num_players; i++) {
			var field = textfields[4].num_facilities[i];
			field.setText(gameState.regions[cont].players[player_names[i-1]].active['solar']);
		}

		//Hydro
		var own = textfields[5].num_facilities[0]; 
		var active = gameState.regions[cont].players[own_name].active['hydro'];
		own.setText( active + "/" + gameState.regions[cont].players[own_name].total['hydro']);

		for(var i=1; i<num_players; i++) {
			var field = textfields[5].num_facilities[i];
			field.setText(gameState.regions[cont].players[player_names[i-1]].active['hydro']);
		}

	},

	createIcons: function() {

		//Australia
		this.contIcons.Australasia[4] = new Icon('solar',1100,510);
		this.contIcons.Australasia[3] = new Icon('wind',1220,520);
		this.contIcons.Australasia[1] = new Icon('nuclear',1150,460);
		this.contIcons.Australasia[0] = new Icon('coal',1150,530);
		this.contIcons.Australasia[2] = new Icon('gas',1220,390);
		this.contIcons.Australasia[5] = new Icon('hydro',1210,460);

		//Europe
		this.contIcons.Europe[4] = new Icon('solar',780,80);
		this.contIcons.Europe[3] = new Icon('wind',595,100);
		this.contIcons.Europe[1] = new Icon('nuclear',780,140);
		this.contIcons.Europe[0] = new Icon('coal',700,140);
		this.contIcons.Europe[2] = new Icon('gas',640,150);
		this.contIcons.Europe[5] = new Icon('hydro',700,70);

		//South America
		this.contIcons.SouthAmerica[4] = new Icon('solar',390,490);
		this.contIcons.SouthAmerica[3] = new Icon('wind',320,510);
		this.contIcons.SouthAmerica[1] = new Icon('nuclear',330,340);
		this.contIcons.SouthAmerica[0] = new Icon('coal',370,430);
		this.contIcons.SouthAmerica[2] = new Icon('gas',340,600);
		this.contIcons.SouthAmerica[5] = new Icon('hydro',280,420);

		//North America
		this.contIcons.NorthAmerica[4] = new Icon('solar',120,200);
		this.contIcons.NorthAmerica[3] = new Icon('wind',170,250);
		this.contIcons.NorthAmerica[1] = new Icon('nuclear',200,160);
		this.contIcons.NorthAmerica[0] = new Icon('coal',180,80);
		this.contIcons.NorthAmerica[2] = new Icon('gas',330,120);
		this.contIcons.NorthAmerica[5] = new Icon('hydro',470,40);

		//Africa
		this.contIcons.Africa[4] = new Icon('solar',650,250);
		this.contIcons.Africa[3] = new Icon('wind',690,410);
		this.contIcons.Africa[1] = new Icon('nuclear',700,500);
		this.contIcons.Africa[0] = new Icon('coal',660,340);
		this.contIcons.Africa[2] = new Icon('gas',740,290);
		this.contIcons.Africa[5] = new Icon('hydro',560,310);

		//Asia
		this.contIcons.Asia[4] = new Icon('solar',780,240);
		this.contIcons.Asia[3] = new Icon('wind',1000,170);
		this.contIcons.Asia[1] = new Icon('nuclear',950,70);
		this.contIcons.Asia[0] = new Icon('coal',1030,300);
		this.contIcons.Asia[2] = new Icon('gas',890,160);
		this.contIcons.Asia[5] = new Icon('hydro',930,270);

	},

	createContButton: function(xpos,ypos,xsize,ysize,cont) {
		var button = game.add.graphics(0,0);
		button.beginFill(0xFFFFFF)
		button.drawRect(xpos, ypos, xsize, ysize);
		button.alpha = 0;
		button.inputEnabled = true;
		button.events.onInputDown.add(function() { this.displayModal(cont); }, this);
		return button;
	},

	createContButtons: function() {
		this.contButtons[0] = this.createContButton(1070, 450, 200, 150, 1); 
		this.contButtons[1] = this.createContButton(830,50,400,300,2); 
		this.contButtons[2] = this.createContButton(580,70,240,150,3);
		this.contButtons[3] = this.createContButton(70,20,350,300,4);
		this.contButtons[4] = this.createContButton(260,350,200,300,5);
		this.contButtons[5] = this.createContButton(540,250,280,330,0);

	},
	

	createContModals: function() {

		for(var i=0; i<6; i++) {
			var modal = new ContModal();
			modal.createContModal(this.cont_lookup[i]);
			modal.hideContModal();
			this.ContModals.push(modal);
		}
	},

	hideModal: function(cont) {
		this.ContModals[cont].hideContModal();
	},

	displayModal: function(cont) {
		this.ContModals[cont].showContModal();
	},

	createHud: function() {
		var player = 1;
		var HUD = game.add.graphics(0,0);
		HUD.beginFill(0xFF0000);
		HUD.drawRect(0, 680, 640, 40);
		HUD.beginFill(0x00FF00);
		HUD.drawRect(640, 680, 640, 40);
		this.money = game.add.text(350, 690,"Money: ",{ font: "18px Arial", backgroundColor: 'red'});

		var icon = game.add.sprite(285, 674, 'coin');
		icon.scale.setTo(0.2,0.2);

		HUD.beginFill(0x00A6ED);
		HUD.drawRect(640, 640, 640, 40);
		this.levels[0] = game.add.text(645, 645,"Coal level:",{ font: "16px Arial"});
		this.levels[1] =game.add.text(800, 645,"Nuclear level: ",{ font: "16px Arial"});
		this.levels[2] =game.add.text(1000, 645,"Gas level:",{ font: "16px Arial"});


		HUD.beginFill(0xFFFF00);
		HUD.drawRect(640 , 680, 128, 40);

		for (i = 0; i <= 5; i++){
			this.scores[i]= game.add.text(610 + ((i+1)*128) - 78, 690,"X%",{ font: "18px Arial"});
		}

		HUD.beginFill(0x9900FF);
		HUD.drawRect(0, 340, 180, 300);
		this.supdems.push(game.add.text(10,350,"Africa: 0/0",{font:"14px Arial"}));
		this.supdems.push(game.add.text(10,380,"Australasia: 0/0",{font:"14px Arial"}));
		this.supdems.push(game.add.text(10,410,"Asia: 0/0",{font:"14px Arial"}));
		this.supdems.push(game.add.text(10,440,"Europe: 0/0",{font:"14px Arial"}));
		this.supdems.push(game.add.text(10,470,"North America: 0/0",{font:"14px Arial"}));
		this.supdems.push(game.add.text(10,500,"South America: 0/0",{font:"14px Arial"}));
		
	},
	adjustNum: function(num) {
		if(num >= 1000000) {
			return ((num/1000000).toFixed(2) + "m");
		} else if (num >= 1000) {
			return ((num/1000).toFixed(2) + "k");
		} else {
			return num.toFixed(2);
		}

	}

};