<template>
    <div class="innerWrap pad-top-xl pad-bottom-l">
        <div class="col12">
            <div class="col12 marg-bottom-xs">
                <h1>{{ langSnippet('settings') }}</h1>
            </div>

            <div class="col12">
                <form class="row" onsubmit="return false;">

                    <div class="col6 column">
                        <div class="col12 field-wrap">
                            <p>
                                <span class="input-wrap input-select">
                                    <label for="language" data-form="select">{{ langSnippet('language') }} (API)</label>
                                    <select v-model="language" id="language">
                                        <option value="de-DE">Deutsch</option>
                                        <option value="en-US">English</option>
                                    </select>
                                </span>
                            </p>
                            <hr>
                        </div>

                        <div class="col12 field-wrap">
                            <p>
                                <span class="input-wrap">
                                    <label for="site_title">{{ langSnippet('page_title') }}</label>
                                    <input type="text" v-model="title" id="site_title" required>
                                </span>
                                <span v-if="titleError" class="text-alert italic column marg-top-xxs">{{ titleError }}</span>
                            </p>
                            <hr>
                        </div>

                        <div class="col12 field-wrap">
                            <p>
                                <span class="input-wrap">
                                    <label for="apikey">{{ langSnippet('api_key') }}</label>
                                    <input type="text" v-model="apikey" id="apikey" required>
                                </span>
                                <span v-if="keyError" class="text-alert italic column marg-top-xxs">{{ keyError }}</span>
                            </p>
                        </div>

                        <div class="col12 field-wrap">
                            <p>
                                <span class="column smaller" v-html="langSnippet('apikey_info')"></span>
                            </p>
                            <hr class="mobile-only">
                        </div>
                    </div>

                    <div class="col5 column marg-left-col1">
                        <div class="col12 field-wrap">
                            <p>
                                <label for="enable-edit">{{ langSnippet('enable_edit_btn') }}
                                    <input type="checkbox" id="enable-edit" v-model="edit">
                                </label>
                            </p>
                            <hr>
                        </div>

                        <div class="col12 field-wrap">
                            <p>
                                <label for="design">{{ langSnippet('round_design') }}
                                    <input type="checkbox" id="design" v-model="design">
                                </label>
                            </p>
                        </div>

                        <div class="col12 text-right marg-top-base field-wrap">
                            <button type="submit" @click="saveData($event)" class="btn btn-small btn-success icon-left icon-save loading" :value="langSnippet('save')">{{ langSnippet('save') }}</button>
                        </div>
                    </div>
                    
                </form>
            </div>
        </div>
    </div>    
</template>

<script>
import tmdbAPI from './../mixins/tmdbAPI.vue';
import langSnippet from './../mixins/language.vue';
import functions from './../mixins/functions.vue';

export default {
    name: 'BackendMovie',
    mixins: [tmdbAPI,langSnippet, functions],
    data() {
        return {
            settings: null,
            title: this.$pageSettings[3].setting_option,
            apikey: this.$pageSettings[1].setting_option,
            language: this.$pageSettings[2].setting_option,
            edit: this.$pageSettings[4].setting_option,
            design: this.$pageSettings[5].setting_option,
            titleError: null,
            keyError: null,
        };
    },
    methods: {
        async saveData(e) {
            const saveButton = e.target;
            this.disableButton(saveButton);
            this.titleError = null;
            this.keyError = null;
            
            const { title, apikey, language, edit, design } = this;
            var validKey = await this.checkApiKey(apikey);

            if (!title) {
                this.titleError = "Darf nicht leer sein!";
                this.callout('alert', this.langSnippet(this.titleError));
            } else if (validKey) {
                this.keyError = null;

                const fields = [
                    'setting_option'
                ]

                const settingsData = [
                    {site_title: `'${title}'`},
                    {api_key: `'${apikey}'`},
                    {api_lang: `'${language}'`},
                    {enable_edit_btn: `'${edit}'`},
                    {design: `'${design}'`},
                ]

                settingsData.map(async (data) => {
                    const [key, value] = Object.entries(data)[0];
                    var response = await this.postDB(`saveSettings?fields=${fields}&whereClause=setting_name="${key}"`, { [key]: value });
                    return new Promise((resolve) => {
                        resolve(response);
                    });
                });

                this.$pageSettings = this.settings = await this.getSettings();

                this.callout('success', this.langSnippet('save'));
            } else {
                this.keyError = "API Key is not valid!";
                this.callout('alert', this.langSnippet(this.keyError));
            }

            this.enableButton(saveButton);

            if ( design && design !== 'false' ) {
                document.getElementById('main').classList.add('is-rounded');
            } else {
                document.getElementById('main').classList.remove('is-rounded');
            }
        },
    },
};
</script>