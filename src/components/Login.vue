<template>
    <div class="innerWrap" id="loginWrap">
        <div class="col4 marg-left-col4 loginCol rounded">
            <form @submit.prevent="login">
                <h2>{{ langSnippet('login')}}</h2>
                <p>
                    <span class="input-wrap">
                        <label for="username">{{ langSnippet('username') }}</label>
                        <input type="text" id="username" v-model="username" autocomplete="username">
                    </span>
                    <span class="text-alert pad-left-xs" v-if="error && error === 'user_not_found'">{{ langSnippet(error) }}</span>
                </p>
                <p>
                    <span class="input-wrap">
                        <label for="password">{{ langSnippet('password') }}</label>
                        <input type="password" id="password" v-model="password" autocomplete="current-password">
                    </span>
                    <span class="text-alert" v-if="error && error === 'invalid_password'">{{ langSnippet(error) }}</span>
                </p>
                <p class="text-right marg-no">
                    <button type="submit" class="btn btn-small btn-success marg-no">{{ langSnippet('login')}}</button>
                </p>
            </form>
        </div>
    </div>
</template>
  
<script>
import functions from './mixins/functions.vue';
import langSnippet from './mixins/language.vue';
  
export default {
    name: 'AppLogin',
    mixins: [functions, langSnippet],
    data() {
        return {
            username: '',
            password: '',
            error: null,
        };
    },
    methods: {
        async login() {
            // Benutzeranmeldeinformationen
            var username = this.username;
            var password = this.password;
            this.error = null;
            
            try {
                await this.postDB(`login`, { username: username, password: password}, { withCredentials: true })
                .then(async() => {
                    window.location.href = this.$route.query.redirect;               
                })
                .catch((error) => {
                    // Fehler bei der Anmeldung
                    this.error = error.response.data.message;
                });
            } catch(err) {
                console.log(err);
            }            
        }
    }
};
</script>
  