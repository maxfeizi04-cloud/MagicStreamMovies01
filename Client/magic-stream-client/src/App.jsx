import "./App.css";
import Header from "./components/header/Header";
import Home from "./components/home/Home";
import Layout from "./components/Layout";
import Login from "./components/login/Login";
import Recommended from "./components/recommended/Recommended";
import Register from "./components/register/Register";
import RequiredAuth from "./components/RequiredAuth";
import Review from "./components/review/Review";
import StreamMovie from "./components/stream/StreamMovie";
import axiosClient from "./api/axiosConfig";
import useAuth from "./hooks/useAuth";
import { Route, Routes, useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();

  const handleLogout = async () => {
    if (!auth?.user_id) {
      setAuth(null);
      navigate("/");
      return;
    }

    try {
      await axiosClient.post("/logout", { user_id: auth.user_id });
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setAuth(null);
      navigate("/");
    }
  };

  return (
    <div className="app-shell">
      <Header handleLogout={handleLogout} />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/stream/:yt_id" element={<StreamMovie />} />

          <Route element={<RequiredAuth />}>
            <Route path="/recommended" element={<Recommended />} />
            <Route path="/review/:imdb_id" element={<Review />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
