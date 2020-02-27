var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'form': {
            'nickName': ''
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'checkData': function () {
            if (!this.form.nickName) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else if (this.form.nickName === this.currentUser.NickName) {
                APP.GLOBAL.toastMsg(this.language.ERROR_2);
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading(this.language.TOAST_TEXT);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ChangeNickName',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.updateUserModel({
                        'NickName': _vue.form.nickName
                    }, [{
                        'pageName': 'profilePage',
                        'actionName': '_vue.updateUserModel()'
                    }, {
                        'pageName': 'center.htmlPage',
                        'actionName': '_vue.updateUserModel()'
                    }]);

                    APP.GLOBAL.toastMsg(_vue.language.SUCCESS_TEXT);
                    APP.GLOBAL.closeWindow();
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('change.nickname', function (lang) {
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