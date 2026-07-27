import { useEffect, useState } from "react";


export default function PaginaPago() {
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (window.location.origin.includes("devtunnels.ms")) {
      window.location.replace("http://localhost:5173");
    }
  }, []);

  const pagar = async () => {
    try {
      setCargando(true);

      const res = await fetch("https://aerosol-recliner-catapult.ngrok-free.dev/pedidos/crear", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("No se pudo iniciar el pago");
      }
      const data = await res.json();
      window.location.href = data.init_point;
    } catch (error) {
      console.error(error);
      alert("Error al iniciar el pago");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Pedido</h1>

        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Pedido:</strong> #123
          </p>
          <p>
            <strong>Cliente:</strong> Luciano
          </p>
          <p>
            <strong>Total:</strong> $15.000
          </p>
          <p>
            <strong>Estado:</strong> Pendiente de pago
          </p>
        </div>

        <button
          onClick={pagar}
          disabled={cargando}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cargando ? "Redirigiendo..." : "Pagar"}
        </button>
      </div>
    </div>
  );
}