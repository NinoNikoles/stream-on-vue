<template>
    <div class="col12 display-flex backend-wrap">

        <backend-menu></backend-menu>

        <div class="col12 backend-content pad-top-xl pad-bottom-l">
            <div class="innerWrap">
                <div class="col12">
                    <div class="col6">
                        <h1>{{ langSnippet('users') }}</h1>
                    </div>

                    <div class="col6 text-right">
                        <p>
                            <button data-src="#add-user" class="btn btn-success btn-small icon-left icon-add-user" data-fancybox>{{ langSnippet('add_user') }}</button>
                        </p>
                    </div>

                    <table v-if="users" class="rounded marg-no">
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
                                <td class="desktop-only">
                                    <figure class="square rounded" style="width: 60px;">
                                        <img v-if="user.img === '-1'" src="/media/avatar.webp" loading="lazy" alt="">
                                        <img v-else :src="user.img" loading="lazy" alt="">
                                    </figure>
                                </td>
                                <td>{{ user.username }}</td>

                                <td class="desktop-only" v-if="user.role === 'superadmin'">Super Admin</td>
                                <td class="desktop-only" v-else-if="user.role === 'admin'">Admin</td>
                                <td class="desktop-only" v-else>User</td>

                                <td v-if="user.role === 'superadmin' && role === 'superadmin'">
                                    <button data-src="#edit-user" @click="selectUser(user)" :title="langSnippet('edit')" class="btn btn-warning icon-only icon-pen marg-no" data-fancybox></button>
                                </td>
                                <td v-else-if="user.role === 'admin' && role !== 'user' || user.role === 'user' && role !== 'user'">
                                    <button data-src="#edit-user" @click="selectUser(user)" :title="langSnippet('edit')" class="btn btn-warning icon-only icon-pen marg-no" data-fancybox></button>
                                </td>
                                <td v-else></td>

                                <td v-if="user.role === 'superadmin' && role === 'superadmin'">
                                    <button data-src="#change-password" @click="selectUser(user)" :title="langSnippet('change_password')" class="btn btn-warning icon-only icon-key marg-no" data-fancybox></button>
                                </td>
                                <td v-else-if="user.role === 'admin' && role !== 'user' || user.role === 'user' && role !== 'user'">
                                    <button data-src="#change-password" @click="selectUser(user)" :title="langSnippet('change_password')" class="btn btn-warning icon-only icon-key marg-no" data-fancybox></button>
                                </td>
                                <td v-else></td>

                                <td v-if="user.role !== 'superadmin' && user.username !== $globalState.user.username">
                                    <button data-src="#delete-user" @click="selectUser(user)" :title="langSnippet('delete')" class="btn btn-alert icon-only icon-trash marg-no" data-fancybox></button>
                                </td>
                                <td v-else></td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Add user -->
                    <div id="add-user" style="display:none;">
                        <p>{{ langSnippet('add_user') }}</p>
                        <form onsubmit="return false;" >
                            <span v-if="newUserError" :class="`box-callout ${newUserError[1]}`">{{ newUserError[0] }}</span>
                            <p>
                                <span class="input-wrap">
                                    <label for="newUsername">{{ langSnippet('username') }}</label>
                                    <input v-model="newUser.name" type="text" id="newUsername" autocomplete="username" name="newUsername" required>
                                </span>
                            </p>
                            <p>
                                <span class="input-wrap">
                                    <label for="newUserpassword">{{ langSnippet('password') }}</label>
                                    <input v-model="newUser.password" type="password" id="newUserpassword" autocomplete="new-password" name="newUserpassword" required>
                                </span>                        
                            </p>
                            <p>
                                <label for="newUserrole" class="checkbox-label">{{ langSnippet('admin') }}
                                <input v-model="newUser.role" type="checkbox" id="newUserrole" name="newUserrole"></label>
                            </p>
                            <p class="text-right">
                                <button @click="addUser($event)" class="btn btn-success icon-left icon-save" :title="langSnippet('save')" type="submit" name="register">{{ langSnippet('save') }}</button>
                            </p>
                        </form>
                    </div>

                    <!-- Edit user -->
                    <div id="edit-user" style="display:none;">
                        <p v-html="langSnippet('edit_user', selectedUser.name)"></p>
                        <form onsubmit="return false;">
                            <span v-if="editUserError" :class="`box-callout ${editUserError[1]}`">{{ editUserError[0] }}</span>
                            <p>
                                <span class="input-wrap">
                                    <label for="username">{{ langSnippet('username') }}</label>
                                    <input v-model="selectedUser.name" type="text" id="username" autocomplete="username" name="username" required>
                                </span>
                            </p>
                            <p>
                                <label for="role" class="checkbox-label">{{ langSnippet('admin') }}
                                <input v-model="selectedUser.role" type="checkbox" id="role" name="role" ></label>
                            </p>
                            <p class="text-right">
                                <button @click="editUser(selectedUser)" class="btn btn-success icon-left icon-save" :title="langSnippet('save')" type="submit" name="save">{{ langSnippet('save') }}</button>
                            </p>
                        </form>
                    </div>
                    <!-- Change password of user -->
                    <div id="change-password" style="display:none;">
                        <p v-html="langSnippet('new_password')"></p>
                        <form onsubmit="return false;">
                            <span v-if="newPasswordError" :class="`box-callout ${newPasswordError[1]}`">{{ newPasswordError[0] }}</span>
                            <input v-model="selectedUser.name" type="text" name="username" autocomplete="username" :placeholder="langSnippet('username')" style="display:none; visibility: hidden;" disabled>
                            <p> 
                                <span class="input-wrap">
                                    <label for="new-password">{{ langSnippet('password') }}</label>
                                    <input v-model="newPassword" type="password" id="new-password" autocomplete="new-password" name="new-password" required>
                                </span>
                            </p>
                            <p>
                                <span class="input-wrap">
                                    <label for="new-password-check">{{ langSnippet('password_repeate') }}</label>
                                    <input v-model="newPasswordCheck" type="password" id="new-password-check" autocomplete="new-password" name="new-password-check" required>
                                </span>
                            </p>
                            <p class="text-right marg-no">
                                <button @click="changeUserPassword(selectedUser.id)" type="submit" class="btn btn-success icon-left icon-save" :title="langSnippet('save')">{{ langSnippet('save') }}</button>
                            </p>
                        </form>
                    </div>
                    <!-- Delete user -->
                    <div id="delete-user" style="display:none;">
                        <p v-html="langSnippet('delete_user', selectedUser.name)"></p>
                        <p class="text-right marg-no">
                            <button type="submit" @click="deleteUser(selectedUser.id)" class="btn btn-alert icon-left icon-trash" :title="langSnippet('delete')">{{ langSnippet('delete') }}</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import tmdbAPI from '../mixins/tmdbAPI.vue';
