const WIDTH=800;
const HEIGHT=600;
const maxStatValue=99;
const g=450;
const sizePelota=15;
const sizePalos=20;
const sizeJugadores=35;
const topArcos=HEIGHT/3;
const bottomArcos=HEIGHT*2/3;
const velocidadJugadores=1;
const velocidadEquipo=velocidadJugadores*2;
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
};
const equiposPredeterminados=[
	[
		{
			nombre:'Finnish M. S. C.',
			color1:'#ffffff',
			color2:'#003580',
			patron:'diagonal',
			anchoPatron:5,
			arquero:{stats:{atraccion:44, repulsion:80, punteria:25, fuerza:79, velocidad:76, aimSpeed:46}},
			jugadores:[
				{stats:{atraccion:71, repulsion:64, punteria:81, fuerza:57, velocidad:69, aimSpeed:52}, x:cancha.width/5, y:cancha.height/3},
				{stats:{atraccion:76, repulsion:63, punteria:59, fuerza:72, velocidad:78, aimSpeed:74}, x:cancha.width/5, y:cancha.height*2/3},
				{stats:{atraccion:75, repulsion:78, punteria:74, fuerza:56, velocidad:45, aimSpeed:60}, x:cancha.width*2/5, y:cancha.height/5},
				{stats:{atraccion:69, repulsion:76, punteria:74, fuerza:54, velocidad:68, aimSpeed:52}, x:cancha.width*2/5, y:cancha.height*4/5}
			]
		},
		{
			nombre:'The albinegros',
			color1:'#000000',
			color2:'#ffffff',
			patron:'horizontal',
			anchoPatron:8,
			arquero:{stats:{atraccion:36, repulsion:65, punteria:31, fuerza:41, velocidad:71, aimSpeed:53}},
			jugadores:[
				{stats:{atraccion:64, repulsion:62, punteria:62, fuerza:44, velocidad:40, aimSpeed:73}, x:cancha.width/5, y:cancha.height/3},
				{stats:{atraccion:60, repulsion:70, punteria:59, fuerza:50, velocidad:59, aimSpeed:44}, x:cancha.width/5, y:cancha.height*2/3},
				{stats:{atraccion:61, repulsion:67, punteria:60, fuerza:56, velocidad:75, aimSpeed:57}, x:cancha.width*2/5, y:cancha.height/5},
				{stats:{atraccion:69, repulsion:68, punteria:64, fuerza:69, velocidad:46, aimSpeed:62}, x:cancha.width*2/5, y:cancha.height*4/5}
			]
		},
		{
			nombre:'A. F. M. Barceloniina',
			color1:'#ff0000',
			color2:'#0000ff',
			arquero:{stats:{atraccion:31, repulsion:64, punteria:5, fuerza:59, velocidad:74, aimSpeed:70}},
			jugadores:[
				{stats:{atraccion:68, repulsion:69, punteria:70, fuerza:71, velocidad:41, aimSpeed:60}, x:cancha.width/5, y:cancha.height/3},
				{stats:{atraccion:62, repulsion:63, punteria:66, fuerza:62, velocidad:78, aimSpeed:70}, x:cancha.width/5, y:cancha.height*2/3},
				{stats:{atraccion:67, repulsion:65, punteria:65, fuerza:68, velocidad:42, aimSpeed:76}, x:cancha.width*2/5, y:cancha.height/5},
				{stats:{atraccion:65, repulsion:59, punteria:64, fuerza:68, velocidad:55, aimSpeed:59}, x:cancha.width*2/5, y:cancha.height*4/5}
			]
		},
		{
			nombre:'Groove Street',
			color1:'#008800',
			color2:'#008800',
			arquero:{stats:{atraccion:13, repulsion:71, punteria:1, fuerza:78, velocidad:54, aimSpeed:53}},
			jugadores:[
				{stats:{atraccion:71, repulsion:60, punteria:70, fuerza:40, velocidad:73, aimSpeed:76}, x:cancha.width/5, y:cancha.height/3},
				{stats:{atraccion:69, repulsion:61, punteria:66, fuerza:68, velocidad:60, aimSpeed:56}, x:cancha.width/5, y:cancha.height*2/3},
				{stats:{atraccion:64, repulsion:66, punteria:63, fuerza:40, velocidad:44, aimSpeed:46}, x:cancha.width*2/5, y:cancha.height/5},
				{stats:{atraccion:67, repulsion:69, punteria:68, fuerza:50, velocidad:70, aimSpeed:54}, x:cancha.width*2/5, y:cancha.height*4/5}
			]
		}
	]
];
const apuntarAEstoDelPalo={tiroLargo:115, tiroCorto:30};
const aimSpeedConst=0.07/50;
const colorPiel='#ffdfc4';
const distanciaDeIntercepcion=80;
const constanteDeDesvio=-7.5;

