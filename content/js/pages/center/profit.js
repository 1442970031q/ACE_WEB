var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'statusbarHeight': 0,
        'language': {},
        'isShowDateTime': false,
        'isSearchMode': false,
        'dateTimeObj': {
            'display': '',
            'value': new Date(),
            'minDate': new Date(2018, 0),
            'maxDate': new Date(new Date().getFullYear() + ' ' + (new Date().getMonth() + 2)),
            'isLoading': false,
            'month': ''
        },
        'result': {
            'MonthTotalMoney': '',
            'FirstWeek': '',
            'SecondWeek': '',
            'ThirdWeek': '',
            'FourWeek': '',
            'FiveWeek': ''
        }
    },
    methods: {
        'gotoDetail': function (weekIndex) {
            APP.GLOBAL.gotoNewWindow('profit.weekPage', 'child/profit.week', {
                'param': 'wIndex=' + weekIndex +
                    '&year=' + this.dateTimeObj.value.getFullYear() +
                    '&month=' + (this.dateTimeObj.value.getMonth() + 1)
            });
        },
        'confirmDateTime': function (value) {
            this.isShowDateTime = false;

            this.dateTimeObj.value = value;
            var y = value.getFullYear();
            var m = value.getMonth() ;

            if (y === new Date().getFullYear() && m === (new Date().getMonth() + 2)) {
                m = value.getMonth();
            } else {
                m = value.getMonth() + 1;
            }

            this.dateTimeObj.month = m;
            this.dateTimeObj.display = y + ' / ' + m;
            this.loadDataByDate(y, m);
        },
        'loadDataByDate': function (y, m) {
            this.isSearchMode = true;
            this.dateTimeObj.isLoading = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'EPAward',
                data: {
                    'year': y,
                    'month': m
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    Vue.set(_vue, 'result', result.Data);
                    _vue.dateTimeObj.isLoading = false;
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('profit', function (lang) {
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