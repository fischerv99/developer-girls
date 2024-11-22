import type { HttpContext } from '@adonisjs/core/http'

export default class SonstigesController {

    public async datenschutz({ view }: HttpContext) {
        return view.render('pages/datenschutz')
    }
      
    public async impressum({ view }: HttpContext) {
        return view.render('pages/impressum')
    }
    
}