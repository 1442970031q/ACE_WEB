var _vue = new Vue({
    el: '#app',
    data: {
        'form': {
            'account': '',
            'changeType': '1',
            'Q1': 0,
            'Q2': 0,
            'Q3': 0
        },
        'language': {},
        'statusbarHeight': 0
    },
    methods: {
        'nextStep': function () {
            if (!this.form.account) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': this.language.SUBMIT_TEXT });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ValidateAccount',
                data: this.form,
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                    } else if (!result.IsSet) {
                        _vue.$dialog.alert({
                            'title': _vue.language.ERROR_NOTSET_TITLE,
                            'message': _vue.language.ERROR_NOTSET_TEXT
                        });
                    } else {
                        _vue.form.Q1 = result.Q1;
                        _vue.form.Q2 = result.Q2;
                        _vue.form.Q3 = result.Q3;

                        APP.GLOBAL.gotoNewWindow('answeringPage', 'answering', {
                            paramObject: {
                                'form': _vue.form
                            },
                            openCallback: function () {
                                APP.GLOBAL.closeWindow('none');
                            }
                        });
                    }
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('forgot', function (lang) {
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