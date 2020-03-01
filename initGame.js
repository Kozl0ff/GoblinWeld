// Создание глобальных переменных //

//Переменные окруженя
var endGame = document.querySelector('.leave');
var start = document.querySelector('.start');
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

//Инициализация массивов
var elements = [];
var arrays = [];

//Объект игры
var game;

// ... //

// Конструкторы-функции управления состоянием игры //

// Конструктор отрисовки поля картинки фона //

function Background (x = 0, y = 0, w = 8000, h = 600, img = 'img/background.png') {

    Coords.call(this, x, y, w, h, img)

    this.process = () => {
    }

    this.draw = () => {
        ctx.drawImage(this.img, this.x + game.camera.getXOffset(), this.y, this.w, this.h);
    }
}

// ... //

// Конструктор отрисовки таймера //

function Timer () {

    this.enable = true;

    this.process = () => {
        this.time = new Date(1988, 11, 12, 0, 0, game.gameDuration);
    }

    this.draw = () => {
        ctx.strokeRect(15,15,90,50);
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'blue';        
        ctx.font = 'bold 30px Arial';
        ctx.fillText(`${this.time.getMinutes()} : ${this.time.getSeconds()}`, 20, 50);
    }

}

// ... //

// Конструктор инициализации элементов игры //

function InitGame () {
    this.gameDuration = 0;
    this.background = new Background();
    this.character = new Character();
    this.spawn = new HostileSpawn();
    this.camera = new Camera(this.character);
    this.timer = new Timer();
    this.gameEnd = false;
    this.pause = false;

    // Функция отображения таймера, героя, фона и точки спавна //
    this.playTime = () => {
        elements.push(this.background);//push элементы добавленные в конец массива начиная с текущей длины
        elements.push(this.timer);//такое расположение для правильного отображения на canvas
        elements.push(this.spawn);
        elements.push(this.character);

        let interval = setInterval(() => {//он запускает выполнение функции не один раз, а регулярно повторяет её через указанный интервал времени. Остановить исполнение можно вызовом clearInterval(timerId).
            if (!this.pause && !this.gameEnd) {
                this.character.hp += 2;
                this.character.mp += 5;//мана
                this.gameDuration++;//игровое время 
            }

            if (this.gameEnd)
                clearInterval(interval);//остновка функции выше
        }, 1000)
    }

    // Состояние игры
    this.inGame = () => {

        if (game.gameEnd) {
            addToList();
            return;
        }

        buttonsListener();//подключение всех кнопок управления в игру

        if (!game.pause) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);//удаляет все с канваса

            isCollision(elements);

            elements.forEach((item, i) => {//функция которая убирает все что есть в canvas
                if (!item.enable) {
                    if (elements[i].type === 'hostile')
                        game.spawn.hostileCount--;
                    elements.splice(i, 1);//обрезка массива начинающаяся с i заканчивающася на 1
                    return;
                }
                item.process();//какждый фрейм (состояние обьекта)
                item.draw();//отрисовка 

            })

        }

        window.requestAnimationFrame(this.inGame); //перерисовка анимации в следующем кадре анимаци
    }

    InitGame.gameOver = function() {
        endGame.style.display = 'none';
        canvas.style.display = 'none';

        setTimeout( () => {//выполнение кода асинхронно и выполнение только один раз
            defeat.style.display = 'none';
            tableOfRecords.classList.toggle('tableOfRecordsOpen');//возвращение псевдамассива(classList) тогл если есть класс значит она ешго ставит а если он есть тогла он есть
        }, 1500);
        game.gameEnd = true;

        defeat.innerHTML = `<p>${currentName.value === '' ? 'Player' : currentName.value}, ohh you are lose </p>
                         <p> Your score : ${game.character.score} </p>`;

        defeat.style.display = 'block';
    }

    //gamePassed
    InitGame.gameWin = function (){
        endGame.style.display = 'none';
        canvas.style.display = 'none';
        setTimeout( () => {
            win.style.display = 'none';
            tableOfRecords.classList.toggle('tableOfRecordsOpen');
        }, 1500);
        game.gameEnd = true;

        win.innerHTML = `<p>${currentName.value === '' ? 'Player' : currentName.value},WoW you are win! </p>
                         <p> Your score : ${game.character.score} </p>`;

        win.style.display = 'block';
    }
}

// ... //

