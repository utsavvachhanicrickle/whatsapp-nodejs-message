import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { DarkModeContextProvider } from "./context/darkModeContext";
import { SocketContextProvider } from "./context/scoketContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { LOGIN, SIGNUP, HOME } from "./utils/app.routes";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import SendMessage from "./components/SendMessage/SendMessage.jsx";


function App() {
  return (
    <DarkModeContextProvider>
      <ToastContainer />
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path={LOGIN} element={<LoginPage />} />
            <Route path={SIGNUP} element={<SignUpPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<SocketContextProvider />}>
                <Route path={HOME} element={<HomePage />} />
                {/* <Route path="/message" element={<SendMessage />} /> */}
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </DarkModeContextProvider>
  );
}

export default App;
