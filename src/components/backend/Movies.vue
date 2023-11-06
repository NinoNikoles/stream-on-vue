<template>
    <div class="innerWrap">
        <div class="col12 marg-top-xl">
            <div class="col12">
                <h1>{{ langSnippet('movies') }}</h1>
            </div>

            <div v-if="genreAvailable" class="col12 marg-bottom-m">
                <div id="searchbar">
                    <label for="movie-api-search">{{ langSnippet('movie_name') }}*
                        <input v-model="inputText" @input="handleInputChange" type="text" id="movie-api-search" name="movie-name" placeholder="" required>
                    </label>

                    <div v-if="movies" id="movieSearchResults">
                        <a v-for="(movie, index) in movies" :key="index" :href="`#movie-${movie.id}`" @click="selectMovie(movie)" class="display-flex flex-row marg-no">
                            <figure class="poster" style="width:20%;max-width:100px;">
                                <img :data-img="$loadImg()" loading="lazy" :alt="`${movie.title}`">
                            </figure>
                            <span class="pad-xs" style="width:80%;">{{ movie.title }}</span>
                        </a>
                    </div>
                </div>

                <div v-if="outputMovies" class="col12 marg-top-m">
                    <div class="row">
                        <div v-for="(movie, index) in outputMovies" :key="index" class="col-6 col-3-medium column">
                            <a :href="`/backend/movie/${movie.tmdbID}`" :title="`${movie.title}`" class="media-card">
                                <figure class="poster">
                                    <img :src="$loadImg()" loading="lazy" :alt="`${movie.title}`">
                                </figure>
                                <span class="title marg-no">{{ $truncate(movie.title, 15) }}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="col12 marg-bottom-m">
                <p>Please setup Genre</p>
            </div>
        </div>
    </div>

    <div class="modal" id="modal">
        <div class="modal-overlay"></div>
        <div class="modal-wrap large">
            <div class="modal-inner-wrap">
                <div v-if="selectedMovie">
                    <p>Möchtest du {{ selectedMovie.title}} hinzufügen?</p>
                    <p class="text-right">
                        <button @click="saveData(selectedMovie)" class="btn btn-success icon-left icon-add" id="add-movie" name="add-movie">Add</button>
                    </p>
                </div>
            </div>
            <a href="#" class="modal-close"></a>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import tmdbAPI from '../api/tmdbAPI.vue';
import langSnippet from '../api/language.vue';

export default {
    name: 'BackendMovie',
    mixins: [tmdbAPI, langSnippet],
    data() {
        return {
            inputText: '',
            outputText: '',
            movies: null,
            selectedMovie: null,
            outputMovies: null,
            genre: null,
            loader: document.getElementById('loader'),
            genreAvailable: false
        };
    },
    methods: {
        handleInputChange() {
            // Hier können Sie die eingegebenen Daten bearbeiten und in outputText speichern
            this.outputText = this.inputText; //.toUpperCase(); // Beispiel: Text in Großbuchstaben anzeigen
            this.searchAndDisplayMovies(this.outputText);
        },
        async searchAndDisplayMovies(title) {
            const query = title;
            try {
                if ( query.length > 0 ) {
                    const movies = await this.searchMovies(query);
                    this.movies = await this.filterMoviesWithExistingIDs(movies);
                } else {
                    this.movies = null;
                }

                //this.genre = await this.getGenre(this.movie);
                //this.saveData(this.movie); // Speichern Sie die Daten nach dem Abrufen
            } catch (error) {
                console.error('Fehler beim Abrufen der Daten:', error);
            }
        },
        async filterMoviesWithExistingIDs(movies) {
            const filteredMovies = [];
            for (const movie of movies) {
                const existsInDatabase = await this.checkIfMovieExistsInDatabase(movie.id);
                if (!existsInDatabase) {
                    filteredMovies.push(movie);
                }
            }
            return filteredMovies;
        },
        async checkIfMovieExistsInDatabase(tmdbID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=tmdbID="${tmdbID}"`);
                return response.data.length > 0;
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return false;
            }
        },
        async saveData(data) {
            this.loader.classList.remove('hidden');
            document.getElementById('modal').classList.remove('active');
            const movie = await this.searchMovieByID(data.id);
            const genres = movie.genres.map(genre => genre.id);

            let date = movie.release_date;
            let parsedDate = new Date(date);
            let day = parsedDate.getDate();
            let month = parsedDate.getMonth() + 1;
            let year = parsedDate.getFullYear();
            let formattedDate = `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;

            var media = {
                tmdbID: movie.id,
                title: movie.title,
                tagline: movie.tagline,
                genres: JSON.stringify(genres),
                overview: movie.overview,
                poster: movie.poster_path,
                backdrop: movie.backdrop_path,
                collection: movie.belongs_to_collection,
                runtime: movie.runtime,
                rating: movie.vote_average.toFixed(2),
                release_date: formattedDate,
                media_type: "movie"
            }

            try {
                await this.sendMedia(media);
            } catch (err) {
                console.log(err);
            }
            
            console.log(this.langSnippet('add_movie_success'));
            this.outPutMovies().then(outputMovies => {
                // Verwenden Sie outputshows hier, um die Daten in Ihrer Komponente zu verwenden
                this.outputMovies = outputMovies;
                this.searchAndDisplayMovies(this.outputText);
            });
        },
        async sendMedia(media) {
            var response = await axios.post(`${this.$mainURL}:3000/api/db/movie?mediaID=${media.tmdbID}&dataGenres=${media.genres}`, { media: media });

            if ( response.data.message === true ) {
                this.loader.classList.add('hidden');
            }
        },
        async outPutMovies() {
            var order = 'title';
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=media_type="movie"&orderBy=${order}&order=ASC`);
                return response.data; // Geben Sie die Daten aus der Antwort zurück, nicht die gesamte Antwort
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }
        },
        selectMovie(movie) {
            document.getElementById('modal').classList.add('active');
            this.selectedMovie = movie;
        },
        async outPutGenres() {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/allGenre`);
                return response.data; // Geben Sie die Daten aus der Antwort zurück, nicht die gesamte Antwort
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }
        }
    },
    mounted() {
        this.outPutGenres().then(genres => {
            // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
            if ( genres.length > 0 ) {
                this.genreAvailable = true;
            } else {
                this.genreAvailable = false;
            }            
        });
        this.outPutMovies().then(outputMovies => {
            // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
            this.outputMovies = outputMovies;
        });
    }
};
</script>

<style>
#app {

}
</style>
