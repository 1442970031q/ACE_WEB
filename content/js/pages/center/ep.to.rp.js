var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'form': {
            'amount': '',
            'password': '',
            'type': 2
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'checkData': function () {
            if (!this.form.amount || this.form.amount <= 0) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else if (this.form.amount * 1 > this.currentUser.EP * 1) {
                APP.GLOBAL.toastMsg(this.language.ERROR_4);
            } else if (!this.form.password) {
                APP.GLOBAL.toastMsg(this.language.ERROR_2);
            } else if (this.form.password.length < 6) {
                APP.GLOBAL.toastMsg(this.language.ERROR_3);
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading(this.language.TOAST_TEXT);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ExchangeRP',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.updateUserModel({
                        'EP': _vue.currentUser.EP - _vue.form.amount,
                        'RP': _vue.currentUser.RP + _vue.form.amount
                    }, [{
                        'pageName': 'home.htmlPage',
                        'actionName': '_vue.updateUserModel()'
                    }]);

                    APP.GLOBAL.gotoNewWindow('change.successPage', 'security/change.success', {
                        param: 'title=' + encodeURIComponent(_vue.language.RESULT_TITLE) +
                            '&text=' + encodeURIComponent(_vue.language.RESULT_TEXT),
                        openCallback: function () {
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('ep.to.rp', function (lang) {
                Vue.set(_vue, 'language', lang);
            });
        }
    },
    created: function () {
        this.changeLanguage();

        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    }
});