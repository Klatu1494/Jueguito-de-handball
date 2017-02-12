class Centro{
	constructor(x, y){
		this._x=x;
		this._y=y;
	}

	get x(){
		return this._x;
	}

	get y(){
		return this._y;
	}

	set x(x){
		if(width<x||x<0||isNaN(x)) throw new Error();
		this._x=x;
	}

	set y(y){
		if(width<y||y<0||isNaN(y)) throw new Error();
		this._y=y;
	}
}