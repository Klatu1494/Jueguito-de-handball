const WIDTH=800;
const HEIGHT=600;
const g=500;
const sizePelota=15;
const sizePalos=20;
const sizeJugadores=35;
const sizeCirculoDeAlrededor=0.25;
const topArcos=HEIGHT/3;
const bottomArcos=HEIGHT*2/3;
const velocidadJugadores=1;
const cancha={
	x:sizePelota,
	y:0,
	width:WIDTH-sizePelota*2,
	height:HEIGHT,
	palos:[
		{x:sizePelota, y:topArcos},
		{x:sizePelota, y:bottomArcos},
		{x:WIDTH-sizePelota, y:topArcos},
		{x:WIDTH-sizePelota, y:bottomArcos}
	],
	color:'#269E3A',
	margen:4*sizePelota
}
const apuntarAEstoDelPalo={tiroLargo:115, tiroCorto:30};
const precision=0.07;
const colorPiel='#ffdfc4';
const distanciaDeIntercepcion=80;
const constanteDeDesvio=-17.5;

var equipo0;
var equipo1;
var equipos;
var jugadorConPelota;
var pelota;
var ultimoEquipoConPelota;
var enPartido;

function setup(){
	createCanvas(WIDTH, HEIGHT);
	equipo0=new Equipo('West Ham United F.C.', 'AI', '#fff', 87, 65, 83, 68, 69, 81, 32, 'mayor que', width/2, width*4/5); //#7D2C3B
	equipo1=new Equipo('Finland', 'AI', '#003580', 73, 74, 75, 76, 79, 85, 13, 'menor que', width/2, width/5);
	equipos=[equipo0, equipo1];
	equipo0.agregarJugador(width*2/5, height/5, {atraccion:50, repulsion:50, punteria:50});
	equipo0.agregarJugador(width*2/5, height*4/5, {atraccion:50, repulsion:50, punteria:50});
	equipo0.agregarJugador(width/5, height/3, {atraccion:50, repulsion:50, punteria:50});
	equipo0.agregarJugador(width/5, height*2/3, {atraccion:50, repulsion:50, punteria:50});
	equipo1.agregarJugador(width*4/5, height/3, {atraccion:50, repulsion:50, punteria:50});
	equipo1.agregarJugador(width*4/5, height*2/3, {atraccion:50, repulsion:50, punteria:50});
	equipo1.agregarJugador(width*3/5, height/5, {atraccion:50, repulsion:50, punteria:50});
	equipo1.agregarJugador(width*3/5, height*4/5, {atraccion:50, repulsion:50, punteria:50});
	textAlign(CENTER, TOP);
	nuevoPartido()
}

