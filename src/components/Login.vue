<template>
    <div>
        <h2>Anmeldung</h2>
        <input v-model="username" placeholder="Benutzername">
        <input type="password" v-model="password" placeholder="Passwort">
        <button @click="login">Anmelden</button>
    </div>
  </template>
  
<script>
//import axios from 'axios';
  
export default {
    name: 'AppLogin',
    data() {
        return {
            username: '',
            password: '',
            loggedIn: false,
        };
    },
    methods: {
        
    }
};
</script>
  