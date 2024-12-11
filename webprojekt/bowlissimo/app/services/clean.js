//Wir speichern alle Warenkörbe in der Datenbank, die erstellt werden
//Alle, die nicht bestellt werden (in_bestellung: 0) werden nach 24 Stunden gelöscht


const Database = use('Database')


// Service für das Löschen von alten Warenkörben
//Services sind Klassen, die wiederverwendbare Funktionen enthalten. Sie können in Controllern oder anderen Services verwendet werden.
class CartCleanupService {
  constructor () {
    this.cleanupInterval = 24 * 60 * 60 * 1000 // 24 Stunden
    this.startCleanup()
  }

  async cleanupOldCarts () {
    try {
      // Löscht alle nicht bestellten Warenkörbe, die älter als 24 Stunden sind
      const deleted = await Database
        .from('warenkorb_bestellung') 
        .where('in_bestellung', 0)
        .where('zeitstempel', '<', Database.raw('NOW() - INTERVAL 24 HOUR'))
        .delete()

      console.log(`${deleted} Warenkörbe wurden gelöscht.`)
    } catch (error) {
      console.error('Fehler beim Löschen der Warenkörbe:', error)
    }
  }

  startCleanup () {
    // Startet das Intervall für die regelmäßige Ausführung alle 24 Stunden
    setInterval(() => {
      this.cleanupOldCarts()
    }, this.cleanupInterval)
  }
}

module.exports = CartCleanupService
