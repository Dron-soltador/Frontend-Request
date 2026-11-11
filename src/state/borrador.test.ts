import { guardarBorrador, leerBorrador, limpiarBorrador, hayCambiosSinGuardar, tiempoRelativo, BorradorPedido } from './borrador'
import type { PuntoEtiquetado } from './localizacion'

describe('borrador', () => {
  const CLAVE_TEST = 'test-borrador-key'

  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.setItem(CLAVE_TEST, JSON.stringify(null))
  })

  afterEach(() => {
    limpiarBorrador()
  })

  describe('guardarBorrador', () => {
    it('debe guardar un borrador en localStorage y devolverlo', () => {
      const borrador: BorradorPedido = {
        origen: { punto: { latitud: -34.6, longitud: -58.4 }, direccion: 'Test' },
        destino: { punto: { latitud: -34.7, longitud: -58.5 }, direccion: 'Test Dest' },
        guardadoEn: '2024-01-01T00:00:00Z',
      }
      localStorage.setItem(CLAVE_TEST, JSON.stringify(null)) // reset

      const resultado = guardarBorrador(borrador.origen, borrador.destino)
      expect(resultado).toEqual(borrador)

      const almacenado = JSON.parse(localStorage.getItem(CLAVE_TEST) || '{}')
      expect(almacenado).toEqual(borrador)
    })
  })

  describe('leerBorrador', () => {
    it('deberia devolver null cuando localStorage esta vacio', () => {
      localStorage.setItem(CLAVE_TEST, JSON.stringify(null))
      expect(leerBorrador()).toBeNull()
    })

    it('deberia devolver el borrador guardado', () => {
      const borrador: BorradorPedido = {
        origen: { punto: { latitud: -34.6, longitud: -58.4 }, direccion: 'Casa' },
        destino: null,
        guardadoEn: '2024-01-01T00:00:00Z',
      }
      localStorage.setItem(CLAVE_TEST, JSON.stringify(borrador))

      expect(leerBorrador()).toEqual(borrador)
    })
  })

  describe('limpiarBorrador', () => {
    it('deberia remover el borrador de localStorage', () => {
      const borrador: BorradorPedido = {
        origen: { punto: { latitud: -34.6, longitud: -58.4 }, direccion: 'Casa' },
        destino: null,
        guardadoEn: '2024-01-01T00:00:00Z',
      }
      localStorage.setItem(CLAVE_TEST, JSON.stringify(borrador))

      limpiarBorrador()
      expect(localStorage.getItem(CLAVE_TEST)).toBeNull()
    })
  })

  describe('hayCambiosSinGuardar', () => {
    it('deberia devolver true cuando no hay borrador previo', () => {
      expect(hayCambiosSinGuardar(null, null, null)).toBe(true)
    })

    it('deberia devolver true cuando los puntos cambiaron', () => {
      const borradorAnterior: BorradorPedido = {
        origen: { punto: { latitud: -34.6, longitud: -58.4 }, direccion: 'Casa Vieja' },
        destino: null,
        guardadoEn: '2024-01-01T00:00:00Z',
      }

      const origenActual = { punto: { latitud: -34.7, longitud: -58.5 }, direccion: 'Casa Nueva' }
      expect(hayCambiosSinGuardar(borradorAnterior, origenActual, null)).toBe(true)
    })

    it('deberia devolver false cuando los puntos son iguales', () => {
      const borrador: BorradorPedido = {
        origen: { punto: { latitud: -34.6, longitud: -58.4 }, direccion: 'Casa' },
        destino: null,
        guardadoEn: '2024-01-01T00:00:00Z',
      }

      const origenIgual = { punto: { latitud: -34.6, longitud: -58.4 }, direccion: 'Casa' }
      expect(hayCambiosSinGuardar(borrador, origenIgual, null)).toBe(false)
    })
  })

  describe('tiempoRelativo', () => {
    it('deberia devolver "hace instancias" para tiempos recientes', () => {
      const ayer = new Date()
      ayer.setSeconds(ayer.getSeconds() - 30)
      expect(tiempoRelativo(ayer.toISOString())).toBe('hace instantes')
    })

    it('deberia devolver minutos para tiempos de menos de 1 hora', () => {
      const hace15Min = new Date()
      hace15Min.setMinutes(hace15Min.getMinutes() - 15)
      expect(tiempoRelativo(hace15Min.toISOString())).toBe('hace 15 min')
    })

    it('deberia devolver horas para tiempos de menos de 1 dia', () => {
      const hace2h = new Date()
      hace2h.setHours(hace2h.getHours() - 2)
      expect(tiempoRelativo(hace2h.toISOString())).toBe('hace 2 h')
    })

    it('deberia devolver dias para tiempos mayores', () => {
      const hace3d = new Date()
      hizo3d.setDate(hace3d.getDate() - 3)
      expect(tiempoRelativo(hace3d.toISOString())).toBe('hace 3 d')
    })
  })
})