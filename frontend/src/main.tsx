import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { FiltrosProvider } from "./context/FiltrosContext";
import { CarritoProvider } from "./context/CarritoContext";


ReactDOM.createRoot(document.getElementById("root")!).render(
    <AuthProvider>
        <WebSocketProvider>
            <CarritoProvider>
                <FiltrosProvider>
                    <App />
                </FiltrosProvider>
            </CarritoProvider>
        </WebSocketProvider>
    </AuthProvider>
);
