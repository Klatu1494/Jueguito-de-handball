function jugadorMasCercanoA(x, y, jugadores){
	var menorDistancia=Infinity;
	for(var jugador of jugadores){
		var distancia=sq(jugador.centro.x-x)+sq(jugador.centro.y-y) //no saco la raíz cuadrada ya que sólo me interesa saber cuál es el que está más cerca, no la distancia
		if(distancia<menorDistancia){
			var jugadoresMasCercanos=[];
			menorDistancia=distancia;
		}
		if(distancia===menorDistancia) jugadoresMasCercanos.push(jugador)
	}
	return random(jugadoresMasCercanos);
}

function apuntarA(x, y){
	var delta=(atan2(y-jugadorConPelota.centro.y, x-jugadorConPelota.centro.x)-jugadorConPelota.angulo+2*TWO_PI)%TWO_PI;
	if(!delta) return true;
	var multiplicador=delta<PI?1:-1;
	jugadorConPelota.angulo+=multiplicador*precision;
	if(jugadorConPelota.angulo<0) jugadorConPelota.angulo+=TWO_PI;
	if(jugadorConPelota.angulo>=TWO_PI) jugadorConPelota.angulo-=TWO_PI;
	delta=(atan2(y-jugadorConPelota.centro.y, x-jugadorConPelota.centro.x)-jugadorConPelota.angulo+2*TWO_PI)%TWO_PI;
	return delta<precision||-delta+TWO_PI<precision;
}

function soltarPelota(){
	var nAngulo = normalizador.RandomNormalizado (jugadorConPelota.angulo, 1 - jugadorConPelota.stats.punteria / 100);
	jugadorConPelota.angulo = nAngulo;
	pelota.centro={x:jugadorConPelota.centro.x+cos(jugadorConPelota.angulo)*(sizePelota+sizeJugadores)/2, y:jugadorConPelota.centro.y+sin(jugadorConPelota.angulo)*(sizePelota+sizeJugadores)/2};
	jugadorConPelota.multiplicadorDeAtraccion=(0<jugadorConPelota.multiplicadorDeAtraccion?-jugadorConPelota.stats.repulsion:jugadorConPelota.stats.atraccion)/50;
	jugadorConPelota=null;
}

function tiro(x, y){
	if(apuntarA(x, y)){
		jugadorConPelota.equipo.despejando=false;
		soltarPelota();
	}
	return true;
}

