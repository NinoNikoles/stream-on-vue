<template>
    <div class="innerWrap" id="loginWrap">
        <div class="col4 marg-left-col4 loginCol">
            <form @submit.prevent="login">
                <h2>{{ langSnippet('login')}}</h2>
                <p>
                    <input type="text" v-model="username" :placeholder="langSnippet('username')">
                </p>
                <p>
                    <input type="password" v-model="password" :placeholder="langSnippet('password')">
                </p>
                <p class="text-right marg-no">
                    <button type="submit" class="btn btn-small btn-success marg-no">{{ langSnippet('login')}}</button>
                </p>
            </form>
        </div>
    </div>
</template>
  
<script>
import axios from 'axios';
import langSnippet from './mixins/language.vue';
  
export default {
    name: 'AppLogin',
    mixins: [langSnippet],
    data() {
        return {
            username: '',
            password: ''
        };
    },
    methods: {
        async login() {
            // Benutzeranmeldeinformationen
            var username = this.username;
            var password = this.password;
            
            try {
                await axios.post(`${this.$mainURL}:3000/api/db/login`, { username: username, password: password}, { withCredentials: true })
                .then(async() => {
                    window.location.href = this.$route.query.redirect;               
                })
                .catch((error) => {
                    // Fehler bei der Anmeldung
                    console.error('Login failed', error);
                });
            } catch(err) {
                console.log(err);
            }            
        }
    }
};
</script>
  