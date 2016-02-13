var Player = function(id, name, battery, x, y, lifes){
	this.name = name;
	this.id = id;
	this.x = x;
	this.y = y;
	this.lifes = lifes || 3;
	this.score = 0;
	this.battery = battery;
};

Player.prototype.getId = function(){
	return this.id;
}
Player.prototype.getName = function(){
	return this.name;
}
Player.prototype.getPos = function(){
	return {x: this.x, y: this.y};
}
Player.prototype.getX = function(){
	return this.x;
}
Player.prototype.getY = function(){
	return this.y;
}
Player.prototype.setPosition = function(x, y){
	this.x = x;
	this.y = y;
}
Player.prototype.getY = function(){
	return this.y;
}
Player.prototype.getBattery = function(){
	return this.battery;
}
Player.prototype.setBattery = function(battery){
	this.battery = battery;
}
Player.prototype.addBattery = function(val){
	this.battery += val;
}
Player.prototype.getLifes = function(){
	return this.lifes;
}
Player.prototype.isDied = function(){
	return this.lifes === 0;
}
Player.prototype.shooted = function(){
	if(this.lifes > 0) this.lifes--;
	return this.lifes === 0;
}
Player.prototype.makePoint = function(){
	this.score = this.score + 1;
}
Player.prototype.getScore = function(){
	return this.score;
}
Player.prototype.getRaw = function(){
	return {
		name    : this.name,
		x       : this.x,
		y       : this.y,
		lifes   : this.lifes,
		score   : this.score,
		battery : this.battery
	};
}

module.exports = Player;