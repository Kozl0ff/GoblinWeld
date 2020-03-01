var form = document.querySelector('form');
var topP = document.querySelector('.top');
var downN = document.querySelector('.down');
var record = document.querySelector('.record');
var tableOfRecords = document.querySelector('.tableOfRecords');
var closeRecordsTable = document.querySelector('.closeTable');
var currentName = document.querySelector('#name');
var win = document.querySelector('.win');
var defeat = document.querySelector('.defeat');
let arrayOfRecords = [];
let currentPlayer;

function addToList() {

    let line = {
        place : arrayOfRecords.length + 1,
        name : currentName.value === '' ? 'Player' : currentName.value,
        score : game.character.score,
        time : game.gameDuration
    };

    currentPlayer = line;

    arrayOfRecords.push(line);
    localStorage.setItem('Records', JSON.stringify(arrayOfRecords));
    showRecords(arrayOfRecords);
}

function showRecords(arr) {//елементов больше чем 2 то удаляем все
    while (tableOfRecords.children.length > 2) {
        tableOfRecords.removeChild(tableOfRecords.lastChild);
    }

    sort(arr);

    for (let i = 0; i < arr.length && i < 9; i++) {
        let section = document.createElement('section');
        let place = document.createElement('p');
        let name = document.createElement('p');
        let score = document.createElement('p');
        let time = document.createElement('p');
        place.innerText = arr[i].place;
        name.innerText = arr[i].name;
        score.innerText = arr[i].score;
        time.innerText = arr[i].time;

        section.appendChild(place);
        section.appendChild(name);
        section.appendChild(score);
        section.appendChild(time);

        tableOfRecords.appendChild(section);
    }
}

function sort(arr) {
    for (let i = 0; i < arr.length-1; i++) {
        for (let j = 0; j < arr.length-1-i; j++) {
            if (arr[j].score < arr[j + 1].score) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                [arr[j].place, arr[j + 1].place] = [arr[j + 1].place, arr[j].place];
            }
        }
    }
    return arr;
}

window.onload = function(argument) {
    if (localStorage.getItem('Records'))
        arrayOfRecords = JSON.parse(localStorage.getItem('Records'));
    showRecords(arrayOfRecords);
}

record.addEventListener('click', function(argument) {
    event.preventDefault();//отменяет дефолтное исполнеие функции
    form.style.display = 'none';
    topP.style.display = 'none';
    downN.style.display = 'none';
    tableOfRecords.classList.toggle('tableOfRecordsOpen');
});

closeRecordsTable.addEventListener('click', function(argument) {
   event.preventDefault();
    tableOfRecords.classList.toggle('tableOfRecordsOpen');
    form.style.display = 'flex';
    topP.style.display = 'flex';
    downN.style.display = 'flex';

});