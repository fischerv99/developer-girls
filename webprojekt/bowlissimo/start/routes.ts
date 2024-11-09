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

router.get('/startseite_pasta', async ({ view, session }) => {
  const pasta = await db.from('pasta').select('*')  //Datenabfrage einzeln, so leichter in der view
  const soßen = await db.from('soßen').select('*')
  const toppings = await db.from('toppings').select('*')

   // Abrufen der Warenkorb-Items und Zählen der Anzahl
   const cartItems = session.get('cartItems', []);
   const cartCount = cartItems.length; // Anzahl der Warenkorb-Items ermitteln

   return view.render('startseite', { pasta, soßen, toppings, cartCount });
});

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
  const pasta = await db.from('pasta').select('*')  
  const soßen = await db.from('soßen').select('*')
  const toppings = await db.from('toppings').select('*')
  return view.render('administratorbereich', { pasta, soßen, toppings })
})

router.get('/administratorbereich/drinks', async ({ view }) => {
  const smoothies = await db.from('getränke').select('*').where('art', 1) 
  const erfrischungsgetränke = await db.from('getränke').select('*').where('art', 2)
  const alkoholfreie_cocktails = await db.from('getränke').select('*').where('art', 3)
  return view.render('administratorbereich_drinks', { smoothies, erfrischungsgetränke, alkoholfreie_cocktails })
})

router.get('/administratorbereich/beilagen', async ({ view }) => {
  const salate = await db.from('beilagen').select('*').where('art', 1) 
  const suppen = await db.from('beilagen').select('*').where('art', 2)
  return view.render('administratorbereich_beilagen', { salate, suppen })
})



// Administratorbereich: Route zum Hinzufügen eines neuen Produkts
router.get('/administratorbereich/hinzufügen/:oberkategorie/:unterkategorie', ({view, params}) => { //oberkategorie = pasta, soßen, toppings, getränke, beilagen
  const { oberkategorie, unterkategorie } = params;
  return view.render('administratorbereich_hinzufügen', {oberkategorie, unterkategorie});  // Rendert die Seite mit dem Formular zum Hinzufügen
});

// POST-Route zum Speichern des neuen Produkts in der Datenbank
router.post('/administratorbereich/hinzufügen/:oberkategorie/:unterkategorie', async ({request, response, params}) => {
  let { oberkategorie, unterkategorie } = params;

  //erst noch if-abfrage möglich, ob felder leer sind (undefined und null) 

  //Unterkategorie bestimmen
  if (unterkategorie === 'smoothies' || unterkategorie === 'salate') {
    unterkategorie = 1;
  } else if (unterkategorie === 'erfrischungsgetränke' || unterkategorie === 'suppen') {
    unterkategorie = 2;
  }
  else if (unterkategorie === 'alkoholfreie_getränke') {
    unterkategorie = 3;
  }

  //Speichern des neuen Produkts in der Datenbank
  if(oberkategorie === 'pasta') {
  const neuesProdukt = await db.table(oberkategorie) //oberkategorie = pasta
                               .insert({id: request.input('name'), 
                                        name: request.input('name'), 
                                        inhalte: request.input('inhalte'), 
                                        ernaehrungsform: request.input('ernaehrungsform'),
                                        kalorien_pro_100g: request.input('kalorien_pro_100g'),
                                        menge_pro_bowl: request.input('menge_pro_bowl'),
                                        kalorien_pro_portion: request.input('kalorien_pro_portion'),
                                        art: unterkategorie
                                       });
  } else {
    const neuesProdukt = await db.table(oberkategorie) //oberkategorie = soßen, toppings, getränke, beilagen
                                 .insert({id: request.input('name'), 
                                        name: request.input('name'), 
                                        inhalte: request.input('inhalte'), 
                                        ernaehrungsform: request.input('ernaehrungsform'),
                                        kalorien_pro_100g: request.input('kalorien_pro_100g'),
                                        menge_pro_bowl: request.input('menge_pro_bowl'),
                                        kalorien_pro_portion: request.input('kalorien_pro_portion'),
                                        preis: request.input('preis'), //bei pasta wird dieser eintrag nicht benötigt
                                        art: unterkategorie
                                    });
  }

  return response.redirect(`/administratorbereich/oberkategorie}`); // Weiterleitung zur Übersichtsseite der Kategorie
});


//Login-Seite:
// Registrierung
router.get('/register', async ({ view }) => {
  return view.render('register');
});

// Registrierung verarbeiten
router.post('/register', async ({ request, response }) => {
  const { nutzername, passwort } = request.only(['nutzername', 'passwort']);

  // Neuen Benutzer in die Datenbank einfügen
  await db.table('users').insert({ nutzername, passwort });
  return response.redirect('/login');
});

// Login-Seite anzeigen
router.get('/login', async ({ view }) => {
  return view.render('login');
});

// Login verarbeiten
router.post('/login', async ({ request, response, session }) => {
  const { nutzername, passwort } = request.only(['nutzername', 'passwort']);

  // Benutzer in der Datenbank suchen
  const user = await db.from('users').where({ nutzername }).first();

  if (!user || user.passwort !== passwort) {
    return response.redirect('/login'); // Bei falschen Anmeldedaten zurück zum Login
  }

  // Benutzersitzung erstellen
  session.put('user_id', user.id);
  return response.redirect('/favoriten'); // Weiterleitung zur Favoriten-Seite
});

// Favoriten-Seite anzeigen (nur eingeloggt)
router.get('/favoriten', async ({ view, session, response }) => {
  const userId = session.get('user_id');
  if (!userId) {
    // Weiterleitung zur Login-Seite, falls nicht eingeloggt
    return response.redirect('/login');
  }
  
  const favorites = await db.from('favorites').where('user_id', userId);
  return view.render('favoriten', { favorites });
}); // Hier gehen wir sicher, dass nur eingeloggt benutzer auf favoriten seite zugreifen können



// Logout
router.get('/logout', async ({ session, response }) => {
  session.forget('user_id');
  return response.redirect('/');
});


  


//Warenkorb-Seite:
// Route für den Warenkorb
router.get('/warenkorb', async ({ view, session }) => {
  // Warenkorb-Items aus der Session abrufen, falls vorhanden
  const cartItems = session.get('cartItems', []);

  // Gesamtpreis berechnen
const totalPrice = cartItems.reduce((total: number, item: { price: number, quantity: number }) => total + (item.price * item.quantity), 0);

return view.render('warenkorb', { cartItems, totalPrice });
});


// Route zum Hinzufügen eines Produkts zum Warenkorb
router.post('/warenkorb/add', async ({ request, session, response }) => {
  const { productid, quantity } = request.only(['productid', 'quantity']);

  const product = await db.from('pasta').where('id', productid).first() ||
                  await db.from('soßen').where('id', productid).first() ||
                  await db.from('toppings').where('id', productid).first() ||
                  await db.from('getränke').where('id', productid).first() ||
                  await db.from('beilagen').where('id', productid).first();

  if (!product) {
    session.flash({ error: 'Produkt nicht gefunden' });
    return response.redirect('back');
  }

  // Warenkorb-Items aus der Session abrufen
  const cartItems = session.get('cartItems', []);

  // Hinzufügen des Produkts zum Warenkorb
  cartItems.push({ ...product, quantity });
  
  // Warenkorb in der Session speichern
  session.put('cartItems', cartItems);
  return response.redirect('/warenkorb');
});