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


<<<<<<< HEAD
=======
  router.get('/warenkorb', async ({ view, session }) => { 
    const cartItems = session.get('cartItems', []); // Warenkorb-Items aus der Session abrufen, falls vorhanden
  
    // Gesamtpreis berechnen (Beispiel: Preis je Produkt x Menge):
    const totalPrice = cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  
    return view.render('warenkorb', { cartItems, totalPrice });
  });

  
>>>>>>> 98908d8de514af3dc76e3ede452b0a9a3fb33e89
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
router.get('/administratorbereich/hinzufügen/:oberkategorie/:unterkategorie', ({view, params}) => { //oberkategorie = pasta, soßen, toppings, getränke, beilagen
  const { oberkategorie, unterkategorie } = params;
  return view.render('administratorbereich_hinzufügen', {oberkategorie, unterkategorie});  // Rendert die Seite mit dem Formular zum Hinzufügen
});

// POST-Route zum Speichern des neuen Produkts in der Datenbank
router.post('/administratorbereich/hinzufügen/:oberkategorie/:unterkategorie', async ({request, response, params}) => {
  const { oberkategorie, unterkategorie } = params;

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

<<<<<<< HEAD


//Warenkorb-Seite:
// Route für den Warenkorb
router.get('/warenkorb', async ({ view, session }) => {
  // Warenkorb-Items aus der Session abrufen, falls vorhanden
    const cartItems = session.get('cartItems', []);
  
    // Logge die cartItems, um zu sehen, ob sie korrekt gefüllt sind
    console.log(cartItems);
  
    // Gesamtpreis berechnen
    const totalPrice = cartItems.reduce((total: number, item: any) => {
      // Stelle sicher, dass 'price' und 'quantity' existieren
      console.log(item); // Hier kannst du das Produkt sehen
      return total + (item.price * item.quantity);
    }, 0);
  
    return view.render('warenkorb', { cartItems, totalPrice });
  });

// Route zum Hinzufügen eines Produkts zum Warenkorb
router.post('/warenkorb/add', async ({ request, session, response }) => {
  const { productId, quantity } = request.only(['productId', 'quantity']);

  // Produktinformationen abrufen
  const product = await db.from('produkte').where('id', productId).first();

  if (!product) {
    return response.redirect('back').with('error', 'Produkt nicht gefunden');
  }

  // Warenkorb-Items aus der Session abrufen und aktualisieren
  const cartItems = session.get('cartItems', []);
  cartItems.push({ ...product, quantity });

  session.put('cartItems', cartItems);
  return response.redirect('/warenkorb');
});
=======
   //Speichern des neuen Produkts in der Datenbank
   const neuesProdukt = await db.table(oberkategorie) //oberkategorie = pasta, soßen, toppings, getränke, beilagen
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

  return response.redirect('/administratorbereich/:oberkategorie'); // Weiterleitung zur Übersichtsseite der Kategorie
>>>>>>> 98908d8de514af3dc76e3ede452b0a9a3fb33e89
