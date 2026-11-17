
import { useState, useEffect } from "react";
import { ref, push, onValue, update } from "firebase/database";
import { db } from "./firebase";
import "./App.css";

const productos = [
  { nombre: "Pollo entero", precio: 75, categoria: "Pollos", emoji: "🍗" },
  { nombre: "1/2 Pollo", precio: 42, categoria: "Pollos", emoji: "🍗" },
  { nombre: "1/4 Pollo", precio: 23, categoria: "Pollos", emoji: "🍗" },
  { nombre: "Coca Cola 1L", precio: 10, categoria: "Bebidas", emoji: "🥤" },
  { nombre: "Inca Kola 1L", precio: 10, categoria: "Bebidas", emoji: "🥤" },
  { nombre: "Pepsi 1L", precio: 9, categoria: "Bebidas", emoji: "🥤" },
  { nombre: "Gaseosa personal", precio: 5, categoria: "Bebidas", emoji: "🥤" },
  { nombre: "Agua mineral", precio: 3, categoria: "Bebidas", emoji: "💧" },
  { nombre: "Chicha morada vaso", precio: 5, categoria: "Bebidas", emoji: "🍹" },
  { nombre: "Chicha morada jarra", precio: 15, categoria: "Bebidas", emoji: "🍹" },
  { nombre: "Cerveza", precio: 10, categoria: "Bebidas", emoji: "🍺" },
  { nombre: "Limonada", precio: 6, categoria: "Bebidas", emoji: "🍋" },
  { nombre: "Porción de papas", precio: 10, categoria: "Adicionales", emoji: "🍟" },
  { nombre: "Ensalada", precio: 7, categoria: "Adicionales", emoji: "🥗" },
];

