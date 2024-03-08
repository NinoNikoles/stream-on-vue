<template>
    <div id="loader" class="">
        <div class="content-wrap">
            <i></i>
            <span></span>
        </div>
    </div>

    <div class="innerWrap pad-bottom-l">
        <div class="pad-top-xl sticky-top">
            <h1>{{ langSnippet('movies') }}</h1>

            <div class="grid-row">
                <div class="col-12 col-3-medium grid-padding marg-bottom-xs">
                    <label class="select">
                        <select id="genre-filter" @change="filterByGenre($event)">
                            <option value="all">{{ langSnippet('all') }}</option>
                            <option v-for="(genre, index) in genres" :key="index" :value="`${genre.genre_id}`">{{ genre.genre_name }}</option>
                        </select>
                    </label>
                </div>
                <div class="col-12 col-3-medium marg-left-col6 grid-padding marg-bottom-xs">
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
        </div>

        <!-- Movies -->
        <template v-if="movies">
            <div class="grid-row" id="media-list">
                <div v-for="(media, index) in visibleMedia" :key="index" :data-index="index" class="col-6 col-4-xsmall col-3-medium grid-padding media" :data-genre="`${media.genres}`" :data-title="media.title" :data-rating="media.rating">
                    <media-content :mediaContent="media" :mediaIndex="index" @popUpTrigger="mediaOpen"></media-content>
                </div>
                <p id="sentinel" class="text-center marg-top-xs marg-bottom-no" style="display: none;">
                    <button id="sentinel-btn" class="btn btn-primary marg-no loading" style="opacity: 0;" @click="loadNextPage">Load more</button>
                </p>
            </div>
        </template>
    </div>
</template>

<script>
import functions from '../mixins/functions.vue';
import langSnippet from '../mixins/language.vue';
import MediaContent from './../includes/MediaCard.vue';

// let mediaInfos = [];

export default {
    name: 'FrontendMovies',
    mixins: [functions, langSnippet],
    components: {
        'media-content': MediaContent,
    },
    props: ['onMediaPopUp'],
    data() {
        return {
            userID: null,
            movies: null,
            url: window.location.protocol + '//' + window.location.hostname,
            genres: null,
            genreFilter: 'all',
            orderFilter: "title,ASC",
            pageSize: 20,
            page: 1,
            totalPages: 0,
            visibleMedia: null,
            observer: null,
            sentinelElement: null,
        };
    },
    methods: {
        setupIntersectionObserver() {
            if ( this.totalPages > 1 ) {
                this.sentinelElement.style.display = 'block';
            }
            if (this.sentinelElement) {
                this.observer = new IntersectionObserver(this.handleIntersect);
                this.observer.observe(this.sentinelElement);
            }
        },
        loadNextPage() {
            const loadButton = document.getElementById('sentinel-btn');
            const nextPageMedia = this.movies.slice(this.page * this.pageSize, (this.page + 1) * this.pageSize);
            var timeOut = 0;
            
            this.disableButton(loadButton);

            if ( this.page < this.totalPages ) this.page++;
            if ( this.page > 4 ) timeOut = 250;

            setTimeout(() => {
                this.visibleMedia = this.visibleMedia.concat(nextPageMedia);
                loadButton.classList.remove('is-loading');
                loadButton.disabled = false;

                if(this.page >= this.totalPages) {
                    this.sentinelElement.remove();
                }
                
            }, timeOut);
        },
        handleIntersect(entries) {
            if ( this.page > 4 ) {
                this.observer.disconnect();
                this.observer = null;
                document.getElementById('sentinel-btn').style.opacity = 1;
            }

            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadNextPage();
                }
            });
        },
        mediaOpen(media, index) {
            this.movies[index].watchlist_status = media.watchlist_status;
            this.onMediaPopUp(media);
        },
        async getMovies() {
            this.movies = await this.getAllMediaInfos('title', 'ASC', null, 'movie');

            this.totalPages = Math.ceil(this.movies.length/20);
            this.visibleMedia = this.movies.slice(0, this.page * this.pageSize);
        },
        async watchListAction(mediaID, buttonID) {
            this.watchListTrigger(this.userID, mediaID, buttonID);
        },
        async popUpTrigger(index, media, event) {
            var status =  await this.checkWatchlist(media.tmdbID);
            this.movies[index].watchlist_status = status
            media.watchlist_status = status;
            this.openMediaPopUp(media, event);
        }
    },
    mounted() {
        this.sessionUser().then(async(userID) => {
            this.userID = userID;

            this.genres = await this.getGenre();
            this.getMovies().then(() => {
                document.getElementById('loader').classList.add('hidden');

                this.sentinelElement = document.getElementById('sentinel');
                this.setupIntersectionObserver();
            });
        });
    },
};
</script>