var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoadingAnswer': true,
        'confirmPassword': '',
        'statusbarHeight': 0,
        'questionDisplay': '',
        'form': {
            'idcard': '',
            'qId': 0,
            'answer': '',
            'oldPassword': '',
            'password': ''
        },
        'request': {
            'from': APP.GLOBAL.queryString('from')
        },
        'language': {
            'TITLE_TEXT': '',
            'BUTTON_1': '',
            'INPUT_TEXT_1': '',
            'INPUT_PLACEHOLDER_1': '',
            'INPUT_TEXT_2': '',
            'INPUT_PLACEHOLDER_2': '',
            'INPUT_TEXT_3': '',
            'INPUT_PLACEHOLDER_3': '',
            'INPUT_TEXT_4': '',
            'INPUT_PLACEHOLDER_4': '',
            'ERROR_1': '',
            'ERROR_2': '',
            'ERROR_3': '',
            'ERROR_4': '',
            'ERROR_5': '',
            'ERROR_6': '',
            'ERROR_7': '',
            'SUBMIT_TOAST_TEXT': '',
            'SUCCESS_TITLE': '',
            'SUCCESS_TEXT': '',
            'RULE_TITLE': '',
            'RULE_ITEM_1': '',
            'RULE_ITEM_2': '',
            'WARNING_TEXT': ''
        }
    },
    methods: {
        'returnLogin': function () {
            var hotScreen = plus.webview.getWebviewById('hot.screenPage');
            if (hotScreen != null) {
                hotScreen.close('none');
            }

            gotoNewWindow('loginPage', '../../account/login', {
                openCallback: function () {
                    plus.webview.getWebviewById('mainPage').close('none');
                    closeWindow('none');
                }
            })
        },
        'checkData': function () {
            if (!this.form.oldPassword) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else if (this.form.oldPassword.length < 6) {
                APP.GLOBAL.toastMsg(this.language.ERROR_2);
            } else if (!this.form.password) {
                APP.GLOBAL.toastMsg(this.language.ERROR_3)
            } else if (this.form.password.length < 6) {
                APP.GLOBAL.toastMsg(this.language.ERROR_4);
            } else if (!this.confirmPassword) {
                APP.GLOBAL.toastMsg(this.language.ERROR_5)
            } else if (this.form.password != this.confirmPassword) {
                APP.GLOBAL.toastMsg(this.language.ERROR_6)
            } else if (!this.form.answer) {
                APP.GLOBAL.toastMsg(this.language.ERROR_8)
            } else if (!this.form.idcard) {
                APP.GLOBAL.toastMsg(this.language.ERROR_7)
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading({
                'message': this.language.SUBMIT_TOAST_TEXT
            });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ChangePassword',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                    } else {

                        APP.GLOBAL.updateUserModel({
                            'IsStrong': true
                        });

                        APP.GLOBAL.gotoNewWindow('change.successPage', 'change.success', {
                            param: 'title=' + encodeURIComponent(_vue.language.SUCCESS_TITLE) +
                                '&text=' + encodeURIComponent(_vue.language.SUCCESS_TEXT) +
                                '&url=' + encodeURIComponent(_vue.request.url),
                            openCallback: function () {
                                APP.GLOBAL.closeWindow('none');
                            }
                        });
                    }
                }
            })
        },
        'loadAnswer': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'GetAnswerTitle',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.questionDisplay = result.QTitle;
                    _vue.form.qId = result.Qid;
                    _vue.isLoadingAnswer = false;
                }
            })
        },
        'changeLanguage': function () {
            LSE.install('change.password', function (lang) {
                Object.assign(_vue.language, lang);
            });
        },
        'backButton': function () {
            toastMsg('請重置您的登錄密碼');
        }
    },
    created: function () {
        if (this.request.from) {
            window.backButton = this.backButton;
        }

        this.changeLanguage();
        this.loadAnswer()
    }
});