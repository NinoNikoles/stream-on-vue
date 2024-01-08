<template>
    <div id="loader" class="">
        <div class="content-wrap">
            <i></i>
            <span></span>
        </div>
    </div>

    <div class="innerWrap pad-top-xl">
        <h1>{{ langSnippet('shows') }}</h1>

        <div class="grid-row">
            <div class="col-12 col-3-medium grid-padding marg-bottom-s">
                <label class="select">
                    <select id="genre-filter" v-model="genreFilter" @change="getShows()">
                        <option value="all">{{ langSnippet('all') }}</option>
                        <option v-for="(genre, index) in genres" :key="index" :value="`${genre.genre_id}`">{{ genre.genre_name }}</option>
                    </select>
                </label>
            </div>
            <div class="col-12 col-3-medium marg-left-col6 grid-padding marg-bottom-s">
                <label class="select">
                    <select id="title-filter" v-model="orderFilter" @change="getShows()">
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

        <div v-if="shows" class="grid-row" id="media-list">
            <div v-for="(show, index) in shows" :key="index" class="col-6 col-4-xsmall col-3-medium grid-padding">
                <div class="media-card">
                    <div class="media-card-wrapper">
                        <template v-if="show['mediaDetails'].file_path === null">
                            <figure class="widescreen desktop-only disabled">
                                <img src="" :data-img="$loadImg(show['mediaDetails'].backdrop)" :alt="`${show['mediaDetails'].title}`">
                            </figure>
                            <figure class="poster mobile-only disabled">
                                <img src="" :data-img="$loadImg(show['mediaDetails'].poster)" :alt="`${show['mediaDetails'].title}`">
                            </figure>
                        </template>

                        <template v-else>
                            <figure class="widescreen desktop-only">
                                <img src="" :data-img="$loadImg(show['mediaDetails'].backdrop)" :alt="`${show['mediaDetails'].title}`">
                            </figure>
                            <figure class="poster mobile-only">
                                <img src="" :data-img="$loadImg(show['mediaDetails'].poster)" :alt="`${show['mediaDetails'].title}`">
                            </figure>
                        </template>

                        <div class="link-wrapper">
                            <a v-if="show['mediaDetails'].file_path" href="#" :title="`${show['mediaDetails'].title}`" class="play-trigger"></a>
                            <a href="#" @click="openPopUp(`${show['mediaDetails'].tmdbID}`, $event)" :title="langSnippet('more_informations')" class="info-trigger trigger-normal" data-modal :data-src="`${show['mediaDetails'].tmdbID}`"></a>
                            <router-link :to="`/backend/${show['mediaDetails'].media_type}/${show['mediaDetails'].tmdbID}`" :title="langSnippet('edit')" class="edit-trigger"></router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <template v-if="shows">
        <div class="modal" :id="`${show['mediaDetails'].tmdbID}`" v-for="(show, index) in shows" :key="index">
            <div class="modal-overlay"></div>
            <div class="modal-wrap large">
                <div class="modal-inner-wrap">
                    <div class="info-popup">
                        <div class="col12 marg-bottom-xs mobile-only">
                            <figure class="widescreen">
                                <img :data-img="$loadImg(show['mediaDetails'].backdrop)" loading="lazy" importance="low" alt="">
                            </figure>
                        </div>
                        <div class="innerWrap">
                            <div class="col7 marg-right-col1">
                                <p class="h2">{{ show['mediaDetails'].title }}</p>
                                <p class="small tag-list marg-bottom-base">
                                    <span class="tag">{{ show['mediaDetails'].release_date }}</span>
                                    <span class="tag">{{ show['mediaDetails'].rating }}/10 ★</span>
                                </p>

                                <div class="col12">
                                    <div class="col-9">
                                        <!-- Play button -->
                                        <button v-if="show['mediaDetails'].file_path" href="#" class="btn btn-small btn-white icon-left icon-play marg-right-no">{{ langSnippet('watch_now') }}</button>
                                    </div>                                    
                                
                                    <div class="col-3">
                                        <p class="text-right">
                                            <!-- Like button -->
                                            <button v-if="show['mediaDetails']['watchlist_status'] === 0" @click="watchListAction(show['mediaDetails'].tmdbID, `btn-${show['mediaDetails'].tmdbID}`)" href="#" :id="`btn-${show['mediaDetails'].tmdbID}`" class="btn btn-small btn-white hollow icon-only like-btn marg-no"></button>
                                            <button v-else @click="watchListAction(show['mediaDetails'].tmdbID, `btn-${show['mediaDetails'].tmdbID}`)" href="#" :id="`btn-${show['mediaDetails'].tmdbID}`" class="btn btn-small btn-white hollow icon-only like-btn liked marg-no"></button>
                                        </p>
                                    </div>
                                </div>
                                
                                <p class="small">{{ show['mediaDetails'].overview }}</p>
                                <p v-if="show['genre']" class="small tag-list marg-bottom-base">
                                    <span v-for="(genre, index) in show['genre']" :key="index" class="tag">
                                        {{ genre }}
                                    </span>
                                </p>
                                <p>
                                    <label>{{ langSnippet('seasons') }}
                                        <select :class="`tab-select season-select-${show['mediaDetails'].tmdbID}`" :id="`season-select-${show['mediaDetails'].tmdbID}`" @change="SelectTabs($event)">
                                            <template v-for="(season, index) in show['seasons']" :key="index">
                                                <option v-if="season.title !== 'Extras'" :value="`${season.season_number}`">
                                                    {{ season.title }}
                                                </option>
                                            </template>
                                            <!-- Extras always get shown at the end -->
                                            <option v-if="show['seasons'][0].title === 'Extras'" :value="`${show['seasons'][0].season_number}`">
                                                {{ show['seasons'][0].title }}
                                            </option>
                                        </select>
                                    </label>
                                </p>

                                <template v-for="(season, index) in show['seasons']" :key="index">
                                    <div v-if="season.season_number === 1" :class="`col12 select-tab-content season-select-${show['mediaDetails'].tmdbID} is-active marg-bottom-base`" :data-select-tab="`${season.season_number}`">
                                        <template v-for="(episode, index) in show['episodes']" :key="index">
                                            <div v-if="episode.season_number === season.season_number" :class="`col12 media-card-episode pad-top-xs pad-bottom-xs`">
                                                <div class="col-5 col-3-medium">
                                                    <figure class="widescreen">
                                                        <img :data-img="$loadImg(episode.backdrop)" :alt="episode.title">
                                                    </figure>
                                                </div>
                                                <div class="col-7 col-9-medium pad-left-xs">
                                                    <p class="small strong marg-no">{{ langSnippet('episode') }} {{ episode.episode_number }}: {{ $truncate(episode.title, 50) }}</p>
                                                    <p class="small">{{ $truncate(episode.overview, 100) }}</p>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                    <div v-else :class="`col12 select-tab-content season-select-${show['mediaDetails'].tmdbID} marg-bottom-base`" :data-select-tab="`${season.season_number}`">
                                        <template v-for="(episode, index) in show['episodes']" :key="index">
                                            <div v-if="episode.season_number === season.season_number" :class="`col12 media-card-episode pad-top-xs pad-bottom-xs`">
                                                <div class="col-5 col-3-medium">
                                                    <figure class="widescreen">
                                                        <img :data-img="$loadImg(episode.backdrop)" :alt="episode.title">
                                                    </figure>
                                                </div>
                                                <div class="col-7 col-9-medium pad-left-xs">
                                                    <p class="small strong marg-no">{{ langSnippet('episode') }} {{ episode.episode_number }}: {{ $truncate(episode.title, 50) }}</p>
                                                    <p class="small">{{ $truncate(episode.overview, 100) }}</p>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </template>
                            </div>
                            <div class="col4 desktop-only">
                                <figure class="poster">
                                    <img :data-img="$loadImg(show['mediaDetails'].poster)" alt="" loading="lazy" importance="low">
                                </figure>
                            </div>
                        </div>
                    </div>
                </div>
                <a href="#" class="modal-close" @click="closePopUp(`${show['mediaDetails'].tmdbID}`, $event)"></a>
            </div>
        </div>
    </template>

