import { Navigate, Route, Routes } from 'react-router-dom'

import { Avisos } from './componentes/avisos/Avisos'
import PaginaMisPedidos from './paginas/PaginaMisPedidos'
import PaginaLogin from './paginas/PaginaLogin'
import PaginaNoEncontrada from './paginas/PaginaNoEncontrada'
import PaginaPanel from './paginas/PaginaPanel'
import PaginaPedido from './paginas/PaginaPedido'
import PaginaRegistro from './paginas/PaginaRegistro'
import PaginaSinAcceso from './paginas/PaginaSinAcceso'
import { RutaProtegida, RutaPublica } from './rutas/Guardias'
import { ProveedorSesion } from './sesion/SesionContext'

export default function App() {
  return (
    <ProveedorSesion>
      <Avisos>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/login"
            element={
              <RutaPublica>
                <PaginaLogin />
              </RutaPublica>
            }
          />

          <Route
            path="/registro"
            element={
              <RutaPublica>
                <PaginaRegistro />
              </RutaPublica>
            }
          />

          <Route
            path="/panel"
            element={
              <RutaProtegida>
                <PaginaPanel />
              </RutaProtegida>
            }
          />

          <Route
            path="/pedido"
            element={
              <RutaProtegida>
                <PaginaPedido />
              </RutaProtegida>
            }
          />

          <Route
            path="/mis-pedidos"
            element={
              <RutaProtegida>
                <PaginaMisPedidos />
              </RutaProtegida>
            }
          />

          {/* Ruta anterior, se conserva para no romper enlaces ya compartidos. */}
          <Route
            path="/puntos"
            element={
              <RutaProtegida>
                <Navigate to="/pedido" replace />
              </RutaProtegida>
            }
          />

          <Route path="/sin-acceso" element={<PaginaSinAcceso />} />
          <Route path="*" element={<PaginaNoEncontrada />} />
        </Routes>
      </Avisos>
    </ProveedorSesion>
  )
}