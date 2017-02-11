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
	color:'#269e3a',
	margen:4*sizePelota
}
const equiposPredeterminados=[
	[
		{
			nombre:'Finnish M. S. C.',
			color1:'#ffffff',
			color2:'#003580',
			patron:'diagonal',
			anchoPatron:5,
			arquero:{atraccion:44, repulsion:80, punteria:25},
			jugadores:[
				{atraccion:71, repulsion:64, punteria:81, x:cancha.width/5, y:cancha.height/3},
				{atraccion:76, repulsion:63, punteria:59, x:cancha.width/5, y:cancha.height*2/3},
				{atraccion:75, repulsion:78, punteria:74, x:cancha.width*2/5, y:cancha.height/5},
				{atraccion:69, repulsion:76, punteria:74, x:cancha.width*2/5, y:cancha.height*4/5}
			]
		},
		{
			nombre:'The albinegros',
			color1:'#000000',
			color2:'#ffffff',
			patron:'horizontal',
			anchoPatron:8,
			arquero:{atraccion:36, repulsion:65, punteria:31},
			jugadores:[
				{atraccion:64, repulsion:62, punteria:62, x:cancha.width/5, y:cancha.height/3},
				{atraccion:60, repulsion:70, punteria:59, x:cancha.width/5, y:cancha.height*2/3},
				{atraccion:61, repulsion:67, punteria:60, x:cancha.width*2/5, y:cancha.height/5},
				{atraccion:69, repulsion:68, punteria:64, x:cancha.width*2/5, y:cancha.height*4/5}
			]
		},
		{
			nombre:'A. F. M. Barceloniina',
			color1:'#ff0000',
			color2:'#0000ff',
			arquero:{atraccion:31, repulsion:64, punteria:5},
			jugadores:[
				{atraccion:68, repulsion:69, punteria:70, x:cancha.width/5, y:cancha.height/3},
				{atraccion:62, repulsion:63, punteria:66, x:cancha.width/5, y:cancha.height*2/3},
				{atraccion:67, repulsion:65, punteria:65, x:cancha.width*2/5, y:cancha.height/5},
				{atraccion:65, repulsion:59, punteria:64, x:cancha.width*2/5, y:cancha.height*4/5}
			]
		},
		{
			nombre:'Groove Street',
			color1:'#008800',
			color2:'#008800',
			arquero:{atraccion:13, repulsion:71, punteria:1},
			jugadores:[
				{atraccion:71, repulsion:60, punteria:70, x:cancha.width/5, y:cancha.height/3},
				{atraccion:69, repulsion:61, punteria:66, x:cancha.width/5, y:cancha.height*2/3},
				{atraccion:64, repulsion:66, punteria:63, x:cancha.width*2/5, y:cancha.height/5},
				{atraccion:67, repulsion:69, punteria:68, x:cancha.width*2/5, y:cancha.height*4/5}
			]
		}
	]
];
const apuntarAEstoDelPalo={tiroLargo:115, tiroCorto:30};
const precision=0.07;
const colorPiel='#ffdfc4';
const distanciaDeIntercepcion=80;
const constanteDeDesvio=-17.5;

var equipo0Seleccion;
var equipo1Seleccion;
var camiseta0;
var camiseta1;
var equipos;
var jugadorConPelota;
var pelota;
var ultimoEquipoConPelota;
var enPartido;
var normalizador;

