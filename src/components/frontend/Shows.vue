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
                    <select id="genre-filter" @change="filterByGenre($event)">
                        <option value="all">{{ langSnippet('all') }}</option>
                        <option v-for="(genre, index) in genres" :key="index" :value="`${genre.genre_id}`">{{ genre.genre_name }}</option>
                    </select>
                </label>
            </div>
            <div class="col-12 col-3-medium marg-left-col6 grid-padding marg-bottom-s">
                <label class="select">
                    <select id="title-filter" @change="filterBySetting($event)">
                        <option value="[title,ASC]">A - Z</option>
                        <option value="[title,DESC]">Z - A</option>
                        <!-- <option value="releaseDate,DESC">Neuste - Älteste</option>
                        <option value="releaseDate,ASC">Älteste - Neuste</option> -->
                        <option value="[rating,DESC]">Bewertung: Höchste - Niedrigste</option>
                        <option value="[rating,ASC]">Bewertung: Niedrigste - Höchste</option>
                    </select>
                </label>
            </div>
        </div>

        <div v-if="shows" class="grid-row" id="media-list">
            <div v-for="(show, index) in shows" :key="index" class="col-6 col-4-xsmall col-3-medium grid-padding media" :data-genre="`[${show.genre}]`" :data-title="show.title" :data-rating="show.rating">
                <media-content :mediaContent="show" :mediaIndex="index" @popUpTrigger="mediaOpen"></media-content>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import functions from '../mixins/functions.vue';
import langSnippet from '../mixins/language.vue';
import MediaContent from './../includes/MediaCard.vue';

let mediaInfos = [];

export default {
    name: 'FrontendShows',
    mixins: [functions, langSnippet],
    components: {
        'media-content': MediaContent,
    },
    props: ['onMediaPopUp'],
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
        mediaOpen(media, index) {
            this.shows[index].watchlist_status = media.watchlist_status;
            this.onMediaPopUp(media);
        },
        async getShows() {
            var mediaResponse = [];

            mediaResponse = await this.get(`SELECT tmdbID FROM media WHERE media_type = "show" ORDER BY title ASC`);

            for (let i = 0; i < mediaResponse.length; i++) {
                if ( !mediaInfos.includes(mediaResponse[i].tmdbID) ) {
                    mediaInfos.push(mediaResponse[i].tmdbID);
                }
            }

            var ids = mediaInfos.filter(num => mediaResponse.some(obj => obj.tmdbID === num));
            this.shows = await this.getAllMediaInfos(ids, 'title', 'ASC');
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
        async watchListAction(mediaID, buttonID) {
            this.watchListTrigger(this.userID, mediaID, buttonID);
        },
    },
    mounted() {
        this.sessionUser().then(async(userID) => {
            this.userID = userID;

            this.genres = await this.getGenre();
            this.getShows().then(() => {
                document.getElementById('loader').classList.add('hidden');
            });
        });
    }
};
</script>