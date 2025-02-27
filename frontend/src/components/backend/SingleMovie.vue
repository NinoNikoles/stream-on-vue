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
            <div class="innerWrap" v-if="movie">
                <div class="col8">
                    <div class="col12">
                        <h1 v-if="movie.tagline">{{ movie.title }}<br>{{ movie.tagline }}</h1>
                        <h1 v-else>{{ movie.title }}</h1>
                    </div>
                    <div class="col12"><p>{{ movie.overview }}</p></div>
                    <div class="col3"><p><strong>{{ langSnippet('rating') }}:</strong><br>{{ movie.rating }}</p></div>
                    <div class="col5"><p><strong>{{ langSnippet('release_date') }}:</strong><br>{{ movie.release_date }}</p></div>
                    <div class="col4"><p><strong>{{ langSnippet('runtime') }}:</strong><br>{{ runtime(movie.runtime) }}</p></div>
                    <div class="col12">
                        <p><strong>{{ langSnippet('genres') }}:</strong><br>
                            <span v-for="(listGenre, index) in genre" :key="index" class="tag">
                                {{ listGenre }}
                            </span>
                        </p>
                    </div>

                    <div class="col12 marg-top-s">
                        <div class="row">
                            <span class="column"><a href="#edit-movie" data-fancybox class="btn btn-primary btn-small icon-left icon-pen">Infos bearbeiten</a></span>
                            <span class="column" v-if="isHighlight===null"><button @click="addHighlight(movie.tmdbID)" class="btn btn-warning hollow btn-small icon-left icon-star" name="addHighlight">{{ langSnippet('add_highlight') }}</button></span>
                        </div>
                    </div>
                </div>
 
                <div class="col3 marg-left-col1">
                    <div class="col12" v-if="movie.file_path || this.$route.params.selectedFile">
                        <figure class="widescreen">
                            <video :src="`${this.$mainURL}:8080/${this.movie.file_path.replace('/public/', '')}`" controls></video>
                        </figure>
                    </div>
                    <div class="col12">
                        <p>
                            <button href="#media-browser" data-fancybox @click="selectMedia(movie)" class="btn btn-success btn-small icon-left icon-media col12" name="addHighlight">{{ langSnippet('select_file') }}</button>
                        </p>
                    </div>

                    <div class="row">
                        <div class="col12 column">
                            <a href="#movie-poster" data-fancybox data-src="#movie-poster">
                                <figure class="poster">
                                    <img :src="$loadImg(movie.poster)" loading="lazy" alt="" id="mainPoster">
                                </figure>
                            </a>
                            <div id="movie-poster" style="display:none;">
                                <p>{{ langSnippet('select_new_poster') }}:</p>
                                <div v-if="allPosters" class="row">
                                    <div v-for="(poster, index) in allPosters" :key="index" class="col-6 col-3-medium column marg-bottom-base">
                                        <div class="poster-select">
                                            <input type="radio" :id="`poster-${index}`" name="poster" :value="`${poster.file_path}`">
                                            <figure class="poster">
                                                <img :src="$loadImg(poster.file_path)" loading="lazy" alt="">
                                            </figure>
                                        </div>
                                    </div>
                                </div>
                                <p class="text-right">
                                    <button @click="savePoster()" class="btn btn-success" name="change-poster">{{ langSnippet('save') }}</button>
                                </p>
                            </div>
                        </div>

                        <div class="col12 column">
                            <a href="#movie-backdrop" data-fancybox data-src="#movie-backdrop">
                                <figure class="widescreen">
                                    <img :src="$loadImg(movie.backdrop)" loading="lazy" alt="" id="mainBackdrop">
                                </figure>
                            </a>
                            <div id="movie-backdrop" style="display:none;">
                                <p>{{ langSnippet('select_new_backdrop') }}:</p>
                                <div v-if="allBackdrops" class="row">
                                    <div v-for="(backdrop, index) in allBackdrops" :key="index" class="col-6 col-3-medium column marg-bottom-base">
                                        <div class="poster-select">
                                            <input type="radio" :id="`backdrop-${index}`" name="backdrop" :value="`${backdrop.file_path}`">
                                            <figure class="original">
                                                <img :src="$loadImg(backdrop.file_path)" loading="lazy" alt="">
                                            </figure>
                                        </div>
                                    </div>
                                </div>
                                <p class="text-right">
                                    <button @click="saveBackdrop()" class="btn btn-success" name="change-backdrop">{{ langSnippet('save') }}</button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="innerWrap marg-top-xl" v-if="collection.length > 0">
                <div class="col12">
                    <h2>Kollektion</h2>

                    <div class="grid-row">
                        <div v-for="(kMovie, index) in collection" :key="index" class="col-6 col-3-xsmall col-2-medium grid-padding">
                            <a :href="`#add-movie-${kMovie.id}`" :title="`${kMovie.title}`" data-fancybox class="media-card-wrap">
                                <figure class="media-card poster rounded">
                                    <img :src="$loadImg(kMovie.poster_path)" loading="lazy" :alt="`${kMovie.title}`">
                                </figure>
                                <span class="title">{{ $truncate(kMovie.title, 15) }}</span>
                            </a>

                            <div :id="`add-movie-${kMovie.id}`" style="display:none;">
                                <p v-html="langSnippet('add_movie_to_library', kMovie.title)"></p>
                                <p class="text-right marg-no">
                                    <button class="btn btn-success icon-left icon-add" :data-media="`${kMovie.id}`" data-fancybox-close type="submit" name="add-movie" @click="saveData(kMovie)">{{ langSnippet('add') }}</button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="innerWrap marg-top-xl" v-if="similarMovies.length > 0">
                <div class="col12">
                    <h2>Ähnliche</h2>

                    <div class="grid-row">
                        <div v-for="(sMovie, index) in similarMovies" :key="index" class="col-6 col-3-xsmall col-2-medium grid-padding">
                            <a :href="`#add-movie-${sMovie.id}`" :title="`${sMovie.title}`" data-fancybox class="media-card-wrap">
                                <figure class="media-card poster rounded">
                                    <img :src="$loadImg(sMovie.poster_path)" loading="lazy" :alt="`${sMovie.title}`">
                                </figure>
                                <span class="title">{{ $truncate(sMovie.title, 15) }}</span>
                            </a>

                            <div :id="`add-movie-${sMovie.id}`" style="display:none;">
                                <p v-html="langSnippet('add_movie_to_library', sMovie.title)"></p>
                                <p class="text-right marg-no">
                                    <button class="btn btn-success icon-left icon-add" :data-media="`${sMovie.id}`" data-fancybox-close type="submit" name="add-movie" @click="saveData(sMovie)">{{ langSnippet('add') }}</button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="edit-movie" style="display: none;" v-if="movie">
                <p v-html="langSnippet('edit')"></p>
                <form onsubmit="return false;">
                    <div class="row">
                        <!-- <span v-if="editUserError" :class="`box-callout ${editUserError[1]}`">{{ editUserError[0] }}</span> -->
                        <div class="col6 column">
                            <p>
                                <span class="input-wrap">
                                    <label for="mTitle">{{ langSnippet('name') }}</label>
                                    <input type="text" id="mTitle" name="mTitle" required v-model="movie.title">
                                </span>
                            </p>
                        </div>
                        <div class="col6 column">
                            <p>
                                <span class="input-wrap">
                                    <label for="mTagline">{{ langSnippet('tagline') }}</label>
                                    <input type="text" id="mTagline" name="mTagline" v-model="movie.tagline">
                                </span>
                            </p>
                        </div>
                        <div class="col12 column">
                            <p>
                                <span class="input-wrap">
                                    <label for="mOverview">{{ langSnippet('overview') }}</label>
                                    <textarea type="text" id="mOverview" name="mOverview" required v-model="movie.overview"></textarea>
                                </span>
                            </p>
                        </div>
                        <div class="col12 column">
                            <p>
                                <span class="input-wrap">
                                    <label for="mTrailerID">{{ langSnippet('trailer') }} ID</label>
                                    <input type="text" id="mTrailerID" name="mTrailerID" required v-model="movie.trailer">
                                </span>
                            </p>
                        </div>
                    </div>
                    <p class="text-right marg-no">
                        <button @click="editMovie(movie)" class="btn btn-small btn-success icon-left icon-save" :title="langSnippet('save')" type="submit" name="save">{{ langSnippet('save') }}</button>
                    </p>
                </form>
            </div>

            <div id="media-browser" style="display: none;" v-if="movie">
                <div class="row">
                    <div class="innerWrap">
                        <div class="col12">
                            <p class="h4">{{langSnippet('select_a_video_file')}}:</p>
                            <media-browser :selectedMedia="movie.file_path"></media-browser>
                        </div>
                    </div>                    
                </div>
            </div>
        </div>
    </div>    
