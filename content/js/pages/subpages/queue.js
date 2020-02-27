var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'pageModel': {
            'searchKey': '',
            'queueCount': '',
            'lastFlowNumber': '',
            'isShowBottom': true,
            'isLoadMore': false,
            'isLoadComplete': false,
            'pageIndex': 1,
            'pageSize': 25,
            'list': []
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'doSearchAjax': function () {
            if (!this.pageModel.searchKey) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
                return;
            } else if (this.pageModel.searchKey.length < 5) {
                APP.GLOBAL.toastMsg(this.language.ERROR_2);
                return;
            } else if (!/^[0-9]*$/.test(this.pageModel.searchKey)) {
                APP.GLOBAL.toastMsg(this.language.ERROR_3);
                return;
            }

            this.isLoading = true;
            this.pageModel.list = [];

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Waiteds',
                data: {
                    'p': 1,
                    'pageSize': this.pageModel.pageSize,
                    'searchKey': this.pageModel.searchKey
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.lastFlowNumber = result.LastFlowNumber;
                    _vue.pageModel.queueCount = result.Count;
                    _vue.pageModel.list = result.Data;
                    _vue.isLoading = false;
                }
            });
        },
        'loadPageData': function () {
            this.isLoading = true;
            this.pageModel.searchKey = '';
            this.pageModel.pageIndex = 1;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Waiteds',
                data: {
                    'p': this.pageModel.pageIndex,
                    'pageSize': this.pageModel.pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (_vue.pageModel.pageIndex === 1) {
                        _vue.pageModel.lastFlowNumber = result.LastFlowNumber;
                        _vue.pageModel.queueCount = result.Count;
                    }

                    _vue.pageModel.pageIndex++;
                    _vue.pageModel.list = result.Data;
                    _vue.isLoading = false;
                }
            });
        },
        'loadMore': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Waiteds',
                data: {
                    'p': this.pageModel.pageIndex,
                    'pageSize': this.pageModel.pageSize,
                    'searchKey': this.pageModel.searchKey
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.pageIndex++;
                    _vue.pageModel.isLoadMore = false;
                    _vue.pageModel.list = _vue.pageModel.list.concat(result.Data);

                    if (result.Data.length < _vue.pageModel.pageSize) {
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
            LSE.install('queue', function (lang) {
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