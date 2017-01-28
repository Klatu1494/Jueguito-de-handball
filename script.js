var equipo0;
var equipo1;
var jugadorConPelota;
var pelota;

function setup(){
	createCanvas(800, 600);
	equipo0=new Equipo('West Ham United F.C.', 87, 65, 83, 68, 69, 81, 32);
	equipo1=new Equipo('Finland', 'T', 'F', 'G', 'H', 'R', 'Y', 'enter');
	equipo0.agregarJugador(width/5, height/3);
	equipo0.agregarJugador(width/5, height*2/3);
	equipo0.agregarJugador(width*2/5, height/2);
	nuevoPartido()
}

function draw(){
	if(enPartido){
		var jugadoresDisputandoPelota=[];
		background('#269E3A');
		noStroke();
		fill('#7D2C3B');
		var vector=new p5.Vector((equipo0.teclaIzquierda.presionada?-1:0)+(equipo0.teclaDerecha.presionada?1:0), (equipo0.teclaArriba.presionada?-1:0)+(equipo0.teclaAbajo.presionada?1:0));
		vector.normalize();
		equipo0.centro.x+=vector.x;
		equipo0.centro.y+=vector.y;
		for(var jugador of equipo0.jugadores){
			pelota.velocidad.x+=500*jugador.multiplicadorDeAtraccion*cos(atan2(jugador.centro.y-pelota.y, jugador.centro.x-pelota.x))/(sq(pelota.x-jugador.centro.x)+sq(pelota.y-jugador.centro.y));
			pelota.velocidad.y+=500*jugador.multiplicadorDeAtraccion*sin(atan2(jugador.centro.y-pelota.y, jugador.centro.x-pelota.x))/(sq(pelota.x-jugador.centro.x)+sq(pelota.y-jugador.centro.y));
			if(jugador===jugadorConPelota){
				if(equipo0.teclaMasAngulo.presionada) jugador.angulo+=0.05;
				if(equipo0.teclaMenosAngulo.presionada) jugador.angulo-=0.05;
			}
			else moverHacia(jugador, equipo0.centro.x+jugador.posicionEnFormacion.x, equipo0.centro.y+jugador.posicionEnFormacion.y);
			ellipse(jugador.centro.x, jugador.centro.y, jugador.size);
		}
		fill('#fff');
		pelota.x+=pelota.velocidad.x;
		pelota.y+=pelota.velocidad.y;
		if(pelota.y<pelota.size/2){
			pelota.y=pelota.size/2;
			pelota.velocidad.y*=-0.8;
		}
		if(pelota.y>height-pelota.size/2){
			pelota.y=height-pelota.size/2;
			pelota.velocidad.y*=-0.8;
		}
		if(!jugadorConPelota){
			for(jugador of equipo0.jugadores) if(jugador!==ultimoJugadorConPelota&&sq(pelota.x-jugador.centro.x)+sq(pelota.y-jugador.centro.y)<sq(jugador.size)) jugadoresDisputandoPelota.push(jugador);
			if(jugadoresDisputandoPelota.length){
				jugadorConPelota=random(jugadoresDisputandoPelota);
				jugadorConPelota.angulo=atan2(pelota.y-jugador.centro.y, pelota.x-jugador.centro.x);
				jugadorConPelota.equipo.jugadorSeleccionado=jugadorConPelota;
				ultimoJugadorConPelota=jugadorConPelota;
			}
		}
		if(jugadorConPelota){
			pelota.x=jugadorConPelota.centro.x+(jugadorConPelota.size+pelota.size)*cos(jugadorConPelota.angulo)/2;
			pelota.y=jugadorConPelota.centro.y+(jugadorConPelota.size+pelota.size)*sin(jugadorConPelota.angulo)/2;
			pelota.velocidad.x=0;
			pelota.velocidad.y=0;
		}
		ellipse(pelota.x, pelota.y, pelota.size);
	}
}

