<template>
    <div id="loader" class="hidden">
        <div class="content-wrap">
            <i></i>
            <span></span>
        </div>
    </div>

    <div class="innerWrap pad-top-xl pad-bottom-l">
        <div class="col12">
            <div class="col12">
                <h1>{{ langSnippet('movies') }}</h1>
            </div>

            <div v-if="genreAvailable" class="col12">
                <div id="searchbar">
                    <label for="movie-api-search">
                        <input v-model="inputText" @input="handleInputChange" type="text" id="movie-api-search" name="movie-name" :placeholder="langSnippet('search')+` ...`" required>
                    </label>

                    <div v-if="movies" id="movieSearchResults" class="rounded">
                        <a v-for="(movie, index) in movies" :key="index" :href="`#add-movie-${movie.id}`" data-fancybox class="display-flex flex-row marg-no">
                            <figure class="poster" style="width:20%;max-width:100px;">
                                <img :src="$loadImg(movie.poster_path)" loading="lazy" :alt="`${movie.title}`">
                            </figure>
                            <span class="pad-xs marg-no" style="width:80%;">{{ movie.title }}</span>

                            <div :id="`add-movie-${movie.id}`" style="display:none;">
                                <p v-html="langSnippet('add_movie_to_library', movie.title)"></p>
                                <p class="text-right marg-no">
                                    <button class="btn btn-success icon-left icon-add" :data-media="`${movie.id}`" data-fancybox-close type="submit" name="add-movie" @click="saveData(movie)">{{ langSnippet('add') }}</button>
                                </p>
                            </div>
                        </a>
                    </div>
                </div>

                <div v-if="outputMovies" class="col12 marg-top-m">
                    <div class="grid-row">
                        <div v-for="(movie, index) in outputMovies" :key="index" class="col-6 col-4-xsmall col-2-medium grid-padding">
                            <router-link :to="`/backend/movie/${movie.tmdbID}`" :title="`${movie.title}`" class="media-card-wrap">
                                <figure class="media-card poster">
                                    <img :src="$loadImg(movie.poster)" loading="lazy" :alt="`${movie.title}`">
                                </figure>
                                <span class="title">{{ $truncate(movie.title, 20) }}</span>
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="col12 marg-bottom-m">
                <p>Please setup Genre</p>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import functions from '../mixins/functions.vue';
import tmdbAPI from '../mixins/tmdbAPI.vue';
import langSnippet from '../mixins/language.vue';

export default {
    name: 'BackendMovie',
    mixins: [functions, tmdbAPI, langSnippet],
    data() {
        return {
            inputText: '',
            outputText: '',
            movies: null,
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
                if ( query.length > 0 && query !== '' && query !== null && query !== undefined ) {
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
            document.getElementById('loader').classList.remove('hidden');
            const movie = await this.searchMovieByID(data.id);
            const genres = movie.genres.map(genre => genre.id);

            let date = movie.release_date;
            let parsedDate = '';

            if ( date != '' ) {
                parsedDate = new Date(date);
 
                
            } else {
                parsedDate = new Date();
            }

            let day = parsedDate.getDate();
            let month = parsedDate.getMonth() + 1;
            let year = parsedDate.getFullYear();
            let formattedDate = `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;
            var collection = null;

            if ( movie.belongs_to_collection != null & movie.belongs_to_collection != 'null' & movie.belongs_to_collection != false ) {
                collection = movie.belongs_to_collection.id;
            } else {
                collection = null;
            }
            
            var media = {
                tmdbID: movie.id,
                title: movie.title,
                tagline: movie.tagline,
                genres: JSON.stringify(genres),
                overview: movie.overview,
                poster: movie.poster_path,
                backdrop: movie.backdrop_path,
                collection: collection,
                runtime: movie.runtime,
                rating: movie.vote_average.toFixed(2),
                release_date: formattedDate,
                media_type: "movie",
                created: new Date()
            }

            try {
                await this.sendMedia(media);
            } catch (err) {
                console.log(err);
            }
            
            this.clearSearch();
            this.outPutMovies().then(outputMovies => {
                // Verwenden Sie outputshows hier, um die Daten in Ihrer Komponente zu verwenden
                this.outputMovies = outputMovies;
                this.searchAndDisplayMovies(this.outputText);
                this.callout('success', 'Movie added successfully');
            });
        },
        async sendMedia(media) {
            try {
                var response = await axios.post(`${this.$mainURL}:3000/api/db/movie?mediaID=${media.tmdbID}&dataGenres=${media.genres}`, { media: media });

                if ( response.data.message === true ) {
                    document.getElementById('loader').classList.add('hidden');
                }
            } catch (err) {
                console.log(err);
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
        clearSearch() {
            this.inputText = "";
            this.outputText = this.inputText;
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
