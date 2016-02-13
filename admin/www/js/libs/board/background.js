module.exports = function(realPoint, canvas, COLOR_BK){
	var ctx = canvas.getContext('2d');
	var width;
	var m;

	function getRows(){
		return m.rows;
	}

	function init(matrix){
		m = matrix;
		resize();
	}

	function draw(){
		for(var i = 0; i < getRows(); i++)
			for(var j = 0; j < getRows(); j++)
				drawPoint(i, j, m.get(i,j) != 0 ? '#c0c0c0' : COLOR_BK);
	}

	function drawPoint(x, y, color){
		ctx.fillStyle = color;
		ctx.fillRect(realPoint(x), realPoint(y), realPoint(1), realPoint(1));
	}

	function resize(){
		width = parseInt(getComputedStyle(canvas).width);
	}

	return{
		init     : init,
		draw     : draw,
		resize   : resize
	}
}