var equipo0Seleccion;
var equipo1Seleccion;
var camiseta0;
var camiseta1;
var equipos;
var jugadorConPelota;
var pelota;
var ultimoEquipoConPelota;
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
			var vector=new Vector((equipo.teclaIzquierda.presionada?-1:0)+(equipo.teclaDerecha.presionada?1:0), (equipo.teclaArriba.presionada?-1:0)+(equipo.teclaAbajo.presionada?1:0));
			vector.normalize();
			vector.multiply(velocidadEquipo);
			equipo.centro.x+=vector.x;
			equipo.centro.y+=vector.y;
		}
		else equipo.AI();
		for(var jugador of equipo.jugadores){
			pelota.velocidad.x+=g*jugador.multiplicadorDeAtraccion*cos(atan2(jugador.centro.y-pelota.centro.y, jugador.centro.x-pelota.centro.x))/(sq(pelota.centro.x-jugador.centro.x)+sq(pelota.centro.y-jugador.centro.y));
			pelota.velocidad.y+=g*jugador.multiplicadorDeAtraccion*sin(atan2(jugador.centro.y-pelota.centro.y, jugador.centro.x-pelota.centro.x))/(sq(pelota.centro.x-jugador.centro.x)+sq(pelota.centro.y-jugador.centro.y));
			if(jugador===jugadorConPelota){
				if(equipo.DT==='humano'){
					if(equipo.teclaMasAngulo.presionada) jugador.angulo+=jugador.stats.aimSpeed*aimSpeedConst;
					if(equipo.teclaMenosAngulo.presionada) jugador.angulo-=jugador.stats.aimSpeed*aimSpeedConst;
					if(jugador.angulo<0) jugador.angulo+=TWO_PI;
					if(jugador.angulo>=TWO_PI) jugador.angulo-=TWO_PI;
				}
			}
			else jugador.moverHacia(equipo.centro.x+jugador.posicionEnFormacion.x, equipo.centro.y+jugador.posicionEnFormacion.y);
			stroke(equipo.color);
			strokeWeight(2);
			noFill();
			if(equipo.DT==='humano') ellipse(equipo.centro.x+jugador.posicionEnFormacion.x, equipo.centro.y+jugador.posicionEnFormacion.y+jugador.size/2, jugador.size-2, jugador.size/2-2);
			noStroke();
			fill(jugador.multiplicadorDeAtraccion>0?'#f00':'#0ff');
			ellipse(jugador.centro.x, jugador.centro.y+jugador.size/2, jugador.size, jugador.size/2);
		}
		pelota.velocidad.x+=g*equipo.arquero.multiplicadorDeAtraccion*cos(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
		pelota.velocidad.y+=g*equipo.arquero.multiplicadorDeAtraccion*sin(atan2(equipo.arquero.centro.y-pelota.centro.y, equipo.arquero.centro.x-pelota.centro.x))/(sq(pelota.centro.x-equipo.arquero.centro.x)+sq(pelota.centro.y-equipo.arquero.centro.y));
		equipo.arquero.moverHacia(equipo.arquero.centro.x, constrain(pelota.centro.y, topArcos+sizePalos/2+equipo.arquero.size/2+sizePelota, bottomArcos-sizePalos/2-equipo.arquero.size/2-sizePelota));
		fill(equipo.arquero.multiplicadorDeAtraccion>0?'#f00':'#0ff');
		ellipse(equipo.arquero.centro.x, equipo.arquero.centro.y+equipo.arquero.size/2, equipo.arquero.size, equipo.arquero.size/2);
		for(var jugador of equipo.jugadores) canvas.getContext('2d').drawImage($('#jugador'+(jugador.equipo===equipo0?0:1))[0], jugador.centro.x-sizeJugadores/2, jugador.centro.y-sizeJugadores/2);
		canvas.getContext('2d').drawImage($('#jugador'+(equipo===equipo0?0:1))[0], equipo.arquero.centro.x-sizeJugadores/2, equipo.arquero.centro.y-sizeJugadores/2);
	}
	fill('#1c1a1a')
	for(var palo of cancha.palos){
		if(sq(pelota.centro.x-palo.x)+sq(pelota.centro.y-palo.y)<=sq(sizePelota/2+sizePalos/2)){
			vector=new Vector(pelota.velocidad.x, pelota.velocidad.y);
			var x;
			var y;
			if(vector.mag()===0){
				var angulo;
				if(palo.x===pelota.centro.x&&palo.y===pelota.centro.y){
					angulo=random(0, TWO_PI);
				}
				else angulo=atan2(pelota.centro.y-palo.y, pelota.centro.x-palo.x);
				x=palo.x+cos(angulo)*(sizePelota/2+sizePalos/2);
				y=palo.y+sin(angulo)*(sizePelota/2+sizePalos/2);
			}
			if(vector.x===0){
				x=pelota.centro.x;
				var dX=x-palo.x;
				y=palo.y-sqrt(sq(sizePelota/2+sizePalos/2)-sq(dX));
			}
			var pendiente=vector.y/vector.x;
			var terminoIndependiente=-pendiente*pelota.centro.x+pelota.centro.y;
			var a=sq(pendiente)+1;
			var b=2*((terminoIndependiente-palo.y)*pendiente-palo.x);
			var c=sq(terminoIndependiente-palo.y)+sq(palo.x)-sq(sizePelota/2+sizePalos/2);
			//aplico la fórmula resolvente
			var x1=(-b+sqrt(sq(b)-4*a*c))/2/a;
			var x2=(-b-sqrt(sq(b)-4*a*c))/2/a;
			if(vector.x<0){
				x=max(x1, x2);
				y=pendiente*x+terminoIndependiente;
			}
			else if(vector.x>0){
				x=min(x1, x2);
				y=pendiente*x+terminoIndependiente;
			}
			pelota.centro={x:x, y:y};
			//calculo la nueva dirección de la pelota
			var anguloEntrePelotaYPalo=atan2(palo.y-pelota.centro.y, palo.x-pelota.centro.x);
			var anguloPelota=vector.heading(anguloEntrePelotaYPalo);
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
		pelota.velocidad.x*=1;
		pelota.velocidad.y*=-1;
		for(var equipo of equipos) if(equipo.DT==='AI') atraerConTodosLosJugadoresDelEquipo(equipo);
	}
	if(pelota.centro.y>cancha.y+cancha.height-sizePelota/2){
		pelota.centro.y=cancha.y+cancha.height-sizePelota/2;
		pelota.velocidad.x*=1;
		pelota.velocidad.y*=-1;
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
			pelota.velocidad.x*=-1;
			pelota.velocidad.y*=1;
			for(var equipo of equipos) if(equipo.DT==='AI') atraerConTodosLosJugadoresDelEquipo(equipo);
		}
	}
	else if(pelota.centro.x<cancha.x-sizePelota/2){
		if(height/3<pelota.centro.y&&pelota.centro.y<height*2/3) gol(equipo1);
		else{
			pelota.centro.x=cancha.x-sizePelota/2;
			pelota.velocidad.x*=-1;
			pelota.velocidad.y*=1;
			for(var equipo of equipos) if(equipo.DT==='AI') atraerConTodosLosJugadoresDelEquipo(equipo);
		}
	}
	else ellipse(pelota.centro.x, pelota.centro.y, sizePelota);
	text(equipo0.goles+' - '+equipo1.goles, 0, 0, width, height)
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

