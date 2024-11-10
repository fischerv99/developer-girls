const dbConfig = {
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: './database/migrations/database.db', // Pfad zur bestehenden Datenbank 
      },
      useNullAsDefault: true,
    },
  },
}

export default dbConfig
