<template>
    <div id="loader" class="">
        <div class="content-wrap">
            <i></i>
            <span></span>
        </div>
    </div>

    <div class="innerWrap pad-top-xl">
        <h1>{{ langSnippet('my_list') }}</h1>

        <div class="grid-row">
            <div class="col-12 col-3-medium grid-padding marg-bottom-s">
                <label class="select">{{ langSnippet('genres') }}
                    <select id="genre-filter" v-model="genreFilter" @change="getMedia()">
                        <option value="all">{{ langSnippet('all') }}</option>
                        <option v-for="(genre, index) in genres" :key="index" :value="`${genre.genre_id}`">{{ genre.genre_name }}</option>
                    </select>
                </label>
            </div>
            <div class="col-12 col-3-medium marg-left-col6 grid-padding marg-bottom-s">
                <label class="select">{{ langSnippet('sorting') }}
                    <select id="title-filter" v-model="orderFilter" @change="getMedia()">
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

        <!--- Media --->
        <div v-if="mediaAll" class="grid-row" id="media-list">
            <div v-for="(media, index) in mediaAll" :key="index" class="col-6 col-4-xsmall col-3-medium grid-padding">
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
                            <a href="#" @click="openPopUp(`${media['mediaDetails'].tmdbID}`, $event)" :title="langSnippet('more_informations')" class="info-trigger trigger-normal" data-modal :data-src="`${media['mediaDetails'].tmdbID}`"></a>
                            <router-link :to="`/backend/${media['mediaDetails'].media_type}/${media['mediaDetails'].tmdbID}`" :title="langSnippet('edit')" class="edit-trigger"></router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!--- Pop Ups --->
    <template v-if="mediaAll">
        <div class="modal" :id="`${media['mediaDetails'].tmdbID}`" v-for="(media, index) in mediaAll" :key="index">
            <div class="modal-overlay"></div>
            <div class="modal-wrap large">
                <div class="modal-inner-wrap">
                    <div class="info-popup">
                        <div class="col12 marg-bottom-xs mobile-only">
                            <figure class="widescreen">
                                <img :data-img="$loadImg(media['mediaDetails'].backdrop)" loading="lazy" importance="low" alt="">
                            </figure>
                        </div>
                        <div class="innerWrap">
                            <div class="col7 marg-right-col1">
                                <p class="h2">{{ media['mediaDetails'].title }}</p>
                                <p class="small tag-list marg-bottom-base">
                                    <span class="tag">{{ media['mediaDetails'].release_date }}</span>
                                    <span class="tag">{{ media['mediaDetails'].rating }}/10 ★</span>
                                </p>

                                <div class="col12">
                                    <div class="col-9">
                                        <!-- Play button -->
                                        <button v-if="media['mediaDetails'].file_path" href="#" class="btn btn-small btn-white icon-left icon-play marg-right-no">{{ langSnippet('watch_now') }}</button>
                                    </div>                                    
                                
                                    <div class="col-3">
                                        <p class="text-right">
                                            <!-- Like button -->
                                            <button v-if="media['mediaDetails']['watchlist_status'] === 0" @click="watchListAction(media['mediaDetails'].tmdbID, `btn-${media['mediaDetails'].tmdbID}`)" href="#" :id="`btn-${media['mediaDetails'].tmdbID}`" class="btn btn-small btn-white hollow icon-only like-btn marg-no"></button>
                                            <button v-else @click="watchListAction(media['mediaDetails'].tmdbID, `btn-${media['mediaDetails'].tmdbID}`)" href="#" :id="`btn-${media['mediaDetails'].tmdbID}`" class="btn btn-small btn-white hollow icon-only like-btn liked marg-no"></button>
                                        </p>
                                    </div>
                                </div>
                                

                                <p class="small">{{ media['mediaDetails'].overview }}</p>
                                <p v-if="media['genre']" class="small tag-list marg-bottom-base">
                                    <span v-for="(genre, index) in media['genre']" :key="index" class="tag">
                                        {{ genre }}
                                    </span>
                                </p>
                            </div>
                            <div class="col4 desktop-only">
                                <figure class="poster">
                                    <img :data-img="$loadImg(media['mediaDetails'].poster)" alt="" loading="lazy" importance="low">
                                </figure>
                            </div>
                        </div>
                    </div>
                </div>
                <a href="#" class="modal-close" @click="closePopUp(`${media['mediaDetails'].tmdbID}`, $event)"></a>
            </div>
        </div>
    </template>

