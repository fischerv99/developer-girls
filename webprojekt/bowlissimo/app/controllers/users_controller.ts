import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db"
import hash from '@adonisjs/core/services/hash'

export default class UsersController {

public async registrieren({ view}: HttpContext) {
    return view.render('pages/register');
}

public async registrieren2({ view, request, response}: HttpContext) {
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
}

public async login({ view}: HttpContext) {
    return view.render('pages/login');
}

public async login2({ view, request, response, session}: HttpContext) {
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
        //In session vermerken, dass der Kunde eingeloggt ist
        session.put('kunde', kunde.kunden_id);
        console.log('Kunde eingeloggt');
        return response.redirect('/');
    } else { 
        const error = 'Falsche Anmeldedaten'
        return view.render('pages/login', {error}) //Zurück zum Login
    }
}

public async favoriten({ view, response, session}: HttpContext) {
    const nutzername = session.get('kunde');
    if (!nutzername) {
       // Weiterleitung zur Login-Seite, falls nicht eingeloggt
          return response.redirect('/login');
    }
    
    const kreationen = []; //Array für alle Kreationen, die favorisiert wurden

    const favoriten = await db.from('favoriten').where('kunden_id', nutzername);

    //Inhalte dieser Bowl sollen angezeigt werden
      //Dafür Kreation_id jeder Favoriten abrufen
    const kreation_ids = favoriten.map(favorit => favorit.kreation_id);
    //kreation_ids ist ein Array mit allen Kreation_ids
     //Jede id durchlaufen und die Kreationen abrufen
    for (const kreation_id of kreation_ids) {
        const kreation = await db.from('kreation').where('id', kreation_id).first();
        if (kreation) {
            kreationen.push(kreation);
        }
    //Ergebnis kreationen ist ein Array mit allen Kreationen, die favorisiert wurden: [{id: 1, pasta.id: 'Spagetti', ...}, ...]
    //Jetzt soll zu jeder Kreation die Toppings abgerufen werden
    //Dafür die kreation_toppings tabelle mit den ids der einzelnen favorisierten Kreationen durchlaufen und die Toppings abrufen
    for (const kreation of kreationen) {
        const toppings_der_einzelnen_kreation = await db.from('kreation_toppings').where('kreation_id', kreation.id);
        //Ergebnis toppings_der_einzelnen_kreation ist ein Array mit allen Toppings der Kreation: [{kreation_id: 1, topping_id: 1, ...}, ...]
        //Nur die Topping-IDs interessieren und sollen in die Kreation eingefügt werden
        const topping_ids = toppings_der_einzelnen_kreation.map(topping => topping.topping_id);
        //topping_ids ist ein Array mit allen Topping-IDs der favorisierten Kreation
        kreation.toppings = topping_ids;

        //Jeder kreation in Kreationen soll der Name der kreation hinzugefügt werden
        const kreation_name = await db.from('favoriten').where('kreation_id', kreation.id).select('name');
        //Ergebnis kreation_name ist ein Array mit dem Namen der Kreation: [{name: 'Pasta-Bowl'}, ...]
        //Nur der Name interessiert und soll in die Kreation eingefügt werden
        const kreation_name_string = kreation_name.map(name => name.name);
        //kreation_name_string ist ein Array mit dem Namen der favorisierten Kreation
        kreation.name = kreation_name_string;

        console.log(kreation)


    }
    console.log(kreationen)
    }  
    
    return view.render('pages/favoritenseite', { kreationen });
}

public async favoriten_hinzufuegen({ response, session, params}: HttpContext) {
    const kreation_id = params.id;

    //Überprüfen, ob der Kunde diese Kreation schon favorisiert hat
    const favorit = await db.from('favoriten').where('kunden_id', session.get('kunde')).where('kreation_id', kreation_id).first();
    if (favorit) {
        return response.redirect('/favoriten');
    } else {
    await db.table('favoriten')
            .insert({ favoriten_id: Math.abs(Math.floor(Math.random() * 1_000_000)), //Zufällige ID für Favoriten
                        kunden_id: session.get('kunde'), //Speichern den nutzername des kunden in der session
                        kreation_id: kreation_id,
                        name: "Pasta-Bowl"
            });
    //Bei der Kreation vermerken, dass sie favorisiert wurde
    await db.from('kreation').where('id', kreation_id).update({favorisiert: 1});

    return response.redirect('/favoriten');
} } 

public async favoriten_update_name({ request, response, session, params}: HttpContext) {
    const kreation_id = params.id;
    const name = request.input('name');


    await db.from('favoriten').where('kunden_id', session.get('kunde')).where('kreation_id', kreation_id).update({name: name});
    return response.redirect('/favoriten');
}

public async favoriten_entfernen({ response, session, params}: HttpContext) {
    const kreation_id = params.id;
    await db.from('favoriten').where('kunden_id', session.get('kunde')).where('kreation_id', kreation_id).delete();
    return response.redirect('/favoriten');
}

public async logout({ response, session}: HttpContext) {
    session.clear(); //Für vollständige Sessionlöschung
    
    console.log('Benutzer wurde erfolgreich ausgeloggt.');//Debugging

    return response.redirect('/');

}

}