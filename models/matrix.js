var Enums = require('./enums');

var Matrix = function(rowsOrArray){
	if(typeof rowsOrArray !== 'number'){
		this.matrix = rowsOrArray;
		this.rows = this.matrix.length;
		return;
	}
	var rows = rowsOrArray;
	this.rows = rows;
	var matrix = [];
	for(var i = 0; i < rows; i++){
		matrix[i] = [];
		for(var j = 0; j < rows; j++){
			matrix[i][j] = Enums.ITEM_EMPTY;
		}
	}
	this.matrix = matrix;
}

function getRandom(min, max) {
  	return Math.floor(Math.random() * (max - min + 1)) + min;
}

Matrix.prototype.getRaw = function(){
	var m = [];
	for(var i = 0; i < this.rows; i++){
		m[i] = [];
		for(var j = 0; j < this.rows; j++){
			m[i][j] = typeof this.matrix[i][j] === 'number' ? this.matrix[i][j] : Enums.ITEM_EMPTY;
		}
	}
	return m;
}

Matrix.prototype._findRandomPos = function(){
	var seed = getRandom(0, this.rows*this.rows - 1);
	var x, y;
	do{
		x = Math.floor(seed/this.rows);
		y = seed%this.rows;
		seed = (seed+1)%(this.rows*this.rows);
	}
	while(this.matrix[x][y] != Enums.ITEM_EMPTY);
	return {x: x, y: y};
}

Matrix.prototype._set = function(x, y, val){
	this.matrix[x][y] = val;
}

Matrix.prototype.clear = function(){
	for(var i = 0; i < this.rows; i++)
		for(var j = 0; j < this.rows; j++)
			this.matrix[i][j] = Enums.ITEM_EMPTY;
}

Matrix.prototype.createRoom = function(startX, startY, endX, endY){
	if((endX - startX <= 3) || (endY - startY <= 3)){
		return;
	} 
	var randX = getRandom(startX + 2, endX - 2);
	var randY = getRandom(startY + 2, endY - 2);
	for(var i = startX; i <= endX; i++) this._set(i, startY, Enums.ITEM_WALL);
	for(var i = startY; i <= endY; i++) this._set(endX, i, Enums.ITEM_WALL);
	for(var i = startX; i <= endX; i++) this._set(i, endY, Enums.ITEM_WALL);
	for(var i = startY; i <= endY; i++) this._set(startX, i, Enums.ITEM_WALL);
	//Top left
	this.createRoom(startX, startY, randX, randY);
	//Top right
	this.createRoom(randX, startY, endX, randY);
	//Bottom left
	this.createRoom(startX, randY, randX, endY);
	//Bottom right
	this.createRoom(randX, randY, endX, endY);


	function openWall(fnc){
		var holes = getRandom(1, 4);	
		for(var i = 0; i < holes; i++) fnc();
	}
	openWall(() => this._set(startX, getRandom(startY + 2, endY - 2), Enums.ITEM_EMPTY));
	openWall(() => this._set(endX,   getRandom(startY + 2, endY - 2), Enums.ITEM_EMPTY));
	openWall(() => this._set(getRandom(startX + 2, endX - 2), endY , Enums.ITEM_EMPTY));
	openWall(() => this._set(getRandom(startX + 2, endX - 2), startY , Enums.ITEM_EMPTY));
}

Matrix.prototype.randomize = function(){
	this.clear();
	this.createRoom(0, 0, this.rows-1, this.rows-1);
	for(var i = 0; i <= this.rows-1; i++){
		this._set(i, this.rows-1, Enums.ITEM_WALL);
		this._set(0, i, Enums.ITEM_WALL);
		this._set(i, 0, Enums.ITEM_WALL);
		this._set(this.rows-1, i, Enums.ITEM_WALL);	
	} 
}
	
Matrix.prototype.get = function(x, y){
	return this.matrix[x][y];
}

Matrix.prototype.insert = function(id){
	var pos = this._findRandomPos();
	this._set(pos.x, pos.y, id);
	return pos;
}

Matrix.prototype.remove = function(x, y){
	this._set(x, y, Enums.ITEM_EMPTY);
}

Matrix.prototype.moveToRandom = function(curX, curY){
	var newPos = this._findRandomPos();
	this._set(newPos.x, newPos.y, this.get(curX, curY));
	this._set(curX, curY, Enums.ITEM_EMPTY);
	return newPos;
}

Matrix.prototype.tryToMoveTo = function(curX, curY, newX, newY){
	if(newX < 0 || newY < 0 || newX >= this.rows || 
		newY >= this.rows || this.get(newX, newY) != Enums.ITEM_EMPTY) return false;
	var obj = this.get(curX, curY);
	this._set(newX, newY, obj);
	this._set(curX, curY, Enums.ITEM_EMPTY);
	return true;
}

Matrix.prototype.look = function(curX, curY, dx, dy){
	var x = curX, y = curY;
	do{
		x = x + dx;
		y = y + dy;
		var obj = this.get(x, y);
		if(obj != Enums.ITEM_EMPTY) return { item: obj, distance: Math.abs(dx ? x - curX : y - curY) };
	}
	while(x >= 0 && y >= 0);
	return {
		item: Enums.ITEM_EXT_WALL,
		distance: dx ? curX : curY
	};
}

Matrix.prototype.print = function(){
	for(var i = 0; i < this.rows; i++){
		var s = '';
		for(var j = 0; j < this.rows; j++){
			var c = this.matrix[j][i];
			s = s + (typeof c === 'string' ? 'X' : c) + '  ';
		}
		console.log(s);
		console.log(' ');
	}
}

module.exports = Matrix;