function App() {
  const [seccion, setSeccion] = useState("inicio");
  const [categoria, setCategoria] = useState("Pollos");
  const [cliente, setCliente] = useState("");
  const [mesa, setMesa] = useState("1");
  const [carrito, setCarrito] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const pedidosRef = ref(db, "pedidos");

    const cancelar = onValue(
      pedidosRef,
      (snapshot) => {
        const datos = snapshot.val();

        if (datos) {
          const lista = Object.entries(datos).map(([id, pedido]) => ({
            id,
            ...pedido,
          }));
          setPedidos(lista.reverse());
        } else {
          setPedidos([]);
        }
      },
      (error) => {
        setMensaje("Error de Firebase: " + error.message);
      }
    );

    return () => cancelar();
  }, []);

  const agregarProducto = (producto) => {
    setCarrito((anterior) => {
      const existe = anterior.find(
        (item) => item.nombre === producto.nombre
      );

      if (existe) {
        return anterior.map((item) =>
          item.nombre === producto.nombre
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...anterior, { ...producto, cantidad: 1 }];
    });

    setMensaje("");
  };

  const cambiarCantidad = (nombre, cambio) => {
    setCarrito((anterior) =>
      anterior
        .map((item) =>
          item.nombre === nombre
            ? { ...item, cantidad: item.cantidad + cambio }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarProducto = (nombre) => {
    setCarrito((anterior) =>
      anterior.filter((item) => item.nombre !== nombre)
    );
  };

  const total = carrito.reduce(
    (suma, item) => suma + item.precio * item.cantidad,
    0
  );

  const enviarPedido = async (e) => {
    e.preventDefault();

    if (!cliente.trim()) {
      setMensaje("Escribe el nombre del cliente.");
      return;
    }

    if (carrito.length === 0) {
      setMensaje("Agrega al menos un producto.");
      return;
    }

    const nuevoPedido = {
      cliente: cliente.trim(),
      mesa,
      items: carrito,
      total,
      estado: "Pendiente",
      fecha: new Date().toLocaleString("es-PE"),
    };

    try {
      await push(ref(db, "pedidos"), nuevoPedido);
      setCliente("");
      setMesa("1");
      setCarrito([]);
      setMensaje("¡Pedido enviado correctamente a cocina!");
    } catch (error) {
      setMensaje("No se pudo guardar: " + error.message);
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await update(ref(db, "pedidos/" + id), { estado });
    } catch (error) {
      setMensaje("Error al actualizar: " + error.message);
    }
  };

  const obtenerItems = (pedido) => {
    if (pedido.items && Array.isArray(pedido.items)) {
      return pedido.items;
    }

    if (pedido.plato) {
      return [{
        nombre: pedido.plato,
        cantidad: Number(pedido.cantidad || 1),
        precio: Number(pedido.precio || 0),
      }];
    }

    return [];
  };

  const pedidosCocina = pedidos.filter(
    (p) => p.estado !== "Entregado"
  );

  const pedidosEntregados = pedidos.filter(
    (p) => p.estado === "Entregado"
  );

  const pendientes = pedidos.filter(
    (p) => p.estado === "Pendiente"
  ).length;

  const preparados = pedidos.filter(
    (p) => p.estado === "Preparado"
  ).length;

  const categorias = ["Pollos", "Bebidas", "Adicionales"];

  return (
    <div className="app">

      <aside className="sidebar">
        <h2>🍗 POLLERÍA</h2>
        <p className="subtitulo">Sistema de atención</p>

        <button onClick={() => setSeccion("inicio")}>🏠 Inicio</button>
        <button onClick={() => setSeccion("mesero")}>🧑‍🍳 Panel del mesero</button>
        <button onClick={() => setSeccion("cocina")}>🍳 Panel de cocina</button>
        <button onClick={() => setSeccion("admin")}>📋 Administración</button>
      </aside>

      <main className="contenido">

        <header>
          <div>
            <h1>Bienvenido a nuestra pollería</h1>
            <p>Sistema de gestión de pedidos</p>
          </div>
          <span className="estado">● Sistema activo</span>
        </header>

        {/* INICIO */}
        {seccion === "inicio" && (
          <section className="panel">
            <h2>Panel principal</h2>
            <p>Administra la atención de tus clientes y los pedidos.</p>

            <div className="tarjetas">
              <div className="tarjeta">
                <span>🧑‍🍳</span>
                <h3>Mesero</h3>
                <p>Registrar pedidos de clientes.</p>
                <button onClick={() => setSeccion("mesero")}>Entrar</button>
              </div>

              <div className="tarjeta">
                <span>🍳</span>
                <h3>Cocina</h3>
                <p>Recibir y preparar pedidos.</p>
                <button onClick={() => setSeccion("cocina")}>Entrar</button>
              </div>

              <div className="tarjeta">
                <span>📋</span>
                <h3>Administrador</h3>
                <p>Administrar el sistema.</p>
                <button onClick={() => setSeccion("admin")}>Entrar</button>
              </div>
            </div>
          </section>
        )}

        {/* MESERO */}
        {seccion === "mesero" && (
          <section className="panel">
            <h2>🧑‍🍳 Panel del mesero</h2>
            <p>Registra todos los productos en un solo pedido.</p>

            <form className="formulario" onSubmit={enviarPedido}>
              <label>Nombre del cliente</label>
              <input
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nombre del cliente"
                required
              />

              <label>Número de mesa</label>
              <select
                value={mesa}
                onChange={(e) => setMesa(e.target.value)}
              >
                {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                  <option key={n} value={n}>Mesa {n}</option>
                ))}
              </select>

              <h3>Selecciona los productos</h3>

              <div className="categorias">
                {categorias.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    className={categoria === cat ? "categoria activa" : "categoria"}
                    onClick={() => setCategoria(cat)}
                  >
                    {cat === "Pollos" ? "🍗" : cat === "Bebidas" ? "🥤" : "🍟"} {cat}
                  </button>
                ))}
              </div>

              <div className="productos-grid">
                {productos
                  .filter((p) => p.categoria === categoria)
                  .map((p) => (
                    <div className="producto-card" key={p.nombre}>
                      <span>{p.emoji}</span>
                      <strong>{p.nombre}</strong>
                      <p>S/ {p.precio.toFixed(2)}</p>
                      <button
                        type="button"
                        onClick={() => agregarProducto(p)}
                      >
                        + Agregar
                      </button>
                    </div>
                  ))}
              </div>

              <div className="carrito">
                <h3>🛒 Pedido del cliente</h3>

                {carrito.length === 0 ? (
                  <p>Selecciona productos para comenzar.</p>
                ) : (
                  carrito.map((item) => (
                    <div className="carrito-item" key={item.nombre}>
                      <div>
                        <strong>{item.nombre}</strong>
                        <p>
                          S/ {item.precio.toFixed(2)} x {item.cantidad}
                        </p>
                      </div>

                      <div className="controles">
                        <button type="button" onClick={() => cambiarCantidad(item.nombre, -1)}>−</button>
                        <strong>{item.cantidad}</strong>
                        <button type="button" onClick={() => cambiarCantidad(item.nombre, 1)}>+</button>
                        <button type="button" className="eliminar" onClick={() => eliminarProducto(item.nombre)}>✕</button>
                      </div>

                      <strong>
                        S/ {(item.precio * item.cantidad).toFixed(2)}
                      </strong>
                    </div>
                  ))
                )}

                <div className="total">
                  TOTAL: S/ {total.toFixed(2)}
                </div>
              </div>

              <button type="submit" className="enviar">
                📤 ENVIAR PEDIDO A COCINA
              </button>
            </form>

            {mensaje && <p className="mensaje">{mensaje}</p>}
          </section>
        )}

        {/* COCINA A PANTALLA COMPLETA */}
        {seccion === "cocina" && (
          <section className="cocina-pantalla">

            <div className="cocina-titulo">
              <div>
                <h1>🍳 PANEL DE COCINA</h1>
                <p>Control de todos los pedidos por mesa</p>
              </div>

              <div className="cocina-contadores">
                <div className="contador-pendiente">
                  <span>PENDIENTES</span>
                  <strong>{pendientes}</strong>
                </div>

                <div className="contador-preparado">
                  <span>PREPARADOS</span>
                  <strong>{preparados}</strong>
                </div>
              </div>
            </div>

            <div className="mesas-grid">
              {pedidosCocina.length === 0 ? (
                <div className="cocina-vacia">
                  <span>🍗</span>
                  <h2>No hay pedidos en cocina</h2>
                  <p>Los nuevos pedidos aparecerán aquí automáticamente.</p>
                </div>
              ) : (
                pedidosCocina.map((p) => (
                  <div
                    className={`mesa-pedido ${
                      p.estado === "Preparado" ? "mesa-lista" : ""
                    }`}
                    key={p.id}
                  >
                    <div className="mesa-encabezado">
                      <div className="mesa-numero">
                        <span>MESA</span>
                        <strong>{p.mesa}</strong>
                      </div>

                      <span className={`mesa-estado ${
                        p.estado === "Preparado" ? "listo" : "esperando"
                      }`}>
                        {p.estado === "Preparado" ? "✓ PREPARADO" : "● PENDIENTE"}
                      </span>
                    </div>

                    <div className="mesa-cliente">
                      <h3>👤 {p.cliente}</h3>
                      <small>Pedido #{p.id.slice(-5)}</small>
                      <small>{p.fecha || "Sin fecha"}</small>
                    </div>

                    <div className="mesa-productos">
                      <h4>🍽️ PRODUCTOS</h4>

                      {obtenerItems(p).map((item, index) => (
                        <div className="mesa-producto" key={index}>
                          <strong>{item.cantidad} x</strong>
                          <span>{item.nombre || item.plato}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mesa-total">
                      TOTAL
                      <strong>S/ {Number(p.total || 0).toFixed(2)}</strong>
                    </div>

                    <div className="mesa-botones">
                      {p.estado !== "Preparado" && (
                        <button
                          className="boton-listo"
                          onClick={() => cambiarEstado(p.id, "Preparado")}
                        >
                          ✓ PEDIDO PREPARADO
                        </button>
                      )}

                      <button
                        className="boton-entregar"
                        onClick={() => cambiarEstado(p.id, "Entregado")}
                      >
                        ✓ ENTREGAR PEDIDO
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ADMINISTRACION */}
        {seccion === "admin" && (
          <section className="panel">
            <h2>📋 Administración</h2>
            <p>Resumen e historial de todos los pedidos.</p>

            <div className="tarjetas">
              <div className="tarjeta">
                <h3>Total de pedidos</h3>
                <h2>{pedidos.length}</h2>
              </div>

              <div className="tarjeta">
                <h3>Pendientes</h3>
                <h2>{pendientes}</h2>
              </div>

              <div className="tarjeta">
                <h3>Preparados</h3>
                <h2>{preparados}</h2>
              </div>

              <div className="tarjeta">
                <h3>Entregados</h3>
                <h2>{pedidosEntregados.length}</h2>
              </div>
            </div>

            <h3 style={{ marginTop: "30px", marginBottom: "15px" }}>
              ✅ Historial de pedidos entregados
            </h3>

            {pedidosEntregados.length === 0 ? (
              <p>Todavía no hay pedidos entregados.</p>
            ) : (
              pedidosEntregados.map((p) => (
                <div className="pedido" key={p.id}>
                  <h3>Pedido de {p.cliente}</h3>
                  <p>Mesa: {p.mesa}</p>

                  {obtenerItems(p).map((item, i) => (
                    <p key={i}>
                      {item.nombre || item.plato} x {item.cantidad}
                    </p>
                  ))}

                  <p>Total: S/ {Number(p.total || 0).toFixed(2)}</p>
                  <p>Fecha: {p.fecha}</p>
                  <p>Estado: ✅ Entregado</p>
                </div>
              ))
            )}
          </section>
        )}

      </main>
    </div>
  );
}

export default App;
