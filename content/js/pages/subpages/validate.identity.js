var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'form': {
            'idCardNumber': ''
        },
        'language': {},
        'statusbarHeight': 0
    },
    methods: {
        'gotoLogin': function () {
            APP.GLOBAL.removeModel();

            APP.GLOBAL.gotoNewWindow('loginPage', '../account/login', {
                'openCallback': function () {
                    plus.webview.getWebviewById('mainPage').close('none');
                    APP.GLOBAL.closeWindow('none');
                }
            });
        },
        'checkData': function () {
            if (!this.form.idCardNumber) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else {
                this.doValidateAjax();
            }
        },
        'doValidateAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': this.language.TOAST_TEXT });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ValidIDCard',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.updateUserModel({
                        'IsNewIDEncrypt': true
                    });

                    APP.GLOBAL.closeWindow();
                }
            });
        },
        'closeWindow': function () {
            var wb = plus.webview.getWebviewById('mainPage');
            wb.evalJS('pageScript.closeMaskWindow()');

            APP.GLOBAL.closeWindow();
        },
        'changeLanguage': function () {
            LSE.install('validate.identity', function (lang) {
                Vue.set(_vue, 'language', lang);
            });
        }
    },
    created: function () {
        this.changeLanguage();

        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }

        window.isPageControlBackButton = true;
    }
});