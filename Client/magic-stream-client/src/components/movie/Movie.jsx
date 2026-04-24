import useLanguage from '../../hooks/useLanguage';
import "./Movie.css";

const Movie = ({
    movie,
    updateMovieReview,
    onPreviewMovie,
    onOpenMovie,
    isPreviewActive,
    isLocked,
    isAuthenticated,
}) => {
    const { t } = useLanguage();
    const genres = movie.genre?.map((item) => item.genre_name).join(' / ') || t('movie.genresUnavailable');
    const rankingName = movie.ranking?.ranking_name || t('movie.unranked');
    const hasPreviewAction = Boolean(onPreviewMovie);
    const hasOpenAction = Boolean(onOpenMovie) && Boolean(isAuthenticated);
    const hasReviewAction = Boolean(updateMovieReview);

    const handlePrimaryAction = () => {
        onPreviewMovie?.(movie);
    };

    return (
        <article className={isLocked ? 'movie-card movie-card--locked' : 'movie-card'}>
            <button type="button" className="movie-poster-trigger" onClick={handlePrimaryAction}>
                <div className="movie-poster-shell">
                    <img
                        src={movie.poster_path}
                        alt={movie.title}
                        className="movie-poster"
                    />
                    <div className="movie-poster__veil" />
                    {isLocked ? (
                        <span className="movie-card__badge">{t('movie.locked')}</span>
                    ) : null}
                </div>
            </button>

            <div className="movie-card__body">
                <div className="movie-card__topline">
                    <span>{movie.imdb_id}</span>
                    <strong>{rankingName}</strong>
                </div>

                <h3>{movie.title}</h3>
                <p className="movie-card__genres">{genres}</p>

                <p className="movie-card__review">
                    {movie.admin_review || t('movie.noReview')}
                </p>

                {hasPreviewAction || hasOpenAction || hasReviewAction ? (
                    <div className="movie-card__actions">
                        {hasPreviewAction ? (
                            <button
                                type="button"
                                className={isPreviewActive ? 'ghost-button ghost-button--small is-active' : 'ghost-button ghost-button--small'}
                                onClick={handlePrimaryAction}
                            >
                                {isLocked
                                    ? t('movie.loginToWatch')
                                    : isAuthenticated
                                        ? (isPreviewActive ? t('movie.previewing') : t('movie.previewHere'))
                                        : t('movie.defaultPreview')}
                            </button>
                        ) : null}

                        {hasOpenAction ? (
                            <button
                                type="button"
                                className="accent-button accent-button--small"
                                onClick={() => onOpenMovie?.(movie)}
                            >
                                {t('movie.openFullPlayer')}
                            </button>
                        ) : null}

                        {hasReviewAction ? (
                            <button
                                type="button"
                                className="ghost-button ghost-button--small"
                                onClick={() => updateMovieReview(movie.imdb_id)}
                            >
                                {t('movie.editReview')}
                            </button>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </article>
    );
};

export default Movie;