function setup(){
	for(var equipo of equiposPredeterminados[0]){
		var li=document.createElement('li');
		li.className='equipo';
		li.equipo=equipo;
		var div=document.createElement('div');
		div.innerText=equipo.nombre;
		li.appendChild(div);
		var canvas=document.createElement('canvas');
		canvas.innerText='Your browser doens\'t support canvas elements.';
		canvas.width=200;
		canvas.height=200;
		dibujarJugador(canvas, 200, equipo.color1, equipo.patron, equipo.color2, equipo.anchoPatron*200/sizeJugadores);
		li.appendChild(canvas);
		var canvas=document.createElement('canvas');
		canvas.innerText='Your browser doens\'t support canvas elements.';
		canvas.width=200;
		canvas.height=200;
		dibujarJugador(canvas, 200, equipo.color2, equipo.patron, equipo.color1, equipo.anchoPatron*200/sizeJugadores);
		li.appendChild(canvas);
		document.getElementById('slider0').appendChild(li);
	}
	createCanvas(WIDTH, HEIGHT);
	textAlign(CENTER, TOP);

	// Inicializar el normalizador
	normalizador=new NormalizadorRandom(10);

	nuevoPartido(false);
	$('#slider0').bxSlider({
		pager: false,
		onSlideAfter: cambiarEquipo0
	});
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
				canvas.getContext('2d').drawImage($('#jugador'+(jugador.equipo===equipo0?0:1))[0], jugador.centro.x-sizeJugadores/2, jugador.centro.y-sizeJugadores/2);
			}
			pelota.velocidad.x+=g*equipo.arquero.multiplicadorDeAtraccion*cos(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
			pelota.velocidad.y+=g*equipo.arquero.multiplicadorDeAtraccion*sin(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
			moverHacia(equipo.arquero, equipo.arquero.centro.x, constrain(pelota.centro.y, topArcos+sizePalos/2+equipo.arquero.size/2+sizePelota, bottomArcos-sizePalos/2-equipo.arquero.size/2-sizePelota));
			fill(equipo.arquero.multiplicadorDeAtraccion>0?'#f00':'#0ff');
			ellipse(equipo.arquero.centro.x, equipo.arquero.centro.y+equipo.arquero.size/4, equipo.arquero.size, equipo.arquero.size/2);
			canvas.getContext('2d').drawImage($('#jugador'+(equipo===equipo0?0:1))[0], equipo.arquero.centro.x-sizeJugadores/2, equipo.arquero.centro.y-sizeJugadores/2);
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
			for(var equipo of equipos) for(var jugador of equipo.jugadores) if(jugador.multiplicadorDeAtraccion>0&&sq(pelota.centro.x-jugador.centro.x)+sq(pelota.centro.y-jugador.centro.y)<sq(jugador.size)) jugadoresDisputandoPelota.push(jugador);
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
			if(jugadorConPelota===equipo.jugadorSeleccionado) soltarPelota();
			else equipo.jugadorSeleccionado.multiplicadorDeAtraccion=(0<equipo.jugadorSeleccionado.multiplicadorDeAtraccion?-equipo.jugadorSeleccionado.stats.repulsion:equipo.jugadorSeleccionado.stats.atraccion)/50;
		}
	}
}

