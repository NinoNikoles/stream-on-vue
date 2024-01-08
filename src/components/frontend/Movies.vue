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
                <label class="select">
                    <select id="genre-filter" v-model="genreFilter" @change="getMovies()">
                        <option value="all">{{ langSnippet('all') }}</option>
                        <option v-for="(genre, index) in genres" :key="index" :value="`${genre.genre_id}`">{{ genre.genre_name }}</option>
                    </select>
                </label>
            </div>
            <div class="col-12 col-3-medium marg-left-col6 grid-padding marg-bottom-s">
                <label class="select">
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

        <!--- Movies --->
        <div v-if="movies" class="grid-row" id="media-list">
            <div v-for="(media, index) in movies" :key="index" class="col-6 col-4-xsmall col-3-medium grid-padding">
                <div class="media-card">
                    <div class="media-card-wrapper">
                        <template v-if="media['mediaDetails'].file_path === null">
                            <figure class="widescreen desktop-only disabled">
                                <img src="" :data-img="$loadImg(media['mediaDetails'].backdrop)" :alt="`${media['mediaDetails'].title}`">
                            </figure>
                            <figure class="poster mobile-only disabled">
                                <img src="" :data-img="$loadImg(media['mediaDetails'].poster)" :alt="`${media['mediaDetails'].title}`">
                            </figure>
                        </template>

                        <template v-else>
                            <figure class="widescreen desktop-only">
                                <img src="" :data-img="$loadImg(media['mediaDetails'].backdrop)" :alt="`${media['mediaDetails'].title}`">
                            </figure>
                            <figure class="poster mobile-only">
                                <img src="" :data-img="$loadImg(media['mediaDetails'].poster)" :alt="`${media['mediaDetails'].title}`">
                            </figure>
                        </template>

                        <div class="link-wrapper">
                            <a v-if="media['mediaDetails'].file_path" href="#" :title="`${media['mediaDetails'].title}`" class="play-trigger"></a>
                            <a href="#" @click="openMediaPopUp(media, $event)" :title="langSnippet('more_informations')" class="info-trigger trigger-normal" data-modal :data-src="`${media['mediaDetails'].tmdbID}`"></a>
                            <router-link :to="`/backend/${media['mediaDetails'].media_type}/${media['mediaDetails'].tmdbID}`" :title="langSnippet('edit')" class="edit-trigger"></router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
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
            userID: null,
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
                    movieInfos['mediaDetails'] = allMovies[i];
                    movieInfos['mediaDetails']['watchlist_status'] = await this.checkWatchlist(allMovies[i].tmdbID);
                    console.log(movieInfos['mediaDetails']['watchlist_status']);
                    
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
        },
        async watchListAction(mediaID, buttonID) {
            this.watchListTrigger(this.userID, mediaID, buttonID);
        }
    },
    mounted() {
        this.sessionUser().then((userID) => {
            this.userID = userID;

            this.getGenre();
            this.getMovies().then(() => {
                document.getElementById('loader').classList.add('hidden');
            });
        });
    }
};
</script>