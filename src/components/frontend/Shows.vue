<template>
    <div id="loader" class="" style="display: none !important;">
        <div class="content-wrap">
            <i></i>
            <span></span>
        </div>
    </div>

    <div class="col12 pad-top-xl sticky-top">
        <div class="innerWrap">
            <div class="grid-row">
                <div class="col6 field-wrap grid-padding">
                    <h1>{{ langSnippet('shows') }}</h1>
                </div>

                <div class="col6 grid-padding">
                    <media-filter></media-filter>
                </div>
            </div>            
        </div>
    </div>

    <div class="innerWrap pad-bottom-l">
        <!-- Shows -->
        <template v-if="shows">
            <div class="grid-row" id="media-list">
                <div v-for="(media, index) in visibleMedia" :key="index" class="col-6 col-4-xsmall col-3-small col-2-medium grid-padding media" :data-genre="`${media.genres}`" :data-title="media.title" :data-rating="media.rating">
                    <media-card :media="media" :id="media.tmdbID"></media-card>
                </div>
                <p id="sentinel" class="text-center marg-top-xs marg-bottom-no" style="display: none;">
                    <button id="sentinel-btn" class="btn btn-primary marg-no loading" style="opacity: 0;" @click="loadNextPage">Load more</button>
                </p>
            </div>
        </template>
        <template v-else>
            <div class="col12">
                <p>{{ langSnippet('no_content_existing') }}</p>
            </div>
        </template>
    </div>
</template>

<script>
import functions from '../functions.vue';
import langSnippet from '../mixins/language.vue';
import MediaFilter from './../includes/MediaFilter.vue';
import MediaCard from './../includes/MediaCard.vue';

export default {
    name: 'FrontendShows',
    mixins: [functions, langSnippet],
    components: {
        'media-filter': MediaFilter,
        'media-card': MediaCard,
    },
    data() {
        return {
            shows: null,
            url: window.location.protocol + '//' + window.location.hostname,
            genres: null,
            genreFilter: 'all',
            orderFilter: "title,ASC",
            pageSize: 24,
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
            const nextPageMedia = this.shows.slice(this.page * this.pageSize, (this.page + 1) * this.pageSize);
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
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadNextPage();
                }
            });
        },
        mediaOpen(media, index) {
            this.shows[index].watchlist_status = media.watchlist_status;
            this.onMediaPopUp(media);
        },
        async getShows() {
            this.shows = this.movies = await this.getAllMediaInfos('title', 'ASC', null, 'show');

            this.totalPages = Math.ceil(this.shows.length/this.totalPages);
            this.visibleMedia = this.shows.slice(0, this.page * this.pageSize);
        },
        async watchListAction(mediaID, buttonID) {
            this.watchListTrigger(this.$globalState.user.id, mediaID, buttonID);
        },
    },
    async mounted() {
        this.genres = await this.getGenre();
        await this.getShows().then(() => {
            document.getElementById('loader').classList.add('hidden');

            this.sentinelElement = document.getElementById('sentinel');
            this.setupIntersectionObserver();
        });
    }
};
</script>