function paseA(jugador){
	var puntoMedio={x:(pelota.centro.x+jugador.centro.x)/2, y:(pelota.centro.y+jugador.centro.y)/2};
	if(noHayJugadoresEntreJugadorConPelotaY(jugador.centro.x, jugador.centro.y)){
		var multiplicadorDeDesvio=dist(jugadorConPelota.centro.x, jugadorConPelota.centro.y, jugador.centro.x, jugador.centro.y)*constanteDeDesvio;
		var desvioX=0;
		var desvioY=0;
		for(var equipo of equipos){
			for(j of equipo.jugadores){
				desvioX+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*cos(atan2(j.centro.y-puntoMedio.y, j.centro.x-puntoMedio.x))/(sq(puntoMedio.x-j.centro.x)+sq(puntoMedio.y-j.centro.y));
				desvioY+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*sin(atan2(j.centro.y-puntoMedio.y, j.centro.x-puntoMedio.x))/(sq(puntoMedio.x-j.centro.x)+sq(puntoMedio.y-j.centro.y));
			}
			desvioX+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*cos(atan2(equipo.arquero.centro.y-puntoMedio.y, equipo.arquero.centro.x-puntoMedio.x))/(sq(puntoMedio.x-equipo.arquero.centro.x)+sq(puntoMedio.y-equipo.arquero.centro.y));
			desvioY+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*sin(atan2(equipo.arquero.centro.y-puntoMedio.y, equipo.arquero.centro.x-puntoMedio.x))/(sq(puntoMedio.x-equipo.arquero.centro.x)+sq(puntoMedio.y-equipo.arquero.centro.y));
		}
		return tiro(jugador.centro.x+desvioX, jugador.centro.y+desvioY);
	}
	else if(jugadorConPelota.centro.y+jugador.centro.y<height){
		if(noHayJugadoresEntreJugadorConPelotaY(jugador.centro.x, -jugador.centro.y, 'arriba')){
			var multiplicadorDeDesvio=dist(jugadorConPelota.centro.x, jugadorConPelota.centro.y, jugador.centro.x, -jugador.centro.y)*constanteDeDesvio;
			var desvioX=0;
			var desvioY=0;
			for(var equipo of equipos){
				for(j of equipo.jugadores){
					desvioX+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*cos(atan2(j.centro.y-puntoMedio.y, j.centro.x-puntoMedio.x))/(sq(puntoMedio.x-j.centro.x)+sq(puntoMedio.y-j.centro.y));
					desvioY+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*sin(atan2(j.centro.y-puntoMedio.y, j.centro.x-puntoMedio.x))/(sq(puntoMedio.x-j.centro.x)+sq(puntoMedio.y-j.centro.y));
				}
				desvioX+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*cos(atan2(equipo.arquero.centro.y-puntoMedio.y, equipo.arquero.centro.x-puntoMedio.x))/(sq(puntoMedio.x-equipo.arquero.centro.x)+sq(puntoMedio.y-equipo.arquero.centro.y));
				desvioY+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*sin(atan2(equipo.arquero.centro.y-puntoMedio.y, equipo.arquero.centro.x-puntoMedio.x))/(sq(puntoMedio.x-equipo.arquero.centro.x)+sq(puntoMedio.y-equipo.arquero.centro.y));
			}
			return tiro(jugador.centro.x+desvioX, -jugador.centro.y-desvioY);
		}
		else if(noHayJugadoresEntreJugadorConPelotaY(jugador.centro.x, 2*(cancha.y+cancha.height)-jugador.centro.y, 'abajo')){
			var multiplicadorDeDesvio=dist(jugadorConPelota.centro.x, jugadorConPelota.centro.y, jugador.centro.x, 2*(cancha.y+cancha.height)-jugador.centro.y)*constanteDeDesvio;
			var desvioX=0;
			var desvioY=0;
			for(var equipo of equipos){
				for(j of equipo.jugadores){
					desvioX+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*cos(atan2(j.centro.y-puntoMedio.y, j.centro.x-puntoMedio.x))/(sq(puntoMedio.x-j.centro.x)+sq(puntoMedio.y-j.centro.y));
					desvioY+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*sin(atan2(j.centro.y-puntoMedio.y, j.centro.x-puntoMedio.x))/(sq(puntoMedio.x-j.centro.x)+sq(puntoMedio.y-j.centro.y));
				}
				desvioX+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*cos(atan2(equipo.arquero.centro.y-puntoMedio.y, equipo.arquero.centro.x-puntoMedio.x))/(sq(puntoMedio.x-equipo.arquero.centro.x)+sq(puntoMedio.y-equipo.arquero.centro.y));
				desvioY+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*sin(atan2(equipo.arquero.centro.y-puntoMedio.y, equipo.arquero.centro.x-puntoMedio.x))/(sq(puntoMedio.x-equipo.arquero.centro.x)+sq(puntoMedio.y-equipo.arquero.centro.y));
			}
			return tiro(jugador.centro.x+desvioX, 2*(cancha.y+cancha.height)-jugador.centro.y-desvioY);
		}
	}
	else if(height<jugadorConPelota.centro.y+jugador.centro.y){
		if(noHayJugadoresEntreJugadorConPelotaY(jugador.centro.x, 2*(cancha.y+cancha.height)-jugador.centro.y, 'abajo')){
			var multiplicadorDeDesvio=dist(jugadorConPelota.centro.x, jugadorConPelota.centro.y, jugador.centro.x, 2*(cancha.y+cancha.height)-jugador.centro.y)*constanteDeDesvio;
			var desvioX=0;
			var desvioY=0;
			for(var equipo of equipos){
				for(j of equipo.jugadores){
					desvioX+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*cos(atan2(j.centro.y-puntoMedio.y, j.centro.x-puntoMedio.x))/(sq(puntoMedio.x-j.centro.x)+sq(puntoMedio.y-j.centro.y));
					desvioY+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*sin(atan2(j.centro.y-puntoMedio.y, j.centro.x-puntoMedio.x))/(sq(puntoMedio.x-j.centro.x)+sq(puntoMedio.y-j.centro.y));
				}
				desvioX+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*cos(atan2(equipo.arquero.centro.y-puntoMedio.y, equipo.arquero.centro.x-puntoMedio.x))/(sq(puntoMedio.x-equipo.arquero.centro.x)+sq(puntoMedio.y-equipo.arquero.centro.y));
				desvioY+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*sin(atan2(equipo.arquero.centro.y-puntoMedio.y, equipo.arquero.centro.x-puntoMedio.x))/(sq(puntoMedio.x-equipo.arquero.centro.x)+sq(puntoMedio.y-equipo.arquero.centro.y));
			}
			return tiro(jugador.centro.x+desvioX, 2*(cancha.y+cancha.height)-jugador.centro.y-desvioY);
		}
		else if(noHayJugadoresEntreJugadorConPelotaY(jugador.centro.x, -jugador.centro.y, 'arriba')){
			var multiplicadorDeDesvio=dist(jugadorConPelota.centro.x, jugadorConPelota.centro.y, jugador.centro.x, -jugador.centro.y)*constanteDeDesvio;
			var desvioX=0;
			var desvioY=0;
			for(var equipo of equipos){
				for(j of equipo.jugadores){
					desvioX+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*cos(atan2(j.centro.y-puntoMedio.y, j.centro.x-puntoMedio.x))/(sq(puntoMedio.x-j.centro.x)+sq(puntoMedio.y-j.centro.y));
					desvioY+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*sin(atan2(j.centro.y-puntoMedio.y, j.centro.x-puntoMedio.x))/(sq(puntoMedio.x-j.centro.x)+sq(puntoMedio.y-j.centro.y));
				}
				desvioX+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*cos(atan2(equipo.arquero.centro.y-puntoMedio.y, equipo.arquero.centro.x-puntoMedio.x))/(sq(puntoMedio.x-equipo.arquero.centro.x)+sq(puntoMedio.y-equipo.arquero.centro.y));
				desvioY+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*sin(atan2(equipo.arquero.centro.y-puntoMedio.y, equipo.arquero.centro.x-puntoMedio.x))/(sq(puntoMedio.x-equipo.arquero.centro.x)+sq(puntoMedio.y-equipo.arquero.centro.y));
			}
			return tiro(jugador.centro.x+desvioX, -jugador.centro.y-desvioY);
		}
	}
	return false
}

