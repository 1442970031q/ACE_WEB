var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'pageModel': {},
        'displayAmount': '',
        'form': {
            'amount': ''
        },
        'language': {},
        'statusbarHeight': 0
    },
    methods: {
        'onInput': function (value) {
            if (value === '.' && this.form.amount.indexOf('.') !== -1) {
                return;
            }

            this.form.amount += value;
        },
        'onDelete': function () {
            this.form.amount = this.form.amount.slice(0, this.form.amount.length - 1);
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'USDTCalc',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    Vue.set(_vue, 'pageModel', result.Data);
                    _vue.isLoading = false;
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('recharge.calc', function (lang) {
                Vue.set(_vue, 'language', lang);
            });
        }
    },
    watch: {
        'form.amount': function (value) {
            if (!value || value <= 0) return;

            this.displayAmount = numberFormat(value * this.pageModel.RPPrice / this.pageModel.USDTPrice, 2);
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }

        this.changeLanguage();
    },
    mounted: function () {
        this.loadPageData();
    }
});