//!     Classes 
class Cell {
    constructor(x ,y, number, checked) {
        this.type = 'cell'
        this.x = x
        this.y = y
        this.number = number
        this.checked = checked 
    }
    getType() {
        return this.type
    }
    getCase() {
        return this.case
    }
}
class Flag extends Cell {
    constructor(x,y,number) {
        super(x, y, number, false)
        this.type = 'flag'
    }
}
class Mine extends Cell {
    constructor(x,y,number) {
        super(x, y, number, true)
        this.type ='mine'
    }
}
class Number extends Cell {
    constructor(x,y,number) {
        super(x, y, number, true)
        this.type = 'number'
    }
}
class Empty extends Cell {
    constructor(x,y,number) {
        super(x, y, number, true)
        this.type = 'empty'
    }
}
//!     Variables
const columnsNumber = 15
let cellArray = []
let countUp = 1
let container = document.querySelector('main .container')
let main = document.querySelector('main')
let firstGameClick = true
let minesRound = 0
let delay = .01
let winTime = localStorage.getItem('winMine') || 0
let loseTime = localStorage.getItem('loseMine') || 0
let level = 10, minesNumber = level * 2
//!     Main
document.querySelectorAll('.select-level input').forEach(
    element => {
        element.onclick = _ => {
            document.querySelector('.start-label').style.pointerEvents = 'all'
            level = element.dataset.level
            minesNumber = element.dataset.mine
            if(level == 10) {
                main.className = 'easy'
            } else if(level == 20) {
                main.className = 'mid'
            } else {
                main.className = 'hard'
            }
        }
    }
)

document.querySelector('.start-label').onclick = _ => {
    removeShader()
    setResult()
    addCellsToGrid(level)

    document.addEventListener('contextmenu', e => {

        if(e.target.classList.contains('cell')) {
            e.preventDefault();
            if(e.target.classList.contains('flag')) {
                removeFlag(e.target.getAttribute('position-x'), e.target.getAttribute('position-y'))
            } else {
                var i = bCreateElement('i', 'fa fa-flag', null, null)
                e.target.appendChild(i)
                e.target.classList.add('flag')
                cellArray[e.target.getAttribute('position-x')][e.target.getAttribute('positiony')] = new Flag(e.target.getAttribute('position-x'), e.target.getAttribute('position-y'), 50)
            }
            checkedFindingMines()
        }

    })

    document.addEventListener('click', e => {

        if(firstGameClick) {
            if(e.target.classList.contains('cell')) {
                cellArray[e.target.getAttribute('position-x')][e.target.getAttribute('positiony')] = new Empty(e.target.getAttribute('position-x'), e.target.getAttribute('position-y'), 50)
                while(minesNumber > 0) {
                    
                    randomlyMines(minesNumber)
                    minesNumber--
                    
                }
                cellArray[e.target.getAttribute('position-x')][e.target.getAttribute('positiony')] = new Cell(e.target.getAttribute('position-x'), e.target.getAttribute('position-y'), 50, false)
                e.target.classList.remove('empty')
                FlowCells(e.target.getAttribute('position-x'), e.target.getAttribute('position-y'))
                delay = .01
                firstGameClick = false
            } 
        } else {
            if(e.target.classList.contains('cell')) {
                console.log('entered second')
                if((e.target.classList.contains('mine'))) {
                    gameOver()
                } else {
                    FlowCells(e.target.getAttribute('position-x'), e.target.getAttribute('position-y'))
                    delay = .01
                }
                checkedFindingMines()
            } 
        }
    })
}
//!     Main Functions
function addCellsToGrid(cellsNumber) {

    setArray(cellArray, cellsNumber)
    setGrid(cellsNumber)

}

//!     Cut Function
function setArray(array, cellsNumber) {

    for(var x = 0; x < cellsNumber; x++) {
        var cellColumnsArray = []
        for(var y = 0; y < columnsNumber; y++) {

            cellColumnsArray[y] = new Cell(x, y, countUp++, false)

        }
        array.push(cellColumnsArray)
    }
    // array[2][2] = new Mine(2, 2, 50)
}

function setGrid(cellsNumber) {

    for(var x = 0; x < cellsNumber; x++) {
        for(var y = 0; y < columnsNumber; y++) {

            //  Create Cell
            var cell = bCreateElement('div', 'cell', null, null)
            cell.setAttribute('Position-x',x)
            cell.setAttribute('Position-y',y)
            container.appendChild(cell)
        }
    }

}

function removeFlag(x, y) {

    cellArray[x][y] = new Cell(x, y, cellArray[x][y].number)
    var currentFlag = searchCell(x, y)
    currentFlag.classList.remove('flag')
    currentFlag.removeChild(currentFlag.children[0])


}

