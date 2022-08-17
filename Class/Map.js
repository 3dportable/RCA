window.NOTHING = 0;
window.BETON = 1;
window.KIRPICH = 2;
window.HEALTH = 3;
window.BULLET = 4;
import MapObj from './MapObj.js';//class для работы с обьектами карты
export default class {

  //координаты левого верхнего края карты
  xyShift = [0, 0];
  nexttestX = 0;//когда проверять  
  speedMap = 5;//10;
  speedBullet = 5;//10;
  textures; //хранилище текстур карты
  healthLastShift = 2;//для генерации здоровья
  healthDistancePeriod = 3000;//каждые 3 метра генерим здоровье
  speedMapUpNextShift = 1000;

  //текущий план расстановки блоков
  floor3 = [0, 5, window.NOTHING];
  floor2 = [0, 2, window.BETON];
  floor1 = [0, 3, window.NOTHING];

  //при создании новой карты
  constructor(sizeX, sizeY,textures) {
    this.textures = textures;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    //генерация новой карты
    this.mapArray = this.getMapNew();
  }

  //Life
  Life(hero) {
    //auto speedUp
    this.autoSpeedUp();
    //смещаем карту
    this.xyShift[0] += this.speedMap;
    //this.xyShift[1] = hero.xy[1];//следование за картой
    //для скорости проверяем координаты не каждый тик 
    if (this.isNeedtest()) {
      //удалим box слева которые вышли за карту      
      this.removeBackBox();
      //добавим новые справа
      let roundShift = Math.floor(this.xyShift[0] / window.widthBox);//иначе пробелы между блоками
      this.putMapRight(roundShift * window.widthBox + this.sizeX * window.widthBox, hero);
    }
    //даем пожить каждому элементу
    this.mapArray.forEach(function (item, index, array) {
      //если отметка об удалении, то не используем
      if (!item.needRemove)
      item.Life();
    });
  }
  autoSpeedUp(){
    if(this.xyShift[0] < this.speedMapUpNextShift)
      return;
    if(this.speedMap > 20)
      return;
    this.speedMapUpNextShift += 2000;//каждый метр повышаем скорость
    this.speedMap += 5;
  }

  //переодичность проверки элементов
  isNeedtest() {
    let need = this.nexttestX <= this.xyShift[0];
    if (need)
      this.nexttestX = this.xyShift[0] + window.widthBox;
    return need;
  }

  //удалим все элементы карты которые вышли за границу
  removeBackBox() {
    let map = this;
    for (let index = this.mapArray.length - 1; index >= 0; index--) {
      if (this.mapArray[index].isNeedRemove(map)){
        this.mapArray.splice(index, 1);
      }
    }
  }

  //Draw
  Draw(ctx) {
    let map = this;

    //рисуем все активные элементы карты      
    this.mapArray.forEach(function (item, index, array) {
      let mapX = -map.xyShift[0];
      let mapY = window.screenshiftY - map.xyShift[1];
      //если отметка об удалении, то не показываем
      if (!item.needRemove)
        item.Draw(ctx, mapX, mapY);
    });

  }

  //генерация новой карты
  getMapNew() {
    let arr = [];
    let Y = 13;
    for (let x = 0; x < this.sizeX; x++) {
      //бетонное начало
      if (x == 0) {
        let box = new MapObj("Бетон", 10, this.textures.getBeton(0), window.BETON);
        box.xy = [x * window.widthBox, Y * window.widthBox];//самый низ
        arr.push(box);
        continue;
      }
      if (x < this.sizeX - 1) {
        let box = new MapObj("Бетон", 10, this.textures.getBeton(1), window.BETON);
        box.xy = [x * window.widthBox, Y * window.widthBox];//самый низ
        arr.push(box);
        continue;
      }
      let box = new MapObj("Бетон", 10, this.textures.getBeton(2), window.BETON);
      box.xy = [x * window.widthBox, Y * window.widthBox];//самый низ
      arr.push(box);
    }
    return arr;
  }

