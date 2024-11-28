import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db"


export default class ProduktesController {
    public async start({ view, session }: HttpContext) {
        const pasta = await db.from('pasta').select('*')
        const soßen = await db.from('saucen').select('*')
        const toppings = await db.from('toppings').select('*')

  //Anzahl der Produkte im Warenkorb berechnen

   // View rendern und Daten übergeben
  return view.render('pages/startseite_pasta', { pasta, soßen, toppings })
}

public async startseite_pasta({ view, session }: HttpContext) {
  const pasta = await db.from('pasta').select('*')
  const soßen = await db.from('saucen').select('*')
  const toppings = await db.from('toppings').select('*')

  //Aktuelle Kreation anzeigen
  const aktuelle_kreation = await db.from('kreation')
                                    .where('session_id', session.sessionId )
                                    .where('status', 'nicht_warenkorb')
                                    .first()
  console.log(aktuelle_kreation)

  //Alle ids speichern der Pasta
  //Alle ids speichern der Soßen
  
  //Zugehörige Toppings der Kreation abrufen
    //Dazu zugehörige kreation_id abrufen
  const aktuelle_kreation_id = aktuelle_kreation.id

  const kreation_toppings = await db.from('kreation_toppings')
                                    .where('kreation_id', aktuelle_kreation_id)
                                    .select('*')
  
  //Alle ids speichern der Toppings


    //Anzahl der Produkte im Warenkorb berechnen

  return view.render('pages/startseite_pasta', { pasta, soßen, toppings})
}

public async startseite_getraenke({ view }: HttpContext) {
  const smoothies = await db.from('getraenke').select('*').where('art', 'smoothie')
  const erfrischungsgetränke = await db.from('getraenke').select('*').where('art', 'erfrischungsgetraenk')
  const alkoholfreie_getränke = await db.from('getraenke').select('*').where('art', 'cocktail')

  return view.render('pages/startseite_drinks', { smoothies, erfrischungsgetränke, alkoholfreie_getränke })
}

public async startseite_beilagen({ view }: HttpContext) {
  const salate = await db.from('beilagen').select('*').where('art', 'salat')
  const suppen = await db.from('beilagen').select('*').where('art', 'suppe')

  return view.render('pages/startseite_beilagen', { salate, suppen })
}

public async details({ view, params }: HttpContext) {
   // Kategorie und ID aus params extrahieren
  const { kategorie, id } = params;
  // Dynamische Tabelle basierend auf der Kategorie wählen
  const produkt = await db.from(kategorie).where('id', id).first();         
  // Falls das Produkt nicht gefunden wird
  if (!produkt) {
    return view.render('errors/not-found'); 
  }
  // Wenn das Produkt gefunden wurde, wird es an die View übergeben
  return view.render('pages/detailansicht', { produkt, kategorie });
}

}
