Vue.use(vant.Lazyload, {
    'loading': '../content/img/default_avatar.jpg',
    'error': '../content/img/default_avatar.jpg',
    'attempt': 1
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'isReloading': false,
        'pageModel': {
            'pageIndex': 1,
            'pageSize': 15,
            'list': [],
            'isLoadMore': false,
            'isLoadComplete': false
        },
        'language': {},
        'menus': [{
            'index': 0,
            'text': '首頁',
            'default': 'iconhome',
            'active': 'iconhomefill',
            'url': 'home.html'
        }, {
            'index': 1,
            'text': 'ACE交易',
            'default': 'iconpuke',
            'active': 'iconpuke_fill',
            'url': '#'
        }, {
            'index': 2,
            'text': 'EP交易',
            'default': 'iconjiaoyi',
            'active': 'iconjiaoyi_fill',
            'url': 'ep.list.html'
        }, {
            'index': 3,
            'text': '我的',
            'default': 'iconmy',
            'active': 'iconmyfill',
            'url': 'center.html'
        }],
        'currentIndex': 1,
        'statusbarHeight': 0
    },
    methods: {
        'gotoDetail': function (item) {
            APP.GLOBAL.gotoNewWindow('ace.list.detailPage', 'secondpage/ace.list.detail', {
                'param': 'aId=' + item.Id
            });
        },
        'onRefresh': function () {
            this.pageModel.pageIndex = 1;
            setTimeout(this.loadPageData, 500);
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'TradingCenter',
                data: {
                    'p': this.pageModel.pageIndex,
                    'pageSize': this.pageModel.pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.list = result.Data.List;
                    _vue.pageModel.pageIndex++;
                    _vue.isLoading = false;
                    _vue.isReloading = false;
                }
            });
        },
        'loadMore': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'TradingCenter',
                data: {
                    'p': this.pageModel.pageIndex,
                    'pageSize': this.pageModel.pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.pageIndex++;
                    _vue.pageModel.isLoadMore = false;
                    _vue.pageModel.list = _vue.pageModel.list.concat(result.Data.List);

                    if (result.Data.List.length < _vue.pageModel.pageSize) {
                        _vue.pageModel.isLoadComplete = true;
                    }
                }
            });
        },
        'windowScroll': function () {
            if (!this.pageModel.isLoadMore && !this.pageModel.isLoadComplete) {
                this.pageModel.isLoadMore = true;
                this.loadMore();
            }
        },
        'changeLanguage': function () {
            LSE.install('ace.list', function (lang) {
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
        window.scrollBottom = this.windowScroll;
    }
});