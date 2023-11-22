<script>
import langSnippet from './language.vue';

export default {
    name: 'MainFunctions',
    mixins: [langSnippet],
    methods: {
        menuBtn() {
            var menuBtn = document.getElementById('menu-button');

            if (menuBtn.classList.contains('active-button')) {
                menuBtn.classList.remove('active-button');
            } else {
                menuBtn.classList.add('active-button');
            }
        },
        userBtnTrigger() {
            var userBtn = document.getElementById('user-menu-btn');

            if (userBtn.classList.contains('active')) {
                userBtn.classList.remove('active');
            } else {
                userBtn.classList.add('active');
            }
        },
        openPopUp() {
            var modal = document.getElementById('modal');
            var activeModalClass = 'active-modal';
            var activeClass = 'active';

            document.body.classList.add(activeModalClass);
            modal.classList.add(activeClass);
        },
        closePopUp() {
            var modal = document.getElementById('modal');
            var activeModalClass = 'active-modal';
            var activeClass = 'active';

            document.body.classList.remove(activeModalClass);
            modal.classList.remove(activeClass);
        },

        openPopUpHeader() {
            var modal = document.getElementById('modalHeader');
            var activeModalClass = 'active-modal';
            var activeClass = 'active';

            document.body.classList.add(activeModalClass);
            modal.classList.add(activeClass);
        },
        closePopUpHeader() {
            var modal = document.getElementById('modalHeader');
            var activeModalClass = 'active-modal';
            var activeClass = 'active';

            document.body.classList.remove(activeModalClass);
            modal.classList.remove(activeClass);
        },

        disableButton(button) {
            button.disabled = true;
            button.classList.add('is-loading');
        },
        enableButton(button) {
            setTimeout(() => {
                button.classList.remove('is-loading');
                button.classList.add('saved');

                setTimeout(() => {
                    button.disabled = false;
                    button.classList.remove('saved');
                }, 1000);
            }, 1000);
        },
        runtime(time) {
            var hours = Math.floor(time/60);
            var restMinutes = parseInt(time % 60);
            var minutesText = '';
            var hourText = '';

            if ( !(restMinutes <= 1) ) {
                minutesText = this.langSnippet('minutes');
            } else if ( restMinutes < 1 ) {
                restMinutes = '';
                minutesText = '';
            } else {
                minutesText = this.langSnippet('minute');
            }

            if ( hours > 0 ) {
                if ( hours <= 1 ) {
                    hourText = this.langSnippet('hour');
                } else {
                    hourText = this.langSnippet('hours');
                }

                var finalRuntime = hours+' '+hourText+' '+restMinutes+' '+minutesText;
            } else {
                finalRuntime = restMinutes+' '+minutesText;
            }

            return finalRuntime;
        },
    },
};
</script>