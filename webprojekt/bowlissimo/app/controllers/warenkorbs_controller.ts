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

        //Array für alle Produkte, die im Warenkorb liegen und keine Bowl sind 
        const ausgewaehlte_produkte = [];
        for (const id of warenkorb_bestellung_ids) {
            const produkte = await db.from('ausgewaehltes_produkt').where('warenkorb_id', id)
                                                                   .andWhere('produkt', 'NOT LIKE', '%0%')
                                                                   .andWhere('produkt', 'NOT LIKE', '%1%')
                                                                   .andWhere('produkt', 'NOT LIKE', '%2%')
                                                                   .andWhere('produkt', 'NOT LIKE', '%3%')
                                                                   .andWhere('produkt', 'NOT LIKE', '%4%')
                                                                   .andWhere('produkt', 'NOT LIKE', '%5%')
                                                                   .andWhere('produkt', 'NOT LIKE', '%6%')
                                                                   .andWhere('produkt', 'NOT LIKE', '%7%')
                                                                   .andWhere('produkt', 'NOT LIKE', '%8%')
                                                                   .andWhere('produkt', 'NOT LIKE', '%9%')
                                                                   .select('*'); 
        //alle Produkte in ein Array pushen
        ausgewaehlte_produkte.push(...produkte); 
        console.log(ausgewaehlte_produkte)
      }

        //Array für alle Bowls, die im Warenkorb liegen
        const ausgewaehlte_produkte_bowl = [];
        for (const id of warenkorb_bestellung_ids) {
            const produkte = await db.from('ausgewaehltes_produkt').where('warenkorb_id', id).andWhere('produkt', '>', 0).select('*'); //andWhere('produkt', '>', 0) -> nur Produkte , die Zahl haben
          //alle Produkte in ein Array pushen
          ausgewaehlte_produkte_bowl.push(...produkte); 
        }
          
          //Array für alle Kreationen, die im Warenkorb liegen
          const kreationen = []; 

          //Inhalte dieser Bowl sollen angezeigt werden
            //Dafür Kreation_id jeder Kreation in ausgewaehlte Proddukte
          const kreation_ids = ausgewaehlte_produkte_bowl.map(ausgewaehltes_produkt => ausgewaehltes_produkt.produkt);
          //kreation_ids ist ein Array mit allen Kreation_ids
           //Jede id durchlaufen und die Kreationen abrufen
          for (const kreation_id of kreation_ids) {
              const kreation = await db.from('kreation').where('id', kreation_id).first();
              if (kreation) {
                  kreationen.push(kreation);
              }
          //Ergebnis kreationen ist ein Array mit allen Kreationen, die favorisiert wurden: [{id: 1, pasta.id: 'Spagetti', ...}, ...]
          //Jetzt soll zu jeder Kreation die Toppings abgerufen werden
          //Dafür die kreation_toppings tabelle mit den ids der einzelnen favorisierten Kreationen durchlaufen und die Toppings abrufen
          for (const kreation of kreationen) {
              const toppings_der_einzelnen_kreation = await db.from('kreation_toppings').where('kreation_id', kreation.id);
              //Ergebnis toppings_der_einzelnen_kreation ist ein Array mit allen Toppings der Kreation: [{kreation_id: 1, topping_id: 1, ...}, ...]
              //Nur die Topping-IDs interessieren und sollen in die Kreation eingefügt werden
              const topping_ids = toppings_der_einzelnen_kreation.map(topping => topping.topping_id);
              //topping_ids ist ein Array mit allen Topping-IDs der favorisierten Kreation
              kreation.toppings = topping_ids;

              //Jeder kreation in Kreationen soll der Preis der kreation hinzugefügt werden
              const kreation_preis = await db.from('ausgewaehltes_produkt').where('produkt', kreation.id).select('preis');
              //Ergebnis kreation_preis ist ein Array mit den Preisen der Kreation: [{preis: '10'}, ...]
              //Nur der Preis interessiert und soll in die Kreation eingefügt werden
              const kreation_preis_string = kreation_preis.map(preis => preis.preis);
              //kreation_preis_string ist ein Array mit dem Namen der favorisierten Kreation
               kreation.preis = kreation_preis_string;

              //Jeder kreation in Kreationen soll die menge der kreation hinzugefügt werden
              const kreation_menge = await db.from('ausgewaehltes_produkt').where('produkt', kreation.id).select('menge');
             //Ergebnis kreation_menge ist ein Array mit dem Namen der Kreation: [{menge: '1'}, ...]
             //Nur der Name interessiert und soll in die Kreation eingefügt werden
             const kreation_menge_string = kreation_menge.map(menge => menge.menge);
             //kreation_name_string ist ein Array mit dem Namen der favorisierten Kreation
             kreation.menge = kreation_menge_string;
      
              console.log(kreation)
          }
 
}
          
      // Gesamtbetrag berechnen
      let gesamtpreis = ausgewaehlte_produkte.reduce((total, produkt) => {
        return total + (produkt.preis * produkt.menge);
    }, 0);
    
    gesamtpreis += kreationen.reduce((total, kreation) => {
        return total + (kreation.preis * kreation.menge);
    }, 0);

      return view.render('pages/warenkorb', { ausgewaehlte_produkte, gesamtpreis, kreationen });
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

            //neues ausgewaehltes Produkt erstellen mit neuer ID
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

           //Wenn eine Kreation hinzugefügt wird muss status geandert ewrden
            if (oberkategorie === 'kreation') {
              await db.from("kreation")
                        .where("session_id", session.sessionId)
                        .andWhere("status", "nicht_warenkorb")
                        .update({ status: "im_warenkorb"})
            }

          //Zu Warenkorb
          return response.redirect('/warenkorb');

                } else {
            //Also wenn bereits ein Warenkorb_Bestellung eintrag in der session vorhanden ist
           // Überprüfen, ob das Produkt bereits im Warenkorb ist
             const vorhandenes_produkt = await db.from('ausgewaehltes_produkt').where('produkt', produkt).andWhere('warenkorb_id', warenkorb.id).first();                   
              
             if (vorhandenes_produkt) {
                // Menge des vorhandenen Produkts erhöhen
                await db.from('ausgewaehltes_produkt').where('produkt', produkt).update({ menge: vorhandenes_produkt.menge + 1 });
              } else {


          //neues ausgewaehltes Produkt erstellen mit neuer ID
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
           //Wenn eine Kreation hinzugefügt wird muss status geandert ewrden
            if (oberkategorie === 'kreation') {
              await db.from("kreation")
                        .where("session_id", session.sessionId)
                        .andWhere("status", "nicht_warenkorb")
                        .update({ status: "im_warenkorb"})
            }

          //Zu Warenkorb
          return response.redirect('/warenkorb');
      } 

  // Menge erhöhen
    async erhoehen({ params, session, response }: HttpContext) {
      const produktId = params.produkt;
      
      //Menge des Produktes erhöhen in der Datenbank ausgewaehltes_produkt
      const produkt = await db.from('ausgewaehltes_produkt').where('produkt', produktId).first();

      await db.from('ausgewaehltes_produkt').where('produkt', produktId).update({ menge: produkt.menge + 1 });

      return response.redirect('/warenkorb'); // Zurück zur Warenkorb-Seite
    }

  // Menge verringern
    async verringern({ params, session, response }: HttpContext) {
      const produktId = params.produkt;
  
      const produkt = await db.from('ausgewaehltes_produkt').where('produkt', produktId).first();
      await db.from('ausgewaehltes_produkt').where('produkt', produktId).update({ menge: produkt.menge - 1 });

      return response.redirect('/warenkorb'); // Zurück zur Warenkorb-Seite

    }

    // Produkt löschen
    async entfernen({ params, session, response }: HttpContext) {
      const produktId = params.produkt;
    
      // Produkt aus der Datenbank löschen
      await db.from('ausgewaehltes_produkt').where('produkt', produktId).delete();
    
      return response.redirect('/warenkorb'); // Zurück zur Warenkorb-Seite
    }
  }
