var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'myQuestions': {
            'Q1': '',
            'Q2': '',
            'Q3': ''
        },
        'questionList': [],
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'getQuestionText': function (qId) {
            for (var i = 0; i < this.questionList.length; i++) {
                if (this.questionList[i].Id === qId) return this.questionList[i].Question;
            }

            return null;
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'GetMyQuestion',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.currentUser.IsSetSecurityQuestion = result.IsSet;
                    APP.GLOBAL.updateUserModel({
                        'IsSetSecurityQuestion': result.IsSet
                    });
                    _vue.myQuestions.Q1 = result.Q1;
                    _vue.myQuestions.Q2 = result.Q2;
                    _vue.myQuestions.Q3 = result.Q3;

                    _vue.loadQuestionList();
                }
            });
        },
        'loadQuestionList': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'QuestionList',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.questionList = result.Data.List;
                    _vue.isLoading = false;
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('security', function (lang) {
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