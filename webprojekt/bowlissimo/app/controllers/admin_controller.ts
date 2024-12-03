import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db" // Import für Datenbankzugriffe
import { cuid } from '@adonisjs/core/helpers'  // Generiert eindeutige IDs



export default class AdminController {

      // Zeigt die Login-Seite für Administratoren an
    public async login ({ view }: HttpContext) {
        return view.render('pages/administratorbereich_login') // Rendert die Login-Ansicht
    }
    // Verarbeitet Login-Daten und überprüft Administrator-Zugang
    public async login2 ({ view, request, response, session }: HttpContext) {
        const nutzername = request.input('nutzername');
        const passwort = request.input('passwort'); //Nutzername und Passwort aus dem Request holen und in einzelnen Konstanten speichern
      
        // Holt Administrator-Daten aus der Datenbank basierend auf der ID (Nutzername)        
        const administrator = await db.from('administrator').where('administrator_id', nutzername).first() //Administrator aus der Datenbank holen
      
        // Überprüft, ob die Felder leer sind, und gibt eine Fehlermeldung zurück
        if(request.input('nutzername') === undefined || request.input('passwort') === undefined) { 
          const error = 'Formular-Fehler'
          return view.render('pages/administratorbereich_login', {error})
        }
      
        if(request.input('nutzername') === null || request.input('passwort') === null) { 
          const error = 'Bitte alle Felder ausfüllen'
          return view.render('pages/administratorbereich_login', {error}) 
        }
      
        // Überprüft, ob die Anmeldedaten korrekt sind
        if (!administrator || administrator.passwort !== passwort) { //Falls der Administrator nicht existiert oder das Passwort falsch ist
          const error = 'Falsche Anmeldedaten'
          return view.render('pages/administratorbereich_login', {error}) //Zurück zum Login
        }
        else {
          // Benutzer-ID in die Session speichern (27.11.Evy)
          session.put('administrator_id', administrator.administrator_id);
          await session.commit();
        
          // Überprüfe, ob die Session funktioniert (27.11.Evy)
          console.log('Session Value:', session.get('administrator_id')); // Debug: Zeigt die gespeicherte ID in der Konsole

          // Speichere die Aktivität, siehe Methode addActivity (27.11.Evy)
          this.addActivity(session, 'Admin hat sich eingeloggt');

          // Leitet zum Administratorbereich weiter, wenn die Anmeldung erfolgreich ist
          return response.redirect('administratorbereich/pasta')
        }
    }

    // Lädt Daten für Pasta, Soßen und Toppings und zeigt sie im Adminbereich an
    public async pasta ({ view }: HttpContext) {
        const pasta = await db.from('pasta').select('*')  // Alle Pastadaten holen
        const soßen = await db.from('saucen').select('*') // Alle Soßendaten holen
        const toppings = await db.from('toppings').select('*') // Alle Toppings holen
        // Rendert die Pasta-Verwaltungsseite mit den geladenen Daten
        return view.render('pages/administratorbereich_pasta', { pasta, soßen, toppings })
    }
    // Lädt Getränkedaten und zeigt sie im Adminbereich an
    public async getraenke ({ view }: HttpContext) {
        const smoothies = await db.from('getraenke').select('*').where('art', 'smoothie') // Nur Smoothies laden
        const erfrischungsgetränke = await db.from('getraenke').select('*').where('art', 'erfrischungsgetraenk' )// Erfrischungsgetränke laden
        const alkoholfreie_cocktails = await db.from('getraenke').select('*').where('art', 'cocktail')  // Cocktails laden
        // Rendert die Getränke-Verwaltungsseite
        return view.render('pages/administratorbereich_drinks', { smoothies, erfrischungsgetränke, alkoholfreie_cocktails })
    }

