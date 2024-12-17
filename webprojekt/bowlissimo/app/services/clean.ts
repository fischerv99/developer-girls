import db from "@adonisjs/lucid/services/db" // Import für Datenbankzugriffe

class CartCleanupService {
  private cleanupInterval: number;

  constructor() {
    this.cleanupInterval = 1000 * 60 * 60 * 24; // 24 Stunden
    this.startCleanup();
  }

  private async cleanupOldCarts() {
    try {
      const gel_warenkorb = await db.from('warenkorb_bestellung')
                                           .where('in_bestellung', 0)
                                           .andWhere('zeitstempel', '<', new Date(Date.now() - this.cleanupInterval).toISOString()) //zeitstempel älter als 2 Minuten
                                           .select('id');

      //wenn es welche gibt:
      if (gel_warenkorb.length > 0) {

      const warenkorb_ids = gel_warenkorb.map((warenkorb) => warenkorb.id);
      const gel_podukte = await db.from('ausgewaehltes_produkt')
                                       .whereIn('warenkorb_id', warenkorb_ids)
                                        .select('produkt');

     //kreationen, die im Warenkörben waren aber nicht bestellt wurden
      const gel_produkte_id = gel_podukte.map((produkt) => produkt.produkt);
      const gel_kreationen_1 = await db.from('kreation')
                                       .whereIn('id', gel_produkte_id)
                                       .where('favorisiert', 0)
                                       .select('id');
        
    //verbindung kreation zu toppings löschen wenn kreation nicht mehr vorhanden
    await db.from('kreation_toppings')
    .whereIn('kreation_id', gel_kreationen_1)
    .delete();

    //kreationen löschen, die im Warenkorb waren aber nicht bestellt wurden,äler als 14h sind und nicht favorisiert sind
    const kreation_id_1 = gel_kreationen_1.map((kreation) => kreation.id);
    await db.from('kreation')
    .whereIn('id', kreation_id_1)
    .andWhere('zeitstempel', '<', new Date(Date.now() - this.cleanupInterval).toISOString())
    .andWhere('favorisiert', 0)
    .delete();

     //ausgewählte Produkte löschen, die im Warenkorb waren aber nicht bestellt wurden
     await db.from('ausgewähltes_produkt')
     .whereIn('warenkorb_id', warenkorb_ids) 
     .delete();

   //Warenkorb löschen, die nicht bestellt wurden
   await db.from('warenkorb_bestellung')
     .where('in_bestellung', 0)
     .delete();
      
      }
      
      //kreationen, die nicht im Warenkorb waren und älter als 24h sind
      const gel_Kreationen_2 = await db.from('kreation')
                                       .where('status', "nicht_warenkorb")
                                       .where('favorisiert', 0)
                                       .andWhere('zeitstempel', '<', new Date(Date.now() - this.cleanupInterval).toISOString())
                                       .select('id');
      
      //wenn es keine Kreationen gibt, die älter als 24h sind
      if (gel_Kreationen_2.length > 0) {
    
      //verbindung kreation zu toppings löschen wenn kreation älter als 24h
      const kreation_id_2 = gel_Kreationen_2.map((kreation) => kreation.id);
      await db.from('kreation_toppings')
             .whereIn('kreation_id', kreation_id_2)
             .delete();

      //kreationen löschen, die nicht im warenkorb waren, nicht favorisiert wurden und älter als 24h sind
      await db.from('kreation')
             .orWhere('id', kreation_id_2)
             .andWhere('favorisiert', 0)
             .delete();

      console.log('Bereinigung abgeschlossen'); }

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
