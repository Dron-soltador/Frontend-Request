import { validarEmail, validarPassword, validarFormularioRegistro, validarFormularioLogin, LONGITUD_MINIMA_PASSWORD } from './validacion'

describe('validacion', () => {
  describe('validarEmail', () => {
    it('debe aceptar emails validos', () => {
      expect(validarEmail('usuario@ejemplo.com')).toBeNull()
      expect(validarEmail('nombre.apellido@dominio.org')).toBeNull()
    })

    it('debe rechazar emails vacios', () => {
      expect(validarEmail('')).toBe('Ingresa tu correo electronico.')
    })

    it('debe rechazar formato invalido', () => {
      expect(validarEmail('usuario@')).toBe('El formato del correo no es valido.')
      expect(validarEmail('usuario')).toBe('El formato del correo no es valido.')
      expect(validarEmail('usario@dominio')).toBe('El formato del correo no es valido.')
    })
  })

  describe('validarPassword', () => {
    it('debe aceptar contrasenas con la longitud minima', () => {
      expect(validarPassword('12345678')).toBeNull()
    })

    it('debe rechazar contrasenas muy cortas', () => {
      expect(validarPassword('1234567')).toBe('La contrasena debe tener al menos 8 caracteres.')
    })

    it('debe rechazar contrasena vacia', () => {
      expect(validarPassword('')).toBe('Ingresa tu contrasena.')
    })
  })

  describe('LONGITUD_MINIMA_PASSWORD', () => {
    it('debe ser 8', () => {
      expect(LONGITUD_MINIMA_PASSWORD).toBe(8)
    })
  })

  describe('validarFormularioLogin', () => {
    it('debe ser valido con campos completos', () => {
      const resultado = validarFormularioLogin('test@test.com', 'password123')
      expect(resultado.valido).toBe(true)
      expect(resultado.errores).toEqual({})
    })

    it('debe mostrar error de email invalido', () => {
      const resultado = validarFormularioLogin('email-invalido', 'password123')
      expect(resultado.valido).toBe(false)
      expect(resultado.errores.email).toBe('El formato del correo no es valido.')
    })

    it('debe mostrar error de password requerido', () => {
      const resultado = validarFormularioLogin('test@test.com', '')
      expect(resultado.valido).toBe(false)
      expect(resultado.errores.password).toBe('Ingresa tu contrasena.')
    })
  })

  describe('validarFormularioRegistro', () => {
    it('debe ser valido con todos los campos y confirmacion coincidente', () => {
      const resultado = validarFormularioRegistro(
        'usuario@test.com',
        'password123',
        'password123'
      )
      expect(resultado.valido).toBe(true)
      expect(resultado.errores).toEqual({})
    })

    it('debe mostrar error de confirmacion mismatch', () => {
      const resultado = validarFormularioRegistro(
        'usuario@test.com',
        'password123',
        'password456'
      )
      expect(resultado.valido).toBe(false)
      expect(resultado.errores.confirmacion).toBe('Las contrasenas no coinciden.')
    })

    it('debe ser invalido si falta email', () => {
      const resultado = validarFormularioRegistro('', 'password123', 'password123')
      expect(resultado.valido).toBe(false)
      expect(resultado.errores.email).toBe('Ingresa tu correo electronico.')
    })
  })
})