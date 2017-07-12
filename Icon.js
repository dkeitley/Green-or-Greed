function Icon(type,xpos,ypos) {
	this.num_facilities = []; //own indexed at 0

	var icon = game.add.sprite(xpos,ypos,type);
		
	if(type == 'solar' || type == 'hydro') {
		icon.scale.setTo(0.15,0.15);
	} else {
		icon.scale.setTo(0.2,0.2);
	} 

	var own = game.add.text(icon.x + icon.width + 2, icon.y ,"2/5",{ font: "12px Arial", backgroundColor: 'white'});
	this.num_facilities.push(own);

	for(var i=0; i< num_players-1; i++) {
			var player = game.add.text(icon.x + 2 + (i*10), icon.y + icon.height + 2,"2",{ font: "12px Arial", backgroundColor: 'white'});
			this.num_facilities.push(player);
	}

}