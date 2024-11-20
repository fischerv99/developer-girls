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
import hash from '@adonisjs/core/services/hash'

router.get('/', async ({ view, session }) => {
  const pasta = await db.from('pasta').select('*')
  const soßen = await db.from('saucen').select('*')
  const toppings = await db.from('toppings').select('*')


  // Neue Session-ID generieren, falls noch keine vorhanden ist
  //Zufällige Session-ID mit 36 Zeichen und ohne 0 und 1 erstellen
  //if (!session.get('sessionId')) {
    //session.put('sessionId', Math.random().toString(36).substring(2)); 
  //}

  // Session in die Datenbank speichern
  //await db.table('session').insert({ session_id: session.get('sessionId'),
                                     //erstellt_am: new Date(),
  // });


  // Anzahl der Produkte im Warenkorb berechnen
  const cartItems = session.get('cartItems', [])
  const cartCount = cartItems.length

  return view.render('pages/startseite_pasta', { pasta, soßen, toppings, cartCount })
})

router.get('/startseite_pasta', async ({ view, session }) => {
  const pasta = await db.from('pasta').select('*')
  const soßen = await db.from('saucen').select('*')
  const toppings = await db.from('toppings').select('*')

  const cartItems = session.get('cartItems', [])
  const cartCount = cartItems.length

  return view.render('pages/startseite_pasta', { pasta, soßen, toppings, cartCount })
})


router.get('/startseite_drinks', async ({ view }) => {
  const smoothies = await db.from('getraenke').select('*').where('art', 1)
  const erfrischungsgetränke = await db.from('getraenke').select('*').where('art', 2)
  const alkoholfreie_getränke = await db.from('getraenke').select('*').where('art', 3)

  return view.render('pages/startseite_drinks', { smoothies, erfrischungsgetränke, alkoholfreie_getränke })
})

router.get('/startseite_beilagen', async ({ view }) => {
  const salate = await db.from('beilagen').select('*').where('art', 1)
  const suppen = await db.from('beilagen').select('*').where('art', 2)

  return view.render('pages/startseite_beilagen', { salate, suppen })
})

// Detailansicht für ein Produkt
router.get('/details/:kategorie/:id', async ({ view, params }) => {
  const { kategorie, id } = params; // Kategorie und ID aus params extrahieren

  // Dynamische Tabelle basierend auf der Kategorie wählen
  const produkt = await db.from(kategorie)  // Hier wird die Tabelle dynamisch auf Basis der Kategorie gewählt
                         .where('id', id)   // Filtert nach der ID
                         .first();         // Gibt das erste (und einzige) Ergebnis zurück

  // Falls das Produkt nicht gefunden wird
  if (!produkt) {
    return view.render('errors/not-found'); 
  }

  // Wenn das Produkt gefunden wurde, wird es an die View übergeben
  return view.render('pages/detailansicht', { produkt, kategorie });
});


//Anmelden im Administratorbereich
router.get('/administratorbereich_login', async ({ view }) => {
  return view.render('pages/administratorbereich_login')
})

router.post('/administratorbereich_login', async ({ request, response, view }) => {
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
    return response.redirect('administratorbereich/pasta') //Weiter zum Administratorbereich 
  }
})

//der Administratorbereich
router.get('/administratorbereich/pasta', async ({ view }) => {
  const pasta = await db.from('pasta').select('*')  
  const soßen = await db.from('saucen').select('*')
  const toppings = await db.from('toppings').select('*')
  return view.render('pages/administratorbereich_pasta', { pasta, soßen, toppings })
})

router.get('/administratorbereich/drinks', async ({ view }) => {
  const smoothies = await db.from('getraenke').select('*').where('art', 1) 
  const erfrischungsgetränke = await db.from('getraenke').select('*').where('art', 2)
  const alkoholfreie_cocktails = await db.from('getraenke').select('*').where('art', 3)
  return view.render('pages/administratorbereich_drinks', { smoothies, erfrischungsgetränke, alkoholfreie_cocktails })
})

