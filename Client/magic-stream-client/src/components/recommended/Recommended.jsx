import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useLanguage from "../../hooks/useLanguage";
import { useEffect, useState } from "react";
import Movies from "../movies/Movies";
import Spinner from "../spinner/Spinner";

const Recommended = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();
  const axiosPrivate = useAxiosPrivate();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchRecommendedMovies = async () => {
      setLoading(true);
      setMessage("");

      try {
        const response = await axiosPrivate.get("/recommendedmovies");
        setMovies(response.data);
        if (response.data.length === 0) {
          setMessage(t.recommended.empty);
        }
      } catch (error) {
        console.error("Error fetching recommended movies:", error);
        setMessage(error.response?.data?.error || t.recommended.error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendedMovies();
  }, [axiosPrivate, t]);

  return (
    <div className="container py-4">
      <h2
        className="mb-4"
        style={{
          fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
          letterSpacing: "-0.03em",
          color: "#0d1b2a",
        }}
      >
        {t.recommended.title}
      </h2>
      {loading ? <Spinner /> : <Movies movies={movies} message={message} />}
    </div>
  );
};

export default Recommended;
