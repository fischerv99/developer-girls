import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db"
import CartCleanupService from '../services/clean.ts' // Importiere den Bereinigungsservice
import { Console } from 'console'



export default class ProduktesController {

public async startseite_pasta({ view, session }: HttpContext) {
  // Bereinigungsservice starten
  new CartCleanupService()  // Bereinigung wird im Hintergrund ausgeführt

  // Session-ID prüfen und setzen (03.12.Evy)
  if (!session.get('sessionId')) {
      session.put('sessionId', session.sessionId);
  }
    console.log("Session ID: ",session.sessionId);

  this.setSessionStart(session); // Startzeit setzen
  this.trackLastActivity(session, 'startseite_pasta'); // Letzte Aktivität und besuchte Seite tracken

  //Schauen ob nutzer angemeldet ist 
  //prüft, ob ein Kunde angemeldet ist, und speichert das Ergebnis als true oder false in der Variablen kundeAngemeldet.
  const kundeAngemeldet = session.get('kunde') !== undefined;

  // Produkte aus der Datenbank
  const pasta = await db.from('pasta').select('*')
  const soßen = await db.from('saucen').select('*')
  const toppings = await db.from('toppings').select('*')

      // Abrufen der Städte-Daten aus der Datenbank
      const cities = await db.from('cities').select('City', 'Postcodes')

  //Aktuelle Anzahl der Produkte im Warenkorb berechnen
    //Dazu Warenkorb_id extrahieren
      const warenkorb_id = await db.from('warenkorb_bestellung')
                                   .where('session_id', session.sessionId)
                                   .first()
  if (warenkorb_id) {
  const anzahl_warenkorb_abrufen = await db.from('ausgewaehltes_produkt')
                                  .where('warenkorb_id', warenkorb_id.id)
                                  .count('*')
    //console.log(anzahl_warenkorb_abrufen)
  //ergebnis ist im falschen format: { 'count(*)': 5 }
  const anzahl_warenkorb = anzahl_warenkorb_abrufen[0]['count(*)'];

  session.put('anzahlWarenkorb', anzahl_warenkorb); // Anzahl der Produkte speichern
  this.logSessionState(session); // Session-Zustand ausgeben

  //Aktuelle Kreation anzeigen                                
  const aktuelle_kreation = await db.from('kreation')
                                    .where('session_id', session.sessionId)
                                    .where('status', 'nicht_warenkorb')
                                    .first();

  //Wenn keine Kreation vorhanden ist, wird die View normal gerendert
  console.log("cities 1", cities);
  if (!aktuelle_kreation) {
    return view.render('pages/startseite_pasta', { pasta, soßen, toppings, anzahl_warenkorb, kundeAngemeldet, cities })
  } else {
    //Wenn eine Kreation vorhanden ist (es ist auf jeden Fall Pastasorte gewählt), wird diese angezeigt
      //id der Pasta speichern 
        const aktuelle_pasta_id = aktuelle_kreation.pasta_id
      //Pasta speichern
      const aktuelle_pasta = await db.from('pasta').where('id', aktuelle_pasta_id).first()

      //Wenn keine Soße gewählt wurde, wird die View gerendert
      if (aktuelle_kreation.sossen_id === 0) { //Länge überprüfen und nicht mit ob vorhnaden, da es auch sein kann, dass Soße gewählt wurde und dann wieder entfernt wurde
        return view.render('pages/startseite_pasta', { pasta, soßen, toppings, aktuelle_pasta, aktuelle_kreation, anzahl_warenkorb, kundeAngemeldet })

      } else {
        //Wenn Pasta und Soße gewählt wurden, werden diese angezeigt  
          //id der Soßen speichern
             const aktuelle_soße_id = aktuelle_kreation.sossen_id
          //Soße speichern
            const aktuelle_soße = await db.from('saucen').where('id', aktuelle_soße_id).first()


          //Zugehörige Toppings der Kreation abrufen -> Überprüfen ob Toppings gewählt wurden
           //Dazu zugehörige kreation_id abrufen
              const aktuelle_kreation_id = aktuelle_kreation.id

              const kreation_toppings = await db.from('kreation_toppings')
                                                .where('kreation_id', aktuelle_kreation_id)
                                                .select('*')
              console.log(kreation_toppings)
              
              //Wenn keine Toppings gewählt wurden, wird die View gerendert
              if (kreation_toppings.length == 0) { //Länge überprüfen und nicht ob vorhanden, da es auch sein kann, dass Toppings gewählt wurden und dann wieder entfernt wurden
                return view.render('pages/startseite_pasta', { pasta, soßen, toppings, aktuelle_pasta, aktuelle_soße, aktuelle_kreation, anzahl_warenkorb,kundeAngemeldet })
              } else {
                //Wenn Toppings gewählt wurden, werden diese angezeigt
                  //Alle ids der ausgewählten Toppings speichern
                  const aktuelle_toppings_ids = kreation_toppings.map((topping) => topping.topping_id);
                  //Ergebnis ist im Format: [ Chilli, Tofu, Pilze]
                  console.log(aktuelle_toppings_ids)
                  //Toppings speichern
                    const aktuelle_toppings = await db.from('toppings')
                                                      .whereIn('id', aktuelle_toppings_ids)
                                                      .select('*')
                console.log(cities);
                return view.render('pages/startseite_pasta', { pasta, soßen, toppings, aktuelle_pasta, aktuelle_soße, aktuelle_toppings_ids, cities, aktuelle_toppings, aktuelle_kreation, anzahl_warenkorb, kundeAngemeldet })
  } } } } else {

  const anzahl_warenkorb = 0;

  //Aktuelle Kreation anzeigen                                
  const aktuelle_kreation = await db.from('kreation')
                                    .where('session_id', session.sessionId)
                                    .where('status', 'nicht_warenkorb')
                                    .first();

  //Wenn keine Kreation vorhanden ist, wird die View normal gerendert
  if (!aktuelle_kreation) {
    return view.render('pages/startseite_pasta', { pasta, soßen, toppings, anzahl_warenkorb, kundeAngemeldet })
  } else {
    //Wenn eine Kreation vorhanden ist (es ist auf jeden Fall Pastasorte gewählt), wird diese angezeigt
      //id der Pasta speichern 
        const aktuelle_pasta_id = aktuelle_kreation.pasta_id
      //Pasta speichern
      const aktuelle_pasta = await db.from('pasta').where('id', aktuelle_pasta_id).first()

      //Wenn keine Soße gewählt wurde, wird die View gerendert
      if (aktuelle_kreation.sossen_id === 0) { //Länge überprüfen und nicht mit ob vorhnaden, da es auch sein kann, dass Soße gewählt wurde und dann wieder entfernt wurde
        return view.render('pages/startseite_pasta', { pasta, soßen, toppings, aktuelle_pasta, aktuelle_kreation, anzahl_warenkorb, kundeAngemeldet })

      } else {
        //Wenn Pasta und Soße gewählt wurden, werden diese angezeigt  
          //id der Soßen speichern
             const aktuelle_soße_id = aktuelle_kreation.sossen_id
          //Soße speichern
            const aktuelle_soße = await db.from('saucen').where('id', aktuelle_soße_id).first()


          //Zugehörige Toppings der Kreation abrufen -> Überprüfen ob Toppings gewählt wurden
           //Dazu zugehörige kreation_id abrufen
              const aktuelle_kreation_id = aktuelle_kreation.id

              const kreation_toppings = await db.from('kreation_toppings')
                                                .where('kreation_id', aktuelle_kreation_id)
                                                .select('*')
              
              //Wenn keine Toppings gewählt wurden, wird die View gerendert
              if (kreation_toppings.length == 0) { //Länge überprüfen und nicht ob vorhanden, da es auch sein kann, dass Toppings gewählt wurden und dann wieder entfernt wurden
                return view.render('pages/startseite_pasta', { pasta, soßen, toppings, aktuelle_pasta, aktuelle_soße, aktuelle_kreation, anzahl_warenkorb, kundeAngemeldet })
              } else {
                //Wenn Toppings gewählt wurden, werden diese angezeigt
                  //Alle ids der ausgewählten Toppings speichern
                  const aktuelle_toppings_ids = kreation_toppings.map((topping) => topping.topping_id); 
                  //Ergebnis ist im Format: [ Chilli, Tofu, Pilze]
                  console.log(aktuelle_toppings_ids)
                  //Toppings speichern
                    const aktuelle_toppings = await db.from('toppings')
                                                      .whereIn('id', aktuelle_toppings_ids)
                                                      .select('*')

                return view.render('pages/startseite_pasta', { 
                  pasta, 
                  soßen, 
                  toppings, 
                  aktuelle_pasta, 
                  aktuelle_soße, 
                  aktuelle_toppings, 
                  aktuelle_kreation, 
                  anzahl_warenkorb, 
                  kundeAngemeldet, 
                  aktuelle_toppings_ids, 
                  cities
                })
              }
              
            } 
} } }

public async startseite_getraenke({ view, session }: HttpContext) {
  this.setSessionStart(session); // Startzeit setzen
  this.trackLastActivity(session, 'startseite_getraenke'); // Letzte Aktivität und besuchte Seite tracken

  //Überprüfen ob kunde angemeldet 
  const kundeAngemeldet = session.get('kunde') !== undefined;

  const smoothies = await db.from('getraenke').select('*').where('art', 'smoothie')
  const erfrischungsgetränke = await db.from('getraenke').select('*').where('art', 'erfrischungsgetraenk')
  const alkoholfreie_getränke = await db.from('getraenke').select('*').where('art', 'cocktail')

  //Aktuelle Anzahl der Produkte im Warenkorb berechnen
    //Dazu Warenkorb_id extrahieren
    const warenkorb_id = await db.from('warenkorb_bestellung')
                                 .where('session_id', session.sessionId)
                                 .first()
    if (warenkorb_id) {
    const anzahl_warenkorb_abrufen = await db.from('ausgewaehltes_produkt')
                                             .where('warenkorb_id', warenkorb_id.id)
                                             .count('*')
      //console.log(anzahl_warenkorb_abrufen)
    //ergebnis ist im falschen format: { 'count(*)': 5 }
    const anzahl_warenkorb = anzahl_warenkorb_abrufen[0]['count(*)'];

    session.put('anzahlWarenkorb', anzahl_warenkorb);
    this.logSessionState(session);
  
    return view.render('pages/startseite_drinks', { smoothies, erfrischungsgetränke, alkoholfreie_getränke, anzahl_warenkorb, kundeAngemeldet })
    } else {
      const anzahl_warenkorb = 0;
      return view.render('pages/startseite_drinks', { smoothies, erfrischungsgetränke, alkoholfreie_getränke, anzahl_warenkorb, kundeAngemeldet })
    }
}

public async startseite_beilagen({ view, session }: HttpContext) {
  this.setSessionStart(session); // Startzeit setzen
  this.trackLastActivity(session, 'startseite_beilagen'); // Letzte Aktivität und besuchte Seite tracken

  //Überprüfen ob kunde angemeldet
  const kundeAngemeldet = session.get('kunde') !== undefined;

  const salate = await db.from('beilagen').select('*').where('art', 'salat')
  const suppen = await db.from('beilagen').select('*').where('art', 'suppe')
  
  //Aktuelle Anzahl der Produkte im Warenkorb berechnen
    //Dazu Warenkorb_id extrahieren
    const warenkorb_id = await db.from('warenkorb_bestellung')
                                 .where('session_id', session.sessionId)
                                 .first()
    if (warenkorb_id) {
    const anzahl_warenkorb_abrufen = await db.from('ausgewaehltes_produkt')
                                             .where('warenkorb_id', warenkorb_id.id)
                                             .count('*')
      //console.log(anzahl_warenkorb_abrufen)
    //ergebnis ist im falschen format: { 'count(*)': 5 }
    const anzahl_warenkorb = anzahl_warenkorb_abrufen[0]['count(*)'];

    session.put('anzahlWarenkorb', anzahl_warenkorb);
    this.logSessionState(session);

    return view.render('pages/startseite_beilagen', { salate, suppen, anzahl_warenkorb, kundeAngemeldet })
    } else {
      const anzahl_warenkorb = 0;
      return view.render('pages/startseite_beilagen', { salate, suppen, anzahl_warenkorb, kundeAngemeldet })
    }
}

public async details({ view, params, session }: HttpContext) {
   // Kategorie und ID aus params extrahieren
  const { kategorie, id } = params;
  // Dynamische Tabelle basierend auf der Kategorie wählen
  const produkt = await db.from(kategorie).where('id', id).first();         
  // Falls das Produkt nicht gefunden wird
  if (!produkt) {
    return view.render('errors/not-found'); 
  }

  this.setSessionStart(session); // Startzeit setzen
  this.trackLastActivity(session, 'details'); // Letzte Aktivität und besuchte Seite tracken
  this.logProductSelection(session, id, kategorie); // Produkt protokollieren


  this.logSessionState(session);

  // Wenn das Produkt gefunden wurde, wird es an die View übergeben
  return view.render('pages/detailansicht', { produkt, kategorie });
}

// Beim ersten Aufruf einer Seite wird der Startzeitpunkt der Session in der Session gespeichert (03.12.Evy)
private setSessionStart(session: HttpContext['session']) {
  if (!session.get('sessionStartTime')) {
    const now = new Date().toISOString();
    session.put('sessionStartTime', now);
    console.log(`Session gestartet: ${now}`);
  }
}

// Letzten Aktivität des Besuchers speichern (03.12.Evy)
private trackLastActivity(session: HttpContext['session'], page: string) {
  // Hol vorhandene Seiten aus der Session oder initialisiere mit einem leeren Array
  const activities: string[] = session.get('visitedPages') || [];

  // Seite hinzufügen, wenn sie noch nicht in der Liste ist
  if (!activities.includes(page)) {
    activities.push(page);
    session.put('visitedPages', activities);
  }
}

//Produkte aus dem Warenkorb ausgeben
private logProductSelection(session: HttpContext['session'], productId: number, category: string) {
  const products = session.get('selectedProducts') || [];
  products.push({ productId, category, timestamp: new Date().toISOString() });
  session.put('selectedProducts', products);

  console.log(`Produkt ausgewählt: ${productId} in Kategorie ${category}`);
  this.logSessionState(session);
}

// Session-Daten vollständig ausgeben
private logSessionState(session: HttpContext['session']) {
  const sessionState = {
    sessionId: session.get('sessionId'),
    sessionStartTime: session.get('sessionStartTime'),
    visitedPages: session.get('visitedPages') || [],
    selectedProducts: session.get('selectedProducts') || [],
    anzahlWarenkorb: session.get('anzahlWarenkorb') || 0, // Anzahl der Produkte im Warenkorb

  }
    console.log('Aktueller Session-Zustand:', sessionState)
}

}