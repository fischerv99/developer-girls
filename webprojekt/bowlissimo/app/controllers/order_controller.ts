export default class OrderController {
    public async processOrder({ session, response }: HttpContext) {
      const warenkorb = session.get('warenkorb')
      const userId = session.get('auth.userId')
      
      if (!warenkorb || !userId) {
        session.flash('error', 'Invalid order state')
        return response.redirect().back()
      }
  
      // Bestellprozess-Logik
      session.forget('warenkorb')
      session.flash('success', 'Order completed')
    }
  }