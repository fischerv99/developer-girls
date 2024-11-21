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
import { cuid } from '@adonisjs/core/helpers'

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


//Angemeldete Startseiten (Kunde ist eingeloggt)
// Angemeldete Startseite Pasta (momentan provisorisch ans nav gebunden)
router.get('/logged_start_pasta', async ({ view, session }) => {
  const pasta = await db.from('pasta').select('*')
  const soßen = await db.from('soßen').select('*')
  const toppings = await db.from('toppings').select('*')

  const cartItems = session.get('cartItems', [])
  const cartCount = cartItems.length

  return view.render('pages/logged_start_pasta', { pasta, soßen, toppings, cartCount })
})

// Angemeldete Startseite Drinks 
router.get('/logged_start_drinks', async ({ view, session }) => {
  const pasta = await db.from('pasta').select('*')
  const soßen = await db.from('soßen').select('*')
  const toppings = await db.from('toppings').select('*')

  const cartItems = session.get('cartItems', [])
  const cartCount = cartItems.length

  return view.render('pages/logged_start_drinks', { pasta, soßen, toppings, cartCount })
})

// Angemeldete Startseite Beilagen 
router.get('/logged_start_sides', async ({ view, session }) => {
  const pasta = await db.from('pasta').select('*')
  const soßen = await db.from('soßen').select('*')
  const toppings = await db.from('toppings').select('*')

  const cartItems = session.get('cartItems', [])
  const cartCount = cartItems.length

  return view.render('pages/logged_start_sides', { pasta, soßen, toppings, cartCount })
})

router.get('/startseite_drinks', async ({ view }) => {
  const smoothies = await db.from('getraenke').select('*').where('art', 'smoothie')
  const erfrischungsgetränke = await db.from('getraenke').select('*').where('art', 'erfrischungsgetraenk')
  const alkoholfreie_getränke = await db.from('getraenke').select('*').where('art', 'cocktail')

  return view.render('pages/startseite_drinks', { smoothies, erfrischungsgetränke, alkoholfreie_getränke })
})

router.get('/startseite_beilagen', async ({ view }) => {
  const salate = await db.from('beilagen').select('*').where('art', 'salat')
  const suppen = await db.from('beilagen').select('*').where('art', 'suppe')

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
  const smoothies = await db.from('getraenke').select('*').where('art', 'smoothie') 
  const erfrischungsgetränke = await db.from('getraenke').select('*').where('art', 'erfrischungsgetraenk' )
  const alkoholfreie_cocktails = await db.from('getraenke').select('*').where('art', 'cocktail')
  return view.render('pages/administratorbereich_drinks', { smoothies, erfrischungsgetränke, alkoholfreie_cocktails })
})

router.get('/administratorbereich/beilagen', async ({ view }) => {
  const salate = await db.from('beilagen').select('*').where('art', 'salat') 
  const suppen = await db.from('beilagen').select('*').where('art', 'suppe')
  return view.render('pages/administratorbereich_beilagen', { salate, suppen })
})



// Administratorbereich: Route zum Hinzufügen eines neuen Produkts
router.get('/administratorbereich/hinzufuegen/:oberkategorie/:unterkategorie', ({view, params}) => {
  const { oberkategorie, unterkategorie } = params;
  return view.render('pages/administratorbereich_hinzufügen', {oberkategorie, unterkategorie});  // Rendert die Seite mit dem Formular zum Hinzufügen
});

// POST-Route zum Speichern des neuen Produkts in der Datenbank
router.post('/administratorbereich/hinzufuegen/:oberkategorie/:unterkategorie', async ({request, view, response, params}) => {
  
  let { oberkategorie } = params;
  let { unterkategorie } = params;

  //Bild 
  const image = request.file('bild',
                            { size: '5mb', 
                              extnames: ['png']})
if (!image) {
  return response.redirect('/administratorbereich/pasta');
}

  //Bild_pfad erstellen                           
const key = `uploads/${cuid()}.${image.extname}`;
const url = `http://localhost:3333/storage/${key}`;


  //Bild in den Speicher verschieben
  await image.moveToDisk(key, 'fs') 

  //Fehlermeldung, wenn id schon existiert
  const produkt = await db.from(oberkategorie).where('id', request.input('name')).first();
  if (produkt) {
    const error = 'Produkt mit diesem Name existiert bereits';
    return view.render('pages/administratorbereich_hinzufügen', { error, oberkategorie, unterkategorie });
  }

  //Speichern des neuen Produkts in der Datenbank
  if(oberkategorie === 'pasta') {
    await db.table(oberkategorie) //oberkategorie = pasta
            .insert({id: request.input('name'), 
                     inhalte: request.input('inhalte'), 
                     ernaehrungsform: request.input('ernaehrungsform'),
                     kalorien_pro_100me: request.input('kalorien_pro_100me'),
                     portionsgroesse: request.input('portionsgroesse'),
                     kalorien_pro_portion: request.input('kalorien_pro_portion'),
                     bild: url,
                     });
  }
    else if (oberkategorie === 'toppings' || oberkategorie === 'saucen') { 
      await db.table(oberkategorie) //oberkategorie = getränke
              .insert({id: request.input('name'), 
                       inhalte: request.input('inhalte'), 
                       ernaehrungsform: request.input('ernaehrungsform'),
                       kalorien_pro_100me: request.input('kalorien_pro_100me'),
                       portionsgroesse: request.input('portionsgroesse'),
                       kalorien_pro_portion: request.input('kalorien_pro_portion'),
                       preis: request.input('preis'), 
                       bild: url,
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
                     bild: url,
                    });
  }

//Wichtig sind schräge Anführungszeichen, da sonst die Variable nicht erkannt wird
  return response.redirect(`/administratorbereich/${oberkategorie}`);
});

