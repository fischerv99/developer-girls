import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

const databaseConfig: DatabaseConfig = {
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'sqlite',
      connection: {
        filename: './database.sqlite',
      },
      useNullAsDefault: true,
    },
  },
}

export default databaseConfig
