class Jugador{
	constructor(equipo, tipo, x, y, stats){
		this.tipo=tipo;
		this.equipo=equipo;
		this.stats=stats;
		this.multiplicadorDeAtraccion=this.stats.atraccion/50;
		this.centro=new Centro(x, y);
		this.posicionEnFormacion={x:x, y:y};
		this.ultimoFrameEmpujado=-1;
	}

	get size(){
		return sizeJugadores;
	}

	moverHacia(x, y, jugadoresEmpujados){
		if(x<cancha.x+this.size/2+cancha.margen&&this.tipo!=='arquero') x=cancha.x+this.size/2+cancha.margen;
		if(y<cancha.y+this.size/2+cancha.margen) y=cancha.y+this.size/2+cancha.margen;
		if(x>cancha.x+cancha.width-this.size/2-cancha.margen&&this.tipo!=='arquero') x=cancha.x+cancha.width-this.size/2-cancha.margen;
		if(y>cancha.y+cancha.height-this.size/2-cancha.margen) y=cancha.y+cancha.height-this.size/2-cancha.margen;
		if(ultimoEquipoConPelota===this.equipo&&ultimoEquipoConPelota.DT==='AI'&&(this.equipo===equipo0?x<this.centro.x:x>this.centro.x)) x=this.centro.x;
		var vector=new Vector(x-this.centro.x, y-this.centro.y);
		if(vector.mag()===0) return;
		vector.normalize();
		vector.multiply(this.stats.velocidad/50);
		var centro=this.centro;
		var nuevoCentro=new Centro(vector.x>0?min(this.centro.x+vector.x, x):max(this.centro.x+vector.x, x), vector.y>0?min(this.centro.y+vector.y, y):max(this.centro.y+vector.y, y));
		for(var equipo of equipos) for(var jugador of equipo.jugadores) if(dist(nuevoCentro.x, nuevoCentro.y, jugador.centro.x, jugador.centro.y)<sizeJugadores) this.empujarDesde(nuevoCentro.x, nuevoCentro.y, jugador, jugadoresEmpujados+1||1);
		for(var equipo of equipos) for(var jugador of equipo.jugadores) if(this!==jugador){
			if(dist(nuevoCentro.x, nuevoCentro.y, jugador.centro.x, jugador.centro.y)<this.size/2+jugador.size/2){
				if(vector.mag()===0){
					var angulo;
					if(jugador.centro.x===nuevoCentro.x&&jugador.centro.y===nuevoCentro.y){
						angulo=random(0, TWO_PI);
					}
					else angulo=atan2(nuevoCentro.y-jugador.centro.y, nuevoCentro.x-jugador.centro.x);
					x=jugador.centro.x+cos(angulo)*(this.size/2+jugador.size/2);
					y=jugador.centro.y+sin(angulo)*(this.size/2+jugador.size/2);
				}
				else if(vector.x===0){
					x=nuevoCentro.x;
					var dX=nuevoCentro.x-jugador.centro.x;
					y=jugador.centro.y-vector.y*sqrt(sq(this.size/2+jugador.size/2)-sq(dX))/abs(vector.y);
				}
				else{
					var pendiente=vector.y/vector.x;
					var terminoIndependiente=-pendiente*nuevoCentro.x+nuevoCentro.y;
					var a=sq(pendiente)+1;
					var b=2*((terminoIndependiente-jugador.centro.y)*pendiente-jugador.centro.x);
					var c=sq(terminoIndependiente-jugador.centro.y)+sq(jugador.centro.x)-sq(this.size/2+jugador.size/2);
					//aplico la fórmula resolvente
					var x1=(-b+sqrt(sq(b)-4*a*c))/2/a;
					var x2=(-b-sqrt(sq(b)-4*a*c))/2/a;
					if(vector.x<0){
						x=max(x1, x2);
						y=pendiente*x+terminoIndependiente;
					}
					else{
						x=min(x1, x2);
						y=pendiente*x+terminoIndependiente;
					}
				}
				nuevoCentro=new Centro(x, y);
				vector=new Vector(nuevoCentro.x-centro.x, nuevoCentro.y-centro.y);
				centro=nuevoCentro;
			}
		}
		this.centro.x=nuevoCentro.x;
		this.centro.y=nuevoCentro.y;
	}

	empujarDesde(x, y, jugador, jugadoresEmpujados){
		if(this.equipo!==jugador.equipo&&jugador.stats.fuerza<this.stats.fuerza&&jugador.ultimoFrameEmpujado<frameCount){
			var vector=new Vector(jugador.centro.x-x, jugador.centro.y-y);
			vector.normalize();
			var fuerza=min(this.stats.fuerza/jugador.stats.fuerza-1, 1)/jugadoresEmpujados*maxStatValue/50;
			var empuje=new Vector(vector.x*fuerza, vector.y*fuerza);
			jugador.ultimoFrameEmpujado=frameCount;
			jugador.moverHacia(jugador.centro.x+empuje.x, jugador.centro.y+empuje.y, jugadoresEmpujados);
		}
	}
}