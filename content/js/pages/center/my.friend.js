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
        'searchKey': '',
        'currentTopUser': {},
        'teamList': [],
        'pageModel': {
            'pageIndex': 1,
            'pageSize': 15,
            'list': [],
            'isLoadMore': false,
            'isLoadComplete': false
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'choiceUser': function (item) {
            this.teamList.push(this.currentTopUser);
            this.currentTopUser = item;

            APP.GLOBAL.toastLoading(this.language.LOADING_TEXT);
            this.pageModel.list = [];
            this.loadPageData();
        },
        'gotoBack': function () {
            var index = this.teamList.length - 1;
            this.currentTopUser = this.teamList[index];
            this.teamList.splice(index, 1);

            APP.GLOBAL.toastLoading(this.language.LOADING_TEXT);
            this.loadPageData();
        },
        'doSearchAjax': function () {
            this.pageModel.pageIndex = 1;
            this.isLoadComplete = false;
            APP.GLOBAL.toastLoading(this.language.LOADING_TEXT);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyRecommendUserList',
                data: {
                    'p': this.pageModel.pageIndex,
                    'pageSize': this.pageModel.pageSize,
                    'fn': this.searchKey
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    window.scroll(0, 0);
                    var userModel = _vue.getSearchUserModel(_vue.searchKey);
                    _vue.teamList.push(_vue.currentTopUser);
                    _vue.currentTopUser = userModel;

                    _vue.pageModel.list = result.Data.List;
                    _vue.pageModel.pageIndex++;
                    _vue.isLoading = false;

                    APP.GLOBAL.closeToastLoading();
                }
            });
        },
        'getSearchUserModel': function (fn) {
            for (var i = 0; i < this.pageModel.list.length; i++) {
                if (this.pageModel.list[i].FlowNumber === fn)
                    return this.pageModel.list[i];
            }

            return null;
        },
        'loadPageData': function () {
            this.pageModel.pageIndex = 1;
            this.pageModel.isLoadComplete = false;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyRecommendUserList',
                data: {
                    'p': this.pageModel.pageIndex,
                    'pageSize': this.pageModel.pageSize,
                    'rId': this.currentTopUser.Id
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    window.scroll(0, 0);
                    _vue.pageModel.list = result.Data.List;
                    _vue.pageModel.pageIndex++;
                    _vue.isLoading = false;

                    APP.GLOBAL.closeToastLoading();
                }
            });
        },
        'loadMore': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyRecommendUserList',
                data: {
                    'p': this.pageModel.pageIndex,
                    'pageSize': this.pageModel.pageSize,
                    'rId': this.currentTopUser.Id,
                    'fn': typeof this.serachKey === 'undefined' ? '' : this.searchKey
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.list = _vue.pageModel.list.concat(result.Data.List);
                    _vue.pageModel.pageIndex++;
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
            LSE.install('my.friend', function (lang) {
                Vue.set(_vue, 'language', lang);
            });
        }
    },
    created: function () {
        this.changeLanguage();

        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }

        this.currentTopUser = this.currentUser;
        this.currentTopUser['Level'] = this.currentUser.InvestmentLevel.StarNumber;
    },
    mounted: function () {
        this.loadPageData();
        window.scrollBottom = this.windowScroll;
    }
});