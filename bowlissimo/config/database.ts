import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

const databaseConfig: DatabaseConfig = {
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'sqlite3',
      connection: {
        filename: '\developer-girls\bowlissimo\database.db', // Pfad zur SQLite-Datei
      },
      useNullAsDefault: true,
    },
  },
}

export default databaseConfig

