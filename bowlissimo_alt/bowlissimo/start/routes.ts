/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import Database from '@ioc:Adonis/Lucid/Database'

router.get('/', async ({ view }) => {
    const pasta = await Database.from('pasta').select('*')
    return view.render('startseite1', { pasta}) 
})


router.get('/startseite_drinks', async ({ view }) => {
    const getränke = await Database.from('getränke').select('*') 
    return view.render('startseite_drinks', { getränke })
})

router.get('/startseite_beilagen', async ({ view }) => {
    const beilagen = await Database.from('beilagen').select('*') 
    return view.render('startseite_beilagen', { beilagen })
})
