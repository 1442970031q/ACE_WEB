var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'pageModel': {
            'isLoadMore': false,
            'isLoadComplete': false,
            'isLoading': true,
            'pageIndex': 1,
            'pageSize': 15,
            'list': []
        },
        'statusbarHeight': 0,
        'request': {
            'weekIndex': APP.GLOBAL.queryString('wIndex'),
            'year': APP.GLOBAL.queryString('year'),
            'month': APP.GLOBAL.queryString('month')
        },
        'language': {}
    },
    methods: {
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'EPAwardList',
                data: {
                    'p': this.pageModel.pageIndex,
                    'pageSize': this.pageModel.pageSize,
                    'year': this.request.year,
                    'month': this.request.month,
                    'num': this.request.weekIndex
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.pageIndex++;
                    _vue.pageModel.list = result.Data.List;
                    _vue.pageModel.isLoading = false;
                }
            });
        },
        'loadMore': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'EPAwardList',
                data: {
                    'p': this.pageModel.pageIndex,
                    'pageSize': this.pageModel.pageSize,
                    'year': this.request.year,
                    'month': this.request.month,
                    'num': this.request.weekIndex
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.pageIndex++;
                    _vue.pageModel.list = _vue.pageModel.list.concat(result.Data.List);
                    _vue.pageModel.isLoadMore = false;
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
            LSE.install('profit.week', function (lang) {
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