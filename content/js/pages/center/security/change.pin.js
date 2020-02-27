var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoadingAnswer': true,
        'confirmPassword': '',
        'questionDisplay': '',
        'form': {
            'idcard': '',
            'oldPassword': '',
            'answer': '',
            'qId': 0,
            'password': ''
        },
        'request': {
            'fp': APP.GLOBAL.queryString('fp')
        },
        "language": {},
        'statusbarHeight': 0
    },
    methods: {
        'checkData': function () {
            if (!this.form.oldPassword) {
                APP.GLOBAL.toastMsg(this.language.INPUT_CURRENT); //'請輸入當前交易密碼'
            } else if (this.form.oldPassword.length < 6) {
                APP.GLOBAL.toastMsg(this.language.CURRENT_TRANSFER_PWD_MUST_MORE_CHARS); //'當前交易密碼必須大於6位'
            } else if (!this.form.password) {
                APP.GLOBAL.toastMsg(this.language.PLS_IPT_NEW_PWD);//'請輸入新的交易密碼'
            } else if (this.form.password.length < 6) {
                APP.GLOBAL.toastMsg(this.language.NEW_PWD_MUST_MORE_CHARS); //'新的交易密碼必須大於6位'
            } else if (!this.confirmPassword) {
                APP.GLOBAL.toastMsg(this.language.CONFIRM_NEW_PWD);//'請重複輸入新的交易密碼'
            } else if (this.form.password !== this.confirmPassword) {
                APP.GLOBAL.toastMsg(this.language.TWO_PWD_MUST_SAME);//'兩次新的交易密碼不一致'
            } else if (!this.form.answer) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else if (!this.form.idcard) {
                APP.GLOBAL.toastMsg(this.language.ERROR_7);
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading(this.language.SUBMIT_PROGRESSING); //'正在提交'

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ChangeTransactionPassword',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (_vue.request.fp) {
                        var homePage = plus.webview.getWebviewById('home.htmlPage');
                        if (homePage !== null) {
                            homePage.evalJS('_vue.addResetCount("trans")');
                        }
                    }

                    APP.GLOBAL.gotoNewWindow('change.successPage', 'change.success', {
                        param: 'title=' + encodeURIComponent(_vue.language.MODIFY_TYPE) +
                            '&text=' + encodeURIComponent(_vue.language.MODIFY_SUCCESS),
                        openCallback: function () {
                            var firstLoginScreen = plus.webview.getWebviewById('first.loginPage');
                            if (firstLoginScreen !== null) {
                                firstLoginScreen.evalJS('_vue.resetItem("FIRST_LOGIN_RESETPIN_KEY")');
                            }

                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        },
        'loadPageData': function () {
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
            });
        },
        'changeLanguage': function () {
            LSE.install('change.pin', function (lang) {
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