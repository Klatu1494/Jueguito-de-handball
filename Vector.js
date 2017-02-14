class Vector{
	constructor(x, y){
		this.x=x
		this.y=y
	}

	mag(){
		if(this.x===0&&this.y===0) return 0;
		if(Math.abs(this.x)<1&&Math.abs(this.y)<1){
			var logX=this.x===0?1:Math.log10(Math.abs(this.x));
			var logY=this.y===0?1:Math.log10(Math.abs(this.y));
			var multiplicador=Math.max(Math.pow(10, -logX, -logY));
			this.multiply(multiplicador);
		}
		else multiplicador=1;
		return sqrt(sq(this.x)+sq(this.y))/multiplicador;
	}

	normalize(){
		var mag=this.mag();
		if(mag===0) return this;
		this.x/=mag;
		this.y/=mag;
		return this;
	}

	multiply(numero){
		this.x*=numero;
		this.y*=numero;
		return this;
	}
}