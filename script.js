
const API_TOKEN = "YOUR_TMDB_READ_ACCESS_TOKEN";

const movieInput = document.getElementById("movieInput");
const searchButton = document.getElementById("searchButton");
const movieContainer = document.getElementById("movieContainer");

const sections = document.querySelectorAll("main section");
const watchSection = sections[2];

// Function to get data from TMDB API
async function getMovieData(url) {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            accept: "application/json"
        }
    });

    if (!response.ok) {
        throw new Error("Unable to fetch movie data.");
    }

    const data = await response.json();
    return data;
}

// Function to search movies
async function searchMovies() {
    const movieName = movieInput.value.trim();

    if (movieName === "") {
        alert("Please enter a movie name.");
        return;
    }

    movieContainer.textContent = "Loading movies...";
    searchButton.disabled = true;

    try {
        const url =
            "https://api.themoviedb.org/3/search/movie?query=" +
            encodeURIComponent(movieName);

        const data = await getMovieData(url);

        displayMovies(data.results);
    } catch (error) {
        movieContainer.textContent =
            "Error: " + error.message;
    } finally {
        searchButton.disabled = false;
    }
}

// Function to display movie cards
function displayMovies(movies) {
    movieContainer.replaceChildren();

    if (movies.length === 0) {
        movieContainer.textContent = "No movies found.";
        return;
    }

    movies.forEach(function (movie) {
        const card = document.createElement("div");
        card.className = "movie-card";

        const poster = document.createElement("img");

        if (movie.poster_path) {
            poster.src =
                "https://image.tmdb.org/t/p/w500" +
                movie.poster_path;
        }

        poster.alt = movie.title + " poster";

        const title = document.createElement("h3");
        title.textContent = movie.title;

        const rating = document.createElement("p");
        rating.textContent =
            "Rating: " +
            (movie.vote_average
                ? movie.vote_average.toFixed(1) + "/10"
                : "Not available");

        const year = document.createElement("p");
        year.textContent = movie.release_date
            ? movie.release_date.substring(0, 4)
            : "Year not available";

        const detailsButton = document.createElement("button");
        detailsButton.textContent = "View Details";

        detailsButton.addEventListener("click", function () {
            showDetails(movie);
        });

        const watchButton = document.createElement("button");
        watchButton.textContent = "Where to Watch";

        watchButton.addEventListener("click", function () {
            showOTT(movie);
        });

        card.append(
            poster,
            title,
            rating,
            year,
            detailsButton,
            watchButton
        );

        movieContainer.appendChild(card);
    });
}

// Function to show movie details
function showDetails(movie) {
    const details =
        "Movie: " + movie.title +
        "\nRelease Date: " +
        (movie.release_date || "Not available") +
        "\nRating: " +
        (movie.vote_average
            ? movie.vote_average.toFixed(1) + "/10"
            : "Not available") +
        "\n\nDescription:\n" +
        (movie.overview || "No description available.");

    alert(details);
}

// Function to show OTT availability in India
async function showOTT(movie) {
    const oldResult = document.getElementById("ottResult");

    if (oldResult) {
        oldResult.remove();
    }

    const result = document.createElement("div");
    result.id = "ottResult";
    result.style.padding = "20px";
    result.textContent = "Checking OTT availability...";

    watchSection.appendChild(result);

    try {
        const url =
            "https://api.themoviedb.org/3/movie/" +
            movie.id +
            "/watch/providers";

        const data = await getMovieData(url);
        const india = data.results.IN;

        result.replaceChildren();

        const heading = document.createElement("h3");
        heading.textContent = "OTT Availability: " + movie.title;
        result.appendChild(heading);

        if (!india) {
            result.appendChild(
                document.createTextNode(
                    "No availability information for India."
                )
            );
            return;
        }

        const providerTypes = [
            { key: "flatrate", label: "Streaming" },
            { key: "rent", label: "Rent" },
            { key: "buy", label: "Buy" }
        ];

        let found = false;

        providerTypes.forEach(function (type) {
            const providers = india[type.key];

            if (providers && providers.length > 0) {
                found = true;

                const label = document.createElement("p");

                label.textContent =
                    type.label + ": " +
                    providers.map(function (provider) {
                        return provider.provider_name;
                    }).join(", ");

                result.appendChild(label);
            }
        });

        if (!found) {
            const message = document.createElement("p");
            message.textContent =
                "No streaming providers are listed for India.";
            result.appendChild(message);
        }

        if (india.link) {
            const link = document.createElement("a");
            link.href = india.link;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "View provider details";
            result.appendChild(link);
        }

    } catch (error) {
        result.textContent =
            "Unable to load OTT availability: " + error.message;
    }
}

// Event handling: Search button click
searchButton.addEventListener("click", searchMovies);

// Event handling: Press Enter to search
movieInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchMovies();
    }
});