</template>

<script>
import axios from 'axios';
import tmdbAPI from '../mixins/tmdbAPI.vue';
import langSnippet from '../mixins/language.vue';
import functions from '../functions.vue';
import ContentManager from '../includes/MediaBrowser.vue';
import { Fancybox } from '@fancyapps/ui';
import BackendMenu from '../includes/BackendMenu.vue';

export default {
    name: 'BackendMovie',
    mixins: [tmdbAPI, langSnippet, functions],
    components: {
        'backend-menu': BackendMenu,
        'media-browser': ContentManager,
    },
    data() {
        return {
            movie: null,
            genre: null,
            isHighlight: null,
            allPosters: null,
            allBackdrops: null,
            collection: [],
            collectionID: null,
            similarMovies: [],
            loader: document.getElementById('loader'),
        };
    },
    methods: {
        async outPutMovie(tmdbID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=tmdbID=${tmdbID}`);
                return response.data; // Geben Sie die Daten aus der Antwort zurück, nicht die gesamte Antwort
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }
        },
        async getGenre(genres) {
            
            const genreData = [];

            for ( const genre of genres ) {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/genreNameByID?id=${genre}`);
                var genreName  = response.data[0].genre_name;
                genreData.push(genreName);
            }

            this.genre = genreData;
        },
        async getAllPosters(mediaID) {
            var posters = await this.getPosters('movie', mediaID);
            return new Promise((resolve) => {
                resolve(posters);
            });
        },
        async getAllBackdrops(mediaID) {
            var backdrops = await this.getBackdrops('movie', mediaID);
            return new Promise((resolve) => {
                resolve(backdrops);
            });
        },
        async savePoster() {
            var posterSelect = document.querySelector('input[name="poster"]:checked');

            if (posterSelect) {
                var newPoster = posterSelect.value;

                try {
                    await axios.post(`${this.$mainURL}:3000/api/db/saveNewPoster?mediaID=${this.movie.tmdbID}&poster=${newPoster}`);
                    document.getElementById('mainPoster').src = `http://image.tmdb.org/t/p/original${newPoster}`;
                } catch (err) {
                    console.log(err);
                }
            }

            Fancybox.close();
        },
        async saveBackdrop() {
            var backdropSelect = document.querySelector('input[name="backdrop"]:checked');
            
            if (backdropSelect) {
                var newBackdrop = backdropSelect.value;

                try {
                    await axios.post(`${this.$mainURL}:3000/api/db/saveNewBackdrop?mediaID=${this.movie.tmdbID}&backdrop=${newBackdrop}`);
                    document.getElementById('mainBackdrop').src = `http://image.tmdb.org/t/p/original${newBackdrop}`;
                } catch (err) {
                    console.log(err);
                }
            }

            Fancybox.close();
        },
        async addHighlight(mediaID) {
            try {
                var response = await axios.post(`${this.$mainURL}:3000/api/db/addHighlight?mediaID=${mediaID}`);

                if ( response ) {
                    try {
                        this.isHighlight = await this.checkForHighlight(); 
                    } catch (err) {
                        console.log(err);
                    }
                }
            } catch (err) {
                console.log(err);
            }                       
        },
        async checkForHighlight() {
            var isTrue;

            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/checkForHighlight?mediaID=${this.movie.tmdbID}`);

                if ( response.data.length > 0 ) {
                    isTrue = 1;
                } else {
                    isTrue = null;
                }
            } catch (err) {
                console.log(err);
            }

            return isTrue;
        },
        async returnCollectionMovies(collectionID) {
            if ( collectionID !== null ) {
                try {
                    const response = await this.getCollectionMovies(collectionID);
                    var checkedCollection = await this.checkIfMediaIsInDB(response);
                    this.collection = checkedCollection;
                } catch (err) {
                    console.log(err);
                }
            } else {
                this.collection = [];
            }   
        },
        async returnSimilarMovies(movieID) {
            function shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            }

            try {
                const response = await this.getSimilarMovies(movieID);
                if (!response || !response.results) {
                    console.error('Ungültige Antwort von API:', response);
                    return;
                }

                var newCheckedArray = await this.checkIfMediaIsInDB(response.results);
                if (!newCheckedArray || newCheckedArray.length === 0) {
                    console.error('Leeres oder ungültiges Array nach Überprüfung:', newCheckedArray);
                    this.similarMovies = null;
                } else {
                    // Mische das Array
                    const shuffledArray = shuffleArray(newCheckedArray);
                    if (!shuffledArray || shuffledArray.length === 0) {
                        this.similarMovies = null;
                    }

                    // Slice
                    this.similarMovies = shuffledArray.slice(0, 12);
                }


            } catch (err) {
                console.log(err);
            }
        },
        async editMovie() {
            var query = '';
            var data = [];

            if (this.movie.tagline !== '') {
                query = `UPDATE media SET title = ?, tagline = ?, overview = ?, trailer = ? WHERE tmdbID = ?`;
                data = [
                    this.movie.title,
                    this.movie.tagline,
                    this.movie.overview,
                    this.movie.trailer,
                    this.movie.tmdbID  // tmdbID hinzufügen, um das WHERE-Kriterium zu erfüllen
                ];
            } else {
                query = `UPDATE media SET title = ?, tagline = ?, overview = ?, trailer = ? WHERE tmdbID = ?`;
                data = [
                    this.movie.title,
                    '',
                    this.movie.overview,
                    this.movie.trailer,
                    this.movie.tmdbID  // tmdbID hinzufügen, um das WHERE-Kriterium zu erfüllen
                ];
            }

            try {
                await axios.post(`${this.$mainURL}:3000/api/db/postQuery`, { query, data });
            } catch(err) {
                console.log(err);
            }

            Fancybox.close();
        },
        async saveData(data) {
            document.getElementById('loader').classList.remove('hidden');
            
            const movie = await this.searchMovieByID(data.id);
            const genres = movie.genres.map(genre => genre.id);

            let date = movie.release_date;
            let parsedDate = '';

            if ( date != '' ) {
                parsedDate = new Date(date);
 
                
            } else {
                parsedDate = new Date();
            }

            let day = parsedDate.getDate();
            let month = parsedDate.getMonth() + 1;
            let year = parsedDate.getFullYear();
            let formattedDate = `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;
            var collection = null;
            var trailer = null;

            if ( movie.belongs_to_collection != null & movie.belongs_to_collection != 'null' & movie.belongs_to_collection != false ) {
                collection = movie.belongs_to_collection.id;
            } else {
                collection = null;
            }
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
                created: new Date()
            }

            try {
                await this.sendMedia(media);
            } catch (err) {
                console.log(err);
            }
            
            this.returnCollectionMovies(this.movie.collection);
            this.returnSimilarMovies(this.$route.params.id).then(() => {
                document.getElementById('loader').classList.add('hidden');
            });
        },
        async sendMedia(media) {
            axios.post(`${this.$mainURL}:3000/api/db/movie?mediaID=${media.tmdbID}&dataGenres=${media.genres}`, { media: media });
        },
        async selectMedia(media) {
            this.$route.params.media = media;
        }
    },
    mounted() {
        const movieID = this.$route.params.id;

        this.outPutMovie(movieID).then(async(movie) => {
            // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
            this.movie = movie[0];
            const genres = JSON.parse(this.movie.genres);
            const collection = this.movie.collection;
            
            await this.getGenre(genres);
            await this.returnCollectionMovies(collection);
            await this.returnSimilarMovies(movieID);

            this.isHighlight = await this.checkForHighlight();
            this.allPosters = await this.getAllPosters(movieID);
            this.allBackdrops = await this.getAllBackdrops(movieID);
        });
    }
        
};
</script>