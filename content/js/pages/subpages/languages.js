var _vue = new Vue({
    el: '#app',
    data: {
        'statusbarHeight': 0,
        'language': {},
        'request': {
            'from': APP.GLOBAL.queryString('from')
        }
    },
    methods: {
        'changeLanguage': function () {
            LSE.install('language', function (lang) {
                Vue.set(_vue, 'language', lang);
            });
        }
    },
    created: function () {
        this.changeLanguage();

        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    }
});