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

router.get('/', async ({ view, session }) => {
  const pasta = await db.from('pasta').select('*')
  const soßen = await db.from('soßen').select('*')
  const toppings = await db.from('toppings').select('*')

  const cartItems = session.get('cartItems', [])
  const cartCount = cartItems.length

  return view.render('pages/startseite_pasta', { pasta, soßen, toppings, cartCount })
})

router.get('/startseite_pasta', async ({ view, session }) => {
  const pasta = await db.from('pasta').select('*')
  const soßen = await db.from('soßen').select('*')
  const toppings = await db.from('toppings').select('*')

  const cartItems = session.get('cartItems', [])
  const cartCount = cartItems.length

  return view.render('pages/startseite_pasta', { pasta, soßen, toppings, cartCount })
})


router.get('/startseite_drinks', async ({ view }) => {
  const smoothies = await db.from('getränke').select('*').where('art', 1)
  const erfrischungsgetränke = await db.from('getränke').select('*').where('art', 2)
  const alkoholfreie_getränke = await db.from('getränke').select('*').where('art', 3)

  return view.render('pages/startseite_drinks', { smoothies, erfrischungsgetränke, alkoholfreie_getränke })
})

router.get('/startseite_beilagen', async ({ view }) => {
  const salate = await db.from('beilagen').select('*').where('art', 1)
  const suppen = await db.from('beilagen').select('*').where('art', 2)
  return view.render('pages/startseite_beilagen', { salate, suppen })
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

  return view.render('pages/detailansicht', { produkt, kategorie }); // Produkt und Kategorie an die View übergeben
});

  
//Anmelden im Administratorbereich
router.get('/administratorbereich_login', async ({ view }) => {
  return view.render('pages/administratorbereich_login')
})

router.post('/administratorbereich_login2', async ({ request, response, view }) => {
  const nutzername = request.input('nutzername');
  const passwort = request.input('passwort'); //Nutzername und Passwort aus dem Request holen und in einzelnen Konstanten speichern

  const administrator = await db.from('administrator').where('administrator_id', nutzername).first() //Administrator aus der Datenbank holen

  if(request.input('nutzername') === undefined || request.input('passwort') === undefined) { 
    const error = 'Formular-Fehler'
    return view.render('pages/administratorbereich_login', {error})
  }

  if(request.input('nutzername') === null || request.input('passwort') === null) { 
    const error = 'Bitte alle Felder ausfüllen'
    return view.render('pages/administratorbereich_login', {error}) 
  }

  if (!administrator || administrator.passwort !== passwort) { //Falls der Administrator nicht existiert oder das Passwort falsch ist
    const error = 'Falsche Anmeldedaten'
    return view.render('pages/administratorbereich_login', {error}) //Zurück zum Login
  }
  else {
    return view.render('pages/administratorbereich_pasta') //Weiter zum Administratorbereich aber warum geht nicht return response redirect???
  }
})

//der Administratorbereich
router.get('/administratorbereich/pasta', async ({ view }) => {
  const pasta = await db.from('pasta').select('*')  
  const soßen = await db.from('soßen').select('*')
  const toppings = await db.from('toppings').select('*')
  return view.render('pages/administratorbereich_pasta', { pasta, soßen, toppings })
})

router.get('/administratorbereich/drinks', async ({ view }) => {
  const smoothies = await db.from('getränke').select('*').where('art', 1) 
  const erfrischungsgetränke = await db.from('getränke').select('*').where('art', 2)
  const alkoholfreie_cocktails = await db.from('getränke').select('*').where('art', 3)
  return view.render('pages/administratorbereich_drinks', { smoothies, erfrischungsgetränke, alkoholfreie_cocktails })
})

router.get('/administratorbereich/beilagen', async ({ view }) => {
  const salate = await db.from('beilagen').select('*').where('art', 1) 
  const suppen = await db.from('beilagen').select('*').where('art', 2)
  return view.render('pages/administratorbereich_beilagen', { salate, suppen })
})



// Administratorbereich: Route zum Hinzufügen eines neuen Produkts
router.get('/administratorbereich/hinzufügen/:oberkategorie/:unterkategorie', ({view, params}) => { //oberkategorie = pasta, soßen, toppings, getränke, beilagen und unterkategorie=
  const { oberkategorie, unterkategorie } = params;
  return view.render('pages/administratorbereich_hinzufügen', {oberkategorie, unterkategorie});  // Rendert die Seite mit dem Formular zum Hinzufügen
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
    await db.table(oberkategorie) //oberkategorie = pasta
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
    await db.table(oberkategorie) //oberkategorie = soßen, toppings, getränke, beilagen
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

  return response.redirect(`pages/administratorbereich/oberkategorie}`); // Weiterleitung zur Übersichtsseite der Kategorie
});

// Administratorbereich: Route zum Bearbeiten eines Produkts
router.get('/administratorbereich/bearbeiten/:oberkategorie/:id', async ({ view, params }) => {
  const { oberkategorie, id } = params; // Kategorie und ID aus params extrahieren

  const produkt = await db.from(oberkategorie).where('id', id).first(); // Produkt aus der Datenbank holen

  if (!produkt) {
    return view.render('errors/not-found'); // Falls das Produkt nicht gefunden wird
  }

  return view.render('pages/administratorbereich_bearbeiten', { produkt, oberkategorie }); // Produkt und Kategorie an die View übergeben
});


//Login-Seite:
// Registrierung
router.get('/register', async ({ view }) => {
  return view.render('pages/register');
});

// Registrierung verarbeiten
router.post('/register', async ({ request, response }) => {
  const { nutzername, passwort } = request.only(['nutzername', 'passwort']);

  // Neuen Benutzer in die Datenbank einfügen
  await db.table('users').insert({ nutzername, passwort });
  return response.redirect('pages/login');
});

// Login-Seite anzeigen
router.get('/login', async ({ view }) => {
  return view.render('pages/login');
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
  return view.render('pages/favoriten', { favorites });
}); // Hier gehen wir sicher, dass nur eingeloggt benutzer auf favoriten seite zugreifen können



// Logout
router.get('/logout', async ({ session, response }) => {
  session.forget('user_id');
  return response.redirect('pages/');
});


  


//Warenkorb-Seite:
// Route für den Warenkorb
router.get('/warenkorb', async ({ view, session }) => {
  // Warenkorb-Items aus der Session abrufen, falls vorhanden
  const cartItems = session.get('cartItems', []);

  // Gesamtpreis berechnen
const totalPrice = cartItems.reduce((total: number, item: { price: number, quantity: number }) => total + (item.price * item.quantity), 0);

return view.render('pages/warenkorb', { cartItems, totalPrice });
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
  return response.redirect('pages/warenkorb');
});


//Route für Datenschutz
router.get('/datenschutz', async ({ view }) => {
  return view.render('pages/datenschutz')
})

//Route für Impressum
router.get('/impressum', async ({ view }) => {
  return view.render('pages/impressum')
})