  //генерация карты справа
  putMapRight(xShift, hero) {
    let arr = this.mapArray;
    //var now = new Date();
    let millis = this.xyShift[0];//now.getTime();

    //1 этаж [0, 3, window.BETON];
    let f = this.floor1;
    let Y1 = 13;
    this.putPlanBox(arr, f, xShift, Y1);
    if (f[0] == f[1])
      this.setNextPlan(f);

    //2 этаж
    f = this.floor2;
    let Y2 = 9;
    this.putPlanBox(arr, f, xShift, Y2);
    if (f[0] == f[1])
      this.setNextPlan(f);

    //3 этаж
    f = this.floor3;
    let Y3 = 5;
    this.putPlanBox(arr, f, xShift, Y3);
    if (f[0] == f[1])
      this.setNextPlan(f);


    //стена на 3 этаже
    let kirpich = [false, false, false];
    let freqBase = 3000;
    if (this.lasttimegenfloar3 < millis && this.floor3[2] == window.BETON) {
      if (this.floor3[0] > 2) {
        this.setKirpichBox(arr, Y3, xShift);
        this.lasttimegenfloar3 = millis + getRandomInt(freqBase) + 2000;
        kirpich[0] = true;
      }
    }
    //стена на 2 этаже
    if (this.lasttimegenfloar2 < millis && this.floor2[2] == window.BETON && this.floor3[2] == window.BETON) {
      if (this.floor2[0] > 2 && this.floor3[0] > 2) {
        this.setKirpichBox(arr, Y2, xShift);
        this.lasttimegenfloar2 = millis + getRandomInt(freqBase) + 2000;
        kirpich[1] = true;
      }
    }
    //стена на 1 этаже
    if (!window.testGameMode && this.lasttimegenfloar1 < millis && this.floor1[2] == window.BETON && this.floor2[2] == window.BETON) {
      if (this.floor2[0] > 2 && this.floor1[0] > 2) {
        this.setKirpichBox(arr, Y1, xShift);
        this.lasttimegenfloar1 = millis + getRandomInt(freqBase) + 2000;
        kirpich[0] = true;
      }
    }
    //генерим здоровье после кирпичей!!
    if (xShift > this.healthLastShift) {
      //выберем этаж для установки здоровья
      let id = getRandomInt(3)
      //проверим чтобы не было там кирпича
      if (!kirpich[id]){
        this.setHealthBox(arr, id * 4, xShift);
        this.healthLastShift = xShift + this.healthDistancePeriod;//+ getRandomInt(1000)/1000
      }
    }
  }
  lasttimegenfloar3 = 0;
  lasttimegenfloar2 = 0;
  lasttimegenfloar1 = 0;
  setKirpichBox(arr, Y, xShift) {
    let box1 = new MapObj("Кирпич", 1, this.textures.getKirpich(-1), window.KIRPICH);
    box1.xy = [xShift, (Y - 1) * window.widthBox];
    arr.push(box1);
    let box2 = new MapObj("Кирпич", 1, this.textures.getKirpich(-1), window.KIRPICH);
    box2.xy = [xShift, (Y - 2) * window.widthBox];
    arr.push(box2);
    let box3 = new MapObj("Кирпич", 1, this.textures.getKirpich(-1), window.KIRPICH);
    box3.xy = [xShift, (Y - 3) * window.widthBox];
    arr.push(box3);
    //свяжем элементы 
    let linkedBox = [box1,box2,box3];
    box1.linkedBox = linkedBox;
    box2.linkedBox = linkedBox;
    box3.linkedBox = linkedBox;
  }
  setHealthBox(arr, Y, xShift) {
    let box = new MapObj("Сердце", 1, this.textures.getHealth(-1), HEALTH);
    box.phisicTransparent = true;
    box.xy = [xShift, (Y + 3) * window.widthBox];
    arr.push(box);
  }
  //[0, 3, BETON];
  putPlanBox(arr, f, xShift, Y) {
    //мотаем план дальше
    f[0]++;
    //если ничего ставить не надо
    if (f[2] == window.NOTHING)
      return;

    var blok;
    if (f[0] == 1) //слева
      blok = new MapObj("Бетон", 10, this.textures.getBeton(0), window.BETON);
    else if (f[0] < f[1])//середина
      blok = new MapObj("Бетон", 10, this.textures.getBeton(1), window.BETON);
    else if (f[0] == f[1]) //справа
      blok = new MapObj("Бетон", 10, this.textures.getBeton(2), window.BETON);

    blok.xy = [xShift, Y * window.widthBox];
    arr.push(blok);
  }
  setNextPlan(f) {
    f[0] = 0;//счетчик плана
    if (f[2] == window.NOTHING) {
      f[2] = window.BETON;
      f[1] = getRandomInt(7) + 3;//3-10 длина бетона
    }
    else {
      f[2] = window.NOTHING;
      f[1] = getRandomInt(5) + 3;//3-8 длина пустоты
    }
  }

  //генерация блока
  getBox() {
    //можно сделать сложность карты по Типу блоков
    let typeid = getRandomInt(7);
    if (typeid <= 3)
      return this.getBoxBeton(typeid);
    else if (typeid == 4)
      return this.getBoxKirpich(typeid);
    else if (typeid == 5)
      return this.getBoxTechno(typeid);
    else if (typeid == 6)//Health
      return this.getBoxHealth(typeid);

  }

  getBoxBeton(typeid) {
    return new MapObj("Бетон", 10, this.textures.getBeton(1), typeid);
  }
  getBoxKirpich(typeid) {
    return new MapObj("Кирпич", 1, this.textures.getKirpich(-1), typeid);
  }
  getBoxTechno(typeid) {
    return new MapObj("Техно", 100, this.textures.getTechno(-1), typeid);
  }
  getBoxHealth(typeid) {
    let box = new MapObj("Жизнь", 30, this.textures.getHealth(-1), typeid);
    box.phisicTransparent = true;
    return box;
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}