function Equipo(nombre, DT, teclaArriba, teclaIzquierda, teclaAbajo, teclaDerecha, teclaMasAngulo, teclaMenosAngulo, teclaCambiarAtraccion, comparadorConLaDistanciaDeTiro, distanciaDeTiroLargo, distanciaDeTiroCorto){
	this.nombre=nombre;
	this.DT=DT;
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

function nuevoPartido(humanos){
	var alMenosUnHumano=humanos&&confirm('¿Deseás jugar?');
	if(!humanos){
		equipo0Seleccion=equiposPredeterminados[0][0];
		equipo1Seleccion=equiposPredeterminados[0][1];
	}
	dibujarJugadores();
	equipo0=new Equipo(equipo0Seleccion.nombre, alMenosUnHumano?'humano':'AI', 87, 65, 83, 68, 69, 81, 32, 'mayor que', width/2, width*4/5);
	equipo1=new Equipo(equipo0Seleccion.nombre, alMenosUnHumano&&confirm('¿Con un/a amigo/a?')?'humano':'AI', 73, 74, 75, 76, 79, 85, 13, 'menor que', width/2, width/5);
	equipos=[equipo0, equipo1];
	for(var jugador of equipo0Seleccion.jugadores){
		equipo0.agregarJugador(cancha.x+jugador.x, cancha.y+jugador.y, {atraccion:jugador.atraccion, repulsion:jugador.repulsion, punteria:jugador.punteria});
	}
	for(var jugador of equipo1Seleccion.jugadores){
		equipo1.agregarJugador(cancha.y+cancha.width-jugador.x, cancha.y+cancha.height-jugador.y, {atraccion:jugador.atraccion, repulsion:jugador.repulsion, punteria:jugador.punteria});
	}
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

function soltarPelota(){
	var nAngulo = normalizador.RandomNormalizado (jugadorConPelota.angulo, 1 - jugadorConPelota.stats.punteria / 100);
	jugadorConPelota.angulo = nAngulo;
	pelota.centro={x:jugadorConPelota.centro.x + cos(jugadorConPelota.angulo)*(sizePelota+sizeJugadores)/2, y:jugadorConPelota.centro.y+sin(jugadorConPelota.angulo)*(sizePelota+sizeJugadores)/2};
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
		//if(a1<=HALF_PI&&HALF_PIangulo<=a2)
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

function moverMenuA(x, y){
	document.getElementById('menu').style.left=-x+'px';
	document.getElementById('menu').style.top=-y+'px';
}

function dibujarJugador(canvas, ladoCanvas, color1, patron, color2, anchoPatron){
	var ctx=canvas.getContext('2d');
	ctx.clearRect(0, 0, ladoCanvas, ladoCanvas);
	ctx.fillStyle=color1;
	ctx.fillRect(ladoCanvas/4, ladoCanvas*5/12, ladoCanvas/2, sqrt(sq(ladoCanvas/2)-sq(ladoCanvas/4)));
	ctx.beginPath();
	ctx.ellipse(ladoCanvas/2, ladoCanvas*5/12, ladoCanvas/4, ladoCanvas/6, 0, 0, 2*Math.PI);
	ctx.fill();
	ctx.globalCompositeOperation='source-atop';
	ctx.fillStyle=color2;
	switch(patron){
		case 'diagonal':
			ctx.translate(0, -anchoPatron/2);
			ctx.rotate(Math.PI/4);
			ctx.fillRect(0, 0, Math.sqrt(2)*ladoCanvas, anchoPatron);
			ctx.rotate(-Math.PI/4);
			ctx.translate(0, anchoPatron/2);
			break;
		case 'diagonal invertido':
			ctx.translate(ladoCanvas, -anchoPatron/2);
			ctx.rotate(-Math.PI/4);
			ctx.fillRect(0, 0, -Math.sqrt(2)*ladoCanvas, anchoPatron);
			ctx.rotate(Math.PI/4);
			ctx.translate(-ladoCanvas, anchoPatron/2);
			break;
		case 'horizontal':
			ctx.translate(0, Math.sqrt(Math.pow((ladoCanvas/2), 2)-Math.pow((ladoCanvas/4), 2))/2+ladoCanvas/4);
			ctx.fillRect(0, 0, ladoCanvas, anchoPatron);
			ctx.translate(0, -Math.sqrt(Math.pow((ladoCanvas/2), 2)-Math.pow((ladoCanvas/4), 2))/2-ladoCanvas/4)-anchoPatron;
			break;
	}
	ctx.globalCompositeOperation='source-over';
	ctx.fillStyle=colorPiel;
	ctx.beginPath();
	ctx.ellipse(ladoCanvas/2, ladoCanvas/8, ladoCanvas/8, ladoCanvas/8, 0, 0, 2*Math.PI);
	ctx.fill();
}

function dibujarJugadores(){
	dibujarJugador($('#jugador0')[0], sizeJugadores, equipo0Seleccion.color1, equipo0Seleccion.patron, equipo0Seleccion.color2, equipo0Seleccion.anchoPatron);
	dibujarJugador($('#jugador1')[0], sizeJugadores, equipo1Seleccion.color1, equipo1Seleccion.patron, equipo1Seleccion.color2, equipo1Seleccion.anchoPatron);
}

class Combinatoria {
	// Función factorial. Devuelve -1 cuando hay error
	static Factorial (n){
		if (n < 0) return -1;
		if (n===0) return 1;
		return n * this.Factorial (n - 1);
	}

	// Función de combinación
	static Comb (n, c){
		return this.Factorial (n) / (this.Factorial(c) * this.Factorial(n-c));
	}
}

class NormalizadorRandom{
	constructor (norm){
		this.Norm = norm;
		this.CombGeneradas = new Array(norm);
		this.Inicializar();
	}

	Inicializar (){
		for (var i = 0; i <= this.Norm; i++) {
			this.CombGeneradas[i] = Combinatoria.Comb(this.Norm, i);
		}
	}
	
	// Rand normalizado. Devuelve un real esperado expected, con máximo error epsilon
	RandomNormalizado (expected, epsilon){
		var r = this.RandomNormalizadoUnitario ();
		var ret = r * (2 * epsilon) + (expected - 0.5); 
		return ret;
	}

	// Random normalizado. Devuelve un real en [0,1] normalizado a 0.5
	RandomNormalizadoUnitario (){
		var i = 0;
		var c = 1;
		var r = Math.random () * Math.pow(2, this.Norm);
		while (c < r) {
			r -= c;
			i++;
			c = this.CombGeneradas[i];
		}
		// i es el intervalo elegido
		return (i + Math.random ()) / this.Norm;
	}
}

function actualizarSlider1(){
	for(var equipo of equiposPredeterminados[0]){
		if(equipo0Seleccion===equipo) continue;
		var li=document.createElement('li');
		li.className='equipo';
		li.equipo=equipo;
		var div=document.createElement('div');
		div.innerText=equipo.nombre;
		li.appendChild(div);
		var canvas=document.createElement('canvas');
		canvas.innerText='Your browser doens\'t support canvas elements.';
		canvas.width=200;
		canvas.height=200;
		dibujarJugador(canvas, 200, equipo.color1, equipo.patron, equipo.color2, equipo.anchoPatron);
		li.appendChild(canvas);
		var canvas=document.createElement('canvas');
		canvas.innerText='Your browser doens\'t support canvas elements.';
		canvas.width=200;
		canvas.height=200;
		dibujarJugador(canvas, 200, equipo.color2, equipo.patron, equipo.color1, equipo.anchoPatron);
		li.appendChild(canvas);
		document.getElementById('slider1').appendChild(li);
	}
}

function cambiarEquipo0(li){
	equipo0Seleccion=li[0].equipo;
}

function cambiarEquipo1(li){
	equipo1Seleccion=li[0].equipo;
}