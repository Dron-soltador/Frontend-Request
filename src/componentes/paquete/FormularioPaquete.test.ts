import { esFragil, CATEGORIAS, DatosPaquete } from './FormularioPaquete'

describe('FormularioPaquete', () => {
  describe('esFragil', () => {
    it('deberia retornar true para categoria Fragil', () => {
      expect(esFragil('Fragil')).toBe(true)
    })

    it('deberia retornar false para categoria Estandar', () => {
      expect(esFragil('Estandar')).toBe(false)
    })
  })

  describe('CATEGORIAS', () => {
    it('deberia contener las dos categorias esperadas', () => {
      expect(CATEGORIAS).toHaveLength(2)
      expect(CATEGORIAS[0].valor).toBe('Estandar')
      expect(CATEGORIAS[1].valor).toBe('Fragil')
    })

    it('deberia tener descripciones adecuadas', () => {
      expect(CATEGORIAS[0].descripcion).toBe('Sin cuidados especiales')
      expect(CATEGORIAS[1].descripcion).toBe('Manejo delicado, +15%')
    })
  })

  describe('DatosPaquete', () => {
    it('deberia crear un objeto DatosPaquete valido', () => {
      const paquete: DatosPaquete = {
        peso_kg: 2.5,
        fecha_programada: '2024-12-25',
        categoria: 'Estandar',
        es_urgente: false,
        descripcion: 'Repuestos',
      }
      expect(paquete.peso_kg).toBe(2.5)
      expect(paquete.categoria).toBe('Estandar')
      expect(paquete.es_urgente).toBe(false)
      expect(paquete.descripcion).toBe('Repuestos')
    })
  })
})