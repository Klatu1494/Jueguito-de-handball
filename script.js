const WIDTH=800;
const HEIGHT=600;
const g=500;
const sizePelota=15;
const sizePalos=20;
const topArcos=HEIGHT/3;
const bottomArcos=HEIGHT*2/3;
const velocidadJugadores=1;
const cancha={
	x:sizePelota+sizePalos,
	y:sizePelota,
	width:WIDTH-(sizePelota+sizePalos)*2,
	height:HEIGHT-sizePelota*2,
	palos:[
		{x:sizePalos/2, y:topArcos},
		{x:sizePalos/2, y:bottomArcos},
		{x:WIDTH-sizePalos/2, y:topArcos},
		{x:WIDTH-sizePalos/2, y:bottomArcos}
	],
	color:'#269E3A'
}
const apuntarAEstoDelPalo={tiroLargo:140, tiroCorto:20};
const precision=0.05;
const colorPiel='#ffdfc4';

var equipo0;
var equipo1;
var equipos;
var jugadorConPelota;
var pelota;

function setup(){
	createCanvas(WIDTH, HEIGHT);
	equipo0=new Equipo('West Ham United F.C.', 'humano', '#7D2C3B', 87, 65, 83, 68, 69, 81, 32, 'mayor que', width/2, width*4/5);
	equipo1=new Equipo('Finland', 'humano', '#003580', 73, 74, 75, 76, 79, 85, 13, 'menor que', width/2, width/5);
	equipos=[equipo0, equipo1];
	equipo0.agregarJugador(width/5, height/3);
	equipo0.agregarJugador(width/5, height*2/3);
	equipo0.agregarJugador(width*2/5, height/2);
	equipo1.agregarJugador(width*4/5, height/3);
	equipo1.agregarJugador(width*4/5, height*2/3);
	equipo1.agregarJugador(width*3/5, height/2);
	textAlign(CENTER, TOP);
	nuevoPartido()
}

