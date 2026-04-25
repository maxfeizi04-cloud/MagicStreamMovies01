import Movie from "../movie/Movie";

const Movies = ({ movies, updateMovieReview, message }) => {
  return (
    <div className="container mt-4">
      <div className="row">
        {movies && movies.length > 0 ? (
          movies.map((movie) => (
            <Movie key={movie._id} updateMovieReview={updateMovieReview} movie={movie} />
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-secondary border-0 shadow-sm">{message}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;
