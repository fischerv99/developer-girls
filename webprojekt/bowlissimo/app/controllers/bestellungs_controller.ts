import type { HttpContext } from '@adonisjs/core/http'

export default class BestellungsController {
    public async kasse ({  }: HttpContext) {
        //Überprüfen, ob Nutzer angemeldet ist mit der session
        //wenn ja soll Zahlungsinfos etc. schon ausgefüllt sein

        //Wenn nicht, dann kann er als Kunde bestellen
        
    }
}