function noHayJugadoresDelanteDe(jugador, multiplicador){
	for(var equipo of equipos){
		for(var posibleJugadorDelante of equipo.jugadores){
			if(multiplicador*posibleJugadorDelante.centro.x<multiplicador*jugador.centro.x) return false;
		}
	}
	return true;
}

function noHayJugadoresEntreJugadorConPelotaY(x, y, proyectar){
	var angulo=atan2(y-jugadorConPelota.centro.y, x-jugadorConPelota.centro.x);
	for(var equipo of equipos){
		if(equipo===jugadorConPelota.equipo) continue;
		for(var jugador of equipo.jugadores){
			if(
				distanciaASegmento(
					jugador.centro.x,
					jugador.centro.y,
					x,
					y,
					jugadorConPelota.centro.x+(jugadorConPelota.size+sizePelota)*cos(angulo)/2,
					jugadorConPelota.centro.y+(jugadorConPelota.size+sizePelota)*sin(angulo)/2
				).distancia<distanciaDeIntercepcion
			) return false;	
		}
		if(proyectar){
			for(var jugador of equipo.jugadores){
				if(
					distanciaASegmento(
						jugador.centro.x,
						-jugador.centro.y+(proyectar==='abajo'?width*2:0),
						x,
						y,
						jugadorConPelota.centro.x+(jugadorConPelota.size+sizePelota)*cos(angulo)/2,
						jugadorConPelota.centro.y+(jugadorConPelota.size+sizePelota)*sin(angulo)/2
					).distancia<distanciaDeIntercepcion
				) return false;	
			}
		}
	}
	return true;
}

