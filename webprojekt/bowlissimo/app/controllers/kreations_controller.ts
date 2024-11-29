import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db" // Import für Datenbankzugriffe

export default class KreationsController {

    public async neue_kreation({ session, response, request }: HttpContext) {
        //Wenn Nutzer eine Nudelsorte auswählt, wird eine neue Kreation erstellt
        const nudelsorte = request.input('nudelsorte')

        //Überprüfen, ob schon eine aktuelle Kreation existiert
        const aktuelle_kreation = await db.from('kreation').where('session_id', session.sessionId).andWhere('status', 'nicht_warenkorb')
        console.log(aktuelle_kreation)

        //Wenn nicht, dann neue Kreation erstellen
        if (aktuelle_kreation.length === 0) {
            console.log('neue Kreation')
        await db.table('kreation')
                .insert({ pasta_id: nudelsorte,
                          id: Math.abs(Math.floor(Math.random() * 1_000_000)),
                          status: "nicht_warenkorb",
                          preis: 5.99,
                          session_id: session.sessionId,
                })
        } else {
            //Wenn schon eine Kreation existiert, dann nur die Nudelsorte updaten
            await db.from('kreation')
                    .where('session_id', session.sessionId)
                    .andWhere('status', 'nicht_warenkorb')
                    .update({ pasta_id: nudelsorte })
        }
       
        // Weiterführen auf die Seite, wo Nutzer herkommt -> Session abfragen, ob Nutzer angemeldet oder nicht
        return response.redirect ('/')
    }

    //Wenn Nutzer eine Soße auswählt, wird die Kreation aktualisiert
    public async update_kreation_sosse({ session, response, request }: HttpContext) {
        const sossensorte = request.input('sossensorte')

        //Überprüfen, ob schon eine aktuelle Kreation existiert -> sprich, ob schon Nudelsorte ausgewählt wurde
        const aktuelle_kreation = await db.from('kreation')
                                          .where('session_id', session.sessionId)
                                          .andWhere('status', 'nicht_warenkorb')
                                          .first()

        if (!aktuelle_kreation) {
            //Wenn keine Kreation existiert, dann ist es nicht möglich, eine Soße auszuwählen
            return response.redirect('/')
        } else {
            //Aktuelle Kreation updaten
            await db.from('kreation')
                  .where('session_id', session.sessionId)
                  .andWhere('status', 'nicht_warenkorb')
                  .update({ sossen_id: sossensorte })

            // Weiterführen auf die Seite, wo Nutzer herkommt -> Session abfragen, ob Nutzer angemeldet oder nicht
            return response.redirect('/')
        }
    }

    public async update_kreation_topping({ session, response, request }: HttpContext) {
        //Ausgewähltes Topping abrufen
        const topping = request.input('toppingsorte')

        //Überprüfen, ob schon eine aktuelle Kreation existiert -> sprich, ob schon Nudelsorte ausgewählt wurde
        const aktuelle_kreation = await db.from('kreation')
                                          .where('session_id', session.sessionId)
                                          .andWhere('status', 'nicht_warenkorb')
                                          .first()
        
        if (!aktuelle_kreation) {
            //Wenn keine Kreation existiert, dann ist es nicht möglich, ein Topping auszuwählen
            return response.redirect('/')
        } 
        else {
            //Überprüfen, ob das Topping schon in der Kreation vorhanden ist
              //Dafür aktuelle kreartion_id abrufen
                const kreation_id = await db.from('kreation')
                                            .where('session_id', session.sessionId)
                                            .andWhere('status', 'nicht_warenkorb')
                                            .select('id')
                                            .first()
            // kreation_id im falschen Format '{"id":117367}' -> nur die Zahl wird benötigt
            const kreation_id_format = kreation_id.id
            
            const topping_existiert = await db.from('kreation_toppings')
                                              .where('kreation_id', kreation_id_format)
                                              .andWhere('topping_id', topping)

                //-> Wenn Topping noch nicht in Kreation vorhanden ist, dann wird es hinzugefügt
                 if (topping_existiert.length === 0) {                          
                    //Topppings und Kreationen werden in Tabelle Kreation_toppings verknüpft
                    //In Tabelle speichern
                        await db.table('kreation_toppings')
                                .insert({ topping_id: topping,
                                          kreation_id: kreation_id_format
                      })
                    }
                    else {
                    //Wenn Topping schon in Kreation vorhanden ist, dann wird es gelöscht
                        await db.from('kreation_toppings')
                                .where('kreation_id', kreation_id_format)
                                .andWhere('topping_id', topping)
                                .delete()
                    }
        
        // Weiterführen auf die Seite, wo Nutzer herkommt -> Session abfragen, ob Nutzer angemeldet oder nicht
        return response.redirect('/')
            }
    }
        }