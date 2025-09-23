import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import "@/lib/supabase/RecoveryBlocker";
import AppRouter from "./routing/AppRouter";
import { AuthProvider } from "./features/auth/components";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
