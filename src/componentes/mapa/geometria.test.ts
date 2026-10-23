import { distanciaHaversineKm, esPuntoValido, formatearCoordenada, normalizarPunto } from './geometria'

describe('geometria', () => {
  describe('normalizarPunto', () => {
    it('deberia normalizar un punto con valores validos', () => {
      const resultado = normalizarPunto({ latitud: -34.6037, longitud: -58.3816 })
      expect(resultado).toEqual({ latitud: -34.6037, longitud: -58.3816 })
    })

    it('deberia manejar puntos con valores extremos', () => {
      const resultado = normalizarPunto({ latitud: 90, longitud: 180 })
      expect(resultado).toEqual({ latitud: 90, longitud: 180 })
    })
  })

  describe('esPuntoValido', () => {
    it('deberia retornar true para un punto con latitud y longitud definidos', () => {
      expect(esPuntoValido({ latitud: -34.6, longitud: -58.4 })).toBe(true)
    })

    it('deberia retornar false para null', () => {
      expect(esPuntoValido(null)).toBe(false)
    })

    it('deberia retornar false para undefined', () => {
      expect(esPuntoValido(undefined)).toBe(false)
    })

    it('deberia retornar false para un objeto sin propiedades', () => {
      expect(esPuntoValido({})).toBe(false)
    })
  })

  describe('formatearCoordenada', () => {
    it('deberia formatear coordenadas negativas', () => {
      expect(formatearCoordenada(-34.6037)).toBe('-34.6')
      expect(formatearCoordenada(-58.3816)).toBe('-58.4')
    })

    it('deberia formatear coordenadas positivas', () => {
      expect(formatearCoordenada(34.6037)).toBe('34.6')
      expect(formatearCoordenada(58.3816)).toBe('58.4')
    })

    it('deberia formatear coordenadas con ceros', () => {
      expect(formatearCoordenada(0)).toBe('0')
    })
  })

  describe('distanciaHaversineKm', () => {
    it('deberia calcular distancia aproximada entre dos puntos cercanos', () => {
      const p1 = { latitud: -34.6037, longitud: -58.3816 }
      const p2 = { latitud: -34.6137, longitud: -58.3916 }
      const dist = distanciaHaversineKm(p1, p2)
      expect(dist).toBeGreaterThan(0)
      expect(dist).toBeLessThan(5) // unos 1 km aproximadamente
    })

    it('deberia retornar null para puntos invalidos', () => {
      expect(distanciaHaversineKm(null, null)).toBeNull()
      expect(distanciaHaversineKm({} as any, {} as any)).toBeNull()
    })
  })
})