</template>

<script>
import axios from 'axios';
import functions from '../mixins/functions.vue';
import langSnippet from '../mixins/language.vue';

export default {
    name: 'FrontendMyList',
    mixins: [functions, langSnippet],
    data() {
        return {
            userID: null,
            mediaAll: null,
            url: window.location.protocol + '//' + window.location.hostname,
            genres: null,
            genreFilter: 'all',
            orderFilter: "title,ASC"
        };
    },

    methods: {
        async getMedia() {
            var genreID = this.genreFilter;
            var orderString = this.orderFilter;
            var orderArr = orderString.split(',');
            var orderBy = orderArr[0];
            var orderType = orderArr[1];
            var allMedia = []
            var media = [];
            var mediaInfos = [];
            var mediaGenre = [];

            if ( genreID === 'all' ) {
                try {
                    const response = await axios.get(`${this.$mainURL}:3000/api/db/media?userID=${this.userID}&orderBy=${orderBy}&order=${orderType}`);
                    allMedia = response.data;
                } catch (error) {
                    console.log(error);
                }
            } else {
                try {
                    const response = await axios.get(`${this.$mainURL}:3000/api/db/mediaFiltered?userID=${this.userID}&orderBy=${orderBy}&order=${orderType}&genreID=${parseInt(genreID)}`);
                    allMedia = response.data;
                    
                } catch (error) {
                    console.log(error);
                }
            }

            for (let i = 0; i < allMedia.length; i++) {
                mediaInfos = [];
                mediaGenre = [];

                try {
                    if ( allMedia[i].media_type === 'show' ) {
                        mediaInfos['seasons'] = await this.getSeasons(allMedia[i].tmdbID);
                        mediaInfos['episodes'] = await this.getEpisodes(allMedia[i].tmdbID);
                    }

                    var mediaGenreIDs = JSON.parse(allMedia[i].genres);

                    for (let x = 0; x < mediaGenreIDs.length; x++) {
                        try {
                            mediaGenre.push(await this.getGenre(mediaGenreIDs[x]));
                            
                        } catch(e) {
                            console.log(e);
                        }                                    
                    }

                    mediaInfos['genre'] = mediaGenre;
                    mediaInfos['mediaDetails'] = allMedia[i];
                    mediaInfos['mediaDetails']['watchlist_status'] = await this.checkWatchlist(allMedia[i].tmdbID);
                    media[i] = mediaInfos;
                    
                } catch (error) {
                    console.log(error);
                }
            }

            this.mediaAll = media;
        },
        async getSeasons(showID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/getSeasons?showID=${showID}`);
                return response.data;                
            } catch (error) {
                console.log(error);
            }
        },
        async getEpisodes(showID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/getEpisodes?showID=${showID}`);
                return response.data;                
            } catch (error) {
                console.log(error);
            }
        },
        async getGenre(genreID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/genreNameByID?id=${genreID}`);
                return response.data[0].genre_name;                
            } catch (error) {
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
        },
        async getGenreAll() {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/allGenre`);
                this.genres = response.data;
                
            } catch (error) {
                // Benutzer ist nicht angemeldet, leiten Sie ihn zur Login-Seite weiter
                console.log(error);
            }
        },
    },
    mounted() {
        this.sessionUser().then((userID) => {
            this.userID = userID;

            this.getMedia();
            this.getGenreAll().then(() => {
                document.getElementById('loader').classList.add('hidden');
            });
        });
    }
};
</script>