// Конструктор для того чтобы наследовать координаты и параметры нужные для отрисовывания элементов в канвасе //

function Coords (x, y, w, h, img) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = new Image();
    this.img.src = img;
    this.enable = true;
}

// ... //

// Конструктор отрисовки стрелы //

function Arrow (x, y, direction, damage = 15, w = 70, h = 70, img = 'img/Attack.png', isSecondAbility, enable) {

    Coords.call(this, x, y, w, h, img)//вызываем конструктор по типу наследования
    this.direction = direction;
    this.speed = 20;//speed
    this.damage = damage;
    this.type = 'arrow';//для сравнения 
    this.isSecondSkill = isSecondAbility;

    this.process = () => {//это фукнция которая удаляет стрелу после того ка кона наносит урон
        if (this.isSecondSkill && this.y - this.h > 400)
            this.enable = false;

        if (!this.isSecondSkill && (this.x < 0 || this.x > canvas.width - game.camera.getXOffset() || this.x > game.background.w))
            this.enable = false;
//если стрела вышла за пределы то она пропадает 
        this.move();
    }

    this.draw = () => {//вызывается когда стрела летит влево а конвас оставляет на месте
        if (this.direction === 'left') {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(this.img, -this.x + 20 - game.camera.getXOffset(), this.y + 20, -this.w, this.h);
            ctx.restore();//возвращаем до метода save
        } else
            ctx.drawImage(this.img, this.x + 40 + game.camera.getXOffset(), this.y + 20, this.w, this.h);//отрисовывает часть изобрадения
    }

    this.move = () => {
        if (this.isSecondSkill) {
            this.y += this.speed - 5;
            return;
        }
        else if (this.direction === 'right')
            this.x += this.speed;
        else
            this.x -= this.speed;
    }
}

// ... //

// Конструктор отрисовки героя //

function Character (x = 0, y = 350, w = 180, h = 200, img = 'img/Character.png') {

    Coords.call(this, x, y, w, h, img)
    this.speed = 9;
    this.hp = 100;
    this.mp = 100;
    this.score = 0;
    this.direction = 'right';
    this.type = 'character';
    this.isAttacked = 0;
    this.isBlock = 0;
    this.attackDelay = 0;
    this.firstSkillDelay = 0;
    this.secondSkillDelay = 0;

    this.process = () => {//функции состояния вызываются каждый кадр в игре
        if (this.hp > 100)
            this.hp = 100;
        if (this.mp > 100)
            this.mp = 100;
        else if (this.mp <= 0)
            this.mp = 0;
        //функция пропадения изображения героя при смерти или победе
        if (this.hp <= 0) {
            InitGame.gameOver();
        } else if (this.x >= game.background.w - this.w) {
            InitGame.gameWin();
        }

        this.attackDelay--;
        this.isAttacked--;
        this.isBlock--;
        this.firstSkillDelay--;
        this.secondSkillDelay--;
        this.showHealth();
        this.showMana();
    }

    this.draw = () => {
        if (this.direction === 'left') {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(this.img, -this.x - game.camera.getXOffset(), this.y, -this.w, this.h);
            ctx.restore();
        } else
            ctx.drawImage(this.img, this.x + game.camera.getXOffset(), this.y, this.w, this.h);
    }

    this.moveLeft = () => {
        this.direction = 'left';
        if (this.x > 0)
            this.x -= this.speed;
    }

    this.moveRight = () => {
        this.direction = 'right';
        if (this.x < game.background.w - this.w)
            this.x += this.speed;
    }

    this.attack = () => {
    	if (this.attackDelay <= 0) {
    		let attack = new Arrow(this.x, this.y, this.direction);
        	elements.push(attack);
        	this.attackDelay = 10;
    	}
    }

    this.block = () => {
        if (this.mp >= 5) {
            this.isBlock = 10;
            if (this.isAttacked >= 0) {
                this.mp -= 5;
            }
        }
    }

    // Вызов первой способности //
    this.firstSkill = () => {
        if (this.firstSkillDelay <= 0 && this.mp >= 10) {
            let attack = new Arrow(this.x + 20, this.y - 20, this.direction, 40, 80, 80, 'img/firstAbility.png');
            elements.push(attack);
            this.firstSkillDelay = 200;
            this.mp -= 10;
        }
    }

    // Вызов второй способности //
    this.secondSkill = () => {
        if (this.secondSkillDelay <= 0 && this.mp >= 30) {
            let attack = new Arrow(this.x - 200, -500, this.direction, 100, 500, 500, 'img/secondAbility.png', true);
            elements.push(attack);
            this.secondSkillDelay = 1000;
            this.mp -= 30;
        }

    }

    this.showHealth = () => {
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + game.camera.getXOffset(), this.y - 30, this.w, 5);
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x + game.camera.getXOffset(), this.y - 30, this.w / 100 * this.hp, 5)
    }

    this.showMana = () => {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x + game.camera.getXOffset(), this.y - 20, this.w, 5);
        ctx.fillStyle = 'aqua';
        ctx.fillRect(this.x + game.camera.getXOffset(), this.y - 20, this.w / 100 * this.mp, 5);
    }


}