// Administratorbereich: Route zum Bearbeiten eines Produkts -> id noch ändern können?
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

  //let kann anderst als const noch nachträglich geändert werden
let url

//Bild 
const image = request.file('bild',
  { size: '5mb', 
    extnames: ['png']})

if (!image) {
 const produkt = await db.from(oberkategorie).select('bild').where('id', id).first();   
 url = produkt.bild   
}      
else {
      //Bild_pfad erstellen                           
      const key = `uploads/${cuid()}.${image.extname}`;
      url = `http://localhost:3333/storage/${key}`;

      //Bild in den Speicher verschieben
      await image.moveToDisk(key, 'fs') 
}


//Produkt in der Datenbank aktualisieren
if (oberkategorie === 'pasta') {
  await db.from(oberkategorie)
          .where('id', id)
          .update({beschreibung: request.input('beschreibung'),
                   inhalte: request.input('inhalte'), 
                   allergene: request.input('allergene'),
                   ernaehrungsform: request.input('ernaehrungsform'), 
                   kalorien_pro_100me: request.input('kalorien_pro_100me'), 
                   portionsgroesse: request.input('portionsgroesse'), 
                   kalorien_pro_portion: request.input('kalorien_pro_portion'), 
                   bild: url,
                   });
}
else if (oberkategorie === 'toppings' || oberkategorie === 'saucen') {
  await db.from(oberkategorie)
          .where('id', id)
          .update({beschreibung: request.input('beschreibung'),
                   inhalte: request.input('inhalte'), 
                   allergene: request.input('allergene'),
                   ernaehrungsform: request.input('ernaehrungsform'), 
                   kalorien_pro_100me: request.input('kalorien_pro_100me'), 
                   portionsgroesse: request.input('portionsgroesse'), 
                   kalorien_pro_portion: request.input('kalorien_pro_portion'), 
                   preis: request.input('preis'),
                   bild: url,
                   });
}
else {
  await db.from(oberkategorie)
          .where('id', id)
          .update({beschreibung: request.input('beschreibung'),
                   inhalte: request.input('inhalte'), 
                   allergene: request.input('allergene'),
                   ernaehrungsform: request.input('ernaehrungsform'), 
                   kalorien_pro_100me: request.input('kalorien_pro_100me'), 
                   portionsgroesse: request.input('portionsgroesse'), 
                   kalorien_pro_portion: request.input('kalorien_pro_portion'), 
                   preis: request.input('preis'),
                   art: request.input('art'),
                   bild: url,
                   });
}

return response.redirect(`/administratorbereich/${oberkategorie}`);
});




// Registrierung
router.get('/register', async ({ view }) => {
  return view.render('pages/register');
});

// Registrierung verarbeiten
router.post('/register', async ({ request, response, view }) => {

  //Fehlermeldung, wenn id schon existiert
  const nutzername = request.input('nutzername');
  const nutzer = await db.from('kunden_angemeldet').where('kunden_id', nutzername).first();
  if (nutzer) {
    const error = 'Nutzername ist schon vergeben';
    return view.render('pages/register', {error});
  }

  //Fehlermeldung wenn die mail schon einem anderen Konto zugeordnet ist
  const mail = request.input('email');
  const mailcheck = await db.from('kunden_angemeldet').where('mail', mail).first();
  if (mailcheck) {
    const error = 'Mail ist schon vergeben';
    return view.render('pages/register', {error});
  }

  // Passwort hashen
  const passwort = request.input('passwort');
  const hashedPasswort = await hash.make(passwort);
 

  // Neuen Benutzer in die Datenbank einfügen
  await db.table('kunden_angemeldet').insert({
                                       vorname: request.input('vorname'),
                                       nachname: request.input('nachname') , 
                                       strasse_nr: request.input('strasse_nr'), 
                                       postleitzahl:request.input('postleitzahl'), 
                                       stadt: request.input('stadt'),
                                       mail: mail,
                                       bezahlart: request.input('bezahlart'),
                                       kunden_id: nutzername,
                                       passwort_hash: hashedPasswort
                                      });

  // Weiterleitung zur Login-Seite -> Nutzer muss sich mit seinen anmeldedaten einloggen
  return response.redirect('/login'); 
});


// Login-Seite anzeigen
router.get('/login', async ({ view }) => {
  return view.render('pages/login');
});

// Login verarbeiten
router.post('/login', async ({ request, view, response }) => {

  // Benutzername und Passwort überprüfen
  if(request.input('nutzername') === undefined || request.input('passwort') === undefined) { 
    const error = 'Formular-Fehler'
    return view.render('pages/login', {error})
  }

  if(request.input('nutzername') === null || request.input('passwort') === null) { 
    const error = 'Bitte alle Felder ausfüllen'
    return view.render('pages/login', {error}) 
  }

//Kunde aus der Datenbank holen
const kunde = await db.from('kunden_angemeldet').select('*').where('kunden_id', request.input('nutzername')).first();

//Fehlermeldung, wenn der Kunde nicht existiert
if (!kunde) {
  const error = 'Falscher Nutzername'
  return view.render('pages/login', {error}) //Zurück zum Login
}

//Passwort mit gehaster Passwort in der Datenbank vergleichen
if (await hash.verify(kunde.passwort_hash, request.input('passwort'))) {
  return response.redirect('/startseite/{{kunde.kunden.id}}/Pasta');
} else { 
  const error = 'Falsche Anmeldedaten'
  return view.render('pages/login', {error}) //Zurück zum Login
}
});

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