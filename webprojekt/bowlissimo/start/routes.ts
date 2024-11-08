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

router.on('/').render('pages/startseite_pasta')

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


<<<<<<< HEAD
  router.get('/warenkorb', async ({ view, session }) => { 
    const cartItems = session.get('cartItems', []); // Warenkorb-Items aus der Session abrufen, falls vorhanden
  
    // Gesamtpreis berechnen (Beispiel: Preis je Produkt x Menge):
    const totalPrice = cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  
    return view.render('warenkorb', { cartItems, totalPrice });
  });

  
=======
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



// Administratorbereich: Route zum Hinzufügen eines neuen Produkts
router.get('/administratorbereich/hinzufügen/:kategorie', ({view, params}) => { //kategorie = pasta, soßen, toppings, getränke, beilagen
  const { kategorie } = params;
  return view.render('administratorbereich_hinzufügen', { kategorie });  // Rendert die Seite mit dem Formular zum Hinzufügen
});

// POST-Route zum Speichern des neuen Produkts in der Datenbank
router.post('/administratorbereich/hinzufügen/:kategorie', async ({request, response, params}) => {
  const { kategorie } = params;
  const { name, image_url } = request; //Hier muss noch alles abgefragt werden, was in der Datenbank gespeichert werden soll

  let query = '';
  if (kategorie === 'pasta') {
    query = 'INSERT INTO pasta (name, image_url) VALUES (?, ?)';
  } else if (kategorie === 'sauce') {
    query = 'INSERT INTO sauce (name, image_url) VALUES (?, ?)';
  } else if (kategorie === 'topping') {
    query = 'INSERT INTO topping (name, image_url) VALUES (?, ?)';
  } else {
    return response.status(400).send('Invalid category');
  }

  // Führe die Abfrage aus, um das Produkt in die richtige Tabelle einzufügen
  db.run(query, [name, image_url], function (err) {
    if (err) {
      return response.status(500).send(err.message);
    }
    return response.redirect('/administratorbereich/:kategorie');  // Nach dem Speichern wird zur Startseite zurückgeleitet
  });
});

>>>>>>> 83638a8cfc4d949d089ac9c5f3e3f16ae276e372
