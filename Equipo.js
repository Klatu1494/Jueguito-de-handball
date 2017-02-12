class Equipo{
	constructor(nombre, DT, color, teclaArriba, teclaIzquierda, teclaAbajo, teclaDerecha, teclaMasAngulo, teclaMenosAngulo, teclaCambiarAtraccion, arco, distanciaDeTiroLargo, distanciaDeTiroCorto){
		this.nombre=nombre;
		this.DT=DT;
		this.color=color;
		this.teclaArriba={code:teclaArriba, presionada:false};
		this.teclaIzquierda={code:teclaIzquierda, presionada:false};
		this.teclaAbajo={code:teclaAbajo, presionada:false};
		this.teclaDerecha={code:teclaDerecha, presionada:false};
		this.teclaMasAngulo={code:teclaMasAngulo, presionada:false};
		this.teclaMenosAngulo={code:teclaMenosAngulo, presionada:false};
		this.teclaCambiarAtraccion=teclaCambiarAtraccion;
		this.jugadores=[];
		this.arco=arco;
		this.distanciaDeTiroCorto=distanciaDeTiroCorto;
		this.distanciaDeTiroLargo=distanciaDeTiroLargo;
	}

	agregarJugador(x, y, stats){
		this.jugadores.push(new Jugador(this, 'jugador', x, y, stats));
	}

	AI(){
		this.jugadorSeleccionado=jugadorMasCercanoA(pelota.centro.x, pelota.centro.y, this.jugadores);
		var p;
		if(pelota.velocidad.x===0){
			if(pelota.velocidad.y===0) p=pelota.centro;
			else p=distanciaASegmento(
				this.jugadorSeleccionado.centro.x,
				this.jugadorSeleccionado.centro.y,
				pelota.centro.x,
				0,
				pelota.centro.x,
				height
			).puntoMasCercano;
		}
		else{
			var m=pelota.velocidad.y/pelota.velocidad.x;
			p=pelota.velocidad.x<0?
				distanciaASegmento(
					this.jugadorSeleccionado.centro.x,
					this.jugadorSeleccionado.centro.y,
					0,
					pelota.centro.y-pelota.centro.x*m,
					pelota.centro.x,
					pelota.centro.y
				).puntoMasCercano:
				distanciaASegmento(
					this.jugadorSeleccionado.centro.x,
					this.jugadorSeleccionado.centro.y,
					pelota.centro.x,
					pelota.centro.y,
					width,
					pelota.centro.y+(width-pelota.centro.x)*m
				).puntoMasCercano;
		}
		this.centro.x=p.x-this.jugadorSeleccionado.posicionEnFormacion.x;
		this.centro.y=p.y-this.jugadorSeleccionado.posicionEnFormacion.y;
		var multiplicador=this.comparadorConLaDistanciaDeTiro==='izquierda'?-1:1;
		var xArcoContrario=width/2-multiplicador*width/2;
		if(jugadorConPelota){
			var equipoRival=this===equipo0?equipo1:equipo0;
			if(jugadorConPelota.equipo===this){
				if(this.despejando) despejar(equipoRival);
				else{
					var x=cancha.x+cancha.width/2-multiplicador*cancha.width/2;
					if(jugadorConPelota.centro.y<cancha.y+cancha.height/2){
						var y=cancha.y+cancha.height*2/3;
						var jugador=jugadorMasCercanoA(x, y, this.jugadores);
						this.centro.x=x-jugador.posicionEnFormacion.x;
						this.centro.y=y-jugador.posicionEnFormacion.y;
						if(multiplicador*this.distanciaDeTiroCorto<multiplicador*jugadorConPelota.centro.x&&multiplicador*jugadorConPelota.centro.x<multiplicador*this.distanciaDeTiroLargo&&jugadorConPelota.equipo.arquero.centro.y===topArcos+sizePalos/2+this.arquero.size/2+sizePelota&&noHayJugadoresDelanteDe(jugadorConPelota, multiplicador)) tiro(xArcoContrario, bottomArcos-apuntarAEstoDelPalo.tiroLargo);
						else if(multiplicador*jugadorConPelota.centro.x<=multiplicador*this.distanciaDeTiroCorto&&jugadorConPelota.equipo.arquero.centro.y>height/2) tiro(xArcoContrario, topArcos+apuntarAEstoDelPalo.tiroCorto);
						else{
							this.jugadores.sort(sortFunction);
							var pelotaPasada=false;
							for(var jugador of this.jugadores){
								if(jugador===jugadorConPelota) continue;
								if(paseA(jugador)){
									pelotaPasada=true;
									break;
								}
							}
							if(!pelotaPasada) despejar(equipoRival);
						}
					}
					else if(jugadorConPelota.centro.y>cancha.y+cancha.height/2){
						var y=cancha.y+cancha.height/3;
						var jugador=jugadorMasCercanoA(x, y, this.jugadores);
						this.centro={x:x-jugador.posicionEnFormacion.x, y:y-jugador.posicionEnFormacion.y};
						if(multiplicador*this.distanciaDeTiroCorto<multiplicador*jugadorConPelota.centro.x&&multiplicador*jugadorConPelota.centro.x<multiplicador*this.distanciaDeTiroLargo&&jugadorConPelota.equipo.arquero.centro.y===bottomArcos-sizePalos/2-this.arquero.size/2-sizePelota&&noHayJugadoresDelanteDe(jugadorConPelota, multiplicador)) tiro(xArcoContrario, topArcos+apuntarAEstoDelPalo.tiroLargo);
						else if(multiplicador*jugadorConPelota.centro.x<=multiplicador*this.distanciaDeTiroCorto&&jugadorConPelota.equipo.arquero.centro.y<height/2) tiro(xArcoContrario, bottomArcos-apuntarAEstoDelPalo.tiroCorto);
						else{
							this.jugadores.sort(sortFunction);
							var pelotaPasada=false;
							for(var jugador of this.jugadores){
								if(jugador===jugadorConPelota) continue;
								if(paseA(jugador)){
									pelotaPasada=true;
									break;
								}
							}
							if(!pelotaPasada) despejar(equipoRival);
						}
					}
					else{
						var y=cancha.y+cancha.height/3+floor(random())*cancha.height/3;
						var jugador=jugadorMasCercanoA(x, y, this.jugadores);
						this.centro={x:x-jugador.posicionEnFormacion.x, y:y-jugador.posicionEnFormacion.y};
						this.jugadores.sort(sortFunction);
						var pelotaPasada=false;
						for(var jugador of this.jugadores){
							if(jugador===jugadorConPelota) continue;
							if(paseA(jugador)){
								pelotaPasada=true;
								break;
							}
						}
						if(!pelotaPasada) despejar(equipoRival);
					}
				}
			}
			else{
			 	var xDelanteros=xArcoContrario;
			 	var equipoRival
				for(jugador of equipoRival.jugadores){
					if(jugador===jugadorConPelota) continue;
					if(multiplicador*xDelanteros<multiplicador*jugador.centro.x){
						xDelanteros=jugador.centro.x;
						var delanteros=[];
					}
					if(xDelanteros===jugador.centro.x){
						delanteros.push(jugador);
					}
				}
				delanteros.sort(function(a, b){
					return Math.min(
						abs(a.centro.y-(cancha.y+cancha.height/3)),
						abs(a.centro.y-(cancha.y+cancha.height*2/3))
					)-Math.min(
						abs(b.centro.y-(cancha.y+cancha.height/3)),
						abs(b.centro.y-(cancha.y+cancha.height*2/3))
					);
				})
				delanteros.filter(function(a, index, array){
					return a.centro.x===array[0].centro.x;
				})
				var distancia=Infinity;
				for(var delantero of delanteros){
					for(var jugador of this.jugadores){
						var objeto=distanciaASegmento(jugador.centro.x, jugador.centro.y, jugadorConPelota.centro.x, jugadorConPelota.centro.y, delantero.centro.x, delantero.centro.y);
						if(objeto.distancia<distancia){
							var array=[]
							distancia=objeto.distancia;
						}
						if(objeto.distancia===distancia){
							array.push({punto: objeto.puntoMasCercano, jugador: jugador});
						}
					}
				}
				var elemento=random(array);
				this.centro.x=elemento.punto.x-elemento.jugador.posicionEnFormacion.x;
				this.centro.y=elemento.punto.y-elemento.jugador.posicionEnFormacion.y;
			}
		}
	}
}