// ... //

// Конструктор отрисовки врага //

function Hostile (x, y, hp, damage, w, h, img, enable) {

    Coords.call(this, x, y, w, h, img)
    this.direction = 'left';
    this.hp = hp;
    this.damage = damage;
    this.type = 'hostile';
    this.isAttacked = 0;
    this.attackDelay = 0;

    this.process = () => {
        if (this.hp <= 0) {
            this.enable = false;
            game.character.score += 1;
        }

        if (this.x < -this.w) {
            this.enable = false;
        }

        if (this.attackDelay < 0)
            this.move();

        this.isAttacked--;
        this.attackDelay--;

        this.showHealth();
    }

    this.draw = () => {
        if (this.direction === 'left') {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(this.img, -this.x - game.camera.getXOffset(), this.y, -this.w, this.h);
            ctx.restore();
        } else
            ctx.drawImage(this.img, this.x + game.camera.getXOffset(), this.y, this.w, this.h);
    }

    this.move = () => {
        if (game.character.x - 20 > this.x)
            this.direction = 'right';

        if (game.character.x + 20 < this.x)
            this.direction = 'left';

        if (this.direction === 'right') {
            this.x += this.speed;
        } else
            this.x -= this.speed;
    }

    this.showHealth = () => {
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 20 + game.camera.getXOffset(), this.y - 30, this.w - 20, 5);
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x + 20 + game.camera.getXOffset(), this.y - 30, this.w  / this.maxHealth * this.hp - 20 , 5)
    }
}

// ... //

// Спавн врагов //

function HostileSpawn () {

        this.spawnDelay = 50;
        this.spawnRate = 50;
        this.hostileCount = 0;
        this.enable = true;

    this.process = () => {
        if (this.spawnDelay <= 0)
            this.createEnemy();

        this.spawnDelay--;
    }

    this.draw = () => {

    }

    this.createEnemy = () => {
        if (this.hostileCount === 10)
            return;
        let randSpawnHostile = Math.random().toFixed(2);//определяет знаки после запятой
        let hostile;

        if (randSpawnHostile < 0.1)
            hostile = new Ork;
        else if (randSpawnHostile >= 0.1 && randSpawnHostile < 0.4)
            hostile = new Troll;
        else
            hostile = new Goblin;

        elements.push(hostile);
        this.hostileCount += 1;
        this.spawnDelay = this.spawnRate;
    }
}

// ... //

// Констрктор отрисовки орков //

function Ork (x = canvas.width - game.camera.getXOffset(), y = 290, hp = 60, damage = 10, w = 220, h = 260, img = 'img/Орк.png')  {

    Hostile.call(this, x, y, hp, damage, w, h, img);
    this.attackSpead = 60;
    this.speed = 3;
    this.maxHealth = 60;
}

// ... //

// Конструктор отрисовки троллей //

function Troll(x = canvas.width - game.camera.getXOffset(), y = 320, hp = 30, damage = 5, w = 220, h = 240, img = 'img/Тролль.png') {

    Hostile.call(this, x, y, hp, damage, w, h, img)
    this.attackSpead = 40;
    this.speed = 5;
    this.maxHealth = 30;
}

// ... //

// Конструктор отрисовки гоблинов //

function Goblin (x = canvas.width - game.camera.getXOffset(), y = 340, hp = 15, damage = 2, w = 220, h = 220, img = 'img/Гоблин.png') {

    Hostile.call(this, x, y, hp, damage, w, h, img)
    this.attackSpead = 20;
    this.speed = 7;
    this.maxHealth = 15;
}

// ... //

// Функция логики камеры //

