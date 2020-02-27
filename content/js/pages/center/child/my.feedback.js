Vue.use(vant.Lazyload, {
    'loading': '../../../content/img/default_feedback.png',
    'error': '../../../content/img/default_feedback.png',
    'attempt': 1
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'pageModel': {
            'pageIndex': 1,
            'pageSize': 15,
            'isLoadMore': false,
            'isLoadComplete': false,
            'list': []
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'viewImage': function (url) {
            vant.ImagePreview([url]);
        },
        'getTypeName': function (item) {
            if (item.CommitType === 1) {
                return this.language.TYPE_1;
            } else if (item.CommitType === 2) {
                return this.language.TYPE_2;
            } else if (item.CommitType === 3) {
                return this.language.TYPE_3;
            } else if (item.CommitType === 4) {
                return this.language.TYPE_4;
            } else if (item.CommitType === 5) {
                return this.language.TYPE_5;
            } else if (item.CommitType === 6) {
                return this.language.TYPE_6;
            }else {
                return this.language.TYPE_7;
            }
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'CommitsList',
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
                    _vue.pageModel.list = result.Data;
                    _vue.isLoading = false;
                }
            });
        },
        'loadMore': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'CommitsList',
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
            LSE.install('my.feedback', function (lang) {
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