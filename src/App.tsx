import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import AuthProvider from "./features/auth/components/AuthProvider";
import AppRouter from "./routing/AppRouter";

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
