import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db" // Import für Datenbankzugriffe
import { cuid } from '@adonisjs/core/helpers' // Generiert eindeutige IDs

export default class AdminController {

    // Zeigt die Login-Seite für Administratoren an
    public async login({ view }: HttpContext) {
        return view.render('pages/administratorbereich_login') // Rendert die Login-Ansicht
    }

    // Verarbeitet Login-Daten und überprüft Administrator-Zugang
    public async login2({ view, request, response, session }: HttpContext) {
        // Holt Nutzername und Passwort aus dem Request
        const nutzername = request.input('nutzername');
        const passwort = request.input('passwort');
        
        // Holt Administrator-Daten aus der Datenbank basierend auf der ID (Nutzername)
        const administrator = await db.from('administrator').where('administrator_id', nutzername).first();

        // Überprüft, ob die Felder leer sind, und gibt eine Fehlermeldung zurück
        if (request.input('nutzername') === undefined || request.input('passwort') === undefined) { 
            const error = 'Formular-Fehler';
            return view.render('pages/administratorbereich_login', { error }); 
        }

        if (request.input('nutzername') === null || request.input('passwort') === null) { 
            const error = 'Bitte alle Felder ausfüllen';
            return view.render('pages/administratorbereich_login', { error }); 
        }

        // Überprüft, ob die Anmeldedaten korrekt sind
        if (!administrator || administrator.passwort !== passwort) { 
            const error = 'Falsche Anmeldedaten';
            return view.render('pages/administratorbereich_login', { error });
        } else {
            // Benutzer-ID in die Session speichern (27.11)
            session.put('administrator_id', administrator.administrator_id);
            await session.commit();

            // Überprüfe, ob die Session funktioniert
            console.log('Session Value:', session.get('administrator_id')); // Debug: Zeigt die gespeicherte ID in der Konsole

            // Leitet zum Administratorbereich weiter, wenn die Anmeldung erfolgreich ist
            return response.redirect('administratorbereich/pasta'); 
        }
    }

    // Lädt Daten für Pasta, Soßen und Toppings und zeigt sie im Adminbereich an
    public async pasta({ view }: HttpContext) {
        const pasta = await db.from('pasta').select('*'); // Alle Pastadaten holen
        const soßen = await db.from('saucen').select('*'); // Alle Soßendaten holen
        const toppings = await db.from('toppings').select('*'); // Alle Toppings holen
        
        // Rendert die Pasta-Verwaltungsseite mit den geladenen Daten
        return view.render('pages/administratorbereich_pasta', { pasta, soßen, toppings });
    }

    // Lädt Getränkedaten und zeigt sie im Adminbereich an
    public async getraenke({ view }: HttpContext) {
        const smoothies = await db.from('getraenke').select('*').where('art', 'smoothie'); // Nur Smoothies laden
        const erfrischungsgetränke = await db.from('getraenke').select('*').where('art', 'erfrischungsgetraenk'); // Erfrischungsgetränke laden
        const alkoholfreie_cocktails = await db.from('getraenke').select('*').where('art', 'cocktail'); // Cocktails laden
        
        // Rendert die Getränke-Verwaltungsseite
        return view.render('pages/administratorbereich_drinks', { smoothies, erfrischungsgetränke, alkoholfreie_cocktails });
    }

    // Lädt Beilagen-Daten wie Salate und Suppen und zeigt sie im Adminbereich an
    public async beilagen({ view }: HttpContext) {
        const salate = await db.from('beilagen').select('*').where('art', 'salat'); // Salate laden
        const suppen = await db.from('beilagen').select('*').where('art', 'suppe'); // Suppen laden
        
        // Rendert die Beilagen-Verwaltungsseite
        return view.render('pages/administratorbereich_beilagen', { salate, suppen });
    }

    // Zeigt das Formular zum Hinzufügen eines neuen Produkts
    public async hinzufuegen({ view, params }: HttpContext) {
        const { oberkategorie, unterkategorie } = params; // Extrahiert Kategorien aus den URL-Parametern
        
        // Rendert die Hinzufügen-Seite mit den Kategorien
        return view.render('pages/administratorbereich_hinzufügen', { oberkategorie, unterkategorie });
    }

    // Verarbeitet das Hinzufügen eines neuen Produkts
    public async hinzufuegen2({ request, view, response, params }: HttpContext) {
        const { oberkategorie, unterkategorie } = params; // Extrahiert Kategorien
        const image = request.file('bild', { size: '5mb', extnames: ['png'] }); // Validiert das Bild

        if (!image) {
            return response.redirect('/administratorbereich/pasta'); // Weiterleitung, wenn kein Bild hochgeladen wurde
        }

        // Generiert einen eindeutigen Dateipfad und URL für das Bild
        const key = `uploads/${cuid()}.${image.extname}`;
        const url = `http://localhost:3333/storage/${key}`;

        await image.moveToDisk(key, 'fs'); // Speichert das Bild im Dateisystem

        // Überprüft, ob das Produkt bereits existiert
        const produkt = await db.from(oberkategorie).where('id', request.input('name')).first();
        if (produkt) {
            const error = 'Produkt mit diesem Namen existiert bereits';
            return view.render('pages/administratorbereich_hinzufügen', { error, oberkategorie, unterkategorie });
        }

        // Fügt das Produkt in die richtige Tabelle ein
        await db.table(oberkategorie).insert({
            id: request.input('name'),
            inhalte: request.input('inhalte'),
            ernaehrungsform: request.input('ernaehrungsform'),
            kalorien_pro_100me: request.input('kalorien_pro_100me'),
            portionsgroesse: request.input('portionsgroesse'),
            kalorien_pro_portion: request.input('kalorien_pro_portion'),
            bild: url,
            art: unterkategorie,
        });

        // Weiterleitung zurück zur Pasta-Seite
        return response.redirect('/administratorbereich/pasta');
    }

    // Lädt ein bestimmtes Produkt zur Bearbeitung
    public async bearbeiten({ view, params }: HttpContext) {
        const { oberkategorie, id } = params; // Kategorie und Produkt-ID aus der URL
        const produkt = await db.from(oberkategorie).where('id', id).first(); // Holt Produktdaten aus der DB

        if (!produkt) {
            return view.render('errors/not-found'); // Fehlerseite anzeigen, wenn Prod
          }
      // Wenn das Produkt gefunden wurde, rendere die Bearbeitungsseite
      return view.render('/administratorbereich_bearbeiten', { produkt, oberkategorie });
    }

    // Beim Logout
    public async logout({ session, response }: HttpContext) {
      // Löscht alle Session-Daten
      session.clear();
      await session.commit(); // Speichert die Änderungen
  
      console.log('Administrator wurde abgemeldet'); // Debugging-Info
      return response.redirect('/startseite_pasta'); // Zur Startseite (unangemeldet) zurück
  }

}