function nuevoPartido(humanos){
	var alMenosUnHumano=humanos&&confirm('¿Deseás jugar?');
	if(!humanos){
		equipo0Seleccion=equiposPredeterminados[0][0];
		equipo1Seleccion=equiposPredeterminados[0][1];
	}
	dibujarJugadores();
	equipo0=new Equipo(equipo0Seleccion.nombre, alMenosUnHumano?'humano':'AI', equipo0Seleccion.color1, 87, 65, 83, 68, 69, 81, 32, 'izquierda', cancha.x+cancha.width/2, cancha.x+cancha.width*4/5);
	equipo1=new Equipo(equipo1Seleccion.nombre, alMenosUnHumano&&confirm('¿Con un/a amigo/a?')?'humano':'AI', equipo1Seleccion.color1===equipo0.color?equipo1Seleccion.color2:equipo1Seleccion.color1, 73, 74, 75, 76, 79, 85, 13, 'derecha', cancha.x+cancha.width/2, cancha.x+cancha.width/5);
	equipos=[equipo0, equipo1];
	var stats={};
	for(var stat in equipo0Seleccion.arquero.stats){
		stats[stat]=equipo0Seleccion.arquero.stats[stat];
	}
	equipo0.arquero=new Jugador(equipo0, 'arquero', cancha.x, cancha.y+cancha.height/2, stats);
	for(var jugador of equipo0Seleccion.jugadores){
		var stats={};
		for(var stat in jugador.stats){
			stats[stat]=jugador.stats[stat];
		}
		equipo0.agregarJugador(cancha.x+jugador.x, cancha.y+jugador.y, stats);
	}
	var stats={};
	for(var stat in equipo1Seleccion.arquero.stats){
		stats[stat]=equipo1Seleccion.arquero.stats[stat];
	}
	equipo1.arquero=new Jugador(equipo1, 'arquero', cancha.x+cancha.width, cancha.y+cancha.height/2, stats);
	for(var jugador of equipo1Seleccion.jugadores){
		var stats={};
		for(var stat in jugador.stats){
			stats[stat]=jugador.stats[stat];
		}
		equipo1.agregarJugador(cancha.y+cancha.width-jugador.x, cancha.y+cancha.height-jugador.y, stats);
	}
	for(equipo of equipos){
		equipo.goles=0;
		equipo.arquero.multiplicadorDeAtraccion=-equipo.arquero.stats.repulsion/50;
	}
	gol(false);
	jugadorConPelota=null;
}

