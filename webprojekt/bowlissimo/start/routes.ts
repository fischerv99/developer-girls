/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'

//Contoller (in Route) importieren
const ProduktController = () => import('#controllers/produkt_controller')
const KreationsController = () => import('#controllers/kreations_controller')
const UsersController = () => import('#controllers/users_controller')
const AdminController = () => import('#controllers/admin_controller')
const WarenkorbsController = () => import('#controllers/warenkorbs_controller')
const SonstigesController = () => import('#controllers/sonstiges_controller') 




//Routen für Startseiten (Kunde nicht angemeldet) -> ProduktController
router.get('/', [ProduktController, 'startseite_pasta'])
router.get('/startseite_drinks', [ProduktController, 'startseite_getraenke'])
router.get('/startseite_beilagen', [ProduktController, 'startseite_beilagen'])
  // Detailansicht für ein Produkt (auch für angemeldete Kunden)
router.get('/details/:kategorie/:id', [ProduktController, 'details'])

//Routen für Kreationen (Kunde nicht angemeldet und angemeldet) -> KreationController
router.post('/neue_kreation', [KreationsController, 'neue_kreation'])
router.post('/update_kreatio_sosse', [KreationsController, 'update_kreation_sosse'])
router.post('/update_kreation_toppings', [KreationsController, 'update_kreation_topping'])

//Routen für angemeldete Startseiten (Kunde ist angemeldet), Registriert sich/einloggen -> UsersController
 // Seiten momentan provisorisch ans nav gebunden
router.get('/startseite/:kunde/Pasta', [UsersController, 'startseite_pasta_logged'])
router.get('/startseite/:kunde/Drinks', [UsersController, 'startseite_getraenke_logged'])
router.get('/startseite/:kunde/Beilagen', [UsersController, 'startseite_beilagen_logged']) 
 // Registrierung
router.get('/register', [UsersController, 'registrieren'])
router.post('/register', [UsersController, 'registrieren2'])
  // Login
router.get('/login', [UsersController, 'login'])
router.post('/login', [UsersController, 'login2'])
  //Favoriten
router.get('/favoriten', [UsersController, 'favoriten'])
 


//Routen für Administratorbereich -> AdminController
 //Anmelden im Administratorbereich
router.get('/administratorbereich_login', [AdminController, 'login'])
router.post('/administratorbereich_login', [AdminController, 'login2'])
 //Administratorbereich
router.get('/administratorbereich/pasta', [AdminController, 'pasta'])
router.get('/administratorbereich/getraenke', [AdminController, 'getraenke'])
router.get('/administratorbereich/beilagen', [AdminController, 'beilagen'])
router.get('/administratorbereich/logout', [AdminController, 'logout'])

//Hinzufügen eines neuen Produkts
router.get('/administratorbereich/hinzufuegen/:oberkategorie/:unterkategorie', [AdminController, 'hinzufuegen'])
router.post('/administratorbereich/hinzufuegen/:oberkategorie/:unterkategorie', [AdminController, 'hinzufuegen2'])
 //Bearbeiten eines Produkts-> id noch ändern können?
router.get('/administratorbereich/bearbeiten/:oberkategorie/:id', [AdminController, 'bearbeiten'])
router.post('/administratorbereich/bearbeiten/:oberkategorie/:id', [AdminController, 'bearbeiten2'])
router.post('/administratorbereich/loeschen/:oberkategorie/:id', [AdminController, 'loeschen'])
 


// Routen für den Warenkorb -> WarenkorbsController
router.get('/warenkorb', [WarenkorbsController, 'warenkorb'])
router.get('/warenkorb/hinzufuegen/:oberkategorie/:produkt', [WarenkorbsController, 'hinzufuegen'])
router.get('/warenkorb/entfernen/:produkt', [WarenkorbsController, 'entfernen'])
router.post('/warenkorb/menge/erhoehen/:produkt', [WarenkorbsController, 'erhoehen'])
router.post('/warenkorb/menge/verringern/:produkt', [WarenkorbsController, 'verringern'])


//Route für Datenschutz und Impressum -> SonstigesController
router.get('/datenschutz', [SonstigesController, 'datenschutz'])
router.get('/impressum', [SonstigesController, 'impressum'])