import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import useLanguage from '../../hooks/useLanguage';
import Movies from '../movies/Movies';
import Spinner from '../spinner/Spinner';
import StreamMovie from '../stream/StreamMovie';

const ALL_GENRES = '__all__';

const Home = ({ updateMovieReview }) => {
    const { auth } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messageKey, setMessageKey] = useState('');
    const [healthStatus, setHealthStatus] = useState('checking');
    const [query, setQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState(ALL_GENRES);
    const [selectedMovieId, setSelectedMovieId] = useState(null);

    const deferredQuery = useDeferredValue(query);
    const isAuthenticated = Boolean(auth?.user_id);
    const canReview = auth?.role === 'ADMIN';

    useEffect(() => {
        let isMounted = true;

        const fetchPageData = async () => {
            setLoading(true);
            setMessageKey('');

            const [healthResult, moviesResult] = await Promise.allSettled([
                axiosClient.get('/health'),
                axiosClient.get('/movies'),
            ]);

            if (!isMounted) {
                return;
            }

            setHealthStatus(healthResult.status === 'fulfilled' ? 'ok' : 'offline');

            if (moviesResult.status === 'fulfilled') {
                const movieList = moviesResult.value.data ?? [];
                setMovies(movieList);
                if (movieList.length === 0) {
                    setMessageKey('home.moviesEmpty');
                }
            } else {
                setMovies([]);
                setMessageKey('home.moviesError');
            }

            setLoading(false);
        };

        fetchPageData();

        return () => {
            isMounted = false;
        };
    }, []);

    const publicMovieId = movies[0]?.imdb_id ?? null;

    const genreOptions = useMemo(() => [
        { value: ALL_GENRES, label: t('common.allGenres') },
        ...Array.from(new Set(
            movies.flatMap((movie) => movie.genre?.map((item) => item.genre_name) ?? [])
        )).sort().map((genre) => ({ value: genre, label: genre })),
    ], [movies, t]);

    const filteredMovies = useMemo(() => {
        const normalizedQuery = deferredQuery.trim().toLowerCase();

        return movies.filter((movie) => {
            const matchesQuery = normalizedQuery === ''
                || movie.title?.toLowerCase().includes(normalizedQuery)
                || movie.imdb_id?.toLowerCase().includes(normalizedQuery);
            const matchesGenre = selectedGenre === ALL_GENRES
                || movie.genre?.some((item) => item.genre_name === selectedGenre);
            return matchesQuery && matchesGenre;
        });
    }, [deferredQuery, movies, selectedGenre]);

    useEffect(() => {
        if (!movies.length) {
            setSelectedMovieId(null);
            return;
        }

        if (!isAuthenticated) {
            setSelectedMovieId(publicMovieId);
            return;
        }

        const hasSelectedMovie = filteredMovies.some((movie) => movie.imdb_id === selectedMovieId);
        if (!hasSelectedMovie) {
            setSelectedMovieId(filteredMovies[0]?.imdb_id ?? publicMovieId);
        }
    }, [filteredMovies, isAuthenticated, movies.length, publicMovieId, selectedMovieId]);

    const selectedMovie = useMemo(() => {
        if (!movies.length) {
            return null;
        }

        const activeMovieId = isAuthenticated ? selectedMovieId : publicMovieId;
        return movies.find((movie) => movie.imdb_id === activeMovieId) ?? movies[0];
    }, [isAuthenticated, movies, publicMovieId, selectedMovieId]);

    const handleQueryChange = (event) => {
        const nextValue = event.target.value;
        startTransition(() => {
            setQuery(nextValue);
        });
    };

    const handleGenreChange = (event) => {
        const nextGenre = event.target.value;
        startTransition(() => {
            setSelectedGenre(nextGenre);
        });
    };

    const handleRequireLogin = (movie) => {
        navigate('/login', {
            state: {
                from: {
                    pathname: `/stream/${movie.youtube_id}`,
                },
            },
        });
    };

    const handlePreviewMovie = (movie) => {
        if (!isAuthenticated && movie.imdb_id !== publicMovieId) {
            handleRequireLogin(movie);
            return;
        }

        startTransition(() => {
            setSelectedMovieId(movie.imdb_id);
        });
    };

    const handleOpenMovie = (movie) => {
        if (!isAuthenticated) {
            if (movie.imdb_id !== publicMovieId) {
                handleRequireLogin(movie);
                return;
            }

            startTransition(() => {
                setSelectedMovieId(movie.imdb_id);
            });
            return;
        }

        navigate(`/stream/${movie.youtube_id}`);
    };

    const statusLabel = healthStatus === 'ok'
        ? t('home.statusOnline')
        : healthStatus === 'offline'
            ? t('home.statusOffline')
            : t('home.statusChecking');
    const statusClassName = healthStatus === 'ok'
        ? 'status-chip status-chip--online'
        : healthStatus === 'offline'
            ? 'status-chip status-chip--offline'
            : 'status-chip status-chip--checking';
    const catalogDescription = isAuthenticated ? t('home.catalogDescriptionAuth') : t('home.catalogDescriptionGuest');

    return (
        <div className="page-stack page-stack--clean">
            <section className="showcase-panel">
                <div className="showcase-player">
                    <StreamMovie ytId={selectedMovie?.youtube_id} autoplay={false} compact={true} />
                </div>

                <aside className="showcase-info">
                    <div className="showcase-info__head">
                        <span className="showcase-info__label">{selectedMovie ? t('home.defaultVideoLabel') : t('home.apiStatusLabel')}</span>
                        <span className={statusClassName}>{statusLabel}</span>
                    </div>

                    <div className="showcase-info__copy">
                        <h1>{selectedMovie?.title ?? t('home.pageTitle')}</h1>
                        <p>
                            {selectedMovie
                                ? (selectedMovie.admin_review || t('home.featuredDescriptionNoReview'))
                                : t('home.featuredDescriptionEmpty')}
                        </p>
                    </div>

                    <dl className="showcase-meta">
                        <div>
                            <dt>IMDb</dt>
                            <dd>{selectedMovie?.imdb_id ?? t('common.noImdb')}</dd>
                        </div>
                        <div>
                            <dt>{t('home.genreLabel')}</dt>
                            <dd>{selectedMovie?.genre?.map((genre) => genre.genre_name).join(' / ') || t('movie.genresUnavailable')}</dd>
                        </div>
                        <div>
                            <dt>{t('home.apiStatusLabel')}</dt>
                            <dd>{isAuthenticated ? t('home.authNotice') : t('home.guestNotice')}</dd>
                        </div>
                    </dl>

                    <p className="showcase-note">
                        {isAuthenticated ? t('home.pageSubtitle') : t('home.defaultPreviewHint')}
                    </p>

                    <div className="showcase-actions">
                        {isAuthenticated ? (
                            <Link to="/recommended" className="accent-button">
                                {t('home.openRecommendations')}
                            </Link>
                        ) : (
                            <Link to="/login" className="accent-button">
                                {t('home.loginToUnlock')}
                            </Link>
                        )}
                        <button
                            type="button"
                            className="ghost-button"
                            onClick={() => selectedMovie && handleOpenMovie(selectedMovie)}
                        >
                            {isAuthenticated ? t('movie.openFullPlayer') : t('movie.defaultPreview')}
                        </button>
                    </div>
                </aside>
            </section>

            <section className="control-bar control-bar--clean">
                <label className="filter-field">
                    <span>{t('home.searchLabel')}</span>
                    <input
                        type="search"
                        value={query}
                        onChange={handleQueryChange}
                        placeholder={t('home.searchPlaceholder')}
                    />
                </label>

                <label className="filter-field">
                    <span>{t('home.genreLabel')}</span>
                    <select value={selectedGenre} onChange={handleGenreChange}>
                        {genreOptions.map((genre) => (
                            <option key={genre.value} value={genre.value}>
                                {genre.label}
                            </option>
                        ))}
                    </select>
                </label>
            </section>

            {loading ? (
                <Spinner />
            ) : (
                <Movies
                    movies={filteredMovies}
                    updateMovieReview={canReview ? updateMovieReview : undefined}
                    message={messageKey ? t(messageKey) : ''}
                    title={t('home.catalogTitle')}
                    description={catalogDescription}
                    emptyTitle={t('home.emptyTitle')}
                    emptyDescription={t('home.emptyDescription')}
                    onPreviewMovie={handlePreviewMovie}
                    onOpenMovie={handleOpenMovie}
                    activePreviewImdbId={selectedMovie?.imdb_id}
                    publicMovieId={publicMovieId}
                    isAuthenticated={isAuthenticated}
                />
            )}
        </div>
    );
};

export default Home;