import langSnippet from '../mixins/language.vue';
import mainFunctions from '../functions.vue';
import { Fancybox } from "@fancyapps/ui";
import BackendMenu from './../includes/BackendMenu.vue';

export default {
    name: 'BackendUsers',
    mixins: [tmdbAPI,langSnippet, mainFunctions],
    components: {
        'backend-menu': BackendMenu,
    },
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
            newUserError: null,
            editUserError: null,
            newPasswordError: null,
            selectedUser: {
                id: null,
                name: null,
                role: true,
            },
            newPassword: null,
            newPasswordCheck: null
        };
    },
    methods: {
        async getUsers() {
            const response = await axios.get(`${this.$mainURL}:3000/api/db/getAllUsers`);
            return new Promise((resolve) => {
                resolve(response.data);
            });
        },
        selectUser(user) {
            this.selectedUser.id = user.id;
            this.selectedUser.name = user.username;

            if ( user.role === 'superadmin' || user.role === 'admin') {
                this.selectedUser.role = true;
            } else {
                this.selectedUser.role = false;
            }
        },
        async addUser() {
            this.newUserError = null;

            try {
                await axios.post(`${this.$mainURL}:3000/api/db/addUser?username=${this.newUser.name}&password=${this.newUser.password}&role=${this.newUser.role}`)

                this.newUser.name = null;
                this.newUser.password = null;
                this.newUser.role = null;

                Fancybox.close();
                this.callout('success', this.langSnippet('saved'));

                this.getUsers().then(users => {
                    this.users = users;
                });
            } catch (error) {
                console.log(error);
                if (error.response.status === 400) this.newUserError = [this.langSnippet('username_already_exists'), 'warning'];
                if (error.response.status === 500) this.newUserError = [this.langSnippet('an_error_occured'), 'alert'];
                return;
            }
        },
        async editUser(user) {
            this.editUserError = null;

            if ( user.id !== null && user.name !== '' ) {
                try {
                    var role = 'user';
                    if (user.role) role = 'admin';
                    if (this.$globalState.user.id === user.id) {
                        if (this.$globalState.user.role === 'superadmin') role = this.$globalState.user.role;

                        await this.postDB(`session`, {
                            username: user.name,
                            role: role
                        }, { withCredentials: true });
                    }

                    await axios.post(`${this.$mainURL}:3000/api/db/editUser?userID=${user.id}&username=${user.name}&role=${role}`);

                    this.$globalState.user.username = user.name;

                    this.callout('success', `${this.langSnippet('settings')} ${this.langSnippet('saved')}`);

                    this.selectedUser.id = null;
                    this.selectedUser.name = null;
                    this.selectedUser.role = null;

                    Fancybox.close();

                    this.getUsers().then(users => {
                        this.users = users;
                    });
                } catch (error) {
                    console.log(error);
                    this.editUserError = [this.langSnippet('an_error_occured'), 'alert'];
                    return;
                }
            }
        },
        async changeUserPassword(userID) {
            this.newPasswordError = null;

            if ( this.newPassword !== '' && this.newPasswordCheck !== '' ) {
                if ( this.newPassword === this.newPasswordCheck && this.selectedUser.id !== null ) {
                    try {
                        await axios.post(`${this.$mainURL}:3000/api/db/changeUserPassword?userID=${userID}&password=${this.newPassword}`)
                        
                        this.selectedUser.id = null;
                        this.selectedUser.name = null;
                        this.selectedUser.role = null;

                        this.newPassword = null;
                        this.newPasswordCheck = null;

                        Fancybox.close();
                        this.callout('success', `${this.langSnippet('password')} ${this.langSnippet('saved')}`);

                    } catch (error) {
                        console.log('Fehler beim Überprüfen des Films in der Datenbank:', error);
                        this.newPasswordError = [this.langSnippet('an_error_occured'), 'alert'];
                        return;
                    }
                } else {
                    this.newPassword = null;
                    this.newPasswordCheck = null;
                    this.newPasswordError = [this.langSnippet('passwords_not_identical'), 'alert'];
                    return;
                }
            }
        },
        async deleteUser(userID) {
            try {
                await axios.post(`${this.$mainURL}:3000/api/db/deleteUser?userID=${userID}`)
                .then(() => {
                    this.callout('success', `${this.selectedUser.name} ${this.langSnippet('deleted')}`);
                    this.selectedUser.id = null;
                    this.selectedUser.name = null;
                    this.selectedUser.role = null;

                    Fancybox.close();

                    this.getUsers().then(users => {
                        this.users = users;
                    });
                });
            } catch (error) {
                console.log(error);
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
    async mounted() {
        await this.fetchSessionStatus();
        this.users = await this.getUsers();
    }
};
</script>