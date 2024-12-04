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
        return response.redirect('/');
    } else { 
        const error = 'Falsche Anmeldedaten'
        return view.render('pages/login', {error}) //Zurück zum Login
    }
}

public async favoriten({ view, response, session}: HttpContext) {
    const userId = session.get('kunde');
    if (!userId) {
       // Weiterleitung zur Login-Seite, falls nicht eingeloggt
          return response.redirect('/login');
    }
        
    const favoriten = await db.from('favoriten').where('kunden_id', userId);
    return view.render('pages/favoritenseite', { favoriten });
      } 

public async logout({ response, session}: HttpContext) {
    session.forget('kunde');
    return response.redirect('/');
}

}