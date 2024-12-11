//Wir speichern alle Warenkörbe in der Datenbank, die erstellt werden
//Alle, die nicht bestellt werden (in_bestellung: 0) werden nach 24 Stunden gelöscht


const Database = use('Database')


// Löschen von Warenkörben, die nicht bestellt wurden 
//Löschen von ausgewählten Produkten, die in nicht bestellten Warenkörben liegen
//Löschen von Kreationen, (die ausgewaehlte Produkte sind) die in nicht bestellten Warenkörben liegen und nicht favorisiert sind
//Löschen von der Verbindung kreation_toppings, die Kreationen enthalten, die in nicht bestellten Warenkörben liegen und nicht favorisiert sind


//Services sind Klassen, die wiederverwendbare Funktionen enthalten. Sie können in Controllern oder anderen Services verwendet werden.
class CartCleanupService {
  constructor () {
    this.cleanupInterval = 24 * 60 * 60 * 1000 // 24 Stunden
    this.startCleanup()
  }

  async cleanupOldCarts () {
      // Löscht alles, die älter als 24 Stunden sind
      const gelöschte_warenkörbe =await Database.from('warenkorb_bestellung') 
                                                .where('in_bestellung', 0)
                                                .where('zeitstempel', '<', Database.raw('NOW() - INTERVAL 24 HOUR'))
                                                .delete()
      
      const gelöschte_produkte = await Database.from('ausgwwaehltes_produkt')
                                                .where('warenkorb_id', 'in', gelöschte_warenkörbe)
                                                .delete()

      const gelöschte_kreationen = await Database.from('kreation')
                                                  .where('id', 'in', gelöschte_produkte)
                                                  .where('favorisiert', 0)
                                                  .delete()
      
      const gelöschte_kreation_toppings = await Database.from('kreation_toppings')
                                                        .where('kreation_id', 'in', gelöschte_kreationen)

  }

  startCleanup () {
    // Startet das Intervall für die regelmäßige Ausführung alle 24 Stunden
    setInterval(() => {
      this.cleanupOldCarts()
    }, this.cleanupInterval)
  }
}

module.exports = CartCleanupService
