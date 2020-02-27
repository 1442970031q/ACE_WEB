var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'request': {
            'sId': APP.GLOBAL.queryString('sId'),
            'count': APP.GLOBAL.queryString('count'),
            'time': APP.GLOBAL.queryString('time')
        },
        'list': [],
        'language': {},
        'statusbarHeight': 0
    },
    methods: {
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'DirectSellDetails',
                data: {
                    'sId': this.request.sId
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.list = result.Data;
                    _vue.isLoading = false;
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('my.ace.detail', function (lang) {
                Vue.set(_vue, 'language', lang);
            });
        }
    },
    created: function () {
        this.changeLanguage();

        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    },
    mounted: function () {
        this.loadPageData();
    }
});