function keyPressed(){
	const teclas=['Arriba', 'Izquierda', 'Abajo', 'Derecha', 'MasAngulo', 'MenosAngulo'];
	for(var tecla of teclas){
		if(keyCode===equipo0['tecla'+tecla].code) equipo0['tecla'+tecla].presionada=true;
		if(keyCode===equipo1['tecla'+tecla].code) equipo1['tecla'+tecla].presionada=true;
	}
	return false;
}

function keyReleased(){
	const teclas=['Arriba', 'Izquierda', 'Abajo', 'Derecha', 'MasAngulo', 'MenosAngulo'];
	for(var tecla of teclas){
		if(keyCode===equipo0['tecla'+tecla].code) equipo0['tecla'+tecla].presionada=false;
		if(keyCode===equipo1['tecla'+tecla].code) equipo1['tecla'+tecla].presionada=false;
	}
	if(keyCode===equipo0.teclaCambiarAtraccion){
		equipo0.jugadorSeleccionado.multiplicadorDeAtraccion*=-1;
		if(jugadorConPelota===equipo0.jugadorSeleccionado) jugadorConPelota=null;
	}
	if(keyCode===equipo1.teclaCambiarAtraccion){
		equipo1.jugadorSeleccionado.multiplicadorDeAtraccion*=-1;
		if(jugadorConPelota===equipo1.jugadorSeleccionado) jugadorConPelota=null;
	}
}

function Equipo(nombre, teclaArriba, teclaIzquierda, teclaAbajo, teclaDerecha, teclaMasAngulo, teclaMenosAngulo, teclaCambiarAtraccion){
	this.nombre=nombre;
	this.teclaArriba={code:teclaArriba, presionada:false};
	this.teclaIzquierda={code:teclaIzquierda, presionada:false};
	this.teclaAbajo={code:teclaAbajo, presionada:false};
	this.teclaDerecha={code:teclaDerecha, presionada:false};
	this.teclaMasAngulo={code:teclaMasAngulo, presionada:false};
	this.teclaMenosAngulo={code:teclaMenosAngulo, presionada:false};
	this.teclaCambiarAtraccion=teclaCambiarAtraccion;
	this.jugadores=[];
}

Equipo.prototype.agregarJugador=function(x, y){
	this.jugadores.push(new Jugador(this, x, y));
};

function Jugador(equipo, x, y){
	this.equipo=equipo;
	this.angulo=0;
	this.multiplicadorDeAtraccion=1;
	this.centro={x:x, y:y};
	this.posicionEnFormacion={x:x, y:y};
}

Jugador.prototype.size=20;

function moverHacia(jugador, x, y){
	if(x<pelota.size+jugador.size/2) x=pelota.size+jugador.size/2;
	if(y<pelota.size+jugador.size/2) y=pelota.size+jugador.size/2;
	if(x>width-pelota.size-jugador.size/2) x=width-pelota.size-jugador.size/2;
	if(y>height-pelota.size-jugador.size/2) y=height-pelota.size-jugador.size/2;
	var vector=new p5.Vector(x-jugador.centro.x, y-jugador.centro.y);
	vector.normalize();
	jugador.centro.x=vector.x>0?Math.min(jugador.centro.x+vector.x, x):Math.max(jugador.centro.x+vector.x, x);
	jugador.centro.y=vector.y>0?Math.min(jugador.centro.y+vector.y, y):Math.max(jugador.centro.y+vector.y, y);
}

function nuevoPartido(){
	enPartido=true;
	equipo0.goles=-1;
	equipo1.goles=0;
	gol(0);
}

function gol(){
	equipo0.centro={x:0, y:0};
	equipo1.centro={x:0, y:0};
	pelota={x:floor(random(width/4, 3/4*width+1)), y:height/2, velocidad:{x:0, y:0}, size:10};
	ultimoJugadorConPelota=null;
}