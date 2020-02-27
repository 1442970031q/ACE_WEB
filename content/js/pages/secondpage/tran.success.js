var _vue = new Vue({
    el: '#app',
    data: {
        'request': {
            'title': APP.GLOBAL.queryString('title'),
            'text': APP.GLOBAL.queryString('text')
        },
        'language': {},
        'statusbarHeight': 0
    },
    methods: {
        'gotoCenter': function () {
            APP.GLOBAL.gotoNewWindow('business.centerPage', '../center/business.center', {
                openCallback: function () {
                    APP.GLOBAL.closeWindow('none');
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('tran.success', function (lang) {
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