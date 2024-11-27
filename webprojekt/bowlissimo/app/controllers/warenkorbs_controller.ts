import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db"

export default class WarenkorbsController {

  // Warenkorb anzeigen
    public async warenkorb({ view, session }: HttpContext) {

      //alle id der warenkorb_bestellung abrufen, welche zur session gehört -> Liste von warenkorb_bestellung-Einträgen zurückgeben, die der session_id entsprechen
      const warenkorb_bestellungen = await db.from('warenkorb_bestellung').where('session_id', session.sessionId).select('*');

      //alle warenkorbspositionen abrufen, welche zu der warenkorb_bestellung gehört
      let alle_warenkorbspositionen: any[] = [];
        for (const bestellung of warenkorb_bestellungen) {
          const warenkorbspositionen = await db.from('warenkorbsposition').where('warenkorb_bestellung_id', bestellung.id).select('*');
          alle_warenkorbspositionen = alle_warenkorbspositionen.concat(warenkorbspositionen); }

      //alle ausgewaehleten produkte abrufen, welche zu der warenkorbsposition gehören
      let alle_ausgewaehlten_produkte: any [] = [];
        for (const position of alle_warenkorbspositionen) {
          const ausgewaehlte_produkte = await db.from('ausgewaehltes_produkt').where('warenkorbsposition_id', position.id).select('*');
          alle_ausgewaehlten_produkte = alle_ausgewaehlten_produkte.concat(ausgewaehlte_produkte); } 
          
      //Um die Menge gut anzeigen zu können: elle_ausgewaehlten_produkte mit der Menge aus warenkorbspositionen verknüpfen
      for (const produkt of alle_ausgewaehlten_produkte) {
        const warenkorbsposition = await db.from('warenkorbsposition').where('id', produkt.warenkorbsposition_id).select('menge').first();
        if (warenkorbsposition) {
          produkt.menge = warenkorbsposition.menge;
        } }
          
          // Gesamtbetrag berechnen
          const gesamtbetrag = alle_ausgewaehlten_produkte.reduce((summe, produkt) => summe + produkt.preis, 0);

      return view.render('pages/warenkorb', { alle_ausgewaehlten_produkte, alle_warenkorbspositionen, gesamtbetrag });
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
          }
          
           // Überprüfen, ob das Produkt bereits im Warenkorb ist
           const vorhandene_position = await db.from('warenkorbsposition')
                                               .join('ausgewaehltes_produkt', 'warenkorbsposition.id', 'ausgewaehltes_produkt.warenkorbsposition_id')
                                               .where('warenkorbsposition.warenkorb_bestellung_id', warenkorb.id)
                                               .where('ausgewaehltes_produkt.produkt', produkt)
                                               .select('warenkorbsposition.id', 'warenkorbsposition.menge')
                                               .first();

            if (vorhandene_position) {
                // Menge des vorhandenen Produkts erhöhen
                await db.from('warenkorbsposition').where('id', vorhandene_position.id).update({ menge: vorhandene_position.menge + 1 });
              } else {


          //neue Warenkorbsposition erstellen mit neuer ID
            //warenkorb_bestellung.id abrufen
            const warenkorb_bestellung_id = await db.from('warenkorb_bestellung').where('session_id', session.sessionId).select('id').first();
            // warenkorbposition_id ist jetzt im falschen Format: { id: 421608 }, muss geändert werden:
            const warenkorb_bestellung_id_format  = warenkorb_bestellung_id.id;

            await db.table('warenkorbsposition')
                    .insert({id: Math.abs(Math.floor(Math.random() * 1_000_000)), // Generate ID in JS
                          warenkorb_bestellung_id: warenkorb_bestellung_id_format, 
                          menge: 1
                  })

          //Produkt in ausgewähltes_produkt speichern
            //Warekorbposition.id abrufen
            const warenkorbsposition_id = await db.from('warenkorbsposition').where('warenkorb_bestellung_id', warenkorb_bestellung_id_format).select('id').first();
            //warenkorbposition_id ist jetzt im falschen Format: { id: 421608 }, muss geändert werden:
            const warenkorbsposition_id_format  = warenkorbsposition_id.id;

            await db.table('ausgewaehltes_produkt')
                  .insert({produkt: produkt,
                           preis: preis_format,
                           id: Math.abs(Math.floor(Math.random() * 1_000_000)), // Generate ID in JS
                           warenkorbsposition_id: warenkorbsposition_id_format
                  })
                }
           
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

          //In warenkorbsposition steht aktuelle Menge
          await db.from('warenkorbsposition').where('warenkorb_bestellung_id', warenkorb_bestellung_id_format)
                  .update({menge: menge
                           });

          //Zu Warenkorb
          return response.redirect('/warenkorb');
      }

 // Produkt löschen
      }
    