function Camera (element) {

    this.viewPortWidth = canvas.width;
    this.sceneWidth = 8000;
    this.deadZoneX = canvas.width / 2;
    this.Followed = element;

    this.getXOffset = () => {
        const clamp = (n, lo, hi) => n <lo ? lo : n > hi ? hi : n;
        return -clamp(this.Followed.x - this.deadZoneX, 0, this.sceneWidth - this.viewPortWidth);
    }
}

// ... //

// ... //

// Функции главной логики //

{

    window.addEventListener('keydown', () => {//нажатие всех кнопок
        arrays[event.keyCode] = 1;
    });

    window.addEventListener('keyup', () => {
        arrays[event.keyCode] = 0;
    });

    start.addEventListener('click', () => {
        event.preventDefault();
        form.style.display = 'none';
        downN.style.display = 'none';
        topP.style.display = 'none';
        canvas.style.display = 'block';
        endGame.style.display = 'block';
        elements.length = 0;
        game = new InitGame();
        game.playTime();
        game.inGame();
    });

    endGame.addEventListener('click', () => {
        canvas.style.display = 'none';
        endGame.style.display = 'none';
        form.style.display = 'flex';
        downN.style.display = 'flex';
        topP.style.display = 'flex';
        game.gameEnd = true;
    })

    // Функция проверки нажатия на клавиши //

    //checkButtons
    function buttonsListener() {
        if (arrays[27]) {
            gamePause();
            arrays[27] = 0;
        }

        if (game.pause)
            return;

        if (arrays[65] || arrays[37])
            game.character.moveLeft();

        if (arrays[68] || arrays[39])
            game.character.moveRight();

        if (arrays[49] || arrays[103] ) {
            game.character.attack();
            arrays[49] = 0;
            arrays[103] = 0;
        }

        if (arrays[50] || arrays[104])
            game.character.block();

        if (arrays[51] || arrays[100]) {
            game.character.firstSkill();
            arrays[51] = 0;
            arrays[100] = 0;
        }

        if (arrays[52] || arrays[105]) {
            game.character.secondSkill();
            arrays[52] = 0;
            arrays[105] = 0;
        }


    }

    // ... //

    function gamePause() {
        game.pause = !game.pause;
    }

    function isCollision(arr) {
        for (let i = 3; i < arr.length; i++) {//с 3 тк с третьего отрисовка героя
            for (let j = 4; j < arr.length; j++) {
                if (collision(arr[i], arr[j])) {
                    if (checkType(arr[i], arr[j]) === 1)//какой тип
                        characterAttack(arr[i], arr[j]);
                    else if (checkType(arr[i], arr[j]) === 2)
                        characterIsAttacked(arr[i], arr[j]);
                }
            }
        }
    }

    function collision(element_1, element_2) {
        if (element_1.type === element_2.type)
            return false;//если элименты одинаковые то коллизии нет 

        if ((element_1.x > element_2.x && element_1.x < element_2.x + element_2.w) ||
            (element_2.x > element_1.x && element_2.x < element_1.x + element_1.w)) {
            return true;
        }
    }

    function characterAttack(element_1, element_2) {
        if (element_1.type === 'arrow') {
            if(element_2.isAttacked <= 0)//второй элемент враг и задержка атаки если 0 атаковать можно если 2 нельзя
                element_2.hp -= element_1.damage;
            element_2.isAttacked = 2;
        } else {
            if(element_1.isAttacked <= 0)
                element_1.hp -= element_2.damage;
            element_1.isAttacked = 2;
        }

    }

    function characterIsAttacked(element_1, element_2) {
        if (element_1.type === 'character') {
            if (element_2.attackDelay <= 0) {
                if (element_1.isBlock < 0)
                    element_1.hp -= element_2.damage;

                element_2.attackDelay = element_2.attackSpead;
                element_1.isAttacked = 1;
            }
        }
    }

    function checkType(element_1, element_2) {
        if ((element_1.type === 'arrow' && element_2.type === 'hostile') ||
            (element_2.type === 'hostile' && element_1.type === 'arrow')) {
            return 1;//если тип стрела и враг то атакуешь ты
        }
        if ((element_1.type === 'character' && element_2.type === 'hostile') ||
            (element_2.type === 'hostile' && element_1.type === 'character')) {
            return 2;//а есои враг и его оружие то атакует враг
        }
        return 0;
    }
}

// ... //