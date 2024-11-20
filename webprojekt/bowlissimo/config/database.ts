const dbConfig = {
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: 'database2.db', // Pfad zur bestehenden Datenbank 
      },
      useNullAsDefault: true,
    },
  },
}

export default dbConfig
