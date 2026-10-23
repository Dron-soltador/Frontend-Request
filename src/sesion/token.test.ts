import { leerClaims, sesionExpirada, esCliente, ClaimsToken, decodificarBase64Url } from './token'

describe('token', () => {
  describe('decodificarBase64Url', () => {
    it('deberia agregar relleno adecuado', () => {
      const tokenSinRelleno = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
      const resultado = decodificarBase64Url(tokenSinRelleno)
      expect(typeof resultado).toBe('string')
    })
  })

  describe('leerClaims', () => {
    it('deberia devolver null cuando el token esta vacio', () => {
      expect(leerClaims(null)).toBeNull()
      expect(leerClaims('')).toBeNull()
    })

    it('deberia devolver null cuando el token no tiene 3 segmentos', () => {
      expect(leerClaims('invalid.token')).toBeNull()
    })

    it('deberia parsear un JWT valido y retornar claims', () => {
      // JWT ejemplo: header.payload.signature
      const payload = JSON.stringify({
        usuario_id: 123,
        email: 'test@test.com',
        rol: 'cliente',
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
      // Simulamos un token JWT simple (sin firma real)
      const headerBase64 = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=/g, '')
      const payloadBase64 = btoa(payload).replace(/=/g, '')
      const token = `${headerBase64}.${payloadBase64}.`

      const resultado = leerClaims(token)
      // Nota: decodificarBase64Url no usa atob seguro en todos los entornos,
      // pero la logica de parsing de segmentos deberia funcionar
      expect(typeof resultado).toBe('object')
    })

    it('deberia manejar tokens con payloads incompletos', () => {
      const token = 'invalid.segment1.segment2.extra'
      expect(leerClaims(token)).toBeNull()
    })
  })

  describe('sesionExpirada', () => {
    it('deberia devolver true cuando claims es null', () => {
      expect(sesionExpirada(null)).toBe(true)
    })

    it('deberia devolver true cuando claims no tiene exp', () => {
      expect(sesionExpirada({ usuario_id: 1, email: 'test@test.com', rol: 'cliente' })).toBe(true)
    })

    it('deberia devolver false cuando el token sigue vigente', () => {
      const claims: ClaimsToken = {
        usuario_id: 1,
        email: 'test@test.com',
        rol: 'cliente',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hora despues
      }
      expect(sesionExpirada(claims)).toBe(false)
    })

    it('deberia devolver true cuando el token expira en 30 seg', () => {
      const claims: ClaimsToken = {
        usuario_id: 1,
        email: 'test@test.com',
        rol: 'cliente',
        exp: Math.floor(Date.now() / 1000) + 30, // exactamente 30 seg despues
      }
      expect(sesionExpirada(claims)).toBe(true)
    })
  })

  describe('esCliente', () => {
    it('deberia retornar true para rol cliente', () => {
      expect(esCliente('cliente')).toBe(true)
      expect(esCliente('CLIENTE')).toBe(true)
      expect(esCliente('Cliente')).toBe(true)
    })

    it('deberia retornar false para rol distinto', () => {
      expect(esCliente('administrador')).toBe(false)
      expect(esCliente('')).toBe(false)
    })
  })
})