import Movie from '../movie/Movie';
import useLanguage from '../../hooks/useLanguage';

const Movies = ({
    movies,
    updateMovieReview,
    message,
    title,
    description,
    emptyTitle,
    emptyDescription,
    onPreviewMovie,
    onOpenMovie,
    activePreviewImdbId,
    publicMovieId,
    isAuthenticated,
}) => {
    const { t } = useLanguage();
    const hasMovies = movies && movies.length > 0;

    return (
        <section className="movie-section">
            <div className="section-heading section-heading--compact">
                {title ? <h2>{title}</h2> : null}
                {description ? <p>{description}</p> : null}
            </div>

            {hasMovies ? (
                <div className="movie-grid">
                    {movies.map((movie) => (
                        <Movie
                            key={movie._id ?? movie.imdb_id}
                            updateMovieReview={updateMovieReview}
                            movie={movie}
                            onPreviewMovie={onPreviewMovie}
                            onOpenMovie={onOpenMovie}
                            isPreviewActive={activePreviewImdbId === movie.imdb_id}
                            isLocked={!isAuthenticated && movie.imdb_id !== publicMovieId}
                            isAuthenticated={isAuthenticated}
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <h3>{message || emptyTitle || t('home.emptyTitle')}</h3>
                    <p>{emptyDescription || t('home.emptyDescription')}</p>
                </div>
            )}
        </section>
    );
};

export default Movies;
