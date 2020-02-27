Vue.use(vant.Lazyload, {
    'loading': '../../content/img/default_avatar.jpg',
    'error': '../../content/img/default_avatar.jpg',
    'attempt': 1
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'tabActive': 0,
        'pageModel': {
            'tabs': [{
                'isLoaded': true,
                'isLoading': true,
                'pageIndex': 1,
                'pageSize': 15,
                'list': [],
                'isLoadMore': false,
                'isLoadComplete': false
            }, {
                'isLoaded': false,
                'isLoading': true,
                'pageIndex': 1,
                'pageSize': 15,
                'list': [{
                    'Seller': {
                        'Avatar': '',
                        'FlowNumber': 10009
                    }
                }]
            }]
        },
        'language': {},
        'statusbarHeight': 0
    },
    methods: {
        'tabChange': function (index) {
            var model = this.pageModel.tabs[index];
            if (!model.isLoaded) {
                model.isLoaded = true;
                this.loadPageData();
            }
        },
        'gotoSellDetail': function (item) {
            APP.GLOBAL.gotoNewWindow('my.ace.detailPage', 'my.ace.detail', {
                'param': 'sId=' + item.Id +
                    '&count=' + item.TotalStockCount +
                    '&time=' + encodeURIComponent(item.Time)
            });
        },
        'loadPageData': function () {
            if (this.tabActive === 0) {
                this.loadTab1();
            } else {
                this.loadTab2();
            }
        },
        'loadTab1': function () {
            var model = this.pageModel.tabs[0];

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'BuyAndSellList',
                data: {
                    'p': model.pageIndex,
                    'pageSize': model.pageSize,
                    'type': 2
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    model.pageIndex++;
                    model.list = result.Data.List;
                    model.isLoading = false;
                }
            });
        },
        'loadTab2': function () {
            var model = this.pageModel.tabs[1];

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyBuyTrades',
                data: {
                    'p': model.pageIndex,
                    'pageSize': model.pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    model.pageIndex++;
                    model.list = result.Data;
                    model.isLoading = false;
                }
            });
        },
        'loadMore': function () {
            var model = this.pageModel.tabs[0];

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'BuyAndSellList',
                data: {
                    'p': model.pageIndex,
                    'pageSize': model.pageSize,
                    'type': 2
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    model.pageIndex++;
                    model.isLoadMore = false;
                    model.list = model.list.concat(result.Data.List);

                    if (result.Data.List.length < model.pageSize) {
                        model.isLoadComplete = true;
                    }
                }
            });
        },
        'windowScroll': function () {
            var model = this.pageModel.tabs[0];
            if (this.tabActive === 0 && !model.isLoadMore && !model.isLoadComplete) {
                model.isLoadMore = true;
                this.loadMore();
            }
        },
        'changeLanguage': function () {
            LSE.install('my.ace', function (lang) {
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