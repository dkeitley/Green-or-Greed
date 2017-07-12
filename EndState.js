function EndState() {
	this.button;
	this.background;
	this.names = ["Person A", "Person B", "Person C", "Person D", "Person E"];
	this.scores = [2,21,18, 15, 17];
}

EndState.prototype = {
	preload: function() {

	},
	create: function() {
		game.stage.backgroundColor = '#182d3b';

	    //line = new Phaser.Line(100, 100, 200, 200);

		game.add.text(200, 0 + index*50, "SCORES", { fontSize: '32px', fill: '#FFF' });

	    player1 = new Phaser.Rectangle(80, 100, 210 - 180, 50);
	    player2 = new Phaser.Rectangle(80, 150, 210 - 180, 50);
	    player3 = new Phaser.Rectangle(80, 200, 210 - 180, 50);
	    player4 = new Phaser.Rectangle(80, 250, 210 - 180, 50); 
	    player5 = new Phaser.Rectangle(80, 300, 210 - 180, 50);

	    game.debug.geom(player1, '#C0392B'); //RED
	    game.debug.geom(player2, '#3498DB'); //BLUE
	    game.debug.geom(player3, '#2ECC71'); //GREEN
	    game.debug.geom(player4, '#F1C40F'); //YELLOW
	    game.debug.geom(player5, '#7D3C98'); //PURPLE

	    for (var index = 0; index < 5; ++index) {
	        	game.add.text(150, 100 + index*50, this.names[index] + ': ' + this.scores[index], { fontSize: '32px', fill: '#FFF' });
	    }

	},

	update:function() {


	},

	actionOnClick: function() {


	}	
};