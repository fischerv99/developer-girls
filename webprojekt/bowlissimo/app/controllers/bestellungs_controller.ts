import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db" // Import für Datenbankzugriffe

export default class BestellungsController {
    public async kasse ({ session, view }: HttpContext) {
        //Überprüfen, ob Nutzer angemeldet ist mit der session
        if (!session.get('kunde')) {
            //Wenn nicht, dann kann er als Kunde bestellen
            return view.render('pages/kasse', { angemeldet: false })
           
        } else {
            //wenn ja soll Zahlungsinfos etc. schon ausgefüllt sein
            //dazu Infos über Kunde aus der db holen
            const kunden_id = session.get('kunde')
            const kunde = await db.from('kunden_angemeldet').where('kunden_id', kunden_id).first()
            return view.render('pages/kasse', { angemeldet: true, kunde })
        }
        
    }

    public async bestellen_als_gast ({ request, view, session }: HttpContext) {

        const vorname = request.input('vorname')
        const nachname = request.input('nachname')
        const strasse_nr = request.input('strasse_nr')
        const postleitzahl = request.input('postleitzahl')
        const stadt = request.input('stadt')
        const mail = request.input('mail')
        const bezahlart = request.input('bezahlart')
        const kunde_id = Math.random().toString(36).substr(2, 9) //Zufällige kunden_id generieren

        //Daten werden in der db für gast_kunden gespeichert
        await db.table('gast_kunden').insert({
            vorname, nachname, strasse_nr, postleitzahl, stadt, mail, bezahlart, kunde_id
        })

        //In der Datenbank warenkorb_bestellung vermerken, dass diese Bestellung abgeschlossen wird
        await db.from('warenkorb_bestellung')
                .where('session_id', session.sessionId)
                .update({in_bestellung: 1,
        })
        
        return view.render('pages/dankeseite', {vorname})

}

    public async bestellen ({ view, request, session, params }: HttpContext) {
        const { nutzername } = params

        //Daten werden in der db bei kunden_angemeldet gespeichert -> falls Nutzer was ändert wird es gespeichert
    const vorname = request.input('vorname')
    const nachname = request.input('nachname')
    const strasse_nr = request.input('strasse_nr')
    const postleitzahl = request.input('postleitzahl')
    const stadt = request.input('stadt')
    const mail = request.input('mail')
    const bezahlart = request.input('bezahlart')

    await db.from('kunden_angemeldet')
            .where('kunden_id', nutzername)
            .update({
                vorname, nachname, strasse_nr, postleitzahl, stadt, mail, bezahlart
            })
    
    //In der Datenbank warenkorb_bestellung vermerken, dass diese Bestellung abgeschlossen wird
    await db.from('warenkorb_bestellung')
    .where('session_id', session.sessionId)
    .update({in_bestellung: 1,
})

        return view.render('pages/dankeseite')
        }
    }