<template>
    <div class="innerWrap pad-top-xl">
        <div class="col12">
            <div class="col12">
                <h1>{{ langSnippet('settings') }}</h1>
            </div>

            <div class="col12 marg-bottom-m">
                <div class="row">
                    <div class="col5 column marg-right-col7">
                        <p>
                            <label for="site_title">
                                <input type="text" v-model="title" id="site_title" :placeholder="langSnippet('page_title')" required>
                            </label>
                        </p>
                    </div>

                    <div class="col5 column">
                        <p>
                            <label for="apikey">
                                <input type="text" v-model="apikey" id="apikey" :placeholder="langSnippet('api_key')" required>
                            </label>
                        </p>
                        <p v-if="keyError"><span class="text-alert italic">{{ keyError }}</span></p>
                        <p>
                            <span class="smaller" v-html="langSnippet('apikey_info')"></span>
                        </p>                        
                    </div>

                    <div class="col5 column marg-right-col7">
                        <p>
                            <label for="language" data-form="select">
                                <select v-model="language" id="language">
                                    <option value="" disabled hidden>- {{ langSnippet('language') }} -</option>
                                    <option value="de-DE">Deutsch</option>
                                    <option value="en-US" selected>English</option>
                                </select>
                            </label>
                        </p>
                    </div>

                    <div class="col12 column">
                        <p>
                            <label for="enable-edit">{{ langSnippet('enable_edit_btn') }}*
                                <input type="checkbox" id="enable-edit" v-model="edit">
                            </label>
                        </p>
                    </div>

                    <div class="col12 column text-right marg-top-base">
                        <button @click="saveData" class="btn btn-small btn-success icon-left icon-save loading">{{ langSnippet('save') }}</button>
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
import mainFunctions from '../mixins/functions.vue';

export default {
    name: 'BackendMovie',
    mixins: [tmdbAPI,langSnippet, mainFunctions],
    data() {
        return {
            settings: null,
            title: null,
            apikey: null,
            language: "en-US",
            edit: null,
            keyError: null,
        };
    },
    methods: {
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

                this.callout('success', this.langSnippet('save'));
            } else {
                this.keyError = "API Key is not valid!";
                this.callout('alert', this.langSnippet(this.keyError));
            }
            
            this.enableButton(saveButton);
        },
        async getSettings() {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/getSettings`);
                return response.data; // Geben Sie die Daten aus der Antwort zurück, nicht die gesamte Antwort
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }
        }
    },
    mounted() {
        this.getSettings().then(settings => {
            // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
            this.apikey = settings[1].setting_option;
            this.language = settings[2].setting_option;
            this.title = settings[3].setting_option;
            this.edit = settings[4].setting_option;
        });
    }
};
</script>

<style>
#app {

}
</style>
