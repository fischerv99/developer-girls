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

router.get('/', async ({ view }) => {
  const pasta = await db.from('pasta').select('*')
  return view.render('startseite', { pasta}) 
})


router.get('/startseite_drinks', async ({ view }) => {
  const getränke = await db.from('getränke').select('*') 
  return view.render('startseite_drinks', { getränke })
})

router.get('/startseite_beilagen', async ({ view }) => {
  const beilagen = await db.from('beilagen').select('*') 
  return view.render('startseite_beilagen', { beilagen })
})
