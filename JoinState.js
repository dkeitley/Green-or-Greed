function JoinState() {
	this.button;
	this.background;
	this.numPlayersText;
	this.pos = 0;
	this.names = [];
	this.textfields = [];
}

JoinState.prototype = {
	preload: function() {

	    //game.load.spritesheet('button', 'assets/buttons/button_sprite_sheet.png', 193, 71);
	    game.load.image('button', 'images/assets/buttons/join.jpg', 188, 71);
	    game.load.image('start','images/assets/buttons/start.png');
	    //game.load.image('background','assets/misc/starfield.jpg');
	},

	create: function() {
		game.stage.backgroundColor = '#182d3b';

	    //line = new Phaser.Line(100, 100, 200, 200);

	    player1 = new Phaser.Rectangle(40 + 250, 100, 210 - 180, 50);
	    player2 = new Phaser.Rectangle(40 + 250, 150, 210 - 180, 50);
	    player3 = new Phaser.Rectangle(40 + 250, 200, 210 - 180, 50);
	    player4 = new Phaser.Rectangle(40 + 250, 250, 210 - 180, 50); 
	    player5 = new Phaser.Rectangle(40 + 250, 300, 210 - 180, 50);

	    game.debug.geom(player1, '#C0392B'); //RED
	    game.debug.geom(player2, '#3498DB'); //BLUE
	    game.debug.geom(player3, '#2ECC71'); //GREEN
	    game.debug.geom(player4, '#F1C40F'); //YELLOW
	    game.debug.geom(player5, '#7D3C98'); //PURPLE

	    button = game.add.button(game.world.centerX + 200, 600, 'button', this.actionOnClick, this, 2, 1, 0);
	    var start = game.add.button(game.world.centerX -  200, 550, 'start',this.startGame,this);
	    start.scale.setTo(0.5,0.5);

	    for (var index = 0; index < 5; ++index) {
	        var num = index + 1;
	        	game.add.text(12, 100 + index*50, num, { fontSize: '32px', fill: '#FFF' });
	    }

	    for (var index = 0; index < 5; ++index) {
        	this.textfields[index] = game.add.text(40, 100 + index*50, "", { fontSize: '32px', fill: '#000' });
    	}

	    var self = this;
	    client.socket.on('notify_player_joined',function(name) {
	    	console.log(name + " joined");
	    	num_players++;
	    	player_names.push(name);
			self.names.push(name)
		});
		
		this.numPlayersText = game.add.text(16, 16, 'Number of players: ' + this.names.length, { fontSize: '32px', fill: '#000' });
		client.socket.emit('go');

	},

	update:function() {
		//console.log(this.names);
		for (var index = 0; index < this.names.length; ++index) {
			this.textfields[index].setText(this.names[index]);
	    }
	    this.numPlayersText.setText("Number of Players: " + this.names.length);

	},
	

	up: function() {
		console.log('button up', arguments);
	},

	over: function() {
		console.log('button over');
	},

	out: function() {
		console.log('button out');
	},

	actionOnClick: function() {
		var player = prompt("Please enter your name");

    	var check = 0;

	    for (var index = 0; index < this.names.length; ++index) {
	        if (player === this.names[index]){
	            check = 1;
	        }
	    }

	    if ((Number(check) == Number("0")) && (player != undefined) ){
	        this.names.push(player);
	        this.numPlayersText.text = 'Number of players: ' + this.names.length;
	        this.pos += 1;
	        button.inputEnabled = false;
	    } else if (Number(check) == Number("1")){
	        window.alert("Name already taken! Choose another name");
	    }

	    own_name = player;
	    client.emitJoin(player);

	},

	startGame: function() {
		console.log("Start Game!");
	
		client.socket.emit('start');
	}	
}