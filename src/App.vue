<template>
    <header-component></header-component>

    <router-view></router-view>
</template>
  
<script>
import Header from './components/Header.vue';
import tmdbAPI from './components/api/tmdbAPI.vue';
import langSnippet from './components/api/language.vue';

export default {
    name: 'AppIndex',
    mixins: [tmdbAPI, langSnippet],
    components: {
        'header-component': Header,
    },
};
</script>