function draw(){
	if(enPartido){
		var jugadoresDisputandoPelota=[];
		background('#269E3A');
		stroke('#fff');
		fill(cancha.color);
		rect(cancha.x, cancha.y, cancha.width, cancha.height);
		noStroke();
		for(var equipo of equipos){
			if(equipo.DT==='humano'){
				var vector=new p5.Vector((equipo.teclaIzquierda.presionada?-1:0)+(equipo.teclaDerecha.presionada?1:0), (equipo.teclaArriba.presionada?-1:0)+(equipo.teclaAbajo.presionada?1:0));
				vector.normalize();
				vector.mult(velocidadJugadores);
				equipo.centro.x+=vector.x;
				equipo.centro.y+=vector.y;
			}
			else{
				if(jugadorConPelota){
					if(jugadorConPelota.equipo===equipo){
						var multiplicador=jugadorConPelota.equipo.comparadorConLaDistanciaDeTiro==='mayor que'?-1:1;
						var x=width/2+multiplicador*0.3;
						if(jugadorConPelota.centro.y<height/2){
							if(multiplicador*equipo.distanciaDeTiroCorto<multiplicador*jugadorConPelota.centro.x&&multiplicador*jugadorConPelota.centro.x<multiplicador*equipo.distanciaDeTiroLargo&&jugadorConPelota.equipo.arquero.centro.y<height/2&&noHayJugadoresDelante(jugadorConPelota, multiplicador)) tiro(width/2-multiplicador*width/2, bottomArcos-apuntarAEstoDelPalo.tiroLargo);
							else{
								var y=height*2/3;
								var jugador=jugadorMasCercanoA(x, y, equipo);
								equipo.centro={x:x-jugador.posicionEnFormacion.x, y:y-jugador.posicionEnFormacion.y};
							}
						}
						else if(jugadorConPelota.centro.y>height/2){
							if(multiplicador*equipo.distanciaDeTiroCorto<multiplicador*jugadorConPelota.centro.x&&multiplicador*jugadorConPelota.centro.x<multiplicador*equipo.distanciaDeTiroLargo&&jugadorConPelota.equipo.arquero.centro.y>height/2&&noHayJugadoresDelante(jugadorConPelota, multiplicador)) tiro(width/2-multiplicador*width/2, topArcos+apuntarAEstoDelPalo.tiroLargo);
							else{
								var y=height/3;
								var jugador=jugadorMasCercanoA(x, y, equipo);
								equipo.centro={x:x-jugador.posicionEnFormacion.x, y:y-jugador.posicionEnFormacion.y};
							}
						}
						else{
							
						}
					}
				}
				else{
					equipo.jugadorSeleccionado=jugadorMasCercanoA(pelota.centro.x, pelota.centro.y, equipo);
					//hago que el jugador más cercano a la pelota la siga, por ahora
					equipo.centro.x=pelota.centro.x-equipo.jugadorSeleccionado.posicionEnFormacion.x;
					equipo.centro.y=pelota.centro.y-equipo.jugadorSeleccionado.posicionEnFormacion.y;
				}
			}
			for(var jugador of equipo.jugadores){
				pelota.velocidad.x+=g*jugador.multiplicadorDeAtraccion*cos(atan2(jugador.centro.y-pelota.centro.y, jugador.centro.x-pelota.centro.x))/(sq(pelota.centro.x-jugador.centro.x)+sq(pelota.centro.y-jugador.centro.y));
				pelota.velocidad.y+=g*jugador.multiplicadorDeAtraccion*sin(atan2(jugador.centro.y-pelota.centro.y, jugador.centro.x-pelota.centro.x))/(sq(pelota.centro.x-jugador.centro.x)+sq(pelota.centro.y-jugador.centro.y));
				if(jugador===jugadorConPelota){
					if(equipo.teclaMasAngulo.presionada) jugador.angulo+=precision;
					if(equipo.teclaMenosAngulo.presionada) jugador.angulo-=precision;
					if(jugador.angulo<0) jugador.angulo+=TWO_PI;
					if(jugador.angulo>=TWO_PI) jugador.angulo-=TWO_PI;
				}
				else moverHacia(jugador, equipo.centro.x+jugador.posicionEnFormacion.x, equipo.centro.y+jugador.posicionEnFormacion.y);
				fill(jugador.multiplicadorDeAtraccion>0?'#f00':'#0ff');
				ellipse(jugador.centro.x, jugador.centro.y, jugador.size);
				fill(cancha.color);
				ellipse(jugador.centro.x, jugador.centro.y, jugador.size*0.75);
				fill(colorPiel);
				ellipse(jugador.centro.x, jugador.centro.y-jugador.size*0.09375, jugador.size*0.1875);
				fill(equipo.color);
				ellipse(jugador.centro.x, jugador.centro.y+jugador.size*0.125, jugador.size*0.375, jugador.size*0.25);
				rect(jugador.centro.x-jugador.size*0.1875, jugador.centro.y+jugador.size*0.125, jugador.size*0.375, jugador.size*sqrt(sq(0.375)-sq(0.1875)));
			}
			pelota.velocidad.x+=g*equipo.arquero.multiplicadorDeAtraccion*cos(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
			pelota.velocidad.y+=g*equipo.arquero.multiplicadorDeAtraccion*sin(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
			moverHacia(equipo.arquero, equipo.arquero.centro.x, constrain(pelota.centro.y, topArcos+sizePalos/2+equipo.arquero.size/2+sizePelota, bottomArcos-sizePalos/2-equipo.arquero.size/2-sizePelota));
			fill(equipo.arquero.multiplicadorDeAtraccion>0?'#f00':'#0ff');
			ellipse(equipo.arquero.centro.x, equipo.arquero.centro.y, equipo.arquero.size);
			fill(cancha.color);
			ellipse(equipo.arquero.centro.x, equipo.arquero.centro.y, equipo.arquero.size*0.75);
			fill(colorPiel);
			ellipse(equipo.arquero.centro.x, equipo.arquero.centro.y-equipo.arquero.size*0.09375, equipo.arquero.size*0.1875);
			fill(equipo.color);
			ellipse(equipo.arquero.centro.x, equipo.arquero.centro.y+equipo.arquero.size*0.125, equipo.arquero.size*0.375, equipo.arquero.size*0.25);
			rect(equipo.arquero.centro.x-equipo.arquero.size*0.1875, equipo.arquero.centro.y+equipo.arquero.size*0.125, equipo.arquero.size*0.375, equipo.arquero.size*sqrt(sq(0.375)-sq(0.1875)));
		}
		fill('#fff')
		for(var palo of cancha.palos){
			if(sq(pelota.centro.x-palo.x)+sq(pelota.centro.y-palo.y)<=sq(sizePelota/2+sizePalos/2)){
				vector=new p5.Vector(pelota.velocidad.x, pelota.velocidad.y);
				var pendiente=vector.y/vector.x;
				var terminoIndependiente=-pendiente*pelota.centro.x+pelota.centro.y;
				var a=sq(pendiente)+1;
				var b=2*((terminoIndependiente-palo.y)*pendiente-palo.x);
				var c=sq(terminoIndependiente-palo.y)+sq(palo.x)-sq(sizePelota/2+sizePalos/2);
				//aplico la fórmula resolvente
				var x1=(-b+sqrt(sq(b)-4*a*c))/2/a;
				var x2=(-b-sqrt(sq(b)-4*a*c))/2/a;
				var x;
				var y;
				if(vector.x<0){
					x=max(x1, x2);
					y=pendiente*x+terminoIndependiente;
				}
				else if(vector.x>0){
					x=min(x1, x2);
					y=pendiente*x+terminoIndependiente;
				}
				else if(vector.x===0){
					y1=pendiente*x1+terminoIndependiente;
					y2=pendiente*x2+terminoIndependiente;
					if(vector.y<0){
						if(y1<y2){
							x=x2;
							y=y2;
						}
						else{
							x=x1;
							y=y1;
						}
					}
					else{
						if(y1<y2){
							x=x1;
							y=y1;
						}
						else{
							x=x2;
							y=y2;
						}
					}
				}
				pelota.centro={x:x, y:y};
				//calculo la nueva dirección de la pelota
				var anguloPelota=vector.heading();
				var anguloEntrePelotaYPalo=atan2(palo.y-pelota.centro.y, palo.x-pelota.centro.x);
				vector.rotate(2*(anguloEntrePelotaYPalo-anguloPelota));
				pelota.velocidad={x:-0.85*vector.x, y:-0.85*vector.y};
			}
			ellipse(palo.x, palo.y, sizePalos);
		}
		fill('#eee');
		var posicionAnteriorDeLaPelota=Object.assign({}, pelota.centro);
		pelota.centro.x+=pelota.velocidad.x;
		pelota.centro.y+=pelota.velocidad.y;
		if(pelota.centro.y<sizePelota/2){
			pelota.centro.y=sizePelota/2;
			pelota.velocidad.x*=0.85;
			pelota.velocidad.y*=-0.85;
		}
		if(pelota.centro.y>height-sizePelota/2){
			pelota.centro.y=height-sizePelota/2;
			pelota.velocidad.x*=0.85;
			pelota.velocidad.y*=-0.85;
		}
		if(!jugadorConPelota){
			for(equipo of equipos) for(jugador of equipo.jugadores) if(jugador.multiplicadorDeAtraccion>0&&sq(pelota.centro.x-jugador.centro.x)+sq(pelota.centro.y-jugador.centro.y)<sq(jugador.size)) jugadoresDisputandoPelota.push(jugador);
			if(jugadoresDisputandoPelota.length){
				jugadorConPelota=random(jugadoresDisputandoPelota);
				jugadorConPelota.angulo=(new p5.Vector(pelota.velocidad.x, pelota.velocidad.y).heading())+PI;
				jugadorConPelota.equipo.jugadorSeleccionado=jugadorConPelota;
				for(jugador of jugadorConPelota.equipo.jugadores) jugador.multiplicadorDeAtraccion=1;
			}
		}
		if(jugadorConPelota){
			pelota.centro.x=jugadorConPelota.centro.x+(jugadorConPelota.size+sizePelota)*cos(jugadorConPelota.angulo)/2;
			pelota.centro.y=jugadorConPelota.centro.y+(jugadorConPelota.size+sizePelota)*sin(jugadorConPelota.angulo)/2;
			pelota.velocidad.x=0;
			pelota.velocidad.y=0;
		}
		else if(pelota.centro.x>width){
			if(height/3<pelota.centro.y&&pelota.centro.y<height*2/3) gol(equipo0);
			else{
				pelota.centro.x=width;
				pelota.velocidad.x*=-0.85;
				pelota.velocidad.y*=0.85;
			}
		}
		if(pelota.centro.x<0){
			if(height/3<pelota.centro.y&&pelota.centro.y<height*2/3) gol(equipo1);
			else{
				pelota.centro.x=0;
				pelota.velocidad.x*=-0.85;
				pelota.velocidad.y*=0.85;
			}
		}
		else ellipse(pelota.centro.x, pelota.centro.y, sizePelota);
		text(equipo0.goles+' - '+equipo1.goles, 0, 0, width, height)
	}
}

function keyPressed(){
	const teclas=['Arriba', 'Izquierda', 'Abajo', 'Derecha', 'MasAngulo', 'MenosAngulo'];
	for(var tecla of teclas) for(equipo of equipos)	if(keyCode===equipo['tecla'+tecla].code){
		equipo['tecla'+tecla].presionada=true;
		return false;
	}
}

function keyReleased(){
	const teclas=['Arriba', 'Izquierda', 'Abajo', 'Derecha', 'MasAngulo', 'MenosAngulo'];
	for(equipo of equipos){
		for(var tecla of teclas) if(keyCode===equipo['tecla'+tecla].code) equipo['tecla'+tecla].presionada=false;
		if(keyCode===equipo.teclaCambiarAtraccion){
			equipo.jugadorSeleccionado.multiplicadorDeAtraccion*=-1;
			if(jugadorConPelota===equipo.jugadorSeleccionado) jugadorConPelota=null;
		}
	}
}

function Equipo(nombre, DT, color, teclaArriba, teclaIzquierda, teclaAbajo, teclaDerecha, teclaMasAngulo, teclaMenosAngulo, teclaCambiarAtraccion, comparadorConLaDistanciaDeTiro, distanciaDeTiroLargo, distanciaDeTiroCorto){
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
	this.comparadorConLaDistanciaDeTiro=comparadorConLaDistanciaDeTiro;
	this.distanciaDeTiroCorto=distanciaDeTiroCorto;
	this.distanciaDeTiroLargo=distanciaDeTiroLargo;
}

Equipo.prototype.agregarJugador=function(x, y){
	this.jugadores.push(new Jugador(this, 'jugador', x, y));
};

function Jugador(equipo, tipo, x, y){
	this.tipo=tipo;
	this.equipo=equipo;
	this.multiplicadorDeAtraccion=1;
	this.centro={x:x, y:y};
	this.posicionEnFormacion={x:x, y:y};
}

Jugador.prototype.size=30;

function moverHacia(jugador, x, y){
	if(x<cancha.x+jugador.size/2&&jugador.tipo!=='arquero') x=sizePelota+jugador.size/2;
	if(y<cancha.y+jugador.size/2) y=sizePelota+jugador.size/2;
	if(x>cancha.x+cancha.width-jugador.size/2&&jugador.tipo!=='arquero') x=width-sizePelota-jugador.size/2;
	if(y>cancha.y+cancha.height-jugador.size/2) y=height-sizePelota-jugador.size/2;
	var vector=new p5.Vector(x-jugador.centro.x, y-jugador.centro.y);
	vector.normalize();
	vector.mult(velocidadJugadores);
	jugador.centro.x=vector.x>0?min(jugador.centro.x+vector.x, x):max(jugador.centro.x+vector.x, x);
	jugador.centro.y=vector.y>0?min(jugador.centro.y+vector.y, y):max(jugador.centro.y+vector.y, y);
}

function nuevoPartido(){
	for(equipo of equipos) equipo.goles=0;
	gol(false);
	enPartido=true;
}

function gol(equipoQueHizoGol){
	for(equipo of equipos){
		equipo.centro={x:0, y:0};
		for(jugador of equipo.jugadores){
			jugador.centro=Object.assign({}, jugador.posicionEnFormacion);
			jugador.multiplicadorDeAtraccion=1;
		}
		equipo.jugadorSeleccionado=jugador;
	}
	pelota={centro:{x:floor(random(width/4, 3/4*width+1)), y:height/2}, velocidad:{x:0, y:0}};
	equipo0.arquero=new Jugador(equipo0, 'arquero', Jugador.prototype.size/2, height/2);
	equipo1.arquero=new Jugador(equipo1, 'arquero', width-Jugador.prototype.size/2, height/2);
	for(var equipo of equipos) equipo.arquero.multiplicadorDeAtraccion=-1;
	if(equipoQueHizoGol){
		equipoQueHizoGol.goles++;
	}
}

function jugadorMasCercanoA(x, y, equipo){
	var jugadorMasCercano=null;
	var menorDistancia=Infinity;
	for(var jugador of equipo.jugadores){
		var distancia=sq(jugador.centro.x-x)+sq(jugador.centro.y-y) //no saco la raíz cuadrada ya que sólo me interesa saber cuál es el que está más cerca, no la distancia
		if(distancia<menorDistancia){
			jugadorMasCercano=jugador;
			menorDistancia=distancia;
		}
	}
	return jugadorMasCercano;
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

function tiro(x, y){
	if(apuntarA(x, y)){
		jugadorConPelota.multiplicadorDeAtraccion*=-1;
		jugadorConPelota=null;
	}
}

function noHayJugadoresDelante(jugador, multiplicador){
	for(var equipo of equipos){
		for(var posibleJugadorDelante of equipo.jugadores){
			if(multiplicador*posibleJugadorDelante.centro.x<multiplicador*jugador.centro.x) return false;
		}
	}
	return true;
}