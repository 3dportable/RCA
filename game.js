console.log(window.navigator.userAgent); // узнать инфо о устройстве пользователя
//получим элемент со страницы///////////////////////////
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");//вытащим из него холст для рисования


//Canvas на весь размер экрана
Resize(); 
window.addEventListener("resize", Resize);//при смене размера экрана
function Resize() {//меняем и размер элемента Canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;	
	window.screenScale = canvas.height/1400;
	window.screenshiftY = 0;
}


//переменные для игры //////////////////////////////////
const UPDATE_TIME = 1000 / 60;
var timer = null;
window.widthBox = 100;

//import MapBack from './Class/MapBack.js';//class героя
import Map from './Class/Map.js';//class карты
import Hero from './Class/Hero.js';//class героя

// var mapBack = new MapBack();//создание заднего фона
var map;//карта
var hero;// гг
restartGame();
function restartGame(){
	map = new Map(30, 10);//карта
	hero = new Hero(200 / window.screenScale, 400, "images/rubicAsep.png");// гг
}

//запускаем GamePlay
Start();

// управление стрелками
const top = document.getElementById('top');
const right = document.getElementById('right');
const bottom = document.getElementById('bottom');
const left = document.getElementById('left');
const shoot = document.getElementById('shoot');
let health = document.getElementById('health');
let score = document.getElementById('score');
const pause = document.getElementById('pause');

document.addEventListener("keydown",function Move(e) {
	if (e.keyCode == '38') { // up arrow
		hero.Jump();
		Pressed();
	}
	else if (e.keyCode == '39') { // right arrow
		hero.Right();
		Pressed();

	}
	else if (e.keyCode == '37') { // left arrow
		hero.Left();
		Pressed();
	}
	else if (e.keyCode == '40') { // down arrow
		hero.antiJump();
		Pressed();

	}
})
// top.onclick = function(event){
// 	hero.Jump();	//shoot.innerHTML = 
// }
// right.onclick = function(event){
// 	hero.Right();
// }
// bottom.onclick = function(event){
// 	hero.antiJump();
// }
// left.onclick = function(event){
// 	hero.Left();
// }
// shoot.onclick = function(event){
// 	console.log('message')
// }
function Pressed() {

}
// пауза

pause.onclick = () => {
	map.speed = 0;
	score = 0;
	pauseMenu();
}
function pauseMenu() {

}
/////////////////////////////////////////////////
function Start() {
	timer = setInterval(Update, UPDATE_TIME);
}
//для остановки игры 
function Stop() {
	clearInterval(timer);
	timer = null;
}
//обновление и рисование всех обьектов
function Update() {
	Lifes();
	Draws();
}
//даем пожить каждому обьекту игры
function Lifes() {
	//mapBack
	//mapBack.Life();
	//карта
	map.Life(hero);
	//живем героя
	hero.Life(map, score);
	//рестарт игры
	if(hero.health < 0)
		restartGame();
}
//рисование всех обьектов игры
function Draws() {
	//очистка экрана
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	//цвет фона
	ctx.beginPath();
	ctx.fillStyle = '#FFF';
	// ctx.fillStyle = '#20F';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

    //рисуем mapBack
    //mapBack.Draw(ctx, map);
	
	//рисуем карту
	map.Draw(ctx);

	//рисуем гг
	hero.Draw(ctx);
}
