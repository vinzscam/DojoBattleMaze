var ease = require('ease-component');
var enums = require('../../../../../models/enums');

module.exports = function(realPoint, IMAGES){
	function getRadianAngle(degreeValue) {
    	return degreeValue * Math.PI / 180;
	} 

	function hexToRgb(hex) {
    	var bigint = parseInt(hex, 16);
    	var r = (bigint >> 16) & 255;
    	var g = (bigint >> 8) & 255;
    	var b = bigint & 255;
    	return r + "," + g + "," + b;
	}

	function getMovingAngle(startDir, endDir){
		if(startDir === endDir) return 0;
		if(startDir === -endDir) return 180;
		var val = Math.abs(startDir*2+endDir);
		return (val === 19 || val === 12) ? -90 : 90;
	}

	function drawPlayer(ctx, startX, startY, dir, color, alpha, injectAtStart, injectAtEnd, injectInMiddle){
		alpha = alpha == null ? 1.0 : alpha;
		ctx.save();
		injectAtStart && injectAtStart();
		var centerX = startX + realPoint(1)/2;
		var centerY = startY + realPoint(1)/2;

		ctx.translate(centerX, centerY);
		injectInMiddle && injectInMiddle();
		ctx.rotate(getRadianAngle(getMovingAngle(enums.DIR_RIGHT, dir)));
		ctx.translate(-centerX, -centerY);
		ctx.fillStyle = `rgba(${hexToRgb(color)}, ${alpha})`;
		fillPlayer(ctx, startX, startY);
		ctx.drawImage(IMAGES.PLAYER, startX + 1, startY + 1, realPoint(1) - 2, realPoint(1) - 2);
		injectAtEnd && injectAtEnd();
		ctx.restore();
	}

	function fillPlayer(ctx, startX, startY){
		ctx.fillRect(startX + realPoint(0.18), startY + realPoint(0.18), realPoint(0.6), realPoint(0.6));
	}

	return {
		nothing: function( ){
			return function(){
				var duration = 500;
				var player = this.data;

				var onStart = function(){
					this.startX = realPoint(player.x);
					this.startY = realPoint(player.y);					
				};
				var onDraw = function(ctx, time, end){
					ctx.clearRect(this.startX, this.startY, realPoint(1), realPoint(1));
					drawPlayer(ctx, this.startX, this.startY, player.dir, player.color, 1.0);
				};
				return{
					duration : duration,
					onStart  : onStart,
					onDraw   : onDraw,
					started  : false
				};
			}
		},		
		teleport1: function(destX, destY){
			return function(){
				var duration = 150;
				var player = this.data;
				var _resolve;
				var onStart = function(){
					this.startX = realPoint(player.x);
					this.startY = realPoint(player.y);
				};
				var onDraw = function(ctx, time, end){
					var val = ease.outQuad(1 - time);
					ctx.clearRect(this.startX, this.startY, realPoint(1), realPoint(1));
					if(end) return;
					drawPlayer(ctx, this.startX, this.startY, player.dir, player.color, end ? 0 : val);
				};
				new Promise(function(resolve){
					_resolve = resolve;	
				})
				.then(function(){
					player.x = destX;
					player.y = destY;
				});				
				return{
					duration : duration,
					onStart  : onStart,
					onDraw   : onDraw,
					started  : false,
					resolve  : _resolve
				};
			}
		},	
		teleport2: function(){
			return function(){
				var duration = 150;
				var player = this.data;

				var onStart = function(){
					this.startX = realPoint(player.x);
					this.startY = realPoint(player.y);					
				};
				var onDraw = function(ctx, time, end){
					var val = ease.inQuad(time);			
					ctx.clearRect(this.startX, this.startY, realPoint(1), realPoint(1));
					drawPlayer(ctx, this.startX, this.startY, player.dir, player.color, end ? 1.0 : val);
				};
				return{
					duration : duration,
					onStart  : onStart,
					onDraw   : onDraw,
					started  : false
				};
			}
		},		
		fireStep1: function(dir){
			return function(){
				var duration = 200;
				var player = this.data;
				var onStart = function(){
					this.startX = realPoint(player.x);
					this.startY = realPoint(player.y);
				};
				var onDraw = function(ctx, time, end){
					var val = ease.inOutExpo(time);
					drawPlayer(ctx, this.startX, this.startY, player.dir, player.color, end ? 1.0 : val, null, function(){
						if(!end){
							//ctx.save();
							ctx.globalAlpha = val;
							ctx.drawImage(IMAGES.PLAYER_FIRING, this.startX, this.startY, realPoint(1), realPoint(1));
							//ctx.restore();
						}
					}.bind(this));
					ctx.restore();
				};
				return{
					duration : duration,
					onStart  : onStart,
					onDraw   : onDraw,
					started  : false,
					dir      : dir
				};
			}
		},
		fireStep2: function(length){
			return function(){
				var duration = 100;
				var player = this.data;

				var onStart = function(){};
				var onDraw = function(ctx, time, end){
					//var val = ease.inQuad(time);
					var val = ease.linear(time);
					var centerX = realPoint(player.x) + realPoint(1)/2;
					var centerY = realPoint(player.y) + realPoint(1)/2;					
					ctx.save();
					ctx.translate(centerX, centerY);
					ctx.rotate(getRadianAngle(getMovingAngle(enums.DIR_LEFT, player.dir)));
					ctx.translate(-centerX, -centerY);
					var totalWidth = realPoint(length*val);
					var step = realPoint(1);
					var i = parseInt(totalWidth / step);
					var firstPart = totalWidth - i*step;
					var x = step;
					ctx.clearRect(realPoint(player.x - this.length*val), realPoint(player.y), realPoint(length*val), realPoint(1));
					if(!end){
						ctx.drawImage(IMAGES.LASER, 0, 0, firstPart/step*100, 200, realPoint(player.x) - totalWidth, realPoint(player.y), firstPart, step);
						for(; i > 0; i--){
							ctx.drawImage(IMAGES.LASER, firstPart/step*100, 0, 100, 200, realPoint(player.x - i) , realPoint(player.y), step, step);
						}
					}
					ctx.restore();
				};
				return{
					duration : duration,
					onStart  : onStart,
					onDraw   : onDraw,
					started  : false,
					length   : length
				};
			}
		},
		move: function(dir){
			return function(){
				var duration = 250;
				var player = this.data;
				var _resolve;

				var onStart = function(){
					this.startX = realPoint(player.x);
					this.startY = realPoint(player.y);
					this.destX  = realPoint(player.x + parseInt(this.dir/10));
					this.destY  = realPoint(player.y + (this.dir%10));
				};
				var onDraw = function(ctx, time){
					var val = ease.outQuart(time);
					var x = (this.destX - this.startX) * val;
					var y = (this.destY - this.startY) * val;
					ctx.clearRect(this.startX + (x > 0 ? 0 : x) , this.startY + (y > 0 ? 0 : y), realPoint(1) + Math.abs(x), realPoint(1) + Math.abs(y));
					drawPlayer(ctx, this.startX, this.startY, player.dir, player.color, null, null, null, function(){
						ctx.translate(x, y);
					}.bind(this));
				};
				new Promise(function(resolve){
					_resolve = resolve;	
				})
				.then(function(){
					player.x = player.x + parseInt(dir/10);
					player.y = player.y + (dir%10);
				});

				return{
					duration : duration,
					onStart	 : onStart,
					onDraw   : onDraw,
					started  : false,
					resolve  : _resolve,
					dir      : dir
				};
			}
		},
		look: function(dir){
			return function(){
				var player = this.data;
				var duration = 200;
				var _resolve;
				var onStart = function(){
					if(player.dir === this.endDir) this.duration = 0;
					this.startX   = realPoint(player.x);
					this.startY   = realPoint(player.y);
					this.startDir = player.dir;
				};

				var onDraw = function(ctx, time, end){
					var val = ease.inOutCirc(time);
					//ctx.clearRect(this.startX, this.startY, realPoint(1), realPoint(1));
					drawPlayer(ctx, this.startX, this.startY, player.dir, player.color, null, null, null, function(){
						ctx.rotate(getRadianAngle(getMovingAngle(this.startDir, this.endDir)*val));
					}.bind(this));
				};
				new Promise(function(resolve){
					_resolve = resolve;	
				})
				.then(function(){
					player.dir = dir;
				});
				return{
					duration : duration,
					onStart	 : onStart,
					onDraw   : onDraw,
					started  : false,
					resolve  : _resolve,
					endDir   : dir
				};
			}
		}
	}
}