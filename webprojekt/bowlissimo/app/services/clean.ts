import db from "@adonisjs/lucid/services/db" // Import für Datenbankzugriffe

class CartCleanupService {
  private cleanupInterval: number;

  constructor() {
    this.cleanupInterval = 24 * 60 * 60 * 1000; // 24 Stunden in Millisekunden
    this.startCleanup();
  }

  private async cleanupOldCarts() {
    try {
      const deletedCarts = await db.from('warenkorb_bestellung')
        .where('in_bestellung', 0)

      const deletedProducts = await db.from('ausgewähltes_produkt')
        .whereIn('warenkorb_id', deletedCarts)

      const deletedCreations = await db.from('kreation')
        .whereIn('id', deletedProducts)
        .where('favorisiert', 0)
        .delete();

      await db.from('kreation_toppings')
        .whereIn('kreation_id', deletedCreations)
        .delete();

      const gelöschte_Kreationen = await db.from('kreation')
        .where('status', "nicht_warenkorb")
        .delete();
      
      await db.from('kreation_toppings')
        .whereIn('kreation_id', gelöschte_Kreationen)
        .delete();
      
      await db.from('ausgewähltes_produkt')
        .whereIn('warenkorb_id', deletedCarts)
        .delete();

      await db.from('warenkorb_bestellung')
        .where('in_bestellung', 0)
        .delete();

      console.log('Bereinigung abgeschlossen');
    } catch (error) {
      console.error('Fehler bei der Bereinigung:', error);
    }
  }

  private startCleanup() {
    setInterval(() => {
      this.cleanupOldCarts();
    }, this.cleanupInterval);
  }
}

export default CartCleanupService;