</template>

<script>
import axios from 'axios';
import functions from '../mixins/functions.vue';
import langSnippet from '../mixins/language.vue';
//import { Swiper, SwiperSlide } from 'swiper/vue';

export default {
    name: 'FrontendShows',
    mixins: [functions, langSnippet],
    data() {
        return {
            userID: null,
            shows: null,
            url: window.location.protocol + '//' + window.location.hostname,
            genres: null,
            genreFilter: 'all',
            orderFilter: "title,ASC"
        };
    },

    methods: {
        async getShows() {
            var genreID = this.genreFilter;
            var orderString = this.orderFilter;
            var orderArr = orderString.split(',');
            var orderBy = orderArr[0];
            var orderType = orderArr[1];
            var mediaGenre = [];
            var allShows = [];
            var allShowInfos = [];
            var shows = [];

            if ( genreID === 'all' ) {               
                try {
                    const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=media_type='show'&orderBy=${orderBy}&order=${orderType}`);
                    shows = response.data;                    
                } catch (error) {
                    // Benutzer ist nicht angemeldet, leiten Sie ihn zur Login-Seite weiter
                    console.log(error);
                }
            } else {
                try {
                    const response = await axios.get(`${this.$mainURL}:3000/api/db/mediaFiltered?mediaType=show&orderBy=${orderBy}&order=${orderType}&genreID=${parseInt(genreID)}`);
                    shows = response.data;
                } catch (error) {
                    // Benutzer ist nicht angemeldet, leiten Sie ihn zur Login-Seite weiter
                    console.log(error);
                }
            }

            for (let i = 0; i < shows.length; i++) {
                allShowInfos = [];
                mediaGenre = [];

                try {
                    allShowInfos['seasons'] = await this.getSeasons(shows[i].tmdbID);
                    allShowInfos['episodes'] = await this.getEpisodes(shows[i].tmdbID);

                    var mediaGenreIDs = JSON.parse(shows[i].genres);
                    for (let x = 0; x < mediaGenreIDs.length; x++) {
                        try {
                            mediaGenre.push(await this.getGenreNames(mediaGenreIDs[x]));
                            
                        } catch(e) {
                            console.log(e);
                        }                                    
                    }

                    allShowInfos['genre'] = mediaGenre;
                    allShowInfos['mediaDetails'] = shows[i];
                    allShowInfos['mediaDetails']['watchlist_status'] = await this.checkWatchlist(shows[i].tmdbID);
                    
                } catch (err) {
                    console.log(err);
                }

                allShows.push(allShowInfos);
            }

            this.shows = allShows;
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
        async getSeasons(showID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/getSeasons?showID=${showID}`);
                return response.data;                
            } catch (error) {
                // Benutzer ist nicht angemeldet, leiten Sie ihn zur Login-Seite weiter
                console.log(error);
            }
        },
        async getEpisodes(showID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/getEpisodes?showID=${showID}`);
                return response.data;                
            } catch (error) {
                // Benutzer ist nicht angemeldet, leiten Sie ihn zur Login-Seite weiter
                console.log(error);
            }
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
            this.getShows().then(() => {
                document.getElementById('loader').classList.add('hidden');
            });
        });
    }
};
</script>