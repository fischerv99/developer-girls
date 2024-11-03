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

router.get('/home', () => {
    return view.render('home')
})