import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
<<<<<<< HEAD


ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
      <App />
  </AuthProvider>
=======
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
);
