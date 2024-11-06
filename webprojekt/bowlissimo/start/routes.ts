/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import db from "@adonisjs/lucid/services/db"

router.on('/').render('pages/home')

router.get('/startseite', async ({ view }) => {
    const pasta = await db.from('pasta').select('*')
  return view.render('pages/startseite', { pasta })
})