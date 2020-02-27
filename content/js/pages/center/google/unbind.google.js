var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isConfirm': false,
        'form': {
            'idcard': '',
            'pin': ''
        },
        'language': {},
        'statusbarHeight': 20
    },
    methods: {
        'checkData': function () {
            if (!this.form.pin) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else if (this.form.pin.length < 6) {
                APP.GLOBAL.toastMsg(this.language.ERROR_2);
            } else if (!this.form.idcard) {
                APP.GLOBAL.toastMsg(this.language.ERROR_3);
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading(this.language.SUBMIT_TOAST_TEXT);
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'UnBindGCode',
                data: this.form,
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.updateUserModel({
                        'IsBindGAuthorize': false
                    }, [{
                        'pageName': 'center.htmlPage',
                        'actionName': '_vue.updateUserModel()'
                    }]);

                    APP.GLOBAL.gotoNewWindow('unbind.google.successPage', 'unbind.google.success', {
                        'openCallback': function () {
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        },
        'unbindConfirm': function () {
            APP.GLOBAL.confirmMsg({
                'title': this.language.DIALOG_TITLE,
                'message': this.language.DIALOG_MESSAGE,
                'confirmButtonText': this.language.DIALOG_CONFIRM_BUTTON,
                'cancelButtonText': this.language.DIALOG_CANCEL_BUTTON,
                'confirmCallback': function () {
                    _vue.isConfirm = true;
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('unbind_google', function (lang) {
                Vue.set(_vue, 'language', lang);
            });
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }

        this.changeLanguage();
    }
});