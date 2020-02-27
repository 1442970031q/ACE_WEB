var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'isSearch': false,
        'searchKey': '',
        'pageModel': {
            'isSearch': false,
            'searchKey': '',
            'isLoadMore': false,
            'isLoadComplete': false,
            'pageIndex': 1,
            'pageSize': 15,
            'list': []
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'choiceMain': function () {
            window.location = '../sell.ace.html';
        },
        'choiceItem': function (item) {
            window.location = '../sell.ace.html?is=true' +
                '&display=' + encodeURIComponent(this.language.SUBACCOUNT_TEXT + '(' + item.FlowNumber + ')') +
                '&sId=' + item.Id +
                '&amount=' + item.AceAmount;
        },
        'onSearch': function () {
            if (!this.searchKey) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else if (!/^\d+$/.test(this.searchKey) || this.searchKey.length < 5) {
                APP.GLOBAL.toastMsg(this.language.ERROR_2);
            } else {
                this.isSearch = true;

                this.pageModel.pageIndex = 1;
                this.pageModel.isLoadComplete = false;
                this.loadPageData();
            }
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MySubaccount',
                data: {
                    'p': this.pageModel.pageIndex,
                    'pageSize': this.pageModel.pageSize,
                    'account': this.searchKey
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.pageIndex++;
                    _vue.pageModel.list = result.Data.List;
                    _vue.isLoading = false;
                    _vue.isSearch = false;
                }
            });
        },
        'loadMore': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MySubaccount',
                data: {
                    'p': this.pageModel.pageIndex,
                    'pageSize': this.pageModel.pageSize,
                    'account': this.searchKey
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
            LSE.install('choice.subaccount', function (lang) {
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