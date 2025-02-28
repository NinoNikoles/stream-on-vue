<template>
    <div id="loader" class="hidden">
        <div class="content-wrap">
            <i></i>
            <span class="visible">{{ langSnippet('please_wait_adding_show') }}</span>
        </div>
    </div>

    <div class="col12 display-flex backend-wrap">

        <backend-menu></backend-menu>

        <div class="col12 backend-content pad-top-xl pad-bottom-l">
            <div class="innerWrap">
                <div class="col8">
                    <h1>{{ langSnippet('shows') }}</h1>
                </div>

                <div class="col4" v-if="genreAvailable">
                    <p class="text-right">
                        <a href="#add-new-show" data-fancybox class="btn btn-primary btn-small icon-left icon-add">
                            {{ langSnippet('add_show') }}
                        </a>
                    </p>

                    <div id="add-new-show" style="display: none;">
                        <div id="searchbar">
                            <label for="show-api-search">
                                <input v-model="inputText" @input="handleInputChange" type="text" id="show-api-search" name="show-name" :placeholder="langSnippet('search')+` ...`" required>
                            </label>

                            <div v-if="shows" id="showSearchResults">
                                <div v-for="(show, index) in shows" :key="index" class="search-result-item display-flex flex-row marg-no" data-fancybox>
                                    <figure class="poster" style="width:20%;max-width:100px;">
                                        <img :src="$loadImg(show.poster_path)" loading="lazy" :alt="`${show.name}`">
                                    </figure>
                                    <span class="pad-xs" style="width:80%;">
                                        {{ show.name }}
                                        <p class="text-right">
                                            <button class="btn btn-success btn-small icon-left icon-add" :data-media="`${show.id}`" data-fancybox-close type="submit" name="add-show" @click="saveData(show)">{{ langSnippet('add') }}</button>
                                        </p>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col12">
                    <div v-if="outputShows" class="col12">
                        <p>
                            <label for="local-search">
                                <input v-model="localSearch" @input="localSearchFunction" type="text" id="local-search" name="local-search" :placeholder="langSnippet('search')+` ...`">
                            </label>
                        </p>

                        <div class="grid-row">
                            <div v-for="(show, index) in outputShows" :key="index" :data-title="show.title" class="col-6 col-4-xsmall col-2-medium grid-padding local-output-items">
                                <router-link :to="`/b/show/${show.tmdbID}`" :title="`${show.title}`" class="media-card-wrap">
                                    <figure class="media-card poster rounded">
                                        <img :src="$loadImg(show.poster)" loading="lazy" :alt="`${show.title}`">
                                    </figure>
                                    <span class="title marg-no">{{ $truncate(show.title, 20) }}</span>
                                </router-link>
                            </div>
                        </div>
                    </div>

                    <div v-else class="col12 marg-bottom-m">
                        <p>Please setup Genre</p>
                    </div>
                </div>
            </div>
        </div>
    </div>    
</template>

<script>
import axios from 'axios';
import tmdbAPI from '../mixins/tmdbAPI.vue';
import language from '../mixins/language.vue';
import functions from '../functions.vue';
import BackendMenu from '../includes/BackendMenu.vue';

