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
        'isShowPasswordInput': false,
        'pageModel': {
            'Id': APP.GLOBAL.queryString('eId')
        },
        'form': {
            'password': ''
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'EPSellDetail',
                data: {
                    'sId': this.pageModel.Id
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    Vue.set(_vue, 'pageModel', result.Detail);
                    _vue.isLoading = false;
                }
            });
        },
        'confirmTran': function () {
            this.isShowPasswordInput = true;

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
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else if (this.form.password.length < 6) {
                done(false);
                APP.GLOBAL.toastMsg(this.language.ERROR_2);
            } else {
                var pwd = this.form.password;
                setTimeout(function () {
                    _vue.form.password = '';
                }, 300);

                done();

                this.doConfirmSubmitAjax(pwd);
            }
        },
        'doConfirmSubmitAjax': function (pwd) {
            APP.GLOBAL.toastLoading(this.language.CONFIRM_TOAST_TEXT);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'BuyEP',
                data: {
                    'sId': this.pageModel.Id,
                    'password': pwd
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.gotoNewWindow('tran.successPage', 'tran.success', {
                        param: 'title=' + encodeURIComponent(_vue.language.COMPLETE_PASSWORD_TITLE) +
                            '&text=' + encodeURIComponent(_vue.language.COMPLETE_PASSWORD_TEXT),
                        openCallback: function () {
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('ep.list.detail', function (lang) {
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