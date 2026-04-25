import { startTransition, useDeferredValue, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosConfig";
import useAuth from "../../hooks/useAuth";
import useLanguage from "../../hooks/useLanguage";
import Spinner from "../spinner/Spinner";
import "./Home.css";

const Home = () => {
  const { auth } = useAuth();
  const { t, translateGenre, translateRanking } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedMovieId, setSelectedMovieId] = useState("");

  const deferredQuery = useDeferredValue(searchQuery.trim().toLowerCase());
  const requestedMovieId = location.state?.requestedMovieId;

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setMessage("");

      try {
        const response = await axiosClient.get("/movies");
        const nextMovies = Array.isArray(response.data) ? response.data : [];
        setMovies(nextMovies);

        if (nextMovies.length === 0) {
          setMessage(t.home.noResults);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        setMovies([]);
        setMessage(t.home.noResults);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [t.home.noResults]);

  const defaultMovie = movies[0];

  useEffect(() => {
    if (!defaultMovie || selectedMovieId) {
      return;
    }

    setSelectedMovieId(defaultMovie.youtube_id);
  }, [defaultMovie, selectedMovieId]);

  useEffect(() => {
    if (!defaultMovie || auth || selectedMovieId === defaultMovie.youtube_id) {
      return;
    }

    startTransition(() => {
      setSelectedMovieId(defaultMovie.youtube_id);
    });
  }, [auth, defaultMovie, selectedMovieId]);

  useEffect(() => {
    if (!requestedMovieId || movies.length === 0) {
      return;
    }

    const requestedMovie = movies.find((movie) => movie.youtube_id === requestedMovieId);
    const nextMovieId =
      auth && requestedMovie ? requestedMovie.youtube_id : movies[0]?.youtube_id;

    if (nextMovieId) {
      startTransition(() => {
        setSelectedMovieId(nextMovieId);
      });
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [auth, location.pathname, movies, navigate, requestedMovieId]);

  const selectedMovie =
    movies.find((movie) => movie.youtube_id === selectedMovieId) ?? defaultMovie ?? null;

  const genres = Array.from(
    new Set(
      movies.flatMap((movie) =>
        Array.isArray(movie.genre) ? movie.genre.map((item) => item.genre_name) : [],
      ),
    ),
  ).sort((left, right) => left.localeCompare(right));

  const filteredMovies = movies.filter((movie) => {
    const localizedGenres = movie.genre?.map((genre) => translateGenre(genre.genre_name)) ?? [];
    const ranking = movie.ranking?.ranking_name ?? "";
    const localizedRanking = translateRanking(ranking);

    const matchesGenre =
      selectedGenre === "all" ||
      movie.genre?.some((genre) => genre.genre_name === selectedGenre);

    if (!matchesGenre) {
      return false;
    }

    if (!deferredQuery) {
      return true;
    }

    const searchText = [
      movie.title,
      movie.imdb_id,
      movie.admin_review,
      ranking,
      localizedRanking,
      ...localizedGenres,
      ...(movie.genre?.map((genre) => genre.genre_name) ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchText.includes(deferredQuery);
  });

  const isMovieUnlocked = (movie) => Boolean(auth) || movie.youtube_id === defaultMovie?.youtube_id;

  const handleMovieSelect = (movie) => {
    if (!movie) {
      return;
    }

    if (!isMovieUnlocked(movie)) {
      navigate("/login", {
        state: {
          from: { pathname: "/" },
          requestedMovieId: movie.youtube_id,
        },
      });
      return;
    }

    startTransition(() => {
      setSelectedMovieId(movie.youtube_id);
    });
  };

  if (loading) {
    return <Spinner />;
  }

  if (!selectedMovie) {
    return (
      <div className="container py-5">
        <div className="alert alert-secondary border-0 shadow-sm">{message}</div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="home-player-shell">
        <div className="home-player-card">
          <span className="home-player-card__eyebrow">{t.home.nowPlaying}</span>
          <div className="home-player-card__frame">
            <ReactPlayer
              controls
              playing={false}
              url={`https://www.youtube.com/watch?v=${selectedMovie.youtube_id}`}
              width="100%"
              height="100%"
            />
          </div>
        </div>

        <aside className="home-details-card">
          <div className="home-details-card__poster">
            <img src={selectedMovie.poster_path} alt={selectedMovie.title} />
          </div>

          <div className="home-details-card__content">
            <span className={`movie-access-pill ${auth ? "is-open" : "is-guest"}`}>
              {auth || selectedMovie.youtube_id === defaultMovie?.youtube_id
                ? t.home.previewFree
                : t.home.membersOnly}
            </span>

            <h1>{selectedMovie.title}</h1>
            <p className="home-details-card__meta">{selectedMovie.imdb_id}</p>

            <div className="home-details-card__section">
              <span>{t.home.genreTitle}</span>
              <strong>
                {selectedMovie.genre?.map((genre) => translateGenre(genre.genre_name)).join(" · ")}
              </strong>
            </div>

            <div className="home-details-card__section">
              <span>{t.home.rankingTitle}</span>
              <strong>{translateRanking(selectedMovie.ranking?.ranking_name)}</strong>
            </div>

            <div className="home-details-card__section">
              <span>{t.home.adminReviewTitle}</span>
              <p>{selectedMovie.admin_review || t.home.keepWatching}</p>
            </div>

            <div className="home-details-card__actions">
              <button
                type="button"
                className="btn btn-primary rounded-pill px-4"
                onClick={() => handleMovieSelect(selectedMovie)}
              >
                {auth ? t.home.keepWatching : t.home.playNow}
              </button>
              <button
                type="button"
                className="btn btn-outline-primary rounded-pill px-4"
                onClick={() => navigate(auth ? "/recommended" : "/login")}
              >
                {auth ? t.common.recommended : t.home.openLibrary}
              </button>
            </div>

            <p className="home-details-card__hint">
              {auth ? t.home.memberHint : t.home.guestHint}
            </p>
          </div>
        </aside>
      </section>

      <section className="catalog-toolbar">
        <div>
          <h2>{t.home.playlistTitle}</h2>
          <p>{auth ? t.home.playlistSubtitleMember : t.home.playlistSubtitleGuest}</p>
        </div>

        <div className="catalog-toolbar__controls">
          <label className="catalog-toolbar__field">
            <span>{t.home.searchLabel}</span>
            <input
              className="form-control"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t.home.searchPlaceholder}
            />
          </label>

          <label className="catalog-toolbar__field">
            <span>{t.home.genreLabel}</span>
            <select
              className="form-select"
              value={selectedGenre}
              onChange={(event) => setSelectedGenre(event.target.value)}
            >
              <option value="all">{t.home.allGenres}</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {translateGenre(genre)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="movie-grid">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie, index) => {
            const isUnlocked = isMovieUnlocked(movie);
            const isSelected = movie.youtube_id === selectedMovie.youtube_id;

            return (
              <button
                key={movie._id}
                type="button"
                className={`movie-tile ${isSelected ? "is-selected" : ""} ${
                  isUnlocked ? "is-unlocked" : "is-locked"
                }`}
                onClick={() => handleMovieSelect(movie)}
              >
                <div className="movie-tile__poster">
                  <img src={movie.poster_path} alt={movie.title} />
                  <span className="movie-tile__badge">
                    {index === 0 ? t.home.previewFree : isUnlocked ? t.home.playNow : t.home.loginToUnlock}
                  </span>
                </div>

                <div className="movie-tile__content">
                  <h3>{movie.title}</h3>
                  <p>{movie.imdb_id}</p>
                  <div className="movie-tile__meta">
                    <span>{translateRanking(movie.ranking?.ranking_name)}</span>
                    <span>{movie.genre?.map((genre) => translateGenre(genre.genre_name)).join(" · ")}</span>
                  </div>
                  <strong className="movie-tile__action">
                    {isUnlocked ? t.home.playNow : t.home.loginToUnlock}
                  </strong>
                </div>
              </button>
            );
          })
        ) : (
          <div className="alert alert-secondary border-0 shadow-sm">{message}</div>
        )}
      </section>
    </div>
  );
};

export default Home;
