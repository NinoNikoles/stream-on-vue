<template>
    <div id="loader" class="">
        <div class="content-wrap">
            <i></i>
            <span></span>
        </div>
    </div>

    <div class="innerWrap pad-top-xl">
        <h1>{{ langSnippet('movies') }}</h1>

        <div class="grid-row">
            <div class="col-12 col-3-medium grid-padding marg-bottom-s">
                <label class="select">{{ langSnippet('genres') }}
                    <select id="genre-filter" v-model="genreFilter" @change="getMovies()">
                        <option value="all">{{ langSnippet('all') }}</option>
                        <option v-for="(genre, index) in genres" :key="index" :value="`${genre.genre_id}`">{{ genre.genre_name }}</option>
                    </select>
                </label>
            </div>
            <div class="col-12 col-3-medium marg-left-col6 grid-padding marg-bottom-s">
                <label class="select">{{ langSnippet('sorting') }}
                    <select id="title-filter" v-model="orderFilter" @change="getMovies()">
                        <option value="title,ASC">A - Z</option>
                        <option value="title,DESC">Z - A</option>
                        <!-- <option value="releaseDate,DESC">Neuste - Älteste</option>
                        <option value="releaseDate,ASC">Älteste - Neuste</option> -->
                        <option value="rating,DESC">Bewertung: Höchste - Niedrigste</option>
                        <option value="rating,ASC">Bewertung: Niedrigste - Höchste</option>
                    </select>
                </label>
            </div>
        </div>

        <div v-if="movies" class="grid-row" id="media-list">
            <div v-for="(movie, index) in movies" :key="index" class="col-6 col-4-xsmall col-3-medium grid-padding">
                <div class="media-card">
                    <div class="media-card-wrapper">
                        <figure class="widescreen desktop-only">
                            <img src="" :data-img="$loadImg(movie['movieDetails'].backdrop)" :alt="`${movie['movieDetails'].title}`">
                        </figure>
                        <figure class="poster mobile-only">
                            <img src="" :data-img="$loadImg(movie['movieDetails'].poster)" :alt="`${movie['movieDetails'].title}`">
                        </figure>
                        <div class="link-wrapper">
                            <a v-if="movie.file_path" href="#" :title="`${movie['movieDetails'].title}`" class="play-trigger"></a>
                            <a href="#" @click="openPopUp(`${movie['movieDetails'].tmdbID}`, $event)" :title="langSnippet('more_informations')" class="info-trigger trigger-normal" data-modal :data-src="`${movie['movieDetails'].tmdbID}`"></a>
                            <router-link :to="`/backend/${movie['movieDetails'].media_type}/${movie['movieDetails'].tmdbID}`" :title="langSnippet('edit')" class="edit-trigger"></router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <template v-if="movies">
        <div class="modal" :id="`${movie['movieDetails'].tmdbID}`" v-for="(movie, index) in movies" :key="index">
            <div class="modal-overlay"></div>
            <div class="modal-wrap large">
                <div class="modal-inner-wrap">
                    <div class="info-popup">
                        <div class="col12 marg-bottom-xs mobile-only">
                            <figure class="widescreen">
                                <img :data-img="$loadImg(movie['movieDetails'].backdrop)" loading="lazy" importance="low" alt="">
                            </figure>
                        </div>
                        <div class="innerWrap">
                            <div class="col7 marg-right-col1">
                                <p class="h2">{{ movie['movieDetails'].title }}</p>
                                <p class="small tag-list marg-bottom-base">
                                    <span class="tag">{{ movie['movieDetails'].release_date }}</span>
                                    <span class="tag">{{ movie['movieDetails'].rating }}/10 ★</span>
                                </p>
                                <a v-if="movie['movieDetails'].file_path" href="#" class="btn btn-small btn-white icon-left icon-play marg-right-xs">{{ langSnippet('watch_now') }}</a>
                                <p class="small">{{ movie['movieDetails'].overview }}</p>
                                <p v-if="movie['genre']" class="small tag-list marg-bottom-base">
                                    <span v-for="(genre, index) in movie['genre']" :key="index" class="tag">
                                        {{ genre }}
                                    </span>
                                </p>
                            </div>
                            <div class="col4 desktop-only">
                                <figure class="poster">
                                    <img :data-img="$loadImg(movie['movieDetails'].poster)" alt="" loading="lazy" importance="low">
                                </figure>
                            </div>
                        </div>
                    </div>
                </div>
                <a href="#" class="modal-close" @click="closePopUp(`${movie['movieDetails'].tmdbID}`, $event)"></a>
            </div>
        </div>
    </template>

</template>

<script>
import axios from 'axios';
import functions from '../mixins/functions.vue';
import langSnippet from '../mixins/language.vue';

export default {
    name: 'FrontendMovies',
    mixins: [functions, langSnippet],
    data() {
        return {
            movies: null,
            url: window.location.protocol + '//' + window.location.hostname,
            genres: null,
            genreFilter: 'all',
            orderFilter: "title,ASC"
        };
    },

    methods: {
        async getMovies() {
            var genreID = this.genreFilter;
            var orderString = this.orderFilter;
            var orderArr = orderString.split(',');
            var orderBy = orderArr[0];
            var orderType = orderArr[1];
            var allMovies = []
            var movies = [];
            var movieInfos = [];
            var movieGenre = [];

            if ( genreID === 'all' ) {
                try {
                    const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=media_type='movie'&orderBy=${orderBy}&order=${orderType}`);
                    allMovies = response.data;
                } catch (error) {
                    // Benutzer ist nicht angemeldet, leiten Sie ihn zur Login-Seite weiter
                    console.log(error);
                }
            } else {
                try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/mediaFiltered?mediaType=movie&orderBy=${orderBy}&order=${orderType}&genreID=${parseInt(genreID)}`);
                    allMovies = response.data;
                } catch (error) {
                    // Benutzer ist nicht angemeldet, leiten Sie ihn zur Login-Seite weiter
                    console.log(error);
                }
            }

            for (let i = 0; i < allMovies.length; i++) {
                movieInfos = [];
                movieGenre = [];

                try {
                    var movieGenreIDs = JSON.parse(allMovies[i].genres);
                    for (let x = 0; x < movieGenreIDs.length; x++) {
                        try {
                            movieGenre.push(await this.getGenreNames(movieGenreIDs[x]));
                            
                        } catch(e) {
                            console.log(e);
                        }                                    
                    }

                    movieInfos['genre'] = movieGenre;
                    movieInfos['movieDetails'] = allMovies[i];
                    
                } catch (err) {
                    console.log(err);
                }

                movies.push(movieInfos);
            }

            this.movies = movies;
        },
        async getGenre() {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/allGenre`);
                this.genres = response.data;
                
            } catch (error) {
                // Benutzer ist nicht angemeldet, leiten Sie ihn zur Login-Seite weiter
                console.log(error);
            }
        },
        async popUpTrigger(media) {
            await this.selectMedia(media)
            .then(() => {
                this.openPopUp();
            });
        },
        async getGenreNames(genreID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/genreNameByID?id=${genreID}`);
                return response.data[0].genre_name;                
            } catch (error) {
                console.log(error);
            }
        }
    },
    mounted() {
        this.getMovies();
        this.getGenre().then(() => {
            document.getElementById('loader').classList.add('hidden');
        });
    }
};
</script>