var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'request': {
            'nId': APP.GLOBAL.queryString('nId')
        },
        'isLoading': true,
        'detail': {
            'Id': 0,
            'Text': '',
            'Title': '',
            'CreateTime': ''
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'NoticeDetail',
                data: this.request,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.detail = Object.assign({}, _vue.detail, result.Data);
                    _vue.isLoading = false;
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('last.notice.detail', function (lang) {
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