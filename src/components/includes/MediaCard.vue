<template>        
    <div class="media-card rounded" v-if="media">
        <div class="media-card-wrapper">
            <!-- <template v-if="media.file_path === null">
                <figure class="widescreen desktop-only disabled">
                    <img :src="$loadImg(media.backdrop)" :alt="`${media.title}`">
                </figure>
                <figure class="poster mobile-only disabled">
                    <img :src="$loadImg(media.poster)" :alt="`${media.title}`">
                </figure>
            </template> -->

            <!-- <template> -->
                <!-- <figure class="widescreen desktop-only">
                    <img :src="$loadImg(media.backdrop)" :alt="`${media.title}`">
                </figure> -->
                <figure class="poster">
                    <img :src="$loadImg(media.poster)" :alt="`${media.title}`">
                </figure>
            <!-- </template> -->
            
            <div class="link-wrapper">
                <progress v-if="getWatchedTime(media.watched_seconds, media.total_length)" max="100" :value="getWatchedTime(media.watched_seconds, media.total_length)"></progress>
                <router-link v-if="media.file_path && media.media_type === 'movie'" :to="`/w?id=${media.tmdbID}`" :title="`${media.title}`" class="play-trigger"></router-link>
                <router-link v-else-if="media.media_type === 'show' && media.episode_id" :to="`/w?id=${media.episode_id}`" :title="`${media.title}`" class="play-trigger"></router-link>
                <router-link v-else-if="media.media_type === 'show' && media.episodes[0].file_path" :to="`/w?id=${media.episodes[0].tmdbID}`" :title="`${media.title}`" class="play-trigger"></router-link>
                
                <button @click="openPopUp(media)" :title="langSnippet('more_informations')" class="info-trigger trigger-normal"></button>
                <router-link v-if="$globalState.pageSettings[4].setting_option === 'true' && ($globalState.user.role ==='superadmin' || $globalState.user.role === 'admin')" :to="`/b/${media.media_type}/${media.tmdbID}`" :title="langSnippet('edit')" class="edit-trigger"></router-link>
            </div>
        </div>
        <div v-if="mediaWatchList" class="watched-bar">
            <p class="smaller marg-bottom-xxs">{{ media.title }}</p>
        </div>
    </div>

</template>

<script>
//import axios from 'axios';
import functions from '../mixins/functions.vue';
import langSnippet from '../mixins/language.vue';

export default {
    name: 'MediaCard',
    mixins: [functions, langSnippet],
    props: ['media', 'id', 'mediaWatchList'],
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