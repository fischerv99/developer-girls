import db from "@adonisjs/lucid/services/db" // Import für Datenbankzugriffe

class CartCleanupService { 
  private cleanupInterval: number;

  constructor() {
    this.cleanupInterval = 60 * 24; // alle 24h wird der Warenkorb bereinigt
    this.startCleanup();
  }

  private async cleanupOldCarts() {
    try {
      const  bereinigungs_zeit = new Date(Date.now() - this.cleanupInterval).toISOString(); //zeitstempel ist mind 24h älter als jetzt

      const gel_warenkorb = await db.from('warenkorb_bestellung')
                                           .where('in_bestellung', 0)
                                           .andWhere('zeitstempel', '<', bereinigungs_zeit) 
                                           .select('id');
      
      console.log('Los gehts mit:', gel_warenkorb);

      //wenn es welche gibt:
      if (gel_warenkorb.length > 0) {

        console.log('Alte Warenkörbe vorhanden, die nicht bestellt wurden: ', gel_warenkorb);

      const warenkorb_ids = gel_warenkorb.map((warenkorb) => warenkorb.id);
      console.log('Warenkorb IDs: ', warenkorb_ids);

      const gel_podukte = await db.from('ausgewaehltes_produkt')
                                  .whereIn('warenkorb_id', warenkorb_ids)
                                  .select('produkt');
      //ergebnis ist array mit produkt ids: [{produkt: 1}, {produkt: 2}, ...]

     //kreationen, die im Warenkörben waren aber nicht bestellt wurden
      const gel_produkte_id = gel_podukte.map((produkt) => produkt.produkt);
      console.log('Produkte IDs: ', gel_produkte_id);
      
      const gel_kreationen_1 = await db.from('kreation')
                                       .whereIn('id', gel_produkte_id)
                                       .where('favorisiert', 0)

        //ergebnnis ist array mit kreationen: [{id: 1, ...}, {id: 2, ...}, ...]
        console.log('Kreationen: ', gel_kreationen_1);
        
    //verbindung kreation zu toppings löschen wenn kreation nicht mehr vorhanden
    const gel_kreationen_1_ids = gel_kreationen_1.map((kreation) => kreation.id);
    console.log('Kreationen IDs: ', gel_kreationen_1_ids);

    await db.from('kreation_toppings')
    .whereIn('kreation_id', gel_kreationen_1_ids)
    .delete(); 

    console.log('alte toppings gelöscht', gel_kreationen_1_ids);

    //kreationen löschen, die im Warenkorb waren aber nicht bestellt wurden,äler als 14h sind und nicht favorisiert sind
    const kreation_id_1 = gel_kreationen_1.map((kreation) => kreation.id);
    await db.from('kreation')
    .whereIn('id', kreation_id_1)
    .andWhere('zeitstempel', '<', bereinigungs_zeit)
    .andWhere('favorisiert', 0)
    .delete();

    console.log('alte kreationen, die nicht bestellt gelöscht', kreation_id_1);

     //ausgewählte Produkte löschen, die im Warenkorb waren aber nicht bestellt wurden
     await db.from('ausgewähltes_produkt')
     .whereIn('warenkorb_id', warenkorb_ids) 
     .delete();

      console.log('alte Produkte aus Warenkorb gelöscht', warenkorb_ids);

   //Warenkorb löschen, die nicht bestellt wurden
   await db.from('warenkorb_bestellung')
     .where('in_bestellung', 0)
     .delete();

      console.log('Alte Warenkörbe gelöscht');
      
      }
      
      //kreationen, die nicht im Warenkorb waren und älter als 24h sind
      const gel_Kreationen_2 = await db.from('kreation')
                                       .where('status', "nicht_warenkorb")
                                       .where('favorisiert', 0)
                                       .andWhere('zeitstempel', '<', bereinigungs_zeit)
                                       .select('id');
      
      //wenn es keine Kreationen gibt, die älter als 24h sind
      if (gel_Kreationen_2.length > 0) {

        console.log('Kreationen vorhanden, die nicht im Warenkorb waren und älter als 24h sind');
    
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