router.get('/administratorbereich/beilagen', async ({ view }) => {
  const salate = await db.from('beilagen').select('*').where('art', 1) 
  const suppen = await db.from('beilagen').select('*').where('art', 2)
  return view.render('pages/administratorbereich_beilagen', { salate, suppen })
})



// Administratorbereich: Route zum Hinzufügen eines neuen Produkts
router.get('/administratorbereich/hinzufuegen/:oberkategorie/:unterkategorie', ({view, params}) => { //oberkategorie = pasta, soßen, toppings, getränke, beilagen und unterkategorie=
  const { oberkategorie, unterkategorie } = params;
  return view.render('pages/administratorbereich_hinzufügen', {oberkategorie, unterkategorie});  // Rendert die Seite mit dem Formular zum Hinzufügen
});

// POST-Route zum Speichern des neuen Produkts in der Datenbank
router.post('/administratorbereich/hinzufuegen/:oberkategorie/:unterkategorie', async ({request, response, params}) => {
  
  let { oberkategorie } = params;
  let { unterkategorie } = params;

  //Unterkategorie bestimmen
  if (unterkategorie === 'smoothie' || unterkategorie === 'salat') {
    unterkategorie = 1;
  } else if (unterkategorie === 'erfrischungsgetraenk' || unterkategorie === 'suppe') {
    unterkategorie = 2;
  }
  else if (unterkategorie === 'cocktail') {
    unterkategorie = 3;
  }
  else {
    unterkategorie = unterkategorie; //wie sonst??
  }

  //Bild 
  const bild = request.input('bild');

  //Speichern des neuen Produkts in der Datenbank
  if(oberkategorie === 'pasta') {
    await db.table(oberkategorie) //oberkategorie = pasta
            .insert({id: request.input('name'), 
                     inhalte: request.input('inhalte'), 
                     ernaehrungsform: request.input('ernaehrungsform'),
                     kalorien_pro_100me: request.input('kalorien_pro_100me'),
                     portionsgroesse: request.input('portionsgroesse'),
                     kalorien_pro_portion: request.input('kalorien_pro_portion'),
                     bild: bild,
                     });

  }  else {
    await db.table(oberkategorie) //oberkategorie = soßen, toppings, getränke, beilagen
            .insert({id: request.input('name'), 
                     inhalte: request.input('inhalte'), 
                     ernaehrungsform: request.input('ernaehrungsform'),
                     kalorien_pro_100me: request.input('kalorien_pro_100me'),
                     portionsgroesse: request.input('portionsgroesse'),
                     kalorien_pro_portion: request.input('kalorien_pro_portion'),
                     preis: request.input('preis'), //bei pasta wird dieser eintrag nicht benötigt
                     art: unterkategorie,
                     bild: bild,
                    });
  }

  return response.redirect('/administratorbereich/pasta');

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

//Administratorbereich: POST-Route zum Speichern der Änderungen
router.post('/administratorbereich/bearbeiten/:oberkategorie/:id', async ({ request, response, params }) => {
  const { oberkategorie, id } = params; // Kategorie und ID aus params extrahieren

//Request-Daten speichern
const name = request.input('produkt_id');
const bild = request.input('produkt_bild');
const beschreibung = request.input('produkt_beschreibung');
const inhalte = request.input('produkt_inhalte');
const allergene = request.input('produkt_allergene');
const ernaehrungsform = request.input('produkt_ernaehrungsform');
const kalorien_pro_100me = request.input('produkt_kalorien_pro_100me');
const portionsgroesse = request.input('produkt_portionsgroesse');
const kalorien_pro_portion = request.input('produkt_kalorien_pro_portion');

if (oberkategorie != 'pasta') {
  const preis = request.input('produkt_preis');
}

//Produkt in der Datenbank aktualisieren-> stimmt glaube ich noch nicht ganz
if (oberkategorie === 'pasta') {
  await db.from(oberkategorie)
          .where('id', id)
          .update({name, bild, beschreibung, inhalte, allergene, ernaehrungsform, kalorien_pro_100me, portionsgroesse, kalorien_pro_portion});
}
else {
  await db.from(oberkategorie)
          .where('id', id)
          .update({name, bild, beschreibung, inhalte, allergene, ernaehrungsform, kalorien_pro_100me, portionsgroesse, kalorien_pro_portion});

}

});




// Registrierung
router.get('/register', async ({ view }) => {
  return view.render('pages/register');
});

// Registrierung verarbeiten
router.post('/register', async ({ request, response, view }) => {

  // Formulardaten aus dem Request holen
  const vorname = request.input('vorname')
  const nachname = request.input('nachname') 
  const strasse_nr = request.input('strasse_nr')
  const postleitzahl = request.input('postleitzahl')
  const stadt = request.input('stadt')
  const mail = request.input('email')
  const bezahlart = request.input('bezahlart')
  const nutzername = request.input('nutzername')

  // Passwort hashen
  const passwort = request.input('passwort');
  const hashedPasswort = await hash.make(passwort);
 

  // Neuen Benutzer in die Datenbank einfügen
  try {
  await db.table('kunden_angemeldet').insert({vorname: vorname, 
                                       nachname: nachname, 
                                       strasse_nr: strasse_nr, 
                                       postleitzahl:postleitzahl, 
                                       stadt: stadt,
                                       mail: mail,
                                       bezahlart: bezahlart,
                                       kunden_id: nutzername,
                                       passwort_hash: hashedPasswort
          });
      } catch  { 
          const error = 'Fehler beim Speichern des Benutzers'
          return view.render('pages/register', {error}) 
      }

  // Weiterleitung zur Login-Seite
  return response.redirect('/login');
});


// Login-Seite anzeigen
router.get('/login', async ({ view }) => {
  return view.render('pages/login');
});

// Login verarbeiten
router.post('/login', async ({ request, view, response }) => {
  const nutzername = request.input('nutzername');
  const passwort = request.input('passwort');

  // Benutzer in der Datenbank suchen
  const kunde = await db.from('kunden_angemeldet').where({kunden_id: nutzername}).first();

  // Benutzername und Passwort überprüfen
  if(request.input('nutzername') === undefined || request.input('passwort') === undefined) { 
    const error = 'Formular-Fehler'
    return view.render('pages/login', {error})
  }

  if(request.input('nutzername') === null || request.input('passwort') === null) { 
    const error = 'Bitte alle Felder ausfüllen'
    return view.render('pages/login', {error}) 
  }

  if (!kunde || kunde.passwort_hash !== passwort) { 
    const error = 'Falsche Anmeldedaten'
    return view.render('pages/login', {error}) 
  }
  else {
    return response.redirect('/startseite/kunde/Pasta') //Weiterleitung noch überarbeiten
  }
})

//Startseite für eingeloggte Kunden
router.get('/startseite/:kunde/Pasta', async ({ view,  }) => {
  const pasta = await db.from('pasta').select('*')
  const soßen = await db.from('saucen').select('*')
  const toppings = await db.from('toppings').select('*')

  return view.render('pages/kunde_pasta', { pasta, soßen, toppings })
})


router.get('/startseite/:kunde/Drinks', async ({ view }) => {
  const smoothies = await db.from('getraenke').select('*').where('art', 1)
  const erfrischungsgetränke = await db.from('getraenke').select('*').where('art', 2)
  const alkoholfreie_getränke = await db.from('getraenke').select('*').where('art', 3)

  return view.render('pages/kunde_drinks', { smoothies, erfrischungsgetränke, alkoholfreie_getränke })
})

router.get('/startseite/:kunde/Beilagen', async ({ view }) => {
  const salate = await db.from('beilagen').select('*').where('art', 1)
  const suppen = await db.from('beilagen').select('*').where('art', 2)

  return view.render('pages/kunde_beilagen', { salate, suppen })
})
 


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
                  await db.from('saucen').where('id', productid).first() ||
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