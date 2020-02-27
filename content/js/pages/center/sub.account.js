Vue.use(vant.Lazyload, {
    'loading': '../../content/img/default_avatar.jpg',
    'error': '../../content/img/default_avatar.jpg',
    'attempt': 1
});

var _vue = new Vue({
    el: '#app',
    data: {
        'isLoading': true,
        'isPasswordInput': false,
        'currentUser': APP.GLOBAL.getUserModel(),
        'pageModel': {
            'pageIndex': 1,
            'pageSize': 15,
            'list': [],
            'isLoadMore': false,
            'isLoadComplete': false
        },
        'form': {
            'password': ''
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'createAccount': function () {
            APP.GLOBAL.toastLoading(this.language.AUDITING);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'IsCanSonDeclarationForm',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                    } else if (!result.CanCreate) {
                        _vue.$dialog.alert({
                            'message': _vue.language.AUDIT_FAIL_MSG_1 + result.CanCreateDate + _vue.language.AUDIT_FAIL_MSG_2,
                            'title': _vue.language.AUDIT_FAIL
                        });
                    } else {
                        APP.GLOBAL.gotoNewWindow('new.subaccountPage', 'new.subaccount', {
                            openCallback: function () {
                                APP.GLOBAL.closeToastLoading();
                            }
                        });
                    }
                }
            });
        },
        'allInOne': function () {
            this.isPasswordInput = true;

            setTimeout(function () {
                _vue.$refs['passwordBox'].focus();
            }, 300);
        },
        'checkPassword': function (action, done) {
            if (action !== 'confirm') {
                done();
                return;
            }

            if (!this.form.password) {
                done(false);
                APP.GLOBAL.toastMsg(this.language.INPUT_TRANSFER_PASSWORD);
            } else if (this.form.password.length < 6) {
                done(false);
                APP.GLOBAL.toastMsg(this.language.TRANSFER_PASSWORD_REQUIRE);
            } else {
                var pwd = this.form.password;
                this.form.password = '';
                done();

                this.doAllInOneAjax(pwd);
            }
        },
        'doAllInOneAjax': function (pwd) {
            APP.GLOBAL.toastLoading(this.language.REGRESSING);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'OneKeyReturn',
                data: { 'password': pwd },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.redloadPageData();
                    _vue.$toast.success(_vue.language.REGRESS_OK);
                }
            });
        },
        'redloadPageData': function () {
            this.isLoading = true;
            this.pageModel.pageIndex = 1;
            this.pageModel.list = [];
            this.loadPageData();
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MySubaccount',
                data: {
                    'p': this.pageModel.pageIndex,
                    'size': this.pageModel.pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.pageIndex++;
                    _vue.pageModel.list = result.Data.List;
                    _vue.isLoading = false;
                }
            });
        },
        'loadMore': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MySubaccount',
                data: {
                    'p': this.pageModel.pageIndex,
                    'size': this.pageModel.pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.pageIndex++;
                    _vue.pageModel.list = _vue.pageModel.list.concat(result.Data.List);
                    _vue.pageModel.isLoadMore = false;
                    _vue.pageModel.isLoadComplete = result.Data.List.length < _vue.pageModel.pageSize;
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
            LSE.install('sub.account', function (lang) {
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