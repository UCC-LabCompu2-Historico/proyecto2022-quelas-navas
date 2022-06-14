const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d');
const scoreEl = document.querySelector('#scoreEl')

canvas.width = 800;
canvas.height = 675;

class Pared {
    static width = 40
    static height = 40

    constructor({posicion}) {
        this.posicion = posicion
        this.width = 40
        this.height = 40
    }

    Dibujar() {
        c.fillStyle = 'blue'
        c.fillRect(this.posicion.x, this.posicion.y, this.width, this.height)
    }
}

class Player {
    constructor({posicion, velocidad}) {
        this.posicion = posicion
        this.velocidad = velocidad
        this.radio = 15
    }

    Dibujar() {
        c.beginPath()//lo inicializa
        c.arc(this.posicion.x, this.posicion.y, this.radio, 0, Math.PI * 2)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()//lo finaliza
    }

    actualizar() {
        this.Dibujar()
        this.posicion.x += this.velocidad.x
        this.posicion.y += this.velocidad.y
    }
}

class Ghost {
    constructor({posicion, velocidad}) {
        this.posicion = posicion
        this.velocidad = velocidad
        this.radio = 15
        this.Colisiones_previas = []
    }

    Dibujar() {
        c.beginPath()
        c.arc(this.posicion.x, this.posicion.y, this.radio, 0, Math.PI * 2)
        c.fillStyle = 'purple'
        c.fill()
        c.closePath()
    }

    actualizar() {
        this.Dibujar()
        this.posicion.x += this.velocidad.x
        this.posicion.y += this.velocidad.y
    }
}

class Moneda {
    constructor({posicion}) {
        this.posicion = posicion
        this.radio = 3
    }

    Dibujar() {
        c.beginPath()
        c.arc(this.posicion.x, this.posicion.y, this.radio, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}

const moneda = []

const paredes = []

const ghost =
    [new Ghost({
        posicion: {
            x: Pared.width * 13 + Pared.width / 2,
            y: Pared.height * 15 + Pared.height / 2
        },
        velocidad: {x: -2, y: 0}
    }),
        new Ghost({
            posicion: {
                x: Pared.width * 1 + Pared.width / 2,
                y: Pared.height * 11 + Pared.height / 2
            },
            velocidad: {x: 0, y: -2}
        }),
        new Ghost({
            posicion: {
                x: Pared.width * 11 + Pared.width / 2,
                y: Pared.height * 3 + Pared.height / 2
            },
            velocidad: {x: 2, y: 0}
        })]

const player = new Player({
    posicion: {
        x: Pared.width + Pared.width / 2,
        y: Pared.height + Pared.height / 2
    },
    velocidad: {
        x: 0,
        y: 0
    }
})

const teclas = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

const mapa = [
    ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['-', ' ', '.', '.', '.', '.', '.', '-', '.', '.', '.', '.', '.', '.', '-'],
    ['-', '.', '-', '.', '-', '-', '.', '-', '.', '-', '-', '.', '-', '.', '-'],
    ['-', '.', '.', '.', '.', '-', '.', '.', '.', '-', '.', '.', '.', '.', '-'],
    ['-', '-', '.', '-', '.', '-', '.', '-', '.', '-', '.', '-', '.', '-', '-'],
    ['-', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '-'],
    ['-', '.', '-', '.', '-', '-', '.', '-', '.', '-', '-', '.', '-', '.', '-'],
    ['-', '.', '-', '.', '.', '.', '.', '-', '.', '.', '.', '.', '-', '.', '-'],
    ['-', '.', '-', '-', '.', '-', '-', '-', '-', '-', '.', '-', '-', '.', '-'],
    ['-', '.', '-', '.', '.', '.', '.', '-', '.', '.', '.', '.', '-', '.', '-'],
    ['-', '.', '-', '.', '-', '-', '.', '-', '.', '-', '-', '.', '-', '.', '-'],
    ['-', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '-'],
    ['-', '-', '.', '-', '.', '-', '.', '-', '.', '-', '.', '-', '.', '-', '-'],
    ['-', '.', '.', '.', '.', '-', '.', '.', '.', '-', '.', '.', '.', '.', '-'],
    ['-', '.', '-', '.', '-', '-', '.', '-', '.', '-', '-', '.', '-', '.', '-'],
    ['-', '.', '.', '.', '.', '.', '.', '-', '.', '.', '.', '.', '.', '.', '-'],
    ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']
]

let ultima_tecla = ''
let score = 0
let animacionId

mapa.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            case '-':
                paredes.push(
                    new Pared({
                        posicion: {x: Pared.width * j, y: Pared.height * i},
                    })
                )
                break
            case '.':
                moneda.push(
                    new Moneda({
                        posicion: {
                            x: Pared.width * j + Pared.width / 2,
                            y: Pared.height * i + Pared.width / 2
                        },
                    })
                )
                break
        }
    })
})

