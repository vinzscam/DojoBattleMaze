const Matrix = require('../models/matrix');
const Enums = require('../models/Enums');
module.exports = function(NUMBER_OF_ROWS){
	var	_players, _matrix, _state, _freemode;

	function init(state){
		_players = new Map();
		_matrix = new Matrix(NUMBER_OF_ROWS);
		_matrix.randomize();
		_state = state || Enums.STATE_NO_GAME;
		_freemode = false;
	}

	function getMatrix(){
		return _matrix;
	}
	function getState(){
		return _state;
	}
	function setState(state){
		_state = state;
	}
	function getPlayers(){
		return _players;
	}
	function enableFreeMode(){
		_freemode = true;
	}
	function isFreeModeEnabled(){
		return _freemode;
	}

	init();
	return{
		init, getMatrix, getState, getPlayers, 
		setState, enableFreeMode, isFreeModeEnabled
	}
}