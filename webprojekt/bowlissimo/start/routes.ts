/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
<<<<<<< HEAD
import db from '@adonisjs/lucid/services/db'
=======
import db from "@adonisjs/lucid/services/db"
>>>>>>> 062f45b56e81d23995d1ea64896d1256c7ccb189

//Contoller (in Route) importieren
const ProduktController = () => import('#controllers/produkt_controller')
const UsersController = () => import('#controllers/users_controller')
const AdminController = () => import('#controllers/admin_controller')
const WarenkorbsController = () => import('#controllers/warenkorbs_controller')
const SonstigesController = () => import('#controllers/sonstiges_controller') 



//Routen für Startseiten (Kunde nicht angemeldet) -> ProduktController
router.get('/', [ProduktController, 'start'])
router.get('/startseite_pasta', [ProduktController, 'startseite_pasta'])
router.get('/startseite_drinks', [ProduktController, 'startseite_getraenke'])
router.get('/startseite_beilagen', [ProduktController, 'startseite_beilagen'])
  // Detailansicht für ein Produkt (auch für angemeldete Kunden)
router.get('/details/:kategorie/:id', [ProduktController, 'details'])



//Routen für angemeldete Startseiten (Kunde ist angemeldet), Registriert sich/einloggen -> UsersController
 // Seiten momentan provisorisch ans nav gebunden
router.get('/logged_start_pasta', [UsersController, 'startseite_pasta_logged'])
router.get('/logged_start_drinks', [UsersController, 'startseite_getraenke_logged'])
router.get('/logged_start_beilagen', [UsersController, 'startseite_beilagen_logged']) 

//alte Startseiten??
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

 // Registrierung
router.get('/register', [UsersController, 'registrieren'])
router.post('/register', [UsersController, 'registrieren2'])
  // Login
router.get('/login', [UsersController, 'login'])
router.post('/login', [UsersController, 'login2'])
  //Favoriten
router.post('/favoriten', [UsersController, 'favoriten'])
 


//Routen für Administratorbereich -> AdminController
 //Anmelden im Administratorbereich
router.get('/administratorbereich_login', [AdminController, 'login'])
router.post('/administratorbereich_login', [AdminController, 'login2'])
 //Administratorbereich
router.get('/administratorbereich/pasta', [AdminController, 'pasta'])
router.get('/administratorbereich/getraenke', [AdminController, 'getraenke'])
router.get('/administratorbereich/beilagen', [AdminController, 'beilagen'])
 //Hinzufügen eines neuen Produkts
router.get('/administratorbereich/hinzufuegen/:oberkategorie/:unterkategorie', [AdminController, 'hinzufuegen'])
router.post('/administratorbereich/hinzufuegen/:oberkategorie/:unterkategorie', [AdminController, 'hinzufuegen2'])
 //Bearbeiten eines Produkts-> id noch ändern können?
router.get('/administratorbereich/bearbeiten/:oberkategorie/:id', [AdminController, 'bearbeiten'])
router.post('/administratorbereich/bearbeiten/:oberkategorie/:id', [AdminController, 'bearbeiten2'])
router.post('/administratorbereich/loeschen/:oberkategorie/:id', [AdminController, 'loeschen'])
 


// Routen für den Warenkorb -> WarenkorbsController
router.get('/warenkorb', [WarenkorbsController, 'warenkorb'])
router.get('/warenkorb/hinzufuegen/:produkt', [WarenkorbsController, 'hinzufuegen'])


//Route für Datenschutz und Impressum -> SonstigesController
router.get('/datenschutz', [SonstigesController, 'datenschutz'])
router.get('/impressum', [SonstigesController, 'impressum'])