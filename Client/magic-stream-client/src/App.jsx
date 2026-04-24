import './App.css';
import Home from './components/home/Home';
import Recommended from './components/recommended/Recommended';
import Review from './components/review/Review';
import Register from './components/register/Register';
import Login from './components/login/Login';
import Layout from './components/Layout';
import RequiredAuth from './components/RequiredAuth';
import StreamMovie from './components/stream/StreamMovie';
import axiosClient from './api/axiosConfig';
import useAuth from './hooks/useAuth';
import { Route, Routes, useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();

  const updateMovieReview = (imdbId) => {
    navigate(`/review/${imdbId}`);
  };

  const handleLogout = async () => {
    if (!auth?.user_id) {
      setAuth(null);
      navigate('/');
      return;
    }

    try {
      await axiosClient.post('/logout', { user_id: auth.user_id });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setAuth(null);
      navigate('/');
    }
  };

  return (
    <Routes>
      <Route element={<Layout handleLogout={handleLogout} />}>
        <Route index element={<Home updateMovieReview={updateMovieReview} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route element={<RequiredAuth />}>
          <Route path="/recommended" element={<Recommended />} />
          <Route path="/review/:imdb_id" element={<Review />} />
          <Route path="/stream/:yt_id" element={<StreamMovie />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
