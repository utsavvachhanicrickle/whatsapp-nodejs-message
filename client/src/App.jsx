import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { DarkModeContextProvider } from "./context/darkModeContext";
import { UserContextProvider } from "./context/userContext";

function App() {
  return (
    <DarkModeContextProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<UserContextProvider />}>
            <Route path="/" element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DarkModeContextProvider>
  );
}

export default App;
