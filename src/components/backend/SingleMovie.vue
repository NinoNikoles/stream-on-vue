<template>
    <div id="loader" class="hidden">
        <div class="content-wrap">
            <i></i>
            <span></span>
        </div>
    </div>

    <div v-if="movie" class="pad-top-xl pad-bottom-l">
        <div class="innerWrap">
            <div class="col7">
                <div v-if="isHighlight===null" class="col12">
                    <div class="col9"><h1>{{ movie.title }}</h1></div>
                    <div class="col3"><button @click="addHighlight(movie.tmdbID)" class="btn btn-white btn-small icon-left icon-add" name="addHighlight">{{ langSnippet('add_highlight') }}</button></div>
                </div>
                <div v-else class="col12"><h1>{{ movie.title }}</h1></div>
                <div v-if="movie.tagline" class="col12">{{ movie.tagline }}</div>
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
            </div>
  
            <div class="col3 marg-left-col1">
                <div class="col12" v-if="movie.file_path">
                    <figure class="widescreen">
                        <video :src="this.$mainURL+movie.file_path" controls></video>
                    </figure>
                </div>
                <div class="col12">
                    <button href="#media-browser" data-fancybox @click="selectMedia(movie)" class="btn btn-success btn-small icon-left icon-media col12" name="addHighlight">{{ langSnippet('select_file') }}</button>
                </div>

                <div class="row">
                    <div class="col6 column">
                        <a href="#movie-poster" data-fancybox data-src="#movie-poster">
                            <figure class="poster">
                                <img :data-img="$loadImg(movie.poster)" loading="lazy" alt="" id="mainPoster">
                            </figure>
                        </a>
                        <div id="movie-poster" style="display:none;">
                            <p>{{ langSnippet('select_new_poster') }}:</p>
                            <div v-if="allPosters" class="row">
                                <div v-for="(poster, index) in allPosters" :key="index" class="col-6 col-3-medium column marg-bottom-base">
                                    <div class="poster-select">
                                        <input type="radio" :id="`poster-${index}`" name="poster" :value="`${poster.file_path}`">
                                        <figure class="poster">
                                            <img :data-img="$loadImg(poster.file_path)" loading="lazy" alt="">
                                        </figure>
                                    </div>
                                </div>
                            </div>
                            <p class="text-right">
                                <button @click="savePoster()" class="btn btn-success" name="change-poster">{{ langSnippet('save') }}</button>
                            </p>
                        </div>
                    </div>

                    <div class="col6 column">
                        <a href="#movie-backdrop" data-fancybox data-src="#movie-backdrop">
                            <figure class="widescreen">
                                <img :data-img="$loadImg(movie.backdrop)" loading="lazy" alt="" id="mainBackdrop">
                            </figure>
                        </a>
                        <div id="movie-backdrop" style="display:none;">
                            <p>{{ langSnippet('select_new_backdrop') }}:</p>
                            <div v-if="allBackdrops" class="row">
                                <div v-for="(backdrop, index) in allBackdrops" :key="index" class="col-6 col-3-medium column marg-bottom-base">
                                    <div class="poster-select">
                                        <input type="radio" :id="`backdrop-${index}`" name="backdrop" :value="`${backdrop.file_path}`">
                                        <figure class="original">
                                            <img :data-img="$loadImg(backdrop.file_path)" loading="lazy" alt="">
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
                            <figure class="media-card poster">
                                <img :src="$loadImg(kMovie.poster)" loading="lazy" :alt="`${kMovie.title}`">
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
                            <figure class="media-card poster">
                                <img :src="$loadImg(sMovie.poster)" loading="lazy" :alt="`${sMovie.title}`">
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

        <div id="media-browser" style="display: none;">
            <div class="row">
                <div class="innerWrap"><div class="col12"><p class="h4">{{langSnippet('select_a_video_file')}}:</p></div></div>
                <media-browser-component :selectedMedia="movie.file_path"></media-browser-component>
            </div>
        </div>
    </div>    
</template>

<script>
import axios from 'axios';
import tmdbAPI from '../mixins/tmdbAPI.vue';
import langSnippet from '../mixins/language.vue';
import functions from '../mixins/functions.vue';
import Mediabrowser from '../Mediabrowser.vue';
import { Fancybox } from '@fancyapps/ui';

export default {
    name: 'BackendMovie',
    mixins: [tmdbAPI, langSnippet, functions],
    components: {
        'media-browser-component': Mediabrowser,
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
        async getAllImages(mediaID) {
            try {
                var posters = await this.getPosters('movie', mediaID);
                var backdrops = await this.getBackdrops('movie', mediaID);

                this.allPosters = posters;
                this.allBackdrops = backdrops;
            } catch(err) {
                console.log(err);
                this.allPosters = '';
                this.allBackdrops = '';
            }
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

            if ( movie.belongs_to_collection != null & movie.belongs_to_collection != 'null' & movie.belongs_to_collection != false ) {
                collection = movie.belongs_to_collection.id;
            } else {
                collection = null;
            }
            
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
            
            await this.getAllImages(movieID);
            await this.getGenre(genres);
            await this.returnCollectionMovies(collection);
            await this.returnSimilarMovies(movieID);
            await this.checkForHighlight().then(isTrue => {
                this.isHighlight = isTrue;
            });
        });
    }
        
};
</script>

<style>
#app {

}
</style>
