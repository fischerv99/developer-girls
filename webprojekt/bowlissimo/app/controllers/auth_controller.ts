import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  public async login({ request, auth, session, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    
    try {
      const user = await auth.attempt(email, password)
      session.put('auth', {
        userId: user.id,
        isAdmin: user.isAdmin
      })
      return response.redirect().toPath('/')
    } catch {
      session.flash('error', 'Ungültige Anmeldedaten')
      return response.redirect().back()
    }
  }

  public async logout({ auth, session, response }: HttpContext) {
    await auth.logout()
    session.forget('auth')
    session.flash('info', 'Erfolgreich abgemeldet')
    return response.redirect().toPath('/login')
  }
}