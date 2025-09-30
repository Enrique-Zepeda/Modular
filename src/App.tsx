import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import "@/lib/supabase/RecoveryBlocker";
import AppRouter from "./routing/AppRouter";
import { AuthProvider } from "./features/auth/components";

// Se mantiene la importación de Toaster
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          {/* ---> SE AGREGA UN FRAGMENTO PARA ENVOLVER A LOS DOS HIJOS */}
          <>
            <AppRouter />
            <Toaster position="top-center" reverseOrder={false} />
          </>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;