/*
Detecta cuando un circulo choca contra una pared
@method circulo_colisiona_con_rectangulo
@param {int} posicion, velocidad y radio - posicion: movimiento del circulo - velocidad: rapidez del circulo - radio: tamaño del circulo
@param {int} posicion, alto y ancho - posicion: lugar de las parades - alto y ancho: tamaño del rectangulo
@return Devuelve contra que pared choco el circulo
*/
function circulo_colisiona_con_rectangulo({circulo, rectangulo}) {

    const padding = Pared.width / 2 - circulo.radio - 1 //para poder modificarle la velocidad al fantasma, necesitamos que se detecte el padding con la colision

    return (circulo.posicion.y - circulo.radio + circulo.velocidad.y <= rectangulo.posicion.y + rectangulo.height + padding &&
        circulo.posicion.x + circulo.radio + circulo.velocidad.x >= rectangulo.posicion.x - padding &&
        circulo.posicion.y + circulo.radio + circulo.velocidad.y >= rectangulo.posicion.y - padding &&
        circulo.posicion.x - circulo.radio + circulo.velocidad.x <= rectangulo.posicion.x + rectangulo.width + padding)
}

/* 
Desarrollo del juego
@mehod animacion
@return Devuelve los posibles caminos que puede tomar el fantasma para no tener colisiones
*/
function animacion() {
    animacionId = requestAnimationFrame(animacion)
    c.clearRect(0, 0, canvas.width, canvas.height) // limpia los movimientos anteriores del pacman
    //Deteccion de colision del jugador con la pared en direccion a -y
    if (teclas.w.pressed && ultima_tecla === 'w') {
        for (let i = 0; i < paredes.length; i++) {
            const Pared = paredes[i]
            if (circulo_colisiona_con_rectangulo({
                circulo: {...player, velocidad: {x: 0, y: -2}},
                rectangulo: Pared
            })
            ) {
                player.velocidad.y = 0
                break
            } else {
                player.velocidad.y = -2
            }
        }
    } 
    //Deteccion de colision del jugador con la pared en direccion a -x
    else if (teclas.a.pressed && ultima_tecla === 'a') {
        for (let i = 0; i < paredes.length; i++) {
            const Pared = paredes[i]
            if (circulo_colisiona_con_rectangulo({
                circulo: {...player, velocidad: {x: -2, y: 0}},
                rectangulo: Pared
            })
            ) {
                player.velocidad.x = 0
                break
            } else {
                player.velocidad.x = -2
            }
        }
    }
     //Deteccion de colision del jugador con la pared en direccion a y
    else if (teclas.s.pressed && ultima_tecla === 's') {
        for (let i = 0; i < paredes.length; i++) {
            const Pared = paredes[i]
            if (circulo_colisiona_con_rectangulo({
                circulo: {...player, velocidad: {x: 0, y: 2}},
                rectangulo: Pared
            })
            ) {
                player.velocidad.y = 0
                break
            } else {
                player.velocidad.y = 2
            }
        }
    } 
    //Deteccion de colision del jugador con la pared en direccion a x
    else if (teclas.d.pressed && ultima_tecla === 'd') {
        for (let i = 0; i < paredes.length; i++) {
            const Pared = paredes[i]
            if (circulo_colisiona_con_rectangulo({
                circulo: {...player, velocidad: {x: 2, y: 0}},
                rectangulo: Pared
            })
            ) {
                player.velocidad.x = 0
                break
            } else {
                player.velocidad.x = 2
            }
        }
    }
    //Deteccion de monedas e incremento del puntaje por monedas
    moneda.forEach((monedas, i) => {
        monedas.Dibujar()
        if (
            Math.hypot(
                monedas.posicion.x - player.posicion.x, //"comer" las monedas
                monedas.posicion.y - player.posicion.y) < monedas.radio + player.radio) {
            moneda.splice(i, 1)
            score += 10
            scoreEl.innerHTML = score
        }
    })
    //Deteccion de jugador con pared que causa que la velocidad se modifique a 0
    paredes.forEach((Pared) => {
        Pared.Dibujar()
        if (circulo_colisiona_con_rectangulo({
            circulo: player,
            rectangulo: Pared
        })
        ) {
            player.velocidad.y = 0
            player.velocidad.x = 0
        }
    })
    player.actualizar() //actualiza al jugador

    //Deteccion de fantasmas con el jugador y con paredes
    ghost.forEach(ghost => {
        ghost.actualizar()
        //Deteccion de fantasma con jugador, condicion para perder
        if (
            Math.hypot(
                ghost.posicion.x - player.posicion.x,
                ghost.posicion.y - player.posicion.y) < ghost.radio + player.radio) {
            cancelAnimationFrame(animacionId)
            alert("Game over")
        }
        //Contador de monedas, condicion para ganar
        if (moneda.length === 0) {
            cancelAnimationFrame(animacionId)
            alert("You win")
        }

        const colisiones = []
        //Deteccion de fantasmas cuando colisionan con las paredes
        paredes.forEach((Pared) => {
            //Detecta colision con la derecha 
            if (!colisiones.includes('right') && circulo_colisiona_con_rectangulo({//!colisiones.includes('right') SI NO COLISIONA CON LA DERECHA
                circulo: {...ghost, velocidad: {x: 2, y: 0}},
                rectangulo: Pared
            })
            ) {
                colisiones.push('right')
            }
            //Detecta colision con la izquierda
            if (!colisiones.includes('left') && circulo_colisiona_con_rectangulo({
                circulo: {...ghost, velocidad: {x: -2, y: 0}},
                rectangulo: Pared
            })
            ) {
                colisiones.push('left')
            }
            //Detecta colision hacia arriba
            if (!colisiones.includes('up') && circulo_colisiona_con_rectangulo({
                circulo: {...ghost, velocidad: {x: 0, y: -2}},
                rectangulo: Pared
            })
            ) {
                colisiones.push('up')
            }
            //Detecta colision hacia abajo
            if (!colisiones.includes('down') && circulo_colisiona_con_rectangulo({
                circulo: {...ghost, velocidad: {x: 0, y: 2}},
                rectangulo: Pared
            })
            ) {
                colisiones.push('down')
            }
        })
        //GUARDAR LA POSICION ANTERIOR DEL FANTASMA
        if (colisiones.length > ghost.Colisiones_previas.length) {
            ghost.Colisiones_previas = colisiones
        }
        //Deteccion de posibles caminos de los fantasmas
        if (JSON.stringify(colisiones) !== JSON.stringify(ghost.Colisiones_previas)) {//JSON.stringify ES LA MEJOR MANERA DE DARSE CUENTA SI EL VECTOR Y SU CONTENIDO SON IGUALES

            if (ghost.velocidad.x > 0) ghost.Colisiones_previas.push('right')//
            else if (ghost.velocidad.x < 0) ghost.Colisiones_previas.push('left')
            else if (ghost.velocidad.y < 0) ghost.Colisiones_previas.push('up')
            else if (ghost.velocidad.y > 0) ghost.Colisiones_previas.push('down')

            const caminos = ghost.Colisiones_previas.filter((collision) => {
                return !colisiones.includes(collision)
            })
            const direction = caminos[Math.floor(Math.random() * caminos.length)]//Math.floor VUELVE (Math.random() * caminos.length) EN INT POR SI NOS DA UN DECIMAL PARA QUE LO REDONDE

            switch (direction) {
                case'down':
                    ghost.velocidad.y = 2
                    ghost.velocidad.x = 0
                    break
                case'up':
                    ghost.velocidad.y = -2
                    ghost.velocidad.x = 0
                    break
                case'right':
                    ghost.velocidad.y = 0
                    ghost.velocidad.x = 2
                    break
                case'left':
                    ghost.velocidad.y = 0
                    ghost.velocidad.x = -2
                    break
            }
            ghost.Colisiones_previas = []
        }
    })
}

animacion()

addEventListener('keydown', ({key}) => {//para saber que tecla presionaste
    switch (key) {
        case 'w':
            teclas.w.pressed = true
            ultima_tecla = 'w'
            break
        case 'a':
            teclas.a.pressed = true
            ultima_tecla = 'a'
            break
        case 's':
            teclas.s.pressed = true
            ultima_tecla = 's'
            break
        case 'd':
            teclas.d.pressed = true
            ultima_tecla = 'd'
            break
    }
})

addEventListener('keyup', ({key}) => { //para frenar cuando se cambia de tecla
    switch (key) {
        case 'w':
            teclas.w.pressed = false
            break
        case 'a':
            teclas.a.pressed = false
            break
        case 's':
            teclas.s.pressed = false
            break
        case 'd':
            teclas.d.pressed = false
            break
    }
})