import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db"

export default class WarenkorbsController {

  // Warenkorb anzeigen
    public async warenkorb({ view, session }: HttpContext) {

      //alle id der warenkorb_bestellung abrufen, welche zur session gehört -> Liste von warenkorb_bestellung-Einträgen zurückgeben, die der session_id entsprechen
      const warenkorb_bestellungen = await db.from('warenkorb_bestellung').where('session_id', session.sessionId).select('*');

      //alle warenkorbspositionen abrufen, welche zu der warenkorb_bestellung gehört
      let alle_warenkorbspositionen: any[] = [];
        for (const bestellung of warenkorb_bestellungen) {
          const warenkorbspositionen = await db.from('warenkorbsposition').where('warenkorb_bestellung_id', bestellung.id).select('*');
          alle_warenkorbspositionen = alle_warenkorbspositionen.concat(warenkorbspositionen); }

      //alle ausgewaehleten produkte abrufen, welche zu der warenkorbsposition gehören
      let alle_ausgewaehlten_produkte: any [] = [];
        for (const position of alle_warenkorbspositionen) {
          const ausgewaehlte_produkte = await db.from('ausgewaehltes_produkt').where('warenkorbsposition_id', position.id).select('*');
          alle_ausgewaehlten_produkte = alle_ausgewaehlten_produkte.concat(ausgewaehlte_produkte); }

      return view.render('pages/warenkorb', { alle_ausgewaehlten_produkte, alle_warenkorbspositionen});
    } 


  // Produkt hinzufügen
      public async hinzufuegen({ request, response, session }: HttpContext) {
            const { productid, quantity } = request.only(['productid', 'quantity']);
           
  // Produkt aus der Datenbank holen
          const product = await db.from('pasta').where('id', productid).first()
         || await db.from('saucen').where('id', productid).first()
         || await db.from('toppings').where('id', productid).first()
         || await db.from('getraenke').where('id', productid).first()
         || await db.from('beilagen').where('id', productid).first();

          
   // Wenn Produkt nicht gefunden wird             
        if (!product) {
              session.flash({ error: 'Produkt nicht gefunden' });
              return response.redirect('back');
        }

    // Warenkorb-Items aus der Session abrufen
        const warenkorb = session.get('warenkorb', []);

    // existing item
        const existingItem = warenkorb.find((item: { id: number }) => item.id === productid);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          const parsedQuantity = parseInt(quantity, 10);
          warenkorb.push({ ...product, quantity: parsedQuantity }); // Neues Produkt hinzufügen
        }
                        
      // Warenkorb in der Session speichern
            session.put('warenkorb', warenkorb);
            return response.redirect('/warenkorb');
          }
 // Produkt entfernen
