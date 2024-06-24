export async function get_page_settings() {
    const response = await this.fetchDB(`getSettings`);
    return new Promise((resolve) => {
        resolve(response.data);
    });
}

export function get_page_setting(settingName) {
    var pageSettings = this.$globalState.pageSettings;
    if (pageSettings.some(setting => setting.setting_name === settingName)) {
        var setting = pageSettings.find(setting => setting.setting_name === settingName);
        return setting.setting_option;
    }
}

export function get_page_title() {
    var title = this.get_page_setting('site_title');
    return title;
}

export function get_page_design() {
    var design = this.get_page_setting('design');
    if ( design === 'true' ) return 'is-rounded';
}