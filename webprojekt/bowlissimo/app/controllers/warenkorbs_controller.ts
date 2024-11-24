import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db"

export default class WarenkorbsController {

  // Warenkorb anzeigen
    public async warenkorb({ view, session }: HttpContext) {
        // Warenkorb-Items aus der Session abrufen, falls vorhanden
        const warenkorb = session.get('warenkorb', []); 

        // Gesamtpreis berechnen
      const totalPrice = warenkorb.reduce((total: number, item: { price: number, quantity: number }) => {
      return total  + (item.price * item.quantity)
      }, 0)
      
      return view.render('pages/warenkorb', { warenkorb, totalPrice }); // View rendern
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
 public async entfernen({ request, response, session }: HttpContext) {
  const { id } = request.only(['id']);

  // Warenkorb aus der Session abrufen
  let warenkorb = session.get('warenkorb', []);

  warenkorb = warenkorb.filter((item: { id: number }) => item.id !== parseInt(id, 10));
 // Warenkorb in der Session aktualisieren
    session.put('warenkorb', warenkorb);

    return response.redirect('/warenkorb');
  }
}