    // Lädt Beilagen-Daten wie Salate und Suppen und zeigt sie im Adminbereich an
    public async beilagen ({ view }: HttpContext) {
        const salate = await db.from('beilagen').select('*').where('art', 'salat') 
        const suppen = await db.from('beilagen').select('*').where('art', 'suppe')
        return view.render('pages/administratorbereich_beilagen', { salate, suppen })
    }
    // Zeigt das Formular zum Hinzufügen eines neuen Produkts
    public async hinzufuegen ({ view, params }: HttpContext) {
        const { oberkategorie, unterkategorie } = params; // Extrahiert Kategorien aus den URL-Parametern
        // Rendert die Seite mit dem Formular zum Hinzufügen
        return view.render('pages/administratorbereich_hinzufügen', {oberkategorie, unterkategorie});  
    }
    //Ein neues Produkt hinzufügen
    public async hinzufuegen2 ({ request, view, response, params, session }: HttpContext) {  
        let { oberkategorie } = params; 
        let { unterkategorie } = params;
      
        //Bild 
        const image = request.file('bild',
                                  { size: '5mb', 
                                    extnames: ['png']})
      if (!image) {
        return response.redirect('/administratorbereich/pasta');
      }
      
      // Generiert einen eindeutigen Dateipfad und URL für das Bild                       
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

      // Speichere die Aktivität (Evy)
      const produktName = request.input('name');
      this.addActivity(session, `Produkt "${produktName}" in Kategorie "${oberkategorie}" hinzugefügt`);

      //Wichtig sind schräge Anführungszeichen, da sonst die Variable nicht erkannt wird
      // Weiterleitung zurück zur Pasta-Seite
        return response.redirect(`/administratorbereich/pasta`);
      }
    // Lädt ein bestimmtes Produkt zur Bearbeitung
      public async bearbeiten ({ view, params }: HttpContext) {

        // Kategorie und ID aus params extrahieren
        const { oberkategorie, id } = params; 
      
        // Produkt aus der Datenbank holen
        const produkt = await db.from(oberkategorie).where('id', id).first(); 
      
        console.log('Oberkategorie:', oberkategorie); // Debug(27.11.Evy)
        console.log('ID:', id); // Debug(27.11.Evy)

        // Falls das Produkt nicht gefunden wird
        if (!produkt) {
          return view.render('errors/not-found');
          console.log("Produkt nicht gefunden");// Debug (27.11)
        }

        // Wenn das Produkt gefunden wurde: Produkt und Kategorie an die View übergeben
        return view.render('pages/administratorbereich_bearbeiten', { produkt, oberkategorie });
 
    }

     public async bearbeiten2 ({ request, response, params }: HttpContext) {
        // Kategorie und ID aus params extrahieren
        const { oberkategorie, id } = params; 
      
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
      
        return response.redirect(`/administratorbereich/pasta`);
    }

    public async loeschen ({ response, params, session }: HttpContext) {
        const { oberkategorie, id } = params; // Kategorie und ID aus params extrahieren
      
        // Produkt aus der Datenbank löschen
        await db.from(oberkategorie).where('id', id).delete();

        // Speichere die Aktivität (Evy)
        this.addActivity(session, `Produkt mit ID "${id}" aus Kategorie "${oberkategorie}" gelöscht`);

        return response.redirect(`/administratorbereich/pasta`);
      }


    // Beim Logout (27.11.Evy)
    public async logout({ session, response }: HttpContext) {
      // Löscht alle Session-Daten
      session.clear();
      await session.commit(); // Speichert die Änderungen
  
      console.log('Administrator wurde abgemeldet'); // Debugging-Info
      return response.redirect('/'); // Zur Startseite (unangemeldet) zurück
  }


      // Private Methode zur Speicherung von Admin-Aktivitäten (28.11.Evy)
    private addActivity(session: HttpContext['session'], activity: string) {
      // Hole das bestehende Aktivitäten-Array aus der Session.
      // Falls es noch nicht existiert, wird ein leeres Array initialisiert.
      const activities = session.get('activities') || [];

      // Füge eine neue Aktivität zum Aktivitäten-Array hinzu (28.11.Evy)
      activities.push({
          activity, // Die Beschreibung der Aktivität (z. B. "Produkt hinzugefügt").
          timestamp: new Date().toISOString(), // Der aktuelle Zeitstempel im ISO-Format.
      });

      // Aktualisiere das Aktivitäten-Array in der Session (28.11.Evy).
      session.put('activities', activities);
      console.log(activities);
    }

}