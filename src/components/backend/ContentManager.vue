<template>
    <div class="col12 display-flex backend-wrap">

        <backend-menu></backend-menu>

        <div class="col12 backend-content pad-top-xl pad-bottom-l">
            <div class="innerWrap">
                <div class="col12">
                    <h1>Content Manager</h1>
                </div>

                <div class="col12">
                    
                    <media-browser></media-browser>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
import tmdbAPI from '../mixins/tmdbAPI.vue';
import mainFunctions from '../functions.vue';
import BackendMenu from '../includes/BackendMenu.vue';
import ContentManager from '../includes/MediaBrowser.vue';

export default {
    name: 'ContentManager',
    mixins: [tmdbAPI, mainFunctions],
    components: {
        'backend-menu': BackendMenu,
        'media-browser': ContentManager,
    }
};
</script>