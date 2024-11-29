import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db"

export default class WarenkorbsController {

  // Warenkorb anzeigen
    public async warenkorb({ view, session }: HttpContext) {

      //alle id der warenkorb_bestellung abrufen, welche zur session gehört -> Liste von warenkorb_bestellung-Einträgen zurückgeben, die der session_id entsprechen
      const warenkorb_bestellungen = await db.from('warenkorb_bestellung').where('session_id', session.sessionId).select('*');

      //alle ausgewaehleten produkte abrufen, welche zu der warenkorb_bestellung gehören
        //Id der warenkorb_bestellung abrufen
        const warenkorb_bestellung_ids = warenkorb_bestellungen.map((warenkorb_bestellung) => warenkorb_bestellung.id);
        //zuürck bekommt man liste mit allen ids, die zur session gehören
        const ausgewaehlte_produkte = [];
        for (const id of warenkorb_bestellung_ids) {
          const produkte = await db.from('ausgewaehltes_produkt').where('warenkorb_id', id).select('*');
          ausgewaehlte_produkte.push(...produkte);
        }
          
      // Gesamtbetrag berechnen
        const gesamtbetrag = ausgewaehlte_produkte.reduce((summe, produkt) => summe + produkt.preis, 0);

      return view.render('pages/warenkorb', { ausgewaehlte_produkte, gesamtbetrag });
    } 


  // Produkt hinzufügen
      public async hinzufuegen({ response, session, params }: HttpContext) {
          const { oberkategorie, produkt } = params;

          //Preis des Produktes abrufen
          const preis = await db.from(oberkategorie).where('id', produkt).select('preis').first();
           //Preis ist jetzt im falschen Format: { preis: 4.5 }, muss geändert werden:
          const preis_format = preis.preis;
          
          //neuen Warenkorb erstellen, wenn noch nicht vorhanden, sonst den bestehenden Warenkorb abrufen
          let warenkorb = await db.from('warenkorb_bestellung').where('session_id', session.sessionId).first();

          if (!warenkorb) {
            await db.table('warenkorb_bestellung')
                    .insert({session_id: session.sessionId,
                            in_bestellung: false,
                            id: Math.abs(Math.floor(Math.random() * 1_000_000)) // Generate ID in JS
                    })
                } else {
          
           // Überprüfen, ob das Produkt bereits im Warenkorb ist
             const vorhandenes_produkt = await db.from('ausgewaehltes_produkt').where('produkt', produkt).andWhere('warenkorb_id', warenkorb.id).first();                   
              
             if (vorhandenes_produkt) {
                // Menge des vorhandenen Produkts erhöhen
                await db.from('ausgewaehltes_produkt').where('produkt', produkt).update({ menge: vorhandenes_produkt.menge + 1 });
              } else {


          //neue Warenkorbsposition erstellen mit neuer ID
            //warenkorb_bestellung.id abrufen
            const warenkorb_bestellung_id = await db.from('warenkorb_bestellung').where('session_id', session.sessionId).select('id').first();
            // warenkorbposition_id ist jetzt im falschen Format: { id: 421608 }, muss geändert werden:
            const warenkorb_bestellung_id_format  = warenkorb_bestellung_id.id;

          //Produkt in ausgewähltes_produkt speichern
            await db.table('ausgewaehltes_produkt')
                  .insert({produkt: produkt,
                           preis: preis_format,
                           id: Math.abs(Math.floor(Math.random() * 1_000_000)), // Generate ID in JS
                           warenkorb_id: warenkorb_bestellung_id_format,
                           menge: 1
                  })
                } }
           
          //Zu Warenkorb
          return response.redirect('/warenkorb');
      } 

 // Produktmenge updaten
      public async update ({ response, session, request, params }: HttpContext) {
          const { produkt } = params
          const { menge } = request.all()

          //In warenkorb_bestellung id abrufen mit aktueller session 
          const warenkorb_bestellung_id = await db.from('warenkorb_bestellung').where('session_id', session.sessionId).select('id').first();
          // warenkorbposition_id ist jetzt im falschen Format: { id: 421608 }, muss geändert werden:
          const warenkorb_bestellung_id_format  = warenkorb_bestellung_id.id;

          //In ausgewaehltes_produkt steht aktuelle Menge
          await db.from('ausgewaehltes_produkt').where('warenkorb_id', warenkorb_bestellung_id_format).andWhere('produkt', produkt)
                  .update({menge: menge
                           });

          //Zu Warenkorb
          return response.redirect('/warenkorb');
      }

 // Produkt löschen
      public async entfernen ({ response, session, params }: HttpContext) {
          const { produkt } = params

          //In warenkorb_bestellung id abrufen mit aktueller session 
          const warenkorb_bestellung_id = await db.from('warenkorb_bestellung').where('session_id', session.sessionId).select('id').first();
          // warenkorbposition_id ist jetzt im falschen Format: { id: 421608 }, muss geändert werden:
          const warenkorb_bestellung_id_format  = warenkorb_bestellung_id.id;

          //Produkt aus ausgewaehltes_produkt löschen
          await db.from('ausgewaehltes_produkt').where('warenkorb_id', warenkorb_bestellung_id_format).andWhere('produkt', produkt).delete();

          //Zu Warenkorb
          return response.redirect('/warenkorb');
      }
    }
    
