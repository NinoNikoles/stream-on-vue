<template>
    <div id="loader" class="">
        <div class="content-wrap">
            <i></i>
            <span></span>
        </div>
    </div>
</template>

<script>
import functions from './mixins/functions.vue';

export default {
    name: 'AppIndex',
    mixins: [functions],
    async mounted() {
        this.logout_function();
    }
};
</script>