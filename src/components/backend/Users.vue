<template>
    <div class="innerWrap">
        <div class="col12 marg-top-xl">
            <div class="col12">
                <h1>{{ langSnippet('users') }}</h1>
            </div>

            <div class="col12 text-right">
                <button data-src="#add-user" class="btn btn-small btn-success icon-left icon-add-user" data-fancybox>{{ langSnippet('add_user') }}</button>
            </div>

            <table v-if="users">
                <thead>
                    <th class="desktop-only">{{ langSnippet('user_img') }}</th>
                    <th>{{ langSnippet('username') }}</th>
                    <th class="desktop-only">{{ langSnippet('role') }}</th>
                    <th>{{ langSnippet('edit') }}</th>
                    <th>{{ langSnippet('password') }}</th>
                    <th>{{ langSnippet('delete') }}</th>
                </thead>
                <tbody>
                    <tr v-for="(user, index) in users" :key="index">
                        <td class="desktop-only"><figure class="square"><img data-img="" loading="lazy" alt=""></figure></td>
                        <td>{{ user.username }}</td>

                        <td class="desktop-only" v-if="user.role === 'superadmin'">Super Admin</td>
                        <td class="desktop-only" v-else-if="user.role === 'admin'">Admin</td>
                        <td class="desktop-only" v-else>User</td>

                        <td v-if="user.role === 'superadmin' && role === 'superadmin'">
                            <button data-src="#edit-user" @click="selectUser(user.id, user.username, user.role)" :title="langSnippet('edit')" class="btn btn-small btn-warning icon-only icon-pen marg-no" data-fancybox></button>
                        </td>
                        <td v-else-if="user.role === 'admin' && role !== 'user' || user.role === 'user' && role !== 'user'">
                            <button data-src="#edit-user" @click="selectUser(user.id, user.username, user.role)" :title="langSnippet('edit')" class="btn btn-small btn-warning icon-only icon-pen marg-no" data-fancybox></button>
                        </td>
                        <td v-else></td>

                        <td v-if="user.role === 'superadmin' && role === 'superadmin'">
                            <button data-src="#change-password" @click="selectUser(user.id, user.username, user.role)" :title="langSnippet('change_password')" class="btn btn-small btn-warning icon-only icon-key marg-no" data-fancybox></button>
                        </td>
                        <td v-else-if="user.role === 'admin' && role !== 'user' || user.role === 'user' && role !== 'user'">
                            <button data-src="#change-password" @click="selectUser(user.id, user.username, user.role)" :title="langSnippet('change_password')" class="btn btn-small btn-warning icon-only icon-key marg-no" data-fancybox></button>
                        </td>
                        <td v-else></td>

                        <td v-if="user.role !== 'superadmin'">
                            <button data-src="#delete-user" @click="selectUser(user.id, user.username, user.role)" :title="langSnippet('delete')" class="btn btn-small btn-alert icon-only icon-trash marg-no" data-fancybox></button>
                        </td>
                        <td v-else></td>
                    </tr>
                </tbody>
            </table>

            <!-- Add user -->
            <div id="add-user" style="display:none;">
                <p>{{ langSnippet('add_user') }}</p>
                <form @submit.prevent="addUser">
                    <p>
                        <label for="newUsername" >{{ langSnippet('username') }}
                        <input v-model="newUser.name" type="text" id="newUsername" name="newUsername" :placeholder="langSnippet('username')" required></label>
                    </p>
                    <p>
                        <label for="newUserrole" class="checkbox-label">{{ langSnippet('admin') }}
                        <input v-model="newUser.role" type="checkbox" id="newUserrole" name="newUserrole"></label>
                    </p>
                    <p>
                        <label for="newUserpassword">{{ langSnippet('password') }}
                        <input v-model="newUser.password" type="password" id="newUserpassword" name="newUserpassword" :placeholder="langSnippet('password')" required></label>
                    </p>
                    <p class="text-right">
                        <button class="btn btn-small btn-success icon-left icon-save" :title="langSnippet('save')" type="submit" name="register">{{ langSnippet('save') }}</button>
                    </p>
                </form>
            </div>
            <!-- Edit user -->
            <div id="edit-user" style="display:none;">
                <p v-html="langSnippet('edit_user', selectedUser.username)"></p>
                <form @submit.prevent="editUser(selectedUser.id, selectedUser.username, selectedUser.role)">
                    <p>
                        <label for="username" >{{ langSnippet('username') }}
                        <input v-model="selectedUser.username" type="text" id="username" name="username" :placeholder="langSnippet('username')" required></label>
                    </p>
                    <p>
                        <label for="role" class="checkbox-label">{{ langSnippet('admin') }}
                        <input v-model="selectedUser.role" type="checkbox" id="role" name="role" ></label>
                    </p>
                    <p class="text-right">
                        <button class="btn btn-small btn-success icon-left icon-save" :title="langSnippet('save')" type="submit" name="save">{{ langSnippet('save') }}</button>
                    </p>
                </form>
            </div>
            <!-- Change password of user -->
            <div id="change-password" style="display:none;">
                <p v-html="langSnippet('edit_user')"></p>
                <form @submit.prevent="changeUserPassword(selectedUser)">
                    <p>
                        <label for="new-password">{{ langSnippet('password') }}
                        <input v-model="newPassword" type="password" id="new-password" name="new-password" :placeholder="langSnippet('password')" required></label>
                    </p>
                    <p>
                        <label for="new-password-check">{{ langSnippet('password') }}
                        <input v-model="newPasswordCheck" type="password" id="new-password-check" name="new-password-check" :placeholder="langSnippet('password')" required></label>
                    </p>
                    <p class="text-right marg-no">
                        <button type="submit" class="btn btn-small btn-success icon-left icon-save" :title="langSnippet('save')">{{ langSnippet('save') }}</button>
                    </p>
                </form>
            </div>
            <!-- Delete user -->
            <div id="delete-user" style="display:none;">
                <p v-html="langSnippet('delete_user', selectedUser.username)"></p>
                <p class="text-right marg-no">
                    <button type="submit" @click="deleteUser(selectedUser.id)" class="btn btn-small btn-alert icon-left icon-trash" :title="langSnippet('delete')">{{ langSnippet('delete') }}</button>
                </p>
            </div>
        </div>
    </div>    