function distanciaASegmento(x, y, x1, y1, x2, y2){
	var A=x-x1;
	var B=y-y1;
	var C=x2-x1;
	var D=y2-y1;
	var dot=A*C+B*D;
	var longitudAlCuadrado=sq(C)+sq(D);
	var param=-1;
	if(longitudAlCuadrado!=0) param=dot/longitudAlCuadrado;
	var xx, yy;
	if(param<0){
		xx=x1;
		yy=y1;
	}
	else if(param>1){
		xx=x2;
		yy=y2;
	}
	else{
		xx=x1+param*C;
		yy=y1+param*D;
	}
	return {distancia:dist(x, y, xx, yy), puntoMasCercano:{x:xx, y:yy}};
}

function sortFunction(a, b){
	var multiplicador=jugadorConPelota.equipo.comparadorConLaDistanciaDeTiro==='izquierda'?-1:1;
	return ((a, b)=>{
		if(a===jugadorConPelota) return 1;
		if(b===jugadorConPelota) return -1;
		var dX=multiplicador*a.centro.x-multiplicador*b.centro.x;
		if(dX===0){
			var dDistancia=sq(jugadorConPelota.centro.x-a.centro.x)+sq(jugadorConPelota.centro.y-a.centro.y)-sq(jugadorConPelota.centro.x-b.centro.x)-sq(jugadorConPelota.centro.y-b.centro.y);
			return -dDistancia||floor(random())*2-1
		}
		return dX;
	})(a, b);
}

function atraerConTodosLosJugadoresDelEquipo(equipo){
	for(var jugador of equipo.jugadores) jugador.multiplicadorDeAtraccion=jugador.stats.atraccion/50;
}

function despejar(equipoRival){
	jugadorConPelota.equipo.despejando=true;
	equipoRival.jugadores.sort(function(a, b){
		return atan2(a.centro.y-jugadorConPelota.centro.y, a.centro.x-jugadorConPelota.centro.x)-atan2(b.centro.y-jugadorConPelota.centro.y, b.centro.x-jugadorConPelota.centro.x);
	});
	var diferencia=0;
	for(var i=0; i<equipoRival.jugadores.length; i++){
		var a1=(atan2(equipoRival.jugadores[i].centro.y-jugadorConPelota.centro.y, equipoRival.jugadores[i].centro.x-jugadorConPelota.centro.x)+TWO_PI)%TWO_PI;
		var a2=(atan2(equipoRival.jugadores[(i+1)%equipoRival.jugadores.length].centro.y-jugadorConPelota.centro.y, equipoRival.jugadores[(i+1)%equipoRival.jugadores.length].centro.x-jugadorConPelota.centro.x)+TWO_PI)%TWO_PI;
		var d=(a2-a1+TWO_PI)%TWO_PI;
		var angulo=(a1+a2)/2;
		if(equipoRival===equipo0&&HALF_PI<=angulo&&angulo<=HALF_PI*3||equipoRival===equipo1&&(angulo<=HALF_PI||HALF_PI*3<=angulo)){
			if(diferencia<d){
				angulos=[];
				diferencia=d;
			}
			if(d===diferencia){
				angulos.push(angulo);
			}
		}
	}
	angulo=random(angulos);
	tiro(jugadorConPelota.centro.x+(sizePelota+jugadorConPelota.size)*cos(angulo), jugadorConPelota.centro.y+(sizePelota+jugadorConPelota.size)*sin(angulo));
}