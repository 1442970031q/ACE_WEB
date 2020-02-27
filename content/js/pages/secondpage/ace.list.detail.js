Vue.use(vant.Lazyload, {
    'loading': '../../content/img/default_avatar.jpg',
    'error': '../../content/img/default_avatar.jpg',
    'attempt': 1
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'isLoadBuyList': true,
        'request': {
            'tId': APP.GLOBAL.queryString('aId')
        },
        'pageModel': {
            'Id': 0,
            'User': {
                'Id': 0
            },
            'buyList': []
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ACETradingDetail',
                data: {
                    'tId': this.request.tId
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel = Object.assign({}, _vue.pageModel, result.Data);
                    _vue.isLoading = false;
                    _vue.loadBuyList();
                }
            });
        },
        'loadBuyList': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'TradingList',
                data: {
                    'p': 1,
                    'pageSize': 10,
                    'tId': this.pageModel.Id,
                    'uId': this.pageModel.User.Id
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.buyList = result.Data;
                    _vue.isLoadBuyList = false;
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('ace.list.detail', function (lang) {
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