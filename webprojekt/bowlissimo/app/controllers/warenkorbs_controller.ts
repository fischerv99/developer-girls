import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db"

export default class WarenkorbsController {

    public async warenkorb({ view, session }: HttpContext) {
        // Warenkorb-Items aus der Session abrufen, falls vorhanden
        const cartItems = session.get('cartItems', []);
      
        // Gesamtpreis berechnen
      const totalPrice = cartItems.reduce((total: number, item: { price: number, quantity: number }) => {
      return total  + (item.price * item.quantity)
      }, 0)
      
      return view.render('pages/warenkorb', { cartItems, totalPrice });
      }

      public async hinzufuegen({ request, response, session }: HttpContext) {
            const { productid, quantity } = request.only(['productid', 'quantity']);
           
          // Produkt aus der Datenbank holen
            const product = await db.from('pasta').where('id', productid).first() ||
                            await db.from('saucen').where('id', productid).first() ||
                            await db.from('toppings').where('id', productid).first() ||
                            await db.from('getraenke').where('id', productid).first() ||
                            await db.from('beilagen').where('id', productid).first();
          
              // Wenn Produkt nicht gefunden wird             
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
          }
}