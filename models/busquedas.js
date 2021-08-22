const fs = require('fs')

const axios = require('axios')

class Busquedas{
    historial = []

    dbPath = './db/database.json'

    constructor(){
        this.leerDb()
    }

    get paramsMapsBox(){
        return  {
            access_token : process.env.MAPBOX_KEY,
            limit : 5,
            language : "es"
        }
    }

    get paramsOpenWeatherMap(){
        return {
            appid : process.env.OPENWEATHER,
            units : 'metric',
            lang : 'es'
        }
    }

    get historialCapitalizado(){
        return this.historial.map ( (busqueda) => {
            return busqueda.split(' ')
                            .map( (letter) => {
                                return letter[0].toUpperCase() + letter.substring(1)
                            })
                            .join(' ')
        })
    }


    async ciudad( lugar = '' ){
        try{
            const createInstance = axios.create({
                baseURL : `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params : this.paramsMapsBox
            })

            const responseGet = await createInstance.get()

            const dataResponse = responseGet.data.features.map ( (lugar) => {
                let data = {
                    id : lugar.id,
                    nombre : lugar.place_name,
                    lng : lugar.center[0],
                    lat : lugar.center[1]
                }

                return data
            })

            return dataResponse
        }catch( erro ){
            return []
        }
    }

    async climaLugar( lat , lon ){
        try{
            const instance = axios.create({
                baseURL : `https://api.openweathermap.org/data/2.5/weather`,
                params : { ...this.paramsOpenWeatherMap , lat , lon}
            })
    
            const response = await instance.get()

            const {main , weather} = response.data

            return {
                temperatura : main.temp,
                tempMinima : main.temp_min, 
                tempMaxima : main.temp_max, 
                descripClima : weather[0].description
            }
        }catch(error){
            console.log(error)
        }
    }

    agregarHistorial( lugar  = ''){
        // prevenir duplicados
        if( this.historial.includes( lugar.toLocaleLowerCase() ) ){
            return
        }

        this.historial = this.historial.splice( 0 , 5 )

        this.historial.unshift( lugar.toLocaleLowerCase() )

        //grabar en la DB
        this.guardarDb()
    }

    guardarDb(){
        const payload = {
            historial : this.historial
        }
        fs.writeFileSync( this.dbPath , JSON.stringify(payload) )
    }

    leerDb(){
        if( !fs.existsSync( this.dbPath ) ){
            return null
        }

        const info = fs.readFileSync( this.dbPath , { encoding: 'utf-8' } )
        const data  = JSON.parse( info )

        this.historial = data.historial
    }
}

module.exports = Busquedas