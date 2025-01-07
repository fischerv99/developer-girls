import db from "@adonisjs/lucid/services/db" // Import für Datenbankzugriffe

class CartCleanupService {
  cleanup(sessionId: string) {
    throw new Error('Method not implemented.');
  }
  static start() {
    throw new Error('Method not implemented.');
  } 
  private static instance: CartCleanupService;
  private cleanupInterval: number;

  private constructor() {
    this.cleanupInterval = 24 * 60 * 60 * 1000; // 24h in ms
      this.startCleanup();
    }

    static getInstance(): CartCleanupService {
      if (!CartCleanupService.instance) {
        CartCleanupService.instance = new CartCleanupService();
      }
      return CartCleanupService.instance;
    }
  
    private startCleanup() {
      setInterval(() => {
        this.cleanupOldCarts();
      }, this.cleanupInterval);
  }

  private async cleanupOldCarts() {
    try {
      const  bereinigungs_zeit = new Date(Date.now() - this.cleanupInterval).toISOString(); //zeitstempel ist mind 24h älter als jetzt

      const gel_warenkorb = await db.from('warenkorb_bestellung')
                                           .where('in_bestellung', 0)
                                           .andWhere('zeitstempel', '<', bereinigungs_zeit) 
                                           .select('id');
       
      //wenn es welche gibt:
      if (gel_warenkorb.length > 0) {

        console.log('Alte Warenkörbe vorhanden, die nicht bestellt wurden: ', gel_warenkorb);

      const warenkorb_ids = gel_warenkorb.map((warenkorb) => warenkorb.id);
      console.log('zu löschende Warenkorb IDs: ', warenkorb_ids);

      const gel_podukte = await db.from('ausgewaehltes_produkt')
                                  .whereIn('warenkorb_id', warenkorb_ids)
                                  .select('produkt')
                                  .whereIn('warenkorb_id', warenkorb_ids)
                                  .select('produkt');
      //ergebnis ist array mit produkt ids: [{produkt: 1}, {produkt: 2}, ...]
      console.log('zu löschende Produkte: ', gel_podukte);

     //kreationen, die im Warenkörben waren aber nicht bestellt wurden
      const gel_produkte_id = gel_podukte.map((produkt) => produkt.produkt);
      console.log('zu löschende Produkte IDs: ', gel_produkte_id);
      
      const gel_kreationen_1 = await db.from('kreation')
                                       .whereIn('id', gel_produkte_id)
                                       .andWhere('favorisiert', 0)
                                       .select('id');
             //ergebnnis ist array mit kreationen: [{id: 1, ...}, {id: 2, ...}, ...]
        console.log('zu löschende Kreationen: ', gel_kreationen_1);
        
    //verbindung kreation zu toppings löschen wenn kreation nicht mehr vorhanden
    const gel_kreationen_1_ids = gel_kreationen_1.map((kreation) => kreation.id);
    console.log('zu löschende Kreationen IDs: ', gel_kreationen_1_ids);

    const gel_toppings_1 = await db.from('kreation_toppings')
                                   .whereIn('kreation_id', gel_kreationen_1_ids)
                                   .delete(); 

    console.log('alte toppings gelöscht', gel_toppings_1);

    //kreationen löschen, die im Warenkorb waren aber nicht bestellt wurden,äler als 14h sind und nicht favorisiert sind
    await db.from('kreation')
            .whereIn('id', gel_kreationen_1_ids)
            .andWhere('zeitstempel', '<', bereinigungs_zeit)
            .andWhere('favorisiert', 0)
            .delete();

    console.log('alte kreationen, die nicht bestellt gelöscht', gel_kreationen_1_ids);
    
     //ausgewählte Produkte löschen, die im Warenkorb waren aber nicht bestellt wurden
     await db.from('ausgewaehltes_produkt')
             .whereIn('warenkorb_id', warenkorb_ids) 
             .delete();

      console.log('alte Produkte aus Warenkorb gelöscht', warenkorb_ids);

   //Warenkorb löschen, die nicht bestellt wurden
   await db.from('warenkorb_bestellung')
           .whereIn('id', warenkorb_ids)
           .delete();

      console.log('Alte Warenkörbe gelöscht');


    //Kreationen löschen, die nicht im Warenkorb waren und älter als 24h sind
    const gel_Kreationen_2 = await db.from('kreation')
    .where('status', "nicht_warenkorb")
    .andWhere('favorisiert', 0)
    .andWhere('zeitstempel', '<', bereinigungs_zeit)
    .select('id');

    //wenn es Kreationen gibt, die älter als 24h sind und nicht im Warenkorb waren
    if (gel_Kreationen_2.length > 0) {

    console.log('Kreationen vorhanden, die nicht im Warenkorb waren und älter als 24h sind');

    //verbindung kreation zu toppings löschen wenn kreation älter als 24h
    const kreation_id_2 = gel_Kreationen_2.map((kreation) => kreation.id);
    console.log('zu löschende Kreationen IDs 2: ', kreation_id_2);

    const gel_toppings_2= await db.from('kreation_toppings')
                                  .whereIn('kreation_id', kreation_id_2)
                                  .delete()

    console.log('alte toppings 2 gelöscht', gel_toppings_2);

    //kreationen löschen, die nicht im Warenkorb waren und älter als 24h sind
    await db.from('kreation')
            .whereIn('id', kreation_id_2)
            .delete();

    console.log('alte kreationen gelöscht', kreation_id_2);
    }
  } else {
      //Kreationen löschen, die nicht im Warenkorb waren und älter als 24h sind
      const gel_Kreationen_2 = await db.from('kreation')
                                       .where('status', "nicht_warenkorb")
                                       .andWhere('favorisiert', 0)
                                       .andWhere('zeitstempel', '<', bereinigungs_zeit)
                                       .select('id');

     //wenn es Kreationen gibt, die älter als 24h sind und nicht im Warenkorb waren
      if (gel_Kreationen_2.length > 0) {

        console.log('Kreationen vorhanden, die nicht im Warenkorb waren und älter als 24h sind');
    
      //verbindung kreation zu toppings löschen wenn kreation älter als 24h
      const kreation_id_2 = gel_Kreationen_2.map((kreation) => kreation.id);
      console.log('zu löschende Kreationen IDs 2: ', kreation_id_2);

      const gel_toppings_2= await db.from('kreation_toppings')
                                    .whereIn('kreation_id', kreation_id_2)
                                    .delete()
  
      console.log('alte toppings 2 gelöscht', gel_toppings_2);

      //kreationen löschen, die nicht im Warenkorb waren und älter als 24h sind
      await db.from('kreation')
              .whereIn('id', kreation_id_2)
              .delete();

      console.log('alte kreationen gelöscht', kreation_id_2);
      } }

    } catch (error) {
      console.error('Fehler beim Bereinigen des Warenkorbs:', error);
    }
  } }

  export default CartCleanupService;

