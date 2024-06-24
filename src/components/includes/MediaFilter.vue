<template>        
    <div class="grid-row pad-top-xxs">
        <div class="col6 grid-padding marg-bottom-xxs field-wrap">
            <p>
                <span class="input-wrap input-select">
                    <label for="genre-filter">{{ langSnippet('filter_by') }}</label>
                    <select id="genre-filter" v-if="genres" @change="filterByGenre($event)">
                        <option value="all">{{ langSnippet('all') }}</option>
                        <option v-for="(genre, index) in genres" :key="index" :value="`${genre.genre_id}`">{{ genre.genre_name }}</option>
                    </select>
                </span>
            </p>
        </div>
        <div class="col6 grid-padding marg-bottom-xxs field-wrap">
            <p>
                <span class="input-wrap input-select">
                    <label for="title-filter">{{ langSnippet('oder_filter') }}</label>
                    <select id="title-filter" @change="filterBySetting($event)">
                        <option value="[title,ASC]">A - Z</option>
                        <option value="[title,DESC]">Z - A</option>
                        <!-- <option value="releaseDate,DESC">Neuste - Älteste</option>
                        <option value="releaseDate,ASC">Älteste - Neuste</option> -->
                        <option value="[rating,DESC]">Bewertung: Höchste - Niedrigste</option>
                        <option value="[rating,ASC]">Bewertung: Niedrigste - Höchste</option>
                    </select>
                </span>
            </p>
        </div>
    </div>
</template>

<script>
//import axios from 'axios';
import functions from '../functions.vue';
import langSnippet from '../mixins/language.vue';

export default {
    name: 'MediaFilter',
    mixins: [functions, langSnippet],
    data() {
        return {
            genres: null,
            genreFilter: 'all',
            orderFilter: "title,ASC",
        };
    },
    async mounted() {
        this.genres = await this.getGenre();
    }
}
</script>