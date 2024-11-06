/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import db from "@adonisjs/lucid/services/db"

router.get('/startseite_pasta', async ({ view }) => {
  const pasta = await db.from('pasta').select('*')  //Datenabfrage einzeln, so leichter in der view
  const soßen = await db.from('soßen').select('*')
  const toppings = await db.from('toppings').select('*')
  return view.render('startseite', {pasta, soßen, toppings}) 
})

router.get('/startseite_drinks', async ({ view }) => {
  const smoothies = await db.from('getränke').select('*').where('art', 1)
  const erfrischungsgetränke = await db.from('getränke').select('*').where('art', 2)
  const alkoholfreie_getränke = await db.from('getränke').select('*').where('art', 3)
  return view.render('startseite_drinks', { smoothies, erfrischungsgetränke, alkoholfreie_getränke })
})

router.get('/startseite_beilagen', async ({ view }) => {
  const salate = await db.from('beilagen').select('*').where('art', 1)
  const suppen = await db.from('beilagen').select('*').where('art', 2)
  return view.render('startseite_beilagen', { salate, suppen })
})

//Dynamische Route für die Detailsseite von Pasta, Soßen, Toppings Getränke und Beilagen 
router.get('/details/:kategorie/:id', async ({ view, params }) => {
  const { kategorie, id } = params; // Kategorie und ID ausparams extrahieren -> category und id jeweils als eigene Konstanten definiert 

  // Erlaubte Kategorien und die zugehörigen Tabellennamen als "Nachschlagewerk" für die Datenbank
  const erlaubteKategorien = {
    pasta: 'pasta',
    soße: 'soßen',
    toppings: 'toppings',
    getränke: 'getränke',
    beilagen: 'beilagen'
  };

  // Überprüfung, ob die Kategorie gültig ist
  const Tabellenname = erlaubteKategorien[kategorie]; // Tabellenname aus dem Nachschlagewerk holen
  if (!Tabellenname) {
    return view.render('errors/not-found'); // Fehler wenn die Kategorie nicht existiert
  }

  // Abruf des Produkts basierend auf Tabelle und ID
  const produkt = await db.select('*')
                          .from(Tabellenname)
                          .where('id', id)
                          .first();
   
  // Überprüfung, ob das Produkt existiert
  if (!produkt) {
    return view.render('errors/not-found'); // Falls das Produkt nicht gefunden wird
  }

  return view.render('detailansicht', { produkt, kategorie }); // Produkt und Kategorie an die View übergeben
});

