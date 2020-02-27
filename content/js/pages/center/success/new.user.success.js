var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'request': {
            'levelName': APP.GLOBAL.queryString('ln'),
            'playerName': APP.GLOBAL.queryString('pn'),
            'pos': APP.GLOBAL.queryString('pos')
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'changeLanguage': function () {
            LSE.install('new.user.success', function (lang) {
                Vue.set(_vue, 'language', lang);
            });
        }
    },
    created: function () {
        this.changeLanguage();
    }
});