function gol(equipoQueHizoGol){
	for(equipo of equipos){
		equipo.centro={x:0, y:0};
		for(var jugador of equipo.jugadores){
			jugador.centro.x=jugador.posicionEnFormacion.x;
			jugador.centro.y=jugador.posicionEnFormacion.y;
			jugador.multiplicadorDeAtraccion=jugador.stats.atraccion/50;
		}
		equipo.jugadorSeleccionado=jugador;
	}
	var angulo=random(0, TWO_PI);
	var radio=random(0, cancha.height/3);
	pelota={centro:{x:cancha.x+cancha.width/2+cos(angulo)*radio, y:cancha.y+cancha.height/2+sin(angulo)*radio}, velocidad:{x:0, y:0}};
	for(var equipo of equipos) equipo.arquero.centro.y=cancha.y+cancha.height/2;
	if(equipoQueHizoGol){
		equipoQueHizoGol.goles++;
	}
}

function soltarPelota(){
	var nAngulo = normalizador.RandomNormalizado (jugadorConPelota.angulo, 1 - jugadorConPelota.stats.punteria / 100);
	jugadorConPelota.angulo = nAngulo;
	pelota.centro={x:jugadorConPelota.centro.x+cos(jugadorConPelota.angulo)*(sizePelota+sizeJugadores)/2, y:jugadorConPelota.centro.y+sin(jugadorConPelota.angulo)*(sizePelota+sizeJugadores)/2};
	jugadorConPelota.multiplicadorDeAtraccion=(0<jugadorConPelota.multiplicadorDeAtraccion?-jugadorConPelota.stats.repulsion:jugadorConPelota.stats.atraccion)/50;
	jugadorConPelota=null;
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
	ctx.fillRect(ladoCanvas/4, ladoCanvas/2, ladoCanvas/2, ladoCanvas/2);
	ctx.beginPath();
	ctx.ellipse(ladoCanvas/2, ladoCanvas/2, ladoCanvas/4, ladoCanvas/6, 0, 0, 2*Math.PI);
	ctx.fill();
	ctx.globalCompositeOperation='source-atop';
	ctx.fillStyle=color2;
	switch(patron){
		case 'diagonal':
			ctx.translate(0, -anchoPatron/2);
			ctx.rotate(Math.PI*4/15);
			ctx.fillRect(0, 0, Math.sqrt(2)*ladoCanvas, anchoPatron);
			ctx.rotate(-Math.PI*4/15);
			ctx.translate(0, anchoPatron/2);
			break;
		case 'diagonal invertido':
			ctx.translate(ladoCanvas, -anchoPatron/2);
			ctx.rotate(-Math.PI*4/15);
			ctx.fillRect(0, 0, -Math.sqrt(2)*ladoCanvas, anchoPatron);
			ctx.rotate(Math.PI*4/15);
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
	ctx.ellipse(ladoCanvas/2, ladoCanvas/6, ladoCanvas/6, ladoCanvas/6, 0, 0, 2*Math.PI);
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
		dibujarJugador(canvas, 200, equipo.color1, equipo.patron, equipo.color2, equipo.anchoPatron*200/sizeJugadores);
		li.appendChild(canvas);
		var canvas=document.createElement('canvas');
		canvas.innerText='Your browser doens\'t support canvas elements.';
		canvas.width=200;
		canvas.height=200;
		dibujarJugador(canvas, 200, equipo.color2, equipo.patron, equipo.color1, equipo.anchoPatron*200/sizeJugadores);
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