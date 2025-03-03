<template>
    <div id="loader" class="hidden">
        <div class="content-wrap">
            <i></i>
            <span></span>
        </div>
    </div>

    <div class="col12 display-flex backend-wrap">

        <backend-menu></backend-menu>

        <div class="col12 backend-content pad-top-xl pad-bottom-l">
            <div class="innerWrap">
                <div class="col8">
                    <h1>{{ langSnippet('movies') }}</h1>
                </div>

                <div class="col4" v-if="genreAvailable">
                    <p class="text-right">
                        <a href="#add-new-movie" data-fancybox class="btn btn-primary btn-small icon-left icon-add">
                            {{ langSnippet('add_movie') }}
                        </a>
                    </p>

                    <div id="add-new-movie" style="display: none;">
                        <div id="searchbar">
                            <label for="movie-api-search">
                                <input v-model="inputText" @input="handleInputChange" type="text" id="movie-api-search" name="movie-name" :placeholder="langSnippet('search')+` ...`" required>
                            </label>

                            <div v-if="movies" id="movieSearchResults" class="rounded">
                                <div v-for="(movie, index) in movies" :key="index" class="search-result-item display-flex flex-row marg-no">
                                    <figure class="poster" style="width:20%;max-width:100px;">
                                        <img :src="$loadImg(movie.poster_path)" loading="lazy" :alt="`${movie.title}`">
                                    </figure>
                                    <span class="pad-xs marg-no" style="width:80%;">
                                        {{ movie.title }}
                                        <p class="marg-no text-right">
                                            <button class="btn btn-small btn-success icon-left icon-add" :data-media="`${movie.id}`" data-fancybox-close type="submit" name="add-movie" @click="saveData(movie)">{{ langSnippet('add') }}</button>
                                        </p>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="col12">
                    <div v-if="outputMovies" class="col12">
                        <p>
                            <label for="local-search">
                                <input v-model="localSearch" @input="localSearchFunction" type="text" id="local-search" name="local-search" :placeholder="langSnippet('search')+` ...`">
                            </label>
                        </p>

                        <div class="grid-row">
                            <div v-for="(movie, index) in outputMovies" :key="index" :data-title="movie.title" class="col-6 col-4-xsmall col-2-medium grid-padding local-output-items">
                                <router-link :to="`/b/movie/${movie.tmdbID}`" :title="`${movie.title}`" class="media-card-wrap">
                                    <figure class="media-card poster rounded">
                                        <img :src="$loadImg(movie.poster)" loading="lazy" :alt="`${movie.title}`">
                                    </figure>
                                    <span class="title">{{ $truncate(movie.title, 20) }}</span>
                                </router-link>
                            </div>
                        </div>
                    </div>

                    <div v-else class="col12">
                        <p>Please setup Genre</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import functions from '../functions.vue';
import tmdbAPI from '../mixins/tmdbAPI.vue';
import langSnippet from '../mixins/language.vue';
import BackendMenu from '../includes/BackendMenu.vue';

export default {
    name: 'BackendMovie',
    mixins: [functions, tmdbAPI, langSnippet],
    components: {
        'backend-menu': BackendMenu,
    },
    data() {
        return {
            inputText: '',
            outputText: '',
            movies: null,
            outputMovies: null,
            genre: null,
            loader: document.getElementById('loader'),
            genreAvailable: false,
            localSearch: ''
        };
    },
    methods: {
        handleInputChange() {
            this.outputText = this.inputText;
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
            } catch (error) {
                console.log(error);
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

            return new Promise((resolve) => {
                resolve(filteredMovies);
            });
        },
        async checkIfMovieExistsInDatabase(tmdbID) {
            const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=tmdbID="${tmdbID}"`);
            return new Promise((resolve) => {
                resolve(response.data.length > 0);
            });
        },
        async saveData(data) {
            document.getElementById('loader').classList.remove('hidden');
            const movie = await this.searchMovieByID(data.id);
            const genres = movie.genres.map(genre => genre.id);

            let date = movie.release_date;
            let parsedDate = new Date();

            if ( date != '' ) parsedDate = new Date(date);

            let day = parsedDate.getDate();
            let month = parsedDate.getMonth() + 1;
            let year = parsedDate.getFullYear();
            let formattedDate = `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;
            var collection = null;
            var trailer = null;

            if ( movie.belongs_to_collection != null & movie.belongs_to_collection != 'null' & movie.belongs_to_collection != false ) collection = movie.belongs_to_collection.id;
            if ( movie.videos.results.length > 0 ) trailer = movie.videos.results[0].key;

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
                trailer: trailer,
                created: new Date(),
            }

            try {
                await this.sendMedia(media);
            } catch (err) {
                console.log(err);
            }
            
            this.clearSearch();
            this.outputMovies = await this.outPutMovies();
            await this.searchAndDisplayMovies(this.outputText);
            this.callout('success', 'Movie added successfully');
        },
        async sendMedia(media) {
            var response = await axios.post(`${this.$mainURL}:3000/api/db/movie?mediaID=${media.tmdbID}&dataGenres=${media.genres}`, { media: media });
            if ( response.data.message === true ) {
                document.getElementById('loader').classList.add('hidden');
            }
        },
        async outPutMovies() {
            var order = 'title';
            const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=media_type="movie"&orderBy=${order}&order=ASC`);

            return new Promise((resolve) => {
                resolve(response.data);
            });
        },
        clearSearch() {
            this.inputText = "";
            this.outputText = this.inputText;
        },
        async genreCheck() {
            const response = await axios.get(`${this.$mainURL}:3000/api/db/allGenre`);
            var genre = response.data;

            return new Promise((resolve) => {
                if (genre.length > 0) resolve(true);
                resolve(false);
            });
        },
        async localSearchFunction() {
            var localOutputItems = document.querySelectorAll('.local-output-items');

            localOutputItems.forEach((item) => {
                var dataTitle = normalizeString(item.getAttribute('data-title'));
                if ( this.localSearch !== '' && !dataTitle.includes(normalizeString(this.localSearch)) ) {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'inline-block';
                }
            });

            function normalizeString(str) {
                return str.toLowerCase()
                        .replace(/ä/g, 'ae')
                        .replace(/ö/g, 'oe')
                        .replace(/ü/g, 'ue')
                        .replace(/ß/g, 'ss')
                        .replace(/ /g, '')
                        .replace(/:/g, '')
                        .replace(/-/g, '');
            }
        }
    },
    async mounted() {
        this.genreAvailable = await this.genreCheck();
        this.outputMovies = await this.outPutMovies();
    }
};
</script>