var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'isShow': false,
        'questionList': [],
        'currnetQuestionList': [],
        'questionIndex': 0,
        'questionDisplay': '',
        'display': {
            'q1': '請選擇您的問題1',
            'q2': '請選擇您的問題2',
            'q3': '請選擇您的問題3'
        },
        'form': {
            'q1': '',
            'a1': '',
            'q2': '',
            'a2': '',
            'q3': '',
            'a3': '',
            'password': '',
            'idcard': ''
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'checkInput': function () {
            if (!this.form.q1) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1); //'請選擇問題1'
            } else if (!this.form.a1) {
                APP.GLOBAL.toastMsg(this.language.ERROR_2);//'請輸入問題1的答案'
            } else if (!this.form.q2) {
                APP.GLOBAL.toastMsg(this.language.ERROR_3); //'請選擇問題2'
            } else if (!this.form.a2) {
                APP.GLOBAL.toastMsg(this.language.ERROR_4);//'請輸入問題2的答案'
            } else if (!this.form.q3) {
                APP.GLOBAL.toastMsg(this.language.ERROR_5);// '請選擇問題3'
            } else if (!this.form.a3) {
                APP.GLOBAL.toastMsg(this.language.ERROR_6);//'請輸入問題3的答案'
            } else if (!this.form.password) {
                APP.GLOBAL.toastMsg(this.language.ERROR_7); //'請輸入當前登錄密碼'
            } else if (this.form.password.length < 6) {
                APP.GLOBAL.toastMsg(this.language.ERROR_8); //'交易密碼最少6位'
            } else if (!this.form.idcard) {
                APP.GLOBAL.toastMsg(this.language.ERROR_9);
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': this.language.TOAST_TEXT });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ForgetQA',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.gotoNewWindow('change.successPage', 'change.success', {
                        param: 'title=' + encodeURIComponent(_vue.language.RESET_TITLE) +
                            '&text=' + encodeURIComponent(_vue.language.RESET_TEXT),
                        openCallback: function () {
                            var firstLoginScreen = plus.webview.getWebviewById('first.loginPage');
                            if (firstLoginScreen !== null) {
                                firstLoginScreen.evalJS('_vue.resetItem("FIRST_LOGIN_QUESTION_KEY")');
                            }

                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        },
        'loadQuestionList': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'QuestionList',
                success: function (result) {
                    if (result.Error) {
                        toastMsg(result.Msg);
                        return;
                    }

                    for (var i = 0; i < result.Data.List.length; i++) {
                        _vue.questionList.push({
                            'text': result.Data.List[i].Question,
                            'value': result.Data.List[i].Id
                        });
                    }
                    _vue.isLoading = false;
                }
            });
        },
        'selectedItem': function (item) {
            this.isShow = false;

            var key = 'q' + this.questionIndex;
            this.display[key] = item.text;
            this.form[key] = item.value;
        },
        'chooseQuestion': function (index) {
            this.questionIndex = index;
            this.currnetQuestionList = [];
            for (var i = 0; i < this.questionList.length; i++) {
                var item = this.questionList[i];
                if (item.value !== this.form.q1
                    && item.value !== this.form.q2
                    && item.value !== this.form.q3) {
                    this.currnetQuestionList.push(this.questionList[i]);
                }
            }

            this.isShow = true;
        },
        'changeLanguage': function () {
            LSE.install('reset.question', function (lang) {
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
        this.loadQuestionList();
    }
});