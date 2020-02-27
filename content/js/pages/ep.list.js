Vue.use(vant.Lazyload, {
    'loading': '../content/img/default_avatar.jpg',
    'error': '../content/img/default_avatar.jpg',
    'attempt': 1
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isReloading': false,
        'tabActive': 0,
        'tabControl': [{
            'title': '挂單中',
            'pageIndex': 1,
            'pageSize': 15,
            'list': [],
            'type': 1,
            'isLoaded': true,
            'isLoadMore': false,
            'isLoadComplete': false,
            'isLoading': true
        }, {
            'title': '交易中',
            'pageIndex': 1,
            'pageSize': 15,
            'list': [],
            'type': 2,
            'isLoaded': false,
            'isLoadMore': false,
            'isLoadComplete': false,
            'isLoading': false
        }, {
            'title': '已完成',
            'pageIndex': 1,
            'pageSize': 15,
            'list': [],
            'type': 8,
            'isLoaded': false,
            'isLoadMore': false,
            'isLoadComplete': false,
            'isLoading': false
        }],
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
            'url': 'ace.list.html'
        }, {
            'index': 2,
            'text': 'EP交易',
            'default': 'iconjiaoyi',
            'active': 'iconjiaoyi_fill',
            'url': '#'
        }, {
            'index': 3,
            'text': '我的',
            'default': 'iconmy',
            'active': 'iconmyfill',
            'url': 'center.html'
        }],
        'currentIndex': 2,
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'tabChange': function (index) {
            var tab = this.tabControl[index];
            if (!tab.isLoaded) {
                tab.isLoaded = true;
                tab.isLoading = true;
                this.loadPageData();
            }
        },
        'onRefresh': function () {
            setTimeout(this.loadPageData, 500);
        },
        'gotoDetail': function (item) {
            APP.GLOBAL.gotoNewWindow('ep.list.detailPage', 'secondpage/ep.list.detail', {
                'param': 'eId=' + item.Id
            });
        },
        'loadPageData': function () {
            var tab = this.tabControl[this.tabActive];
            tab.pageIndex = 1;
            tab.isLoadMore = false;
            tab.isLoadComplete = false;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'EPSellRecords',
                data: {
                    'p': tab.pageIndex,
                    'pageSize': tab.pageSize,
                    'type': tab.type
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    tab.list = result.Data.List;
                    tab.pageIndex++;
                    tab.isLoading = false;
                    _vue.isReloading = false;
                }
            });
        },
        'loadMore': function () {
            var tab = this.tabControl[this.tabActive];

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'EPSellRecords',
                data: {
                    'p': tab.pageIndex,
                    'pageSize': tab.pageSize,
                    'type': tab.type
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    tab.list = tab.list.concat(result.Data.List);
                    tab.pageIndex++;
                    tab.isLoadMore = false;

                    if (result.Data.List.length < tab.pageSize) {
                        tab.isLoadComplete = true;
                    }
                }
            });
        },
        'windowScroll': function () {
            var tab = this.tabControl[this.tabActive];
            if (!tab.isLoadMore && !tab.isLoadComplete) {
                tab.isLoadMore = true;
                this.loadMore();
            }
        },
        'changeLanguage': function () {
            LSE.install('ep.list', function (lang) {
                Vue.set(_vue, 'language', lang);

                _vue.tabControl[0].title = _vue.language.TAB_1;
                _vue.tabControl[1].title = _vue.language.TAB_2;
                _vue.tabControl[2].title = _vue.language.TAB_3;
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
        if (!APP.CONFIG.IS_RUNTIME) {
            this.loadPageData();
        }

        window.scrollBottom = this.windowScroll;
    }
});