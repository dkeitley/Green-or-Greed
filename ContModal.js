function ContModal() {
	this.items = [];
	this.background;
	this.close;
	this.cont;
	this.contnum;
	this.res_prices = [];
	this.lob_prices = [];
	this.adv_price;
	this.boxes = [];
}

ContModal.prototype = {

	update: function() {
		for(var i=0; i<this.boxes.length;i++) {
			var box = this.boxes[i];
			box.update();
		}

		for(var i=0; i<this.res_prices.length; i++) {
			this.res_prices[i].setText("Buy (£"+ gameState.global_costs.research + ")");
			this.lob_prices[i].setText("Buy (£" + gameState.global_costs.lobby + ")");
		}
		this.adv_price.setText("Cost: £" + gameState.global_costs.advertise);



	},

	createContModal: function(cont) {
		var background = game.add.graphics(0,0);
		background.beginFill(0xFFFFFF)
		background.drawRect(0,0,game.width,game.height);
		background.alpha = 0.5;
		this.items.push(background);
		this.cont = cont;
		this.contnum= ["Africa","Australasia","Asia","Europe","NorthAmerica","SouthAmerica"].indexOf(cont);

		var close = game.add.text(0,0,"X");
		close.inputEnabled = true;

		this.items.push(game.add.text(560,0,cont));

		for(var i=0; i<=3; i++) {
			this.boxes.push(new ContModalBox(20 +(i*310),40,i,cont));
		}

		for(var i=4; i<6; i++) {
			this.boxes.push(new ContModalBox(20 +((i-4)*310),350,i,cont));
		}

		var xbase = 640;
		var ybase = 350;
		var xstep = 206;
		var xmargin = 10;
		var ymargin = 5;
		var yspacing = 30;

		this.createResearchBox(xbase,ybase);
		xbase = xbase+xstep;
		this.createLobbyBox(xbase,ybase);
		xbase= xbase+xstep;
		this.createAdvertiseBox(xbase,ybase);
		


		close.events.onInputDown.add(this.hideContModal,this);
		this.items.push(close);

	},
	hideContModal: function() {

		for(var i=0;i<this.boxes.length;i++) {
			this.boxes[i].hideContBox(); 
		}
		for(var i=0; i<this.items.length;i++) {
			this.items[i].visible = false;
		}
	},
	showContModal: function() {

		for(var i=0;i<this.boxes.length;i++) {
			this.boxes[i].showContBox(); 
		}

		for(var i=0; i<this.items.length;i++) {
			this.items[i].visible = true;
		}
	

	},


	createAdvertiseBox: function(xbase,ybase) {
		var xmargin = 30;
		var ymargin = 5;
		var yspacing = 30;

		var adv_box = game.add.graphics(0,0);
		adv_box.beginFill(0xF3B700)
		adv_box.drawRect(xbase,ybase,196,300);
		this.items.push(adv_box);
		xbase = xbase+5;
		this.items.push(game.add.text(xbase,ybase+5,"Advertise"));
		ybase = ybase+15;
		this.items.push(game.add.text(xbase,ybase+yspacing,"Player1 Reputation:",{font:"14px Arial"}));
		this.items.push(game.add.text(xbase,ybase+2*yspacing,"Player2 Reputation:",{font:"14px Arial"}));
		this.items.push(game.add.text(xbase,ybase+3*yspacing,"Player3 Reputation:",{font:"14px Arial"}));
		this.adv_price = game.add.text(xbase,ybase+5*yspacing,"Cost: £0",{font:"14px Arial"});
		this.items.push(this.adv_price);

		
		var advertise = game.add.graphics(0,0);
		advertise.beginFill(0x23D82A)
		advertise.drawRect(xbase+30,ybase+250,100,30);
		advertise.inputEnabled = true;
		advertise.events.onInputDown.add(this.advertise,this);
		this.items.push(advertise);
		this.items.push(game.add.text(xbase+55,ybase+255,"Buy",{font:"18px Arial"}));
	},

	advertise: function() {
		client.socket.emit('advertise',this.contnum);
		console.log("Advertised!");
	},

	research: function(type) {
		client.socket.emit('research',type);
		console.log("Researching " + type);
	},

	createResearchBox: function(xbase,ybase) {
		var xmargin = 10;
		var ymargin = 5;
		var yspacing = 30;
		//Frame
		var res_box = game.add.graphics(0,0);
		res_box.beginFill(0xF3B700)
		res_box.drawRect(xbase,ybase,196,300);
		this.items.push(res_box);

		//Title
		this.items.push(game.add.text(xbase+xmargin,ybase+ymargin,"Research"));

		//Coal line
		ybase = ybase+15+yspacing;
		this.items.push(game.add.text(xbase+xmargin,ybase,"Coal:",{font:"14px Arial"}));
		var old_res = game.add.text(xbase+xmargin+40,ybase,"(Old 1.2x)",{font:"10px Arial"});
		var new_res = game.add.text(xbase+xmargin+40,ybase+10,"(New 1.4x)",{font:"10px Arial"});
		this.items.push(old_res);
		this.items.push(new_res);
		var coal_res = game.add.graphics(0,0);
		coal_res.beginFill(0xF0FFF0)
		coal_res.drawRect(xbase+120,ybase-5,70,30);
		coal_res.inputEnabled = true;
		coal_res.events.onInputDown.add(function() { this.research('coal'); },this);
		this.items.push(coal_res);
		var coal_res_text = game.add.text(xbase+130,ybase,"Buy (£0)",{font:"12px Arial"});
		this.res_prices.push(coal_res_text);
		this.items.push(coal_res_text);

		yspacing = 40;

		//Nuclear line
		this.items.push(game.add.text(xbase+xmargin,ybase+(1*yspacing),"Nuclear:",{font:"14px Arial"}));
		var old_res = game.add.text(xbase+xmargin+55,ybase+yspacing,"(Old 1.2x)",{font:"10px Arial"});
		var new_res = game.add.text(xbase+xmargin+55,ybase+yspacing+10,"(New 1.4x)",{font:"10px Arial"});
		this.items.push(old_res);
		this.items.push(new_res);
		var button = game.add.graphics(0,0);
		button.beginFill(0xF0FFF0)
		button.drawRect(xbase+120,ybase+yspacing-5,70,30);
		button.inputEnabled = true;
		button.events.onInputDown.add(function() { this.research('nuclear'); },this)
		this.items.push(button);
		var nuc_res_text = game.add.text(xbase+130,ybase+yspacing,"Buy (£0)",{font:"12px Arial"});
		this.res_prices.push(nuc_res_text);
		this.items.push(nuc_res_text);

		//Gas line
		this.items.push(game.add.text(xbase+xmargin,ybase+(2*yspacing),"Gas:",{font:"14px Arial"}));
		var old_res = game.add.text(xbase+xmargin+40,ybase+2*yspacing,"(Old 1.2x)",{font:"10px Arial"});
		var new_res = game.add.text(xbase+xmargin+40,ybase+2*yspacing+10,"(New 1.4x)",{font:"10px Arial"});
		this.items.push(old_res);
		this.items.push(new_res);
		var button = game.add.graphics(0,0);
		button.beginFill(0xF0FFF0)
		button.drawRect(xbase+120,ybase+2*yspacing-5,70,30);
		button.inputEnabled = true;
		button.events.onInputDown.add(function() { this.research('gas'); },this)
		this.items.push(button);
		var gas_res_text = game.add.text(xbase+130,ybase+2*yspacing,"Buy (£0)",{font:"12px Arial"});
		this.res_prices.push(gas_res_text);
		this.items.push(gas_res_text);


		//Wind line
		this.items.push(game.add.text(xbase+xmargin,ybase+(3*yspacing),"Wind:",{font:"14px Arial"}));
		var old_res = game.add.text(xbase+xmargin+40,ybase+3*yspacing,"(Old 1.2x)",{font:"10px Arial"});
		var new_res = game.add.text(xbase+xmargin+40,ybase+3*yspacing+10,"(New 1.4x)",{font:"10px Arial"});
		this.items.push(old_res);
		this.items.push(new_res);
		var button = game.add.graphics(0,0);
		button.beginFill(0xF0FFF0)
		button.drawRect(xbase+120,ybase+3*yspacing-5,70,30);
		button.inputEnabled = true;
		button.events.onInputDown.add(function() { this.research('wind'); },this)
		this.items.push(button);
		var wind_res_text = game.add.text(xbase+130,ybase+3*yspacing,"Buy (£0)",{font:"12px Arial"});
		this.res_prices.push(wind_res_text);
		this.items.push(wind_res_text);

		//Solar line
		this.items.push(game.add.text(xbase+xmargin,ybase+(4*yspacing),"Solar:",{font:"14px Arial"}));
		var old_res = game.add.text(xbase+xmargin+40,ybase+4*yspacing,"(Old 1.2x)",{font:"10px Arial"});
		var new_res = game.add.text(xbase+xmargin+40,ybase+4*yspacing+10,"(New 1.4x)",{font:"10px Arial"});
		this.items.push(old_res);
		this.items.push(new_res);
		var button = game.add.graphics(0,0);
		button.beginFill(0xF0FFF0)
		button.drawRect(xbase+120,ybase+4*yspacing-5,70,30);
		button.inputEnabled = true;
		button.events.onInputDown.add(function() { this.research('solar'); },this)
		this.items.push(button);
		var sol_res_text = game.add.text(xbase+130,ybase+4*yspacing,"Buy (£0)",{font:"12px Arial"});
		this.res_prices.push(sol_res_text);
		this.items.push(sol_res_text);

		//Hydro
		this.items.push(game.add.text(xbase+xmargin,ybase+(5*yspacing),"Hydro-electric:",{font:"14px Arial"}));
		var old_res = game.add.text(xbase+xmargin,ybase+5*yspacing+15,"(Old 1.2x)",{font:"10px Arial"});
		var new_res = game.add.text(xbase+xmargin,ybase+5*yspacing+25,"(New 1.4x)",{font:"10px Arial"});
		this.items.push(old_res);
		this.items.push(new_res);
		var button = game.add.graphics(0,0);
		button.beginFill(0xF0FFF0)
		button.drawRect(xbase+120,ybase+5*yspacing-5,70,30);
		button.inputEnabled = true;
		button.events.onInputDown.add(function() { this.research('hydro'); },this)
		this.items.push(button);
		var hydro_res_text = game.add.text(xbase+130,ybase+5*yspacing,"Buy (£0)",{font:"12px Arial"});
		this.res_prices.push(hydro_res_text);
		this.items.push(hydro_res_text);

	},

	lobby: function(type) {
		var data = {
			facility_type: type,
			region_id: this.contnum
		};
		console.log(data);
		client.socket.emit('lobby',data);
		console.log("Lobby " + type);
	},

	createLobbyBox: function(xbase,ybase) {
		var xmargin = 10;
		var ymargin = 5;
		var yspacing = 40;

		var lobby_box = game.add.graphics(0,0);
		lobby_box.beginFill(0xF3B700)
		lobby_box.drawRect(xbase,ybase,196,300);
		this.items.push(lobby_box);

		xbase = xbase+xmargin;
		this.items.push(game.add.text(xbase,ybase+5,"Lobby"));
		ybase=ybase+5+yspacing;


		//Coal line
		this.items.push(game.add.text(xbase,ybase,"Coal:",{font:"14px Arial"}));
		var old_lob = game.add.text(xbase+xmargin+35,ybase,"(Old 1.2x)",{font:"10px Arial"});
		var new_lob = game.add.text(xbase+xmargin+35,ybase+10,"(New 1.4x)",{font:"10px Arial"});
		this.items.push(old_lob);
		this.items.push(new_lob);
		var coal_lob = game.add.graphics(0,0);
		coal_lob.beginFill(0xF0FFF0)
		coal_lob.drawRect(xbase+110,ybase-5,70,30);
		coal_lob.inputEnabled = true;
		coal_lob.events.onInputDown.add(function() { this.lobby('coal'); },this)
		this.items.push(coal_lob);
		var coal_lob_text = game.add.text(xbase+120,ybase,"Buy (£0)",{font:"12px Arial"});
		this.lob_prices.push(coal_lob_text);
		this.items.push(coal_lob_text);


		//Nuclear Line
		this.items.push(game.add.text(xbase,ybase+1*yspacing,"Nuclear:",{font:"14px Arial"}));
		var old_res = game.add.text(xbase+xmargin+45,ybase+yspacing,"(Old 1.2x)",{font:"10px Arial"});
		var new_res = game.add.text(xbase+xmargin+45,ybase+yspacing+10,"(New 1.4x)",{font:"10px Arial"});
		this.items.push(old_res);
		this.items.push(new_res);
		var nuc_lob = game.add.graphics(0,0);
		nuc_lob.beginFill(0xF0FFF0)
		nuc_lob.drawRect(xbase+110,ybase+yspacing-5,70,30);
		nuc_lob.inputEnabled = true;
		nuc_lob.events.onInputDown.add(function() { this.lobby('nuclear'); },this)
		this.items.push(nuc_lob);
		var nuc_lob_text = game.add.text(xbase+120,ybase+yspacing,"Buy (£0)",{font:"12px Arial"});
		this.lob_prices.push(nuc_lob_text);
		this.items.push(nuc_lob_text);

		//Gas line
		this.items.push(game.add.text(xbase,ybase+2*yspacing,"Gas:",{font:"14px Arial"}));
		var old_lob = game.add.text(xbase+xmargin+35,ybase+2*yspacing,"(Old 1.2x)",{font:"10px Arial"});
		var new_lob = game.add.text(xbase+xmargin+35,ybase+2*yspacing+10,"(New 1.4x)",{font:"10px Arial"});
		this.items.push(old_lob);
		this.items.push(new_lob);
		var gas_lob = game.add.graphics(0,0);
		gas_lob.beginFill(0xF0FFF0)
		gas_lob.drawRect(xbase+110,ybase+2*yspacing-5,70,30);
		gas_lob.inputEnabled = true;
		gas_lob.events.onInputDown.add(function() { this.lobby('gas'); },this)
		this.items.push(gas_lob);
		var gas_lob_text = game.add.text(xbase+120,ybase+2*yspacing,"Buy (£0)",{font:"12px Arial"});
		this.lob_prices.push(gas_lob_text);
		this.items.push(gas_lob_text);


		//Wind line
		this.items.push(game.add.text(xbase,ybase+3*yspacing,"Wind:",{font:"14px Arial"}));
		var old_lob = game.add.text(xbase+xmargin+35,ybase+3*yspacing,"(Old 1.2x)",{font:"10px Arial"});
		var new_lob = game.add.text(xbase+xmargin+35,ybase+3*yspacing+10,"(New 1.4x)",{font:"10px Arial"});
		this.items.push(old_lob);
		this.items.push(new_lob);
		var wind_lob = game.add.graphics(0,0);
		wind_lob.beginFill(0xF0FFF0)
		wind_lob.drawRect(xbase+110,ybase+3*yspacing-5,70,30);
		wind_lob.inputEnabled = true;
		wind_lob.events.onInputDown.add(function() { this.lobby('wind'); },this)
		this.items.push(wind_lob);
		var wind_lob_text = game.add.text(xbase+120,ybase+3*yspacing,"Buy (£0)",{font:"12px Arial"});
		this.lob_prices.push(wind_lob_text);
		this.items.push(wind_lob_text);


		//Solar line
		this.items.push(game.add.text(xbase,ybase+4*yspacing,"Solar:",{font:"14px Arial"}));
		var old_lob = game.add.text(xbase+xmargin+35,ybase+4*yspacing,"(Old 1.2x)",{font:"10px Arial"});
		var new_lob = game.add.text(xbase+xmargin+35,ybase+4*yspacing+10,"(New 1.4x)",{font:"10px Arial"});
		this.items.push(old_lob);
		this.items.push(new_lob);
		var solar_lob = game.add.graphics(0,0);
		solar_lob.beginFill(0xF0FFF0)
		solar_lob.drawRect(xbase+110,ybase+4*yspacing-5,70,30);
		solar_lob.inputEnabled = true;
		solar_lob.events.onInputDown.add(function() { this.lobby('solar'); },this);
		this.items.push(solar_lob);
		var solar_lob_text = game.add.text(xbase+120,ybase+4*yspacing,"Buy (£0)",{font:"12px Arial"});
		this.lob_prices.push(solar_lob_text);
		this.items.push(solar_lob_text);

		//Hydro line
		this.items.push(game.add.text(xbase,ybase+5*yspacing,"Hydro-electric:",{font:"14px Arial"}));
		var old_lob = game.add.text(xbase+xmargin,ybase+5*yspacing+15,"(Old 1.2x)",{font:"10px Arial"});
		var new_lob = game.add.text(xbase+xmargin,ybase+5*yspacing+25,"(New 1.4x)",{font:"10px Arial"});
		this.items.push(old_lob);
		this.items.push(new_lob);
		var hydro_lob = game.add.graphics(0,0);
		hydro_lob.beginFill(0xF0FFF0)
		hydro_lob.drawRect(xbase+110,ybase+5*yspacing-5,70,30);
		hydro_lob.inputEnabled = true;
		hydro_lob.events.onInputDown.add(function() { this.lobby('hydro'); },this)
		this.items.push(hydro_lob);
		var hydro_lob_text = game.add.text(xbase+120,ybase+5*yspacing,"Buy (£0)",{font:"12px Arial"});
		this.lob_prices.push(hydro_lob_text);
		this.items.push(hydro_lob_text);

	}



};