<script>
import langSnippet from './language.vue';

export default {
    name: 'MainFunctions',
    mixins: [langSnippet],
    methods: {
        toggleMainMenu(event) {
            event.preventDefault();
            var menuBtn = document.getElementById('menu-button');
            document.body.classList.toggle('active-menu');
            menuBtn.classList.toggle('active-button');
        },
        userBtnTrigger() {
            var userBtn = document.getElementById('user-menu-btn');

            if (userBtn.classList.contains('active')) {
                userBtn.classList.remove('active');
            } else {
                userBtn.classList.add('active');
            }
        },
        openPopUp(popUpID, event) {
            event.preventDefault();
            var modal = document.getElementById(popUpID);

            document.body.classList.add('active-modal');
            modal.classList.add('active');
        },
        closePopUp(popUpID, event) {
            event.preventDefault();
            var modal = document.getElementById(popUpID);

            document.body.classList.remove('active-modal');
            modal.classList.remove('active');
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
        SelectTabs(event) {
            event.preventDefault();
            var selectID = event.target.id;
            var selectValue = event.target.value;
            document.querySelectorAll(`.${selectID}.is-active`)[0].classList.remove('is-active');
            document.querySelectorAll(`.${selectID}[data-select-tab="${selectValue}`)[0].classList.add('is-active');
        }
    }
};
</script>