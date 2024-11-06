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
  const pasta = await db.from('pasta').select('*')
  const soßen = await db.from('soßen').select('*')
  const toppings = await db.from('toppings').select('*')
  return view.render('startseite', {pasta, soßen, toppings}) 
})

router.get('/startseite_drinks', async ({ view }) => {
  const getränke = await db.from('getränke').select('*')
  return view.render('startseite_drinks', { getränke })
})

router.get('/startseite_beilagen', async ({ view }) => {
  const beilagen = await db.from('beilagen').select('*') 
  return view.render('startseite_beilagen', { beilagen })
})

//Dynamische Route für die Detailsseite von Pasta, Soßen, Toppings getränke und beilagen 
router.get('/details/:kategorie/:id', async ({ view, params }) => {
  const { kategorie, id } = params; // Kategorie und ID ausparams extrahieren -> category und id jeweils als eigene Konstanten definiert 

  // Erlaubte Kategorien und die zugehörigen Tabellennamen als "Nachschlagewerk" für die Datenbank
  const erlaubteKategorien = {
    pasta: 'pasta',
    soße: 'soße',
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

