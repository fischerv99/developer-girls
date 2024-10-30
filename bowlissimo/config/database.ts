import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

const databaseConfig: DatabaseConfig = {
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'sqlite3',
      connection: {
        filename: 'C:\Users\jule\OneDrive\Dokumente\GitHub\developer-girls\bowlissimo\database.db', // Pfad zur SQLite-Datei
      },
      useNullAsDefault: true,
    },
  },
}

export default databaseConfig

