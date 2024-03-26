<template>        
    <div class="media-card rounded" v-if="mediaContent">
        <div class="media-card-wrapper">
            <template v-if="mediaContent.file_path === null">
                <figure class="widescreen desktop-only disabled">
                    <img :src="$loadImg(mediaContent.backdrop)" :alt="`${mediaContent.title}`">
                </figure>
                <figure class="poster mobile-only disabled">
                    <img :src="$loadImg(mediaContent.poster)" :alt="`${mediaContent.title}`">
                </figure>
            </template>

            <template v-else>
                <figure class="widescreen desktop-only">
                    <img :src="$loadImg(mediaContent.backdrop)" :alt="`${mediaContent.title}`">
                </figure>
                <figure class="poster mobile-only">
                    <img :src="$loadImg(mediaContent.poster)" :alt="`${mediaContent.title}`">
                </figure>
            </template>
            
            <div class="link-wrapper">
                <progress v-if="getWatchedTime(mediaContent.watched_seconds, mediaContent.total_length)" max="100" :value="getWatchedTime(mediaContent.watched_seconds, mediaContent.total_length)"></progress>
                <router-link v-if="mediaContent.file_path && mediaContent.media_type === 'movie'" :to="`/watch?id=${mediaContent.tmdbID}`" :title="`${mediaContent.title}`" class="play-trigger"></router-link>
                <router-link v-else-if="mediaContent.media_type === 'show' && mediaContent['episodes'][0].file_path" :to="`/watch?id=${mediaContent['episodes'][0].tmdbID}`" :title="`${mediaContent['episodes'][0].title}`" class="play-trigger"></router-link>
                
                <button @click="popUpTrigger(mediaContent, mediaIndex, $event)" :title="langSnippet('more_informations')" class="info-trigger trigger-normal"></button>
                <router-link v-if="$pageSettings[4].setting_option === 'true' && ($user.role ==='superadmin' || $user.role === 'admin')" :to="`/backend/${mediaContent.media_type}/${mediaContent.tmdbID}`" :title="langSnippet('edit')" class="edit-trigger"></router-link>
            </div>
        </div>
        <!-- <div v-if="mediaWatchList" class="watched-bar">
            <p class="smaller marg-bottom-xxs">{{ mediaContent.title }}</p>
        </div> -->
    </div>
</template>

<script>
//import axios from 'axios';
import functions from '../mixins/functions.vue';
import langSnippet from '../mixins/language.vue';

export default {
    name: 'MediaCard',
    mixins: [functions, langSnippet],
    props: ['mediaContent', 'mediaIndex', 'mediaWatchList', 'onPopUpTrigger'],
    methods: {
        async popUpTrigger(media, index, event) {
            var status =  await this.checkWatchlist(media.tmdbID);
            media.watchlist_status = status;
            this.onPopUpTrigger(media, index, event);
            this.openPopUp(event); 
        },
        getWatchedTime(watchedTime, totalDuration) {
            const currTime = parseFloat(watchedTime);
            const totalLength = parseFloat(totalDuration);
            const watchedInPercent = (currTime/totalLength)*100;
            return watchedInPercent;
        }
    },
}
</script>