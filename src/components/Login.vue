<template>
    <div class="innerWrap">
        <div class="col6 marg-left-col3">
            <form @submit.prevent="login">
                <h2>{{ langSnippet('login')}}</h2>
                <p>
                    <input type="text" v-model="username" :placeholder="langSnippet('username')">
                </p>
                <p>
                    <input type="password" v-model="password" :placeholder="langSnippet('password')">
                </p>
                <p class="text-right">
                    <button type="submit" class="btn btn-small btn-success">{{ langSnippet('login')}}</button>
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
                .then(async(response) => {
                    console.log(response.data.message);
                    window.location.href = '/';               
                })
                .catch((error) => {
                    // Fehler bei der Anmeldung
                    console.error('Login failed', error);
                });
            } catch(err) {
                console.log(err);
            }            
        }
    },

};
</script>
  