function draw(){
	if(enPartido){
		var jugadoresDisputandoPelota=[];
		background(cancha.color);
		stroke('#fff');
		line(cancha.x, cancha.y, cancha.x, cancha.y+cancha.height);
		line(cancha.x+cancha.width, cancha.y, cancha.x+cancha.width, cancha.y+cancha.height);
		line(cancha.x+cancha.width/2, cancha.y, cancha.x+cancha.width/2, cancha.y+cancha.height);
		noFill();
		ellipse(cancha.x+cancha.width/2, cancha.y+cancha.height/2, cancha.height/3);
		dibujarRectanguloPunteado(cancha.x+cancha.margen, cancha.y+cancha.margen, cancha.width-cancha.margen*2, cancha.height-cancha.margen*2);
		noStroke();
		for(var equipo of equipos){
			if(equipo.DT==='humano'){
				var vector=new p5.Vector((equipo.teclaIzquierda.presionada?-1:0)+(equipo.teclaDerecha.presionada?1:0), (equipo.teclaArriba.presionada?-1:0)+(equipo.teclaAbajo.presionada?1:0));
				vector.normalize();
				vector.mult(velocidadJugadores);
				equipo.centro.x+=vector.x;
				equipo.centro.y+=vector.y;
			}
			else AI(equipo);
			for(var jugador of equipo.jugadores){
				pelota.velocidad.x+=g*jugador.multiplicadorDeAtraccion*cos(atan2(jugador.centro.y-pelota.centro.y, jugador.centro.x-pelota.centro.x))/(sq(pelota.centro.x-jugador.centro.x)+sq(pelota.centro.y-jugador.centro.y));
				pelota.velocidad.y+=g*jugador.multiplicadorDeAtraccion*sin(atan2(jugador.centro.y-pelota.centro.y, jugador.centro.x-pelota.centro.x))/(sq(pelota.centro.x-jugador.centro.x)+sq(pelota.centro.y-jugador.centro.y));
				if(jugador===jugadorConPelota){
					if(equipo.DT==='humano'){
						if(equipo.teclaMasAngulo.presionada) jugador.angulo+=precision;
						if(equipo.teclaMenosAngulo.presionada) jugador.angulo-=precision;
						if(jugador.angulo<0) jugador.angulo+=TWO_PI;
						if(jugador.angulo>=TWO_PI) jugador.angulo-=TWO_PI;
					}
				}
				else moverHacia(jugador, equipo.centro.x+jugador.posicionEnFormacion.x, equipo.centro.y+jugador.posicionEnFormacion.y);
				fill(jugador.multiplicadorDeAtraccion>0?'#f00':'#0ff');
				ellipse(jugador.centro.x, jugador.centro.y+jugador.size/4, jugador.size, jugador.size/2);
				fill(colorPiel);
				ellipse(jugador.centro.x, jugador.centro.y-jugador.size*3/8, jugador.size/4);
				fill(equipo.color);
				ellipse(jugador.centro.x, jugador.centro.y-jugador.size/12, jugador.size/2, jugador.size/3);
				rect(jugador.centro.x-jugador.size/4, jugador.centro.y-jugador.size/12, jugador.size/2, sqrt(sq(jugador.size/2)-sq(jugador.size/4)));
			}
			pelota.velocidad.x+=g*equipo.arquero.multiplicadorDeAtraccion*cos(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
			pelota.velocidad.y+=g*equipo.arquero.multiplicadorDeAtraccion*sin(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
			moverHacia(equipo.arquero, equipo.arquero.centro.x, constrain(pelota.centro.y, topArcos+sizePalos/2+equipo.arquero.size/2+sizePelota, bottomArcos-sizePalos/2-equipo.arquero.size/2-sizePelota));
			fill(equipo.arquero.multiplicadorDeAtraccion>0?'#f00':'#0ff');
			ellipse(equipo.arquero.centro.x, equipo.arquero.centro.y+equipo.arquero.size/4, equipo.arquero.size, equipo.arquero.size/2);
			fill(colorPiel);
			ellipse(equipo.arquero.centro.x, equipo.arquero.centro.y-equipo.arquero.size*3/8, equipo.arquero.size/4);
			fill(equipo.color);
			ellipse(equipo.arquero.centro.x, equipo.arquero.centro.y-equipo.arquero.size/12, equipo.arquero.size/2, equipo.arquero.size/3);
			rect(equipo.arquero.centro.x-equipo.arquero.size/4, equipo.arquero.centro.y-equipo.arquero.size/12, equipo.arquero.size/2, sqrt(sq(equipo.arquero.size/2)-sq(equipo.arquero.size/4)));
		}
		fill('#1c1a1a')
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
		strokeWeight(2);
		var posicionAnteriorDeLaPelota=Object.assign({}, pelota.centro);
		pelota.centro.x+=pelota.velocidad.x;
		pelota.centro.y+=pelota.velocidad.y;
		if(pelota.centro.y<cancha.y+sizePelota/2){
			pelota.centro.y=cancha.y+sizePelota/2;
			pelota.velocidad.x*=1.15;
			pelota.velocidad.y*=-1.15;
			for(var equipo of equipos) if(equipo.DT==='AI') atraerConTodosLosJugadoresDelEquipo(equipo);
		}
		if(pelota.centro.y>cancha.y+cancha.height-sizePelota/2){
			pelota.centro.y=cancha.y+cancha.height-sizePelota/2;
			pelota.velocidad.x*=1.15;
			pelota.velocidad.y*=-1.15;
			for(var equipo of equipos) if(equipo.DT==='AI') atraerConTodosLosJugadoresDelEquipo(equipo);
		}
		if(!jugadorConPelota){
			for(equipo of equipos) for(jugador of equipo.jugadores) if(jugador.multiplicadorDeAtraccion>0&&sq(pelota.centro.x-jugador.centro.x)+sq(pelota.centro.y-jugador.centro.y)<sq(jugador.size)) jugadoresDisputandoPelota.push(jugador);
			if(jugadoresDisputandoPelota.length){
				jugadorConPelota=random(jugadoresDisputandoPelota);
				jugadorConPelota.angulo=atan2(pelota.centro.y-jugadorConPelota.centro.y, pelota.centro.x-jugadorConPelota.centro.x);
				jugadorConPelota.equipo.jugadorSeleccionado=jugadorConPelota;
				ultimoEquipoConPelota=jugadorConPelota.equipo;
				for(var equipo of equipos) if(equipo===jugadorConPelota.equipo||equipo.DT==='AI') for(jugador of equipo.jugadores) jugador.multiplicadorDeAtraccion=jugador.stats.atraccion/50;
			}
		}
		if(jugadorConPelota){
			pelota.centro={
				x:jugadorConPelota.centro.x+(jugadorConPelota.size+sizePelota)*cos(jugadorConPelota.angulo)/2,
				y:jugadorConPelota.centro.y+(jugadorConPelota.size+sizePelota)*sin(jugadorConPelota.angulo)/2
			};
			pelota.velocidad={x:0, y:0};
		}
		if(cancha.x+cancha.width+sizePelota/2<pelota.centro.x){
			if(height/3<pelota.centro.y&&pelota.centro.y<height*2/3) gol(equipo0);
			else{
				pelota.centro.x=cancha.x+cancha.width+sizePelota/2;
				pelota.velocidad.x*=-1.15;
				pelota.velocidad.y*=1.15;
				for(var equipo of equipos) if(equipo.DT==='AI') atraerConTodosLosJugadoresDelEquipo(equipo);
			}
		}
		else if(pelota.centro.x<cancha.x-sizePelota/2){
			if(height/3<pelota.centro.y&&pelota.centro.y<height*2/3) gol(equipo1);
			else{
				pelota.centro.x=cancha.x-sizePelota/2;
				pelota.velocidad.x*=-1.15;
				pelota.velocidad.y*=1.15;
				for(var equipo of equipos) if(equipo.DT==='AI') atraerConTodosLosJugadoresDelEquipo(equipo);
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
		if(keyCode===equipo.teclaCambiarAtraccion&&equipo.DT==='humano'){
			equipo.jugadorSeleccionado.multiplicadorDeAtraccion=(0<equipo.jugadorSeleccionado.multiplicadorDeAtraccion?-equipo.jugadorSeleccionado.stats.repulsion:equipo.jugadorSeleccionado.stats.atraccion)/50;
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

Equipo.prototype.agregarJugador=function(x, y, stats){
	this.jugadores.push(new Jugador(this, 'jugador', x, y, stats));
};

function Jugador(equipo, tipo, x, y, stats){
	this.tipo=tipo;
	this.equipo=equipo;
	this.stats=stats;
	this.multiplicadorDeAtraccion=this.stats.atraccion/50;
	this.centro={x:x, y:y};
	this.posicionEnFormacion={x:x, y:y};
}

Jugador.prototype.size=sizeJugadores;

function moverHacia(jugador, x, y){
	if(x<cancha.x+jugador.size/2+cancha.margen&&jugador.tipo!=='arquero') x=cancha.x+jugador.size/2+cancha.margen;
	if(y<cancha.y+jugador.size/2+cancha.margen) y=cancha.y+jugador.size/2+cancha.margen;
	if(x>cancha.x+cancha.width-jugador.size/2-cancha.margen&&jugador.tipo!=='arquero') x=cancha.x+cancha.width-jugador.size/2-cancha.margen;
	if(y>cancha.y+cancha.height-jugador.size/2-cancha.margen) y=cancha.y+cancha.height-jugador.size/2-cancha.margen;
	if(ultimoEquipoConPelota===jugador.equipo&&ultimoEquipoConPelota.DT==='AI'&&(jugador.equipo===equipo0?x<jugador.centro.x:x>jugador.centro.x)) x=jugador.centro.x;
	var vector=new p5.Vector(x-jugador.centro.x, y-jugador.centro.y);
	var centroPrevio={x:jugador.centro.x, y:jugador.centro.y}
	vector.normalize();
	vector.mult(velocidadJugadores);
	jugador.centro.x=vector.x>0?min(jugador.centro.x+vector.x, x):max(jugador.centro.x+vector.x, x);
	jugador.centro.y=vector.y>0?min(jugador.centro.y+vector.y, y):max(jugador.centro.y+vector.y, y);
	for(var equipo of equipos) for(var jugador2 of equipo.jugadores) if(jugador!==jugador2&&dist(jugador.centro.x, jugador.centro.y, jugador2.centro.x, jugador2.centro.y)<sizeJugadores) jugador.centro=centroPrevio;
}

function nuevoPartido(){
	for(equipo of equipos) equipo.goles=0;
	gol(false);
	enPartido=true;
	jugadorConPelota=null;
}

function gol(equipoQueHizoGol){
	for(equipo of equipos){
		equipo.centro={x:0, y:0};
		for(jugador of equipo.jugadores){
			jugador.centro=Object.assign({}, jugador.posicionEnFormacion);
			jugador.multiplicadorDeAtraccion=jugador.stats.atraccion/50;
		}
		equipo.jugadorSeleccionado=jugador;
	}
	var angulo=random(0, TWO_PI);
	var radio=random(0, cancha.height/3);
	pelota={centro:{x:cancha.x+cancha.width/2+cos(angulo)*radio, y:cancha.y+cancha.height/2+sin(angulo)*radio}, velocidad:{x:0, y:0}};
	equipo0.arquero=new Jugador(equipo0, 'arquero', cancha.x, height/2, {atraccion:50, repulsion:50, punteria:50});
	equipo1.arquero=new Jugador(equipo1, 'arquero', cancha.x+cancha.width, height/2, {atraccion:50, repulsion:50, punteria:50});
	for(var equipo of equipos) equipo.arquero.multiplicadorDeAtraccion=-equipo.arquero.stats.repulsion/50;
	if(equipoQueHizoGol){
		equipoQueHizoGol.goles++;
	}
}

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

function tiro(x, y){
	if(apuntarA(x, y)){
		jugadorConPelota.equipo.despejando=false;
		jugadorConPelota.angulo=jugadorConPelota.angulo+(random()*2-1)*jugadorConPelota.stats.punteria/100;
		pelota.centro={x:jugadorConPelota.centro.x+cos(jugadorConPelota.angulo)*(sizePelota+sizeJugadores)/2, y:jugadorConPelota.centro.y+sin(jugadorConPelota.angulo)*(sizePelota+sizeJugadores)/2}
		jugadorConPelota.multiplicadorDeAtraccion=(0<jugadorConPelota.multiplicadorDeAtraccion?-jugadorConPelota.stats.repulsion:jugadorConPelota.stats.atraccion)/50;
		jugadorConPelota=null;
	}
	return true;
}

function paseA(jugador){
	if(noHayJugadoresEntreJugadorConPelotaY(jugador.centro.x, jugador.centro.y)){
		var multiplicadorDeDesvio=dist(jugadorConPelota.centro.x, jugadorConPelota.centro.y, jugador.centro.x, jugador.centro.y)*constanteDeDesvio;
		var desvioX=0;
		var desvioY=0;
		for(var equipo of equipos){
			for(j of equipo.jugadores){
				desvioX+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*cos(atan2(j.centro.y-pelota.centro.y, j.centro.x-pelota.centro.x))/(sq(pelota.centro.x-j.centro.x)+sq(pelota.centro.y-j.centro.y));
				desvioY+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*sin(atan2(j.centro.y-pelota.centro.y, j.centro.x-pelota.centro.x))/(sq(pelota.centro.x-j.centro.x)+sq(pelota.centro.y-j.centro.y));
			}
			desvioX+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*cos(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
			desvioY+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*sin(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
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
					desvioX+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*cos(atan2(j.centro.y-pelota.centro.y, j.centro.x-pelota.centro.x))/(sq(pelota.centro.x-j.centro.x)+sq(pelota.centro.y-j.centro.y));
					desvioY+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*sin(atan2(j.centro.y-pelota.centro.y, j.centro.x-pelota.centro.x))/(sq(pelota.centro.x-j.centro.x)+sq(pelota.centro.y-j.centro.y));
				}
				desvioX+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*cos(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
				desvioY+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*sin(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
			}
			return tiro(jugador.centro.x+desvioX, -jugador.centro.y-desvioY);
		}
		else if(noHayJugadoresEntreJugadorConPelotaY(jugador.centro.x, 2*(cancha.y+cancha.height)-jugador.centro.y, 'abajo')){
			var multiplicadorDeDesvio=dist(jugadorConPelota.centro.x, jugadorConPelota.centro.y, jugador.centro.x, 2*(cancha.y+cancha.height)-jugador.centro.y)*constanteDeDesvio;
			var desvioX=0;
			var desvioY=0;
			for(var equipo of equipos){
				for(j of equipo.jugadores){
					desvioX+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*cos(atan2(j.centro.y-pelota.centro.y, j.centro.x-pelota.centro.x))/(sq(pelota.centro.x-j.centro.x)+sq(pelota.centro.y-j.centro.y));
					desvioY+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*sin(atan2(j.centro.y-pelota.centro.y, j.centro.x-pelota.centro.x))/(sq(pelota.centro.x-j.centro.x)+sq(pelota.centro.y-j.centro.y));
				}
				desvioX+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*cos(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
				desvioY+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*sin(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
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
					desvioX+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*cos(atan2(j.centro.y-pelota.centro.y, j.centro.x-pelota.centro.x))/(sq(pelota.centro.x-j.centro.x)+sq(pelota.centro.y-j.centro.y));
					desvioX+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*sin(atan2(j.centro.y-pelota.centro.y, j.centro.x-pelota.centro.x))/(sq(pelota.centro.x-j.centro.x)+sq(pelota.centro.y-j.centro.y));
				}
				desvioX+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*cos(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
				desvioY+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*sin(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
			}
			return tiro(jugador.centro.x+desvioX, 2*(cancha.y+cancha.height)-jugador.centro.y-desvioY);
		}
		else if(noHayJugadoresEntreJugadorConPelotaY(jugador.centro.x, -jugador.centro.y, 'arriba')){
			var multiplicadorDeDesvio=dist(jugadorConPelota.centro.x, jugadorConPelota.centro.y, jugador.centro.x, -jugador.centro.y)*constanteDeDesvio;
			var desvioX=0;
			var desvioY=0;
			for(var equipo of equipos){
				for(j of equipo.jugadores){
					desvioX+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*cos(atan2(j.centro.y-pelota.centro.y, j.centro.x-pelota.centro.x))/(sq(pelota.centro.x-j.centro.x)+sq(pelota.centro.y-j.centro.y));
					desvioX+=(j===jugadorConPelota?-1:1)*g*j.multiplicadorDeAtraccion*sin(atan2(j.centro.y-pelota.centro.y, j.centro.x-pelota.centro.x))/(sq(pelota.centro.x-j.centro.x)+sq(pelota.centro.y-j.centro.y));
				}
				desvioX+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*cos(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
				desvioY+=(equipo.arquero===jugadorConPelota?-1:1)*g*equipo.arquero.multiplicadorDeAtraccion*sin(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
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
	var multiplicador=jugadorConPelota.equipo.comparadorConLaDistanciaDeTiro==='mayor que'?-1:1;
	return (function(a, b){
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
		if(diferencia<d){
			angulos=[];
			diferencia=d;
		}
		if(d===diferencia){
			angulos.push((a1+a2+TWO_PI)/2);
		}
	}
	angulo=random(angulos);
	tiro(jugadorConPelota.centro.x+(sizePelota+jugadorConPelota.size)*cos(angulo), jugadorConPelota.centro.y+(sizePelota+jugadorConPelota.size)*sin(angulo));
}

function AI(equipo){
	equipo.jugadorSeleccionado=jugadorMasCercanoA(pelota.centro.x, pelota.centro.y, equipo.jugadores);
	var p;
	if(pelota.velocidad.x===0){
		if(pelota.velocidad.y===0) p=pelota.centro;
		else p=distanciaASegmento(
			equipo.jugadorSeleccionado.centro.x,
			equipo.jugadorSeleccionado.centro.y,
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
				equipo.jugadorSeleccionado.centro.x,
				equipo.jugadorSeleccionado.centro.y,
				0,
				pelota.centro.y-pelota.centro.x*m,
				pelota.centro.x,
				pelota.centro.y
			).puntoMasCercano:
			distanciaASegmento(
				equipo.jugadorSeleccionado.centro.x,
				equipo.jugadorSeleccionado.centro.y,
				pelota.centro.x,
				pelota.centro.y,
				width,
				pelota.centro.y+(width-pelota.centro.x)*m
			).puntoMasCercano;
	}
	equipo.centro.x=p.x-equipo.jugadorSeleccionado.posicionEnFormacion.x;
	equipo.centro.y=p.y-equipo.jugadorSeleccionado.posicionEnFormacion.y;
	var multiplicador=equipo.comparadorConLaDistanciaDeTiro==='mayor que'?-1:1;
	var xArcoContrario=width/2-multiplicador*width/2;
	if(jugadorConPelota){
		var equipoRival=equipo===equipo0?equipo1:equipo0;
		if(jugadorConPelota.equipo===equipo){
			if(equipo.despejando) despejar(equipoRival);
			else{
				var x=cancha.x+cancha.width/2-multiplicador*cancha.width/2;
				if(jugadorConPelota.centro.y<cancha.y+cancha.height/2){
					var y=cancha.y+cancha.height*2/3;
					var jugador=jugadorMasCercanoA(x, y, equipo.jugadores);
					equipo.centro={x:x-jugador.posicionEnFormacion.x, y:y-jugador.posicionEnFormacion.y};
					if(multiplicador*equipo.distanciaDeTiroCorto<multiplicador*jugadorConPelota.centro.x&&multiplicador*jugadorConPelota.centro.x<multiplicador*equipo.distanciaDeTiroLargo&&jugadorConPelota.equipo.arquero.centro.y===topArcos+sizePalos/2+equipo.arquero.size/2+sizePelota&&noHayJugadoresDelanteDe(jugadorConPelota, multiplicador)) tiro(xArcoContrario, bottomArcos-apuntarAEstoDelPalo.tiroLargo);
					else if(multiplicador*jugadorConPelota.centro.x<=multiplicador*equipo.distanciaDeTiroCorto&&jugadorConPelota.equipo.arquero.centro.y>height/2) tiro(xArcoContrario, topArcos+apuntarAEstoDelPalo.tiroCorto);
					else{
						equipo.jugadores.sort(sortFunction);
						var pelotaPasada=false;
						for(var jugador of equipo.jugadores){
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
					var jugador=jugadorMasCercanoA(x, y, equipo.jugadores);
					equipo.centro={x:x-jugador.posicionEnFormacion.x, y:y-jugador.posicionEnFormacion.y};
					if(multiplicador*equipo.distanciaDeTiroCorto<multiplicador*jugadorConPelota.centro.x&&multiplicador*jugadorConPelota.centro.x<multiplicador*equipo.distanciaDeTiroLargo&&jugadorConPelota.equipo.arquero.centro.y===bottomArcos-sizePalos/2-equipo.arquero.size/2-sizePelota&&noHayJugadoresDelanteDe(jugadorConPelota, multiplicador)) tiro(xArcoContrario, topArcos+apuntarAEstoDelPalo.tiroLargo);
					else if(multiplicador*jugadorConPelota.centro.x<=multiplicador*equipo.distanciaDeTiroCorto&&jugadorConPelota.equipo.arquero.centro.y<height/2) tiro(xArcoContrario, bottomArcos-apuntarAEstoDelPalo.tiroCorto);
					else{
						equipo.jugadores.sort(sortFunction);
						var pelotaPasada=false;
						for(var jugador of equipo.jugadores){
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
					var jugador=jugadorMasCercanoA(x, y, equipo.jugadores);
					equipo.centro={x:x-jugador.posicionEnFormacion.x, y:y-jugador.posicionEnFormacion.y};
					equipo.jugadores.sort(sortFunction);
					var pelotaPasada=false;
					for(var jugador of equipo.jugadores){
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
				for(var jugador of equipo.jugadores){
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
			equipo.centro.x=elemento.punto.x-elemento.jugador.posicionEnFormacion.x;
			equipo.centro.y=elemento.punto.y-elemento.jugador.posicionEnFormacion.y;
		}
	}
}

function dibujarRectanguloPunteado(x, y, width, height){
	dibujarLineaPunteada(x, y, x+width, y);
	dibujarLineaPunteada(x+width, y, x+width, y+height);
	dibujarLineaPunteada(x+width, y+height, x, y+height);
	dibujarLineaPunteada(x, y+height, x, y);
}

function dibujarLineaPunteada(x1, y1, x2, y2){
	var anchoLinea=10;
	var angulo=atan2(y2-y1, x2-x1);
	var lineas=(dist(x1, y1, x2, y2)-anchoLinea)/anchoLinea;
	for(i=0; i<lineas; i+=2) line(x1+cos(angulo)*anchoLinea*i, y1+sin(angulo)*anchoLinea*i, x1+cos(angulo)*anchoLinea*(i+1), y1+sin(angulo)*anchoLinea*(i+1));
	line(x1+cos(angulo)*anchoLinea*i, y1+sin(angulo)*anchoLinea*i, x2, y2);
}