</template>

<script>
import axios from 'axios';
import tmdbAPI from '../mixins/tmdbAPI.vue';
import langSnippet from '../mixins/language.vue';
import mainFunctions from '../mixins/functions.vue';
import { Fancybox } from "@fancyapps/ui";

export default {
    name: 'BackendUsers',
    mixins: [tmdbAPI,langSnippet, mainFunctions],
    data() {
        return {
            users: null,
            username: '',
            role: 'user',
            isLoggedIn: null,
            newUser: {
                name: null,
                password: null,
                role: 'user'
            },
            selectedUser: {
                id: null,
                username: null,
                role: true,
            },
            newPassword: null,
            newPasswordCheck: null
        };
    },
    methods: {
        async getUsers() {
            try {
                var response = await axios.get(`${this.$mainURL}:3000/api/db/getAllUsers`);
                return response.data; // Geben Sie die Daten aus der Antwort zurück, nicht die gesamte Antwort
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }
        },
        async addUser() {            
            try {
                await axios.post(`${this.$mainURL}:3000/api/db/addUser?username=${this.newUser.name}&password=${this.newUser.password}&role=${this.newUser.role}`)
                .then(() => {
                    this.newUser.name = null;
                    this.newUser.password = null;
                    this.newUser.role = null;

                    Fancybox.close();

                    this.getUsers().then(users => {
                        this.users = users;
                    });
                });
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }
        },
        selectUser(userID, username, role) {
            this.selectedUser.id = userID;
            this.selectedUser.username = username;

            if ( role === 'superadmin' || role === 'admin') {
                this.selectedUser.role = true;
            } else {
                this.selectedUser.role = false;
            }
        },
        async editUser(userID, username, role) {
            if ( this.userID !== null && this.username !== '' ) {
                try {
                    await axios.post(`${this.$mainURL}:3000/api/db/editUser?userID=${userID}&username=${username}&role=${role}`)
                    .then(() => {
                        this.selectedUser.id = null;
                        this.selectedUser.username = null;
                        this.selectedUser.role = null;

                        Fancybox.close();

                        this.getUsers().then(users => {
                            this.users = users;
                        });
                    });
                } catch (error) {
                    console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                    return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
                }
            } else {
                alert('Password empty');
            }
        },
        async changeUserPassword(userID) {
            if ( this.newPassword !== '' && this.newPasswordCheck !== '' ) {
                if ( this.newPassword === this.newPasswordCheck && this.selectedUser.id !== null ) {
                    try {
                        await axios.post(`${this.$mainURL}:3000/api/db/changeUserPassword?userID=${userID}&password=${this.newPassword}`)
                        .then(() => {
                            this.selectedUser.id = null;
                            this.selectedUser.username = null;
                            this.selectedUser.role = null;

                            this.newPassword = null;
                            this.newPasswordCheck = null;

                            Fancybox.close();
                        });
                    } catch (error) {
                        console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                        return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
                    }
                } else {
                    this.newPassword = null;
                    this.newPasswordCheck = null;
                    alert('Password wrong');
                }
            } else {
                alert('Password empty');
            }
        },
        async deleteUser(userID) {
            try {
                await axios.post(`${this.$mainURL}:3000/api/db/deleteUser?userID=${userID}`)
                .then(() => {
                    this.selectedUser.id = null;
                    this.selectedUser.username = null;
                    this.selectedUser.role = null;

                    Fancybox.close();

                    this.getUsers().then(users => {
                        this.users = users;
                    });
                });
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }
        },
        async saveData(e) {
            const saveButton = e.target;
            this.disableButton(saveButton);
            const { title, apikey, language, edit } = this;

            var validKey = await this.checkApiKey(apikey);

            if (validKey) {
                this.keyError = null;

                const fields = [
                    'setting_option'
                ]

                const settingsData = [
                    {site_title: `"${title}"`},
                    {api_key: `"${apikey}"`},
                    {api_lang: `"${language}"`},
                    {enable_edit_btn: `"${edit}"`},
                ]

                for ( const data of settingsData ) {
                    try {
                        const [key, value ] = Object.entries(data)[0];
                        await axios.post(`${this.$mainURL}:3000/api/db/saveSettings?fields=${fields}&whereClause=setting_name="${key}"`, { [key]: value });
                    } catch (err) {
                        console.log(err);
                    }
                }
            } else {
                this.keyError = "API Key is not valid!";
            }

            this.enableButton(saveButton);
        },
        async fetchSessionStatus() {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/session`, { withCredentials: true });
                if ( response.data.user ) {
                    this.isLoggedIn = response.data.user.isLoggedIn;
                    this.username = response.data.user.name;
                    this.role = response.data.user.role;
                }               
            } catch (error) {
                console.error('Fehler beim Abrufen des Session-Status:', error);
            }
        },
    },
    mounted() {
        this.fetchSessionStatus()
        .then(() => {
            this.getUsers().then(users => {
                this.users = users;
            });
        });        
    }
};
</script>

<style>
#app {

}
</style>
