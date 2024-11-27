import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db"
import { cuid } from '@adonisjs/core/helpers'



export default class AdminController {
    public async login ({ view }: HttpContext) {
        return view.render('pages/administratorbereich_login')
    }

    public async login2 ({ view, request, response }: HttpContext) {
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
    }

    public async pasta ({ view }: HttpContext) {
        const pasta = await db.from('pasta').select('*')  
        const soßen = await db.from('saucen').select('*')
        const toppings = await db.from('toppings').select('*')
        return view.render('pages/administratorbereich_pasta', { pasta, soßen, toppings })
    }

    public async getraenke ({ view }: HttpContext) {
        const smoothies = await db.from('getraenke').select('*').where('art', 'smoothie') 
        const erfrischungsgetränke = await db.from('getraenke').select('*').where('art', 'erfrischungsgetraenk' )
        const alkoholfreie_cocktails = await db.from('getraenke').select('*').where('art', 'cocktail')
        return view.render('pages/administratorbereich_drinks', { smoothies, erfrischungsgetränke, alkoholfreie_cocktails })
    }

    public async beilagen ({ view }: HttpContext) {
        const salate = await db.from('beilagen').select('*').where('art', 'salat') 
        const suppen = await db.from('beilagen').select('*').where('art', 'suppe')
        return view.render('pages/administratorbereich_beilagen', { salate, suppen })
    }

    public async hinzufuegen ({ view, params }: HttpContext) {
        const { oberkategorie, unterkategorie } = params;
        // Rendert die Seite mit dem Formular zum Hinzufügen
        return view.render('pages/administratorbereich_hinzufügen', {oberkategorie, unterkategorie});  
    }

    public async hinzufuegen2 ({ request, view, response, params }: HttpContext) {  
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
        return response.redirect(`/administratorbereich/pasta`);
      }

      public async bearbeiten ({ view, params }: HttpContext) {
        // Kategorie und ID aus params extrahieren
        const { oberkategorie, id } = params; 
      
        // Produkt aus der Datenbank holen
        const produkt = await db.from(oberkategorie).where('id', id).first(); 
      
        // Falls das Produkt nicht gefunden wird
        if (!produkt) {
          return view.render('errors/not-found'); 
        }
      
        // Produkt und Kategorie an die View übergeben
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

    public async loeschen ({ response, params }: HttpContext) {
        const { oberkategorie, id } = params; // Kategorie und ID aus params extrahieren
      
        // Produkt aus der Datenbank löschen
        await db.from(oberkategorie).where('id', id).delete(); 
      
        return response.redirect(`/administratorbereich/pasta`);
      }
}