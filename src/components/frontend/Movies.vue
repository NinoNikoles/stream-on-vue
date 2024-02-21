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

        <!--- Movies --->
        <div v-if="movies" class="grid-row" id="media-list">
            <div v-for="(media, index) in movies" :key="index" class="col-6 col-4-xsmall col-3-medium grid-padding media" :data-genre="`[${media.genre}]`" :data-title="media.title" :data-rating="media.rating">
                <div class="media-card">
                    <div class="media-card-wrapper">
                        <template v-if="media.file_path === null">
                            <figure class="widescreen desktop-only disabled">
                                <img src="" :data-img="$loadImg(media.backdrop)" :alt="`${media.title}`">
                            </figure>
                            <figure class="poster mobile-only disabled">
                                <img src="" :data-img="$loadImg(media.poster)" :alt="`${media.title}`">
                            </figure>
                        </template>

                        <template v-else>
                            <figure class="widescreen desktop-only">
                                <img src="" :data-img="$loadImg(media.backdrop)" :alt="`${media.title}`">
                            </figure>
                            <figure class="poster mobile-only">
                                <img src="" :data-img="$loadImg(media.poster)" :alt="`${media.title}`">
                            </figure>
                        </template>

                        <div class="link-wrapper">
                            <a v-if="media.file_path" href="#" :title="`${media.title}`" class="play-trigger"></a>
                            <a href="#" @click="openMediaPopUp(media, $event)" :title="langSnippet('more_informations')" class="info-trigger trigger-normal" data-modal :data-src="`${media.tmdbID}`"></a>
                            <router-link :to="`/backend/${media.media_type}/${media.tmdbID}`" :title="langSnippet('edit')" class="edit-trigger"></router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import functions from '../mixins/functions.vue';
import langSnippet from '../mixins/language.vue';

let mediaInfos = [];

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
            var mediaResponse = [];

            try {
                mediaResponse = await this.get(`SELECT tmdbID FROM media WHERE media_type = "movie" ORDER BY title ASC`);
            } catch (error) {
                console.log(error);
            }

            for (let i = 0; i < mediaResponse.length; i++) {
                if ( !mediaInfos.includes(mediaResponse[i].tmdbID) ) {
                    mediaInfos.push(mediaResponse[i].tmdbID);
                }
            }
            
            var ids = mediaInfos.filter(num => mediaResponse.some(obj => obj.tmdbID === num));
            this.movies = await this.getAllMediaInfos(ids, 'title', 'ASC');
        },
        async popUpTrigger(media) {
            await this.selectMedia(media)
            .then(() => {
                this.openPopUp();
            });
        },
        async watchListAction(mediaID, buttonID) {
            this.watchListTrigger(this.userID, mediaID, buttonID);
        }
    },
    mounted() {
        this.sessionUser().then(async(userID) => {
            this.userID = userID;

            this.genres = await this.getGenre();
            this.getMovies().then(() => {
                document.getElementById('loader').classList.add('hidden');
            });
        });
    }
};
</script>