function FlowCells(x, y) {

    delay += 0.005
    var element = searchCell(x, y)
    if(!cellArray[x][y].checked) {
        element.style.animationDelay  = `${delay.toFixed(3)}s`
        element.style.transitionDelay  = `${delay.toFixed(3)}s`
        if(roundMine(x, y)) {
            if(element.classList.contains('flag')) {
                removeFlag(x, y)
            }
            cellArray[x][y] = new Number(x, y, cellArray[x][y].number)
            element.innerHTML = minesRound
            if(minesRound > 0 && minesRound < 3) {
                element.style.color = 'blue'
            } else if(minesRound > 2 && minesRound < 5) {
                element.style.color = 'green'
            } else {
                element.style.color = 'red'
            }
            element.classList.add('number')
            minesRound = 0
        } else {
            cellArray[x][y] = new Empty(x, y, cellArray[x][y].number)
            element.classList.add('empty')
            if(element.classList.contains('flag')) {
                removeFlag(x, y)
            }
            for(var a = -1; a <= 1; a++) {
                for(var b = -1; b <= 1 ; b++) {
                    if(!outRange(+x+a, +y+b)) {
                        FlowCells(+x+a, +y+b)
                    }
                }
            }
        }
    }
}

function gameOver() {
    var mines = document.querySelectorAll('main .mine') 
    mines.forEach(e => {
        if(e.classList.contains('flag')) {
            removeFlag(e.getAttribute('position-x'), e.getAttribute('position-y'))
        }
        var mine = bCreateElement('i', 'fa fa-exclamation-circle', null, null)
        e.appendChild(mine)
        e.style.backgroundColor = '#f00'
        e.style.transitionDelay = `${delay}s`
        delay+=0.05
    })
    container.style.pointerEvents = 'none'
    setTimeout(() => {
        endGame('Game Over', '#f00')
    }, 1500);
    localStorage.setItem('loseMine', ++loseTime)
    setResult()
}

function endGame(text, color) {
    var overlay = bCreateElement('div', 'overlay', null, null)
    var p = bCreateElement('p', 'text', null, text)
    p.style.backgroundColor = color
    p.style.boxShadow = `1px 1px 4px 0 ${color}`
    overlay.appendChild(p)
    document.body.appendChild(overlay)
}

function searchCell(x ,y) {

    var gridCells = document.querySelectorAll('main .container .cell')
    var result = [...gridCells].filter(
        e => e.getAttribute('position-x') == x
    ).filter(
        e => e.getAttribute('position-y') == y
    )
    return result[0]
}

function roundMine(x, y) {

    var caseFunction = false
    for(a = -1; a <= 1; a++) {
        for(b = -1; b <= 1 ; b++) {
            if(!outRange(+x+a, +y+b)) {
                if(cellArray[+x+a][+y+b].type == 'mine') {
                    caseFunction = true 
                    minesRound++
                }
            }
        }
    }
    return caseFunction
}

function outRange(x ,y) {
    if(x < cellArray.length && x >= 0) {
        if(y < cellArray[x].length && y >= 0) {
            return false
        }
    }
    return true
}

function randomlyMines(number) {

    var position_x = parseInt(Math.random() * level)
    var position_y = parseInt(Math.random() * 15)
    if(notCell(position_x, position_y)) {
        console.log(cellArray[position_x][position_y].type)
        console.log('Entered THe Condition')
        randomlyMines(number)
    } else {
        console.log('out Of Condition')
        cellArray[position_x][position_y] = 
        new Mine(position_x, position_y, number)
        searchCell(position_x, position_y).classList.add('mine')
    }

}

function notCell(x ,y) {
    return cellArray[x][y].type == 'mine' ?  true:
    cellArray[x][y].type == 'number' ? true:
    cellArray[x][y].type == 'empty' ? true: 
    false
}

function checkedFindingMines() {
    var mines = document.querySelectorAll('main .mine')
    var result = Array.from(mines).every(
        e => e.classList.contains('flag')
    )
    result ? finishedGame(): null
}

function finishedGame() {
    var mines = document.querySelectorAll('main .mine') 
    mines.forEach(e => {
        if(e.classList.contains('flag')) {
            removeFlag(e.getAttribute('position-x'), e.getAttribute('position-y'))
        }
        var mine = bCreateElement('i', 'fa fa-thumbs-up', null, null)
        e.appendChild(mine)
        e.style.backgroundColor = '#f00'
        e.style.transitionDelay = `${delay}s`
        delay+=0.05
    })
    container.style.pointerEvents = 'none'
    setTimeout(() => {
        endGame('You Win', 'blue')
    }, 1500);
    localStorage.setItem('winMine', ++winTime)
    setResult()
}

function setResult() {
    if(winTime < 10) {
        document.getElementById('win').innerHTML = `0${winTime}`
    } else {
        document.getElementById('win').innerHTML = `${winTime}`
    }
    if(loseTime < 10) {
        document.getElementById('lose').innerHTML = `0${loseTime}`
    } else {
        document.getElementById('lose').innerHTML = `${loseTime}`
    }
}

function removeShader() {
    document.querySelector('.start').remove()
}
//!     Template Function
function bCreateElement(element, className, id, text) {

    var newElement = document.createElement(element)
    className !== null ? newElement.className = className : null;
    id !== null ? newElement.id = id : null;
    if(text !== null) {

        newElement.appendChild(document.createTextNode(text))

    }


    return newElement
}