function ContModalBox(xpos,ypos,type,cont) {
	this.items = [];
	this.contnum = ["Africa","Australasia","Asia","Europe","NorthAmerica","SouthAmerica"].indexOf(cont);
	this.cont = cont;
	this.type = type;
	this.base;
	this.tax;
	this.research;
	this.total;
	this.output;
	//this.profit; 
	this.cost; 
	this.lobby;
	this.names_lookup = ["Coal","Nuclear","Gas","Wind","Solar","Hydro-electric"];
	this.dan_to_mic = ["coal","nuclear","gas","wind","solar","hydro"];
	
	var frame = game.add.graphics(0,0);
	frame.beginFill(0xD8232A)
	frame.drawRect(xpos,ypos,300,300);
	this.items.push(frame);

	this.items.push(game.add.text(xpos+10,ypos+5,this.names_lookup[type]));

	var step = 30;
	var ybase = ypos+15;
	this.items.push(game.add.text(xpos + 10, ybase+step,"Build Cost:",{font:"14px Arial"}));
	this.items.push(game.add.text(xpos + 10, ybase+(2*step),"Base Cost:",{font:"14px Arial"}));
	this.items.push(game.add.text(xpos + 10, ybase+(3*step),"Tax:",{font:"14px Arial"}));
	this.items.push(game.add.text(xpos + 10, ybase+(4*step),"Resource:",{font:"14px Arial"}));
	this.items.push(game.add.text(xpos + 10, ybase+(5*step),"Total Running Costs:",{font:"14px Arial"}));
	this.items.push(game.add.text(xpos + 10, ybase+(6*step),"Output:",{font:"14px Arial"}));
	//this.items.push(game.add.text(xpos + 10, ybase+(7*step),"Profit:",{font:"14px Arial"}));

	this.build = game.add.text(xpos + 230, ybase+step,"£0",{font:"14px Arial"});
	this.base = game.add.text(xpos + 230, ybase+(2*step),"£0",{font:"14px Arial"});
	this.tax = game.add.text(xpos + 230, ybase+(3*step),"£0",{font:"14px Arial"});
	this.resource = game.add.text(xpos + 230, ybase+(4*step),"£0",{font:"14px Arial"});
	this.output = game.add.text(xpos + 230, ybase+(6*step),"£0",{font:"14px Arial"});
	//this.profit = game.add.text(xpos + 230, ybase+(7*step),"£0",{font:"14px Arial"});

	var buy = game.add.graphics(0,0);
	buy.beginFill(0x23D82A);
	buy.drawRect(xpos+15,ypos+260,100,30);
	buy.inputEnabled = true;
	buy.events.onInputDown.add(function() {this.buyFacility(type);},this);
	this.items.push(game.add.text(xpos+50,ypos+265,"Buy",{font:"18px Arial"}));

	var demolish = game.add.graphics(0,0);
	demolish.beginFill(0xFF00F0)
	demolish.drawRect(xpos+15 +140,ypos+260,100,30);
	demolish.inputEnabled = true;
	demolish.events.onInputDown.add(function() {this.demolishFacility(type);},this);
	this.items.push(game.add.text(xpos+170,ypos+265,"Demolish",{font:"18px Arial"}));


	this.items.push(this.build);
	this.items.push(this.base);
	this.items.push(this.tax);
	this.items.push(this.resource);
	this.items.push(this.output);
	//this.items.push(this.profit);
	this.items.push(buy);
	this.items.push(demolish);


}

ContModalBox.prototype = {
	update: function() {
		var mic_type = this.dan_to_mic[this.type];


		var new_build = gameState.facilities[mic_type].building_costs;
		this.build.setText("£" + new_build);

		var new_base = gameState.facilities[mic_type].base_cost;
		this.base.setText("£" + new_base);

		var new_tax = gameState.regions[this.contnum].taxes[mic_type];
		this.tax.setText(new_tax + "x");

		var new_resource = gameState.facilities[mic_type].fuel_cost;
		this.resource.setText("£" + new_resource);

		var research = gameState.players[own_name].research[mic_type];
		var step = gameState.research_step;
		var base_output = gameState.facilities[mic_type].base_output;
		var output = base_output * (step*research + 1);
		this.output.setText(output)
		//research *research_step +  base_output

	},

	hideContBox: function() {
		for(var i=0; i<this.items.length; i++) {
			this.items[i].visible = false;
		}
	},

	showContBox: function() {
		for(var i=0; i<this.items.length; i++) {
			this.items[i].visible = true;
		}
	},

	buyFacility: function(type) {
		var data = {
			facility_type: this.dan_to_mic[type],
			region_id: this.contnum
		};
		client.socket.emit('build',data);

		console.log("Buy " + this.names_lookup[type] + " in " + this.cont);
	},

	demolishFacility: function(type) {
		client.socket.emit('demolish',{
			facility_type: this.dan_to_mic[type],
			region_id: this.contnum
		});
		console.log("Demolish " + this.names_lookup[type] + " in " + this.cont);
	}
};