import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { DarkModeContextProvider } from "./context/darkModeContext";
import { SocketContextProvider } from "./context/scoketContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { LOGIN, SIGNUP, HOME} from "./utils/app.routes"

function App() {
  return (
    <DarkModeContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path={LOGIN} element={<LoginPage />} />
          <Route path={SIGNUP} element={<SignUpPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<SocketContextProvider />}>
              <Route path={HOME} element={<HomePage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </DarkModeContextProvider>
  );
}

export default App;
