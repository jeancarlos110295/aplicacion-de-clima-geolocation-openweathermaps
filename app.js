require('dotenv').config()

const { 
    leerInput ,
    inquerirMenu,
    pausa,
    listarLugares
 } = require('./helpers/inquirer.js')

const Busquedas = require('./models/busquedas.js')

console.clear()

const appInst = async () => {
    let opt = null

    let instBusquedas = new Busquedas()



    do{
        opt = await inquerirMenu()

        switch(opt){
            case 1:
                // Mostrar mensaje
                const lugar = await leerInput('Ciudad: ')

                // Buscar los lugares
                const lugares = await instBusquedas.ciudad( lugar )
                const id = await listarLugares(lugares)

                if( id == "0"){
                    //si se cancela en los resultados, se continua el ciclo
                    continue
                }

                // Seleccionar el lugar
                const {nombre , lng , lat} = lugares.find( l => l.id === id)

                // Clima
                const {temperatura , tempMinima , tempMaxima , descripClima} = await instBusquedas.climaLugar(lat , lng)

                //guardar en la db
                instBusquedas.agregarHistorial( lugar )

                // Mostrar resultados
                console.clear()
                console.log('\nInformación de la ciudad\n'.green)
                console.log('Ciudad: '.green +nombre)
                console.log('Lat: '.green +lat)
                console.log('Lng: '.green +lng)
                console.log('Temperatura: '.green +temperatura)
                console.log('Mínima: '.green +tempMinima)
                console.log('Máxima: '.green +tempMaxima)
                console.log('El clima esta: '.green +descripClima)
            break;
    
            case 2:
                instBusquedas.historialCapitalizado.forEach( (lugar , i) => {
                    const idx = `${i + 1}.`.green

                    console.log(` ${ idx } ${lugar} `)
                })
            break;
        }
    
        if(opt !== 0) await pausa()
    } while(opt !== 0)

}

appInst()