export default {
    name: 'BackendShows',
    mixins: [functions, tmdbAPI, language],
    components: {
        'backend-menu': BackendMenu,
    },
    data() {
        return {
            inputText: '',
            outputText: '',
            shows: null,
            outputShows: null,
            genre: null,
            showProgressBar: false,
            progressBarWidth: '0%',
            genreAvailable: false,
            localSearch: ''
        };
    },
    methods: {
        handleInputChange() {
            this.outputText = this.inputText;
            this.searchAndDisplayShows(this.outputText);
        },
        async searchAndDisplayShows(title) {
            const query = title;
            try {
                if ( query.length > 0 && query !== '' && query !== null && query !== undefined ) {
                    const shows = await this.searchShows(query);
                    this.shows = await this.filterShowsWithExistingIDs(shows);
                } else {
                    this.shows = null;
                }
            } catch (error) {
                console.log(error);
            }
        },
        async filterShowsWithExistingIDs(shows) {
            const filteredshows = [];
            for (const show of shows) {
                const existsInDatabase = await this.checkIfShowExistsInDatabase(show.id);
                if (!existsInDatabase) {
                    filteredshows.push(show);
                }
            }

            return new Promise((resolve) => {
                resolve(filteredshows);
            });
        },
        async checkIfShowExistsInDatabase(tmdbID) {
            const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=tmdbID="${tmdbID}"`);
            return new Promise((resolve) => {
                resolve(response.data.length > 0);
            });
        },
        async saveData(data) {
            document.getElementById('loader').classList.remove('hidden');
            this.showProgressBar = true;

            const show = await this.searchShowByID(data.id);
            const genres = show.genres.map(genre => genre.id);
            let date = show.first_air_date;
            let parsedDate = new Date(date);
            let day = parsedDate.getDate();
            let month = parsedDate.getMonth() + 1;
            let year = parsedDate.getFullYear();
            let formattedDate = `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;
            var trailer = null;
            if ( show.videos.results.length > 0 ) trailer = show.videos.results[0].key;

            var media = {
                tmdbID: show.id,
                title: show.name,
                tagline: show.tagline,
                genres: JSON.stringify(genres),
                overview: show.overview,
                poster: show.poster_path,
                backdrop: show.backdrop_path,
                rating: show.vote_average.toFixed(2),
                release_date: formattedDate,
                show_season_count: show.number_of_seasons,
                show_episodes_count: show.number_of_episodes,
                media_type: "show",
                trailer: trailer
            }

            try {
                var seasons = await this.saveSeasons(show.seasons, show.id);
                var episodes = await this.saveEpisodes(show.id, show.seasons);
                await this.sendMedia(media, seasons, episodes);
            } catch (error) {
                console.log(error);
            }

            this.clearSearch();
            this.outputShows = await this.outPutShows();
            await this.searchAndDisplayShows(this.outputText);
            this.callout('success', 'Show added successfully');
        },
        async saveSeasons(seasons, showID) {
            var dataSeasons = [];

            for (const season of seasons) {
                const newSeason = await this.searchSeasonByNumber(showID, season.season_number);

                var seasonData = {
                    tmdbID: newSeason.id,
                    title: newSeason.name,
                    overview: newSeason.overview,
                    poster: newSeason.poster_path,
                    season_number: newSeason.season_number,
                    release_date: newSeason.air_date,
                    episodes_count: newSeason.episodes.length,
                    show_tmdbID: showID,
                }

                dataSeasons.push(seasonData);
            }

            return dataSeasons;
        },
        async saveEpisodes(showID, seasons) {
            var dataEpisodes = [];

            for (const season of seasons) {
                try {
                    const newSeason = await this.searchSeasonByNumber(showID, season.season_number);

                    try {
                        let newEpisodes = await this.searchShowEpisodes(showID, season.season_number, newSeason.episodes);

                        for ( const episode of newEpisodes ) {
                            var episodeData = {
                                tmdbID: episode.id,
                                episode_number: episode.episode_number,
                                title: episode.name,
                                overview: episode.overview,
                                backdrop: episode.still_path,
                                runtime: episode.runtime,
                                release_date: episode.air_date,
                                show_id: showID,
                                season_number: season.season_number,
                            }

                            dataEpisodes.push(episodeData);
                        }                        
                    } catch (err) {
                        console.log(err);
                    }
                } catch (err) {
                    console.log(err);
                }
            }

            return dataEpisodes;
        },
        async sendMedia(media, seasons, episodes) {
            var response = await axios.post(`${this.$mainURL}:3000/api/db/show?mediaID=${media.tmdbID}&dataGenres=${media.genres}`, { media: media, seasons: seasons, episodes: episodes, });   
            if ( response.data.message === true ) {
                document.getElementById('loader').classList.add('hidden');
            }
        },
        async outPutShows() {
            var order = 'title';
            const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=media_type="show"&orderBy=${order}&order=ASC`);
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
        this.outputShows = await this.outPutShows();
    }
};
</script>