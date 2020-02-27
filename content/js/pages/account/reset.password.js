var _vue = new Vue({
    el: '#app',
    data: {
        'isLoading': true,
        'confirmPassword': '',
        'form': {
            'account': APP.GLOBAL.queryString('account'),
            'changeType': APP.GLOBAL.queryString('ct'),
            'password': ''
        },
        'language': {},
        'statusbarHeight': 0
    },
    methods: {
        'checkInput': function () {
            if (!this.form.password) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else if (this.form.password.length < 6) {
                APP.GLOBAL.toastMsg(this.language.ERROR_2);
            } else if (this.form.password !== this.confirmPassword) {
                APP.GLOBAL.toastMsg(this.language.ERROR_3);
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': this.language.TOAST_TEXT });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ResetPassword',
                data: this.form,
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                    } else {
                        _vue.$dialog.alert({
                            'title': _vue.language.DIALOG_TITLE,
                            'message': _vue.language.DIALOG_TEXT
                        }).then(() => {
                            APP.GLOBAL.closeWindow();
                        });
                    }
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('reset.password', function (lang) {
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
        window.isPageControlBackButton = true;
    }
});