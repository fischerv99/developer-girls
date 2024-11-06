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

router.get('/startseite/drinks', async ({ view }) => {
  const smoothies = await db.from('getränke').select('*').where('art', 1)
  const erfrischungsgetränke = await db.from('getränke').select('*').where('art', 2)
  const alkoholfreie_getränke = await db.from('getränke').select('*').where('art', 3)
  return view.render('startseite_drinks', { smoothies, erfrischungsgetränke, alkoholfreie_getränke })
})

router.get('/startseite/beilagen', async ({ view }) => {
  const salate = await db.from('beilagen').select('*').where('art', 1)
  const suppen = await db.from('beilagen').select('*').where('art', 2)
  return view.render('startseite_beilagen', { salate, suppen })
})

//Dynamische Route für die Detailsseite von Pasta, Soßen, Toppings Getränke und Beilagen 
router.get('/details/:kategorie/:id', async ({ view, params }) => {
  const { kategorie, id } = params; // Kategorie und ID ausparams extrahieren -> category und id jeweils als eigene Konstanten definiert 

  const Tabellenname = kategorie; // Tabellenname definieren nach Kategorie

  // Abruf des Produkts basierend auf Tabelle und ID
  const produkt = await db.from(Tabellenname)
                          .select('*')
                          .where('id', id)
                          .first();
   
  // Überprüfung, ob das Produkt existiert
  if (!produkt) {
    return view.render('errors/not-found'); // Falls das Produkt nicht gefunden wird
  }

  return view.render('detailansicht', { produkt, kategorie }); // Produkt und Kategorie an die View übergeben
});


//Anmelden im Administratorbereich
router.get('/administratorbereich_login', async ({ view }) => {
  return view.render('administratorbereich_login')
})

router.post('/administratorbereich_login', async ({ request, response }) => {
  const { nutzername, passwort } = request.only(['nutzername', 'passwort']) //Nutzername und Passwort aus dem Request holen und in einzelnen Konstanten speichern
  const administrator = await db.from('administrator').where('administrator_id', nutzername).first() //Administrator aus der Datenbank holen

  if (!administrator || administrator.passwort !== passwort) { //Falls der Administrator nicht existiert oder das Passwort falsch ist
    return response.redirect('administratorbereich_login') //Zurück zum Login
  }
  else {
    return response.redirect('administratorbereich') //Weiter zum Administratorbereich
  }
})

//der Administratorbereich
router.get('/administratorbereich/pasta', async ({ view }) => {
  const pasta = await db.from('pasta').select('*')  //Datenabfrage einzeln, so leichter in der view
  const soßen = await db.from('soßen').select('*')
  const toppings = await db.from('toppings').select('*')
  return view.render('administratorbereich', { pasta, soßen, toppings })
})

router.get('/administratorbereich/drinks', async ({ view }) => {
  const getränke = await db.from('getränke').select('*')  //Datenabfrage einzeln, so leichter in der view
  return view.render('administratorbereich_drinks', { getränke })
})

router.get('/administratorbereich/beilagen', async ({ view }) => {
  const beilagen = await db.from('beilagen').select('*')  //Datenabfrage einzeln, so leichter in der view
  return view.render('administratorbereich_beilagen', { beilagen })
})