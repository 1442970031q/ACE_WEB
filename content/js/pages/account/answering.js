var _vue = new Vue({
    el: '#app',
    data: {
        'isLoading': true,
        'questionList': [],
        'paramObject': {},
        'form': {
            'account': '',
            'q1': '',
            'a1': '',
            'q2': '',
            'a2': '',
            'q3': '',
            'a3': ''
        },
        'language': {},
        'statusbarHeight': 0
    },
    methods: {
        'checkInput': function () {
            if (!this.form.a1) {
                APP.GLOBAL.toastMsg(this.language.CHECK_MESSAGE_1);
            } else if (!this.form.a2) {
                APP.GLOBAL.toastMsg(this.language.CHECK_MESSAGE_2);
            } else if (!this.form.a3) {
                APP.GLOBAL.toastMsg(this.language.CHECK_MESSAGE_3);
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': this.language.SUBMIT_TEXT });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ValidateQuestion',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                    } else {
                        APP.GLOBAL.gotoNewWindow('reset.passwordPage', 'reset.password', {
                            param: 'account=' + encodeURIComponent(_vue.paramObject.account) +
                                '&ct=' + _vue.paramObject.changeType,
                            openCallback: function () {
                                APP.GLOBAL.closeWindow('none');
                            }
                        });
                    }
                }
            });
        },
        'getQuestionText': function (qId) {
            for (var i = 0; i < this.questionList.length; i++) {
                if (this.questionList[i].Id === qId) return this.questionList[i].Question;
            }

            if (APP.CONFIG.IS_RUNTIME) {
                plus.nativeUI.alert(this.language.ERROR_TEXT_1, function () {
                    APP.GLOBAL.closeWindow();
                }, this.language.ERROR_TITLE_1);
            }
        },
        'loadQuestionList': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'QuestionList',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (result.Data.List.length === 0) {
                        plus.nativeUI.alert(_vue.language.ERROR_TEXT_2, function () {
                            APP.GLOBAL.closeWindow();
                        }, _vue.language.ERROR_TITLE_2);
                        return;
                    }

                    _vue.questionList = result.Data.List;
                    _vue.isLoading = false;
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('answering', function (lang) {
                Vue.set(_vue, 'language', lang);
            });
        }
    },
    created: function () {
        this.changeLanguage();

        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();

            var wb = plus.webview.currentWebview();
            this.paramObject = wb.paramObject.form;

            this.form.account = this.paramObject.account;
            this.form.q1 = this.paramObject.Q1;
            this.form.q2 = this.paramObject.Q2;
            this.form.q3 = this.paramObject.Q3;
        }
    },
    mounted: function () {
        this.loadQuestionList();
    }
});