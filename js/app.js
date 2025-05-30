class GameObject {

    constructor(name, x = 0, y = 0) {
        this.health = 0;
        this.id = GameObjects.length;
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = 0;
        this.height = 0;
        this.image = new Image();
        GameObjects[this.id] = this;
    }

}

var canvas = document.getElementById('canv');
var context = canvas.getContext('2d');
context.fillRect(0, 0, canvas.width, canvas.height);

var requestId;

var grow;
var grow2;
var road;
var road2;
var road3;
var player;
var cooldown = false;
var pointIncr = 1;
var pointTimeout;

var scores = 0;
var score_table = [];
var pressing_buttons;

var animating = false;
var gameSpeed = 0;
var globalGameSpeed = 3;

var GameObjects = [];

function start() {
	getOldRecords();
	drawScoreTable();
    addDimensions();
    addCar();
    addPoint();
    addTree();
    draw();
    increaseGameSpeed();
}

function restart() {
    Animate();
    deleteObjs(['car', 'bullet', 'tree', 'point']);
    player.x = canvas.width / 2 - 32;
    player.y = canvas.height - 100;
	
	if (scores > 0)
	score_table.push(scores);

	drawScoreTable()
    scores = 0;
    scoresP.innerHTML = "Ваши очки: " + scores;
    hello.innerHTML = "Вы проиграли! Продолжим?"
        globalGameSpeed = 2;
}

function getOldRecords(){
	
	var scoreTableLenght = localStorage.getItem("scoreTableLenght");
	
	for (var i = 0; i < scoreTableLenght; i++){
		
		var value = localStorage.getItem("score"+i);
		
		if (value > 0){
			score_table.push(value);
		}
		
	}
	
}

function drawScoreTable(){
	let table_text = `
	<tr><th>Ваши рекорды:</th></tr>
	<tr><td><button onclick='clearRecords()'>Очистить</button></td></tr>
	`;
	for (var i = 0; i < score_table.length; i++){
		localStorage.setItem("score"+i, score_table[i]);
		table_text += `
		<tr><td>${score_table[i]}</td></tr>
		`
	}
	localStorage.setItem("scoreTableLenght", score_table.length);
	table_width_scores.innerHTML = table_text;
}

function clearRecords(){
	
	localStorage.clear();
	score_table = [];
	drawScoreTable()
	
}

function draw() {
    gameSpeed = globalGameSpeed * pointIncr;

    //Перебираем массив с игровыми объектами
    for (obj of GameObjects) {

        //Проверяем столкновения с player
        if (obj.name == 'player') {

            for (anotherObj of GameObjects) {

                if (anotherObj.name == 'car') {

                    if (isCollide(obj, anotherObj)) {

                        restart();

                    }

                }

                if (anotherObj.name == 'point') {

                    if (isCollide(obj, anotherObj)) {
						
						GameObjects.removeId(anotherObj.id);
                        addBonus();

                    }

                }

            }

            if (obj.x < 210 || obj.x > 540) {
                restart();
            }

            if (obj.y > canvas.height || obj.y < -20) {
                player.y = canvas.height - 100;
            }

        }

        //Рисуем объект по его координатам
        context.drawImage(obj.image, obj.x, obj.y);

        //Удаляем дерево после его ухода с экрана
        if (obj.name == 'tree') {

            obj.y += gameSpeed;

            if (obj.y > canvas.height + 50) {
                GameObjects.removeId(obj.id);
            }

        }

        if (obj.name == 'point') {

            obj.y += gameSpeed;

            if (obj.y > canvas.height + 50) {
                GameObjects.removeId(obj.id);
            }

        }

        //Чтобы дорога после ухода за экран рисовалась с верху
        if (obj.name == 'road') {

            obj.y += gameSpeed;

            if (obj.y > canvas.height + 100) {
                obj.y -= obj.image.height * 2.5;
            }

        }

        //Чтобы трава после ухода за экран рисовалась с верху
        if (obj.name == 'grow') {

            obj.y += gameSpeed;

            if (obj.y > canvas.height) {
                obj.y -= obj.image.height * 2;
            }

        }

        //Удаляем машину после ёё ухода с экрана
        if (obj.name == 'car') {

            obj.y += gameSpeed * 1.5;

            if (obj.y > canvas.height + 35) {
                GameObjects.removeId(obj.id);
                scores += 30 * globalGameSpeed;
                scoresP.innerHTML = "Ваши очки: " + scores;
            }

            for (o of GameObjects) {

                if (o.name == 'car') {
                    if (obj !== o) {
                        if (isCollide(obj, o)) {
                            obj.y -= obj.height;
                        }
                    }
                }

            }

        }

    }

    //Перебираем зажатые клавиши
    for (key of pressing_buttons) {

        switch (key) {
        case "w":
            player.y -= gameSpeed;
            break;
        case "a":
            player.x -= gameSpeed;
            break;
        case "s":
            player.y += gameSpeed / 2;
            break;
        case "d":
            player.x += gameSpeed;
            break;
        case "ц":
            player.y -= gameSpeed;
            break;
        case "ф":
            player.x -= gameSpeed;
            break;
        case "ы":
            player.y += gameSpeed / 2;
            break;
        case "в":
            player.x += gameSpeed;
            break;
        }

    }

    //Если анимация true, апускаем анимацию и сохраняем её id
    if (animating) {

        requestId = requestAnimationFrame(draw);

    }

}

function increaseGameSpeed() {

    if (animating) {

        globalGameSpeed += 1;

    }
    setTimeout(increaseGameSpeed, 5000);

}

function deleteObjs(values) {

    let DeletingObjects = [];

    for (obj of GameObjects) {

        for (val of values) {

            if (obj.name == val) {
                DeletingObjects.push(obj);
            }

        }

    }

    for (obj of DeletingObjects) {
        GameObjects.removeId(obj.id);
    }

}

//Останавливаем/запускаем анимацию
function Animate() {

    animating = !animating;

    if (!animating) {
        menu.style.display = '';
        cancelAnimationFrame(requestId);
        pause.disabled = true;
    } else {
        menu.style.display = 'none';
        pause.disabled = false;
        requestAnimationFrame(draw);
    }

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

//Добавляем машину
function addCar() {

    if (animating) {

        let car = new GameObject('car', canvas.width / 2 + randPosCar() - 35, -200);
        car.image.src = "src/car" + getRandomInt(1, 5) + ".png";
        car.image.onload = addDimensions;

        if ((10 + Math.random() * gameSpeed * 35) > 100) {
            let car2 = new GameObject('car', canvas.width / 2 + randPosCar() - 35, -400 * Math.random() - 200);
            car2.image.src = "src/car" + getRandomInt(1, 5) + ".png";
            car2.image.onload = addDimensions;
        }

        if ((10 + Math.random() * gameSpeed * 20) > 100) {
            let car3 = new GameObject('car', canvas.width / 2 + randPosCar() - 35, -400 * Math.random() - 200);
            car3.image.src = "src/car" + getRandomInt(1, 5) + ".png";
            car3.image.onload = addDimensions;
        }

        if ((10 + Math.random() * gameSpeed * 10) > 100) {
            let car4 = new GameObject('car', canvas.width / 2 + randPosCar() - 35, -400 * Math.random() - 200);
            car4.image.src = "src/car" + getRandomInt(1, 5) + ".png";
            car4.image.onload = addDimensions;
        }

    }

    setTimeout(addCar, Math.random() * 12000 / gameSpeed + 1000);

}

//Добавляем деревья
function addTree() {

    if (animating) {

        let tree = new GameObject('tree', randPosTree(), -400 * Math.random() - 100);
        tree.image.src = "src/tree" + getRandomInt(1, 2) + ".png";

    }

    setTimeout(addTree, Math.random() * 100 * gameSpeed);

}

//Добавляем бонусы
function addPoint() {

    if (animating) {

        if ((40 + Math.random() * gameSpeed * 10) > 100) {
            let point = new GameObject('point', canvas.width / 2 + randPosCar() - 35, -400 * Math.random() - 200);
            point.image.src = "src/point.png";
            point.image.onload = addDimensions;
        }

    }

    setTimeout(addPoint, Math.random() * 100 * gameSpeed);

}

function addBonus() {
	clearTimeout(pointTimeout);
	
	scores += 50 * globalGameSpeed;
    pointIncr = 0.5;
	
    pointTimeout = setTimeout(function () {
        pointIncr = 1;
    }, 5000);
}

//Генерация случайного положения дерева
function randPosTree() {

    if (Math.random() > 0.5) {
        return Math.random() * 170 - 10;
    } else {
        return canvas.width - Math.random() * 200 - 20;
    }

}

//Генерация случайного положения машины
function randPosCar() {
    let multiplier = 1;
    if (Math.random() > 0.5) {
        multiplier *= -1;
    }
    return Math.random() * multiplier * 160
}

//Проверяем на столкновения
function isCollide(a, b) {
    return !(
        ((a.y + a.height) < (b.y)) ||
        (a.y > (b.y + b.height)) ||
        ((a.x + a.width) < b.x) ||
        (a.x > (b.x + b.width)));
}

//Добавляем ширину/высоту к объекту (для удобства)
function addDimensions() {

    for (obj of GameObjects) {
        if (obj.width == 0 || obj.height == 0) {
            obj.width = obj.image.width;
            obj.height = obj.image.height;
        }
    }

}

function parseINI(string) {
    // Начнём с объекта, содержащего настройки верхнего уровня
    var currentSection = {
        name: null,
        fields: []
    };
    var categories = [currentSection];
    string.split(/r?n/).forEach(function (line) {
        var match;
        if (/^s*(;.*)?$/.test(line)) {
            return;
        } else if (match = line.match(/^[(.*)]$/)) {
            currentSection = {
                name: match[1],
                fields: []
            };
            categories.push(currentSection);
        } else if (match = line.match(/^(w+)=(.*)$/)) {
            currentSection.fields.push({
                name: match[1],
                value: match[2]
            });
        } else {
            throw new Error("Строчка '" + line + "' содержит неверные данные.");
        }
    });
    return categories;
}

//Дополняем массивы функцией удаления конкретного элемента по ключу
Array.prototype.removeId = function (id) {
    const objWithIdIndex = this.findIndex((obj) => obj.id == id);

    if (objWithIdIndex > -1) {
        this.splice(objWithIdIndex, 1);
    }

    return this;
}

//Дополняем массивы функцией поиска последнего элемента
Array.prototype.last = function () {
    return this[this.length - 1];
}

//Слушаем нажатия клавиш и добавляем зажатые в массив
document.addEventListener("keydown", (e) => {
    if (!pressing_buttons.includes(e.key)) {
        pressing_buttons.push(e.key);
    }
});

//Удаляем зажатые из массива при отпускании
document.addEventListener("keyup", (e) => {
    pressing_buttons = pressing_buttons.filter(value => value !== e.key);
});

//Создаём объекты по-умолчанию
grow = new GameObject('grow', 0, 0);
grow.image.src = "src/grow.png";

grow2 = new GameObject('grow', 0, -700);
grow2.image.src = "src/grow.png";

road = new GameObject('road', 212.5, 0);
road.image.src = "src/road.png";

road2 = new GameObject('road', 212.5, 512);
road2.image.src = "src/Road.png";

road3 = new GameObject('road', 212.5, -512);
road3.image.src = "src/road.png";

player = new GameObject('player', canvas.width / 2 -16, canvas.height - 100);
player.image.src = "src/racingcar.png";

pressing_buttons = [];

GameObjects.last().image.onload = start;

//Работа с файлом scores.ini
