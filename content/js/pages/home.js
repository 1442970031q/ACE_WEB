var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'isLoadChart': true,
        'isReloading': false,
        'isNoticeShow': false,
        'statusbarHeight': 0,
        'pageModel': {
            'lastNotice': {},
            'currentStockPrice': 0,
            'realData': {
                'TotalBuyCount': 0,
                'TotalBuyMoney': 0,
                'TotalSellAce': 0,
                'TotalSellCount': 0
            },
            'profitData': {
                'CurrentACEPrice': 0,
                'Percent': 0
            }
        },
        'menus': [{
            'index': 0,
            'text': '首頁',
            'default': 'iconhome',
            'active': 'iconhomefill',
            'url': '#'
        }, {
            'index': 1,
            'text': 'ACE交易',
            'default': 'iconpuke',
            'active': 'iconpuke_fill',
            'url': 'ace.list.html'
        }, {
            'index': 2,
            'text': 'EP交易',
            'default': 'iconjiaoyi',
            'active': 'iconjiaoyi_fill',
            'url': 'ep.list.html'
        }, {
            'index': 3,
            'text': '我的',
            'default': 'iconmy',
            'active': 'iconmyfill',
            'url': 'center.html'
        }],
        'currentIndex': 0,
        'language': {}
    },
    methods: {
        'firstScreen': function () {
            this.isNoticeShow = true;
        },
        'gotoNotice': function () {
            APP.GLOBAL.gotoNewWindow('last.notice.detailPage', 'subpages/last.notice.detail', {
                'param': 'nId=' + this.pageModel.lastNotice.Id
            });
        },
        'updateUserModel': function () {
            Vue.set(this, 'currentUser', APP.GLOBAL.getUserModel());
        },
        'gotoQueue': function () {
            APP.GLOBAL.gotoNewWindow('queuePage', 'subpages/queue');
        },
        'onRefresh': function () {
            setTimeout(this.loadPageData, 500);
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'IndexData',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (APP.GLOBAL.queryString('first')) {
                        _vue.firstScreen();
                    }

                    APP.GLOBAL.updateUserModel({
                        'ACECount': result.Data.ACECount,
                        'TotalACE': result.Data.TotalACE,
                        'WeeklyMoney': result.Data.WeeklyMoney,
                        'EP': result.Data.EP,
                        'RP': result.Data.RP,
                        'AP': result.Data.AP,
                        'SP': result.Data.SP,
                        'HonorName': result.Data.HonorName,
                        'Credit': result.Data.Credit,
                        'IsService': result.Data.IsService,
                        'TotalSellAce': result.Data.RealData.TotalSellAce,
                        'WithdrawExchangeRate': result.Data.WithdrawExchangeRate,
                        'CurrentStockPrice': result.Data.CurrentStockPrice
                    });

                    _vue.currentUser = APP.GLOBAL.getUserModel();

                    _vue.pageModel.lastNotice = Object.assign({}, _vue.pageModel.lastNotice, result.Data.NoticeList);
                    _vue.pageModel.currentStockPrice = result.Data.CurrentStockPrice;
                    _vue.pageModel.realData = Object.assign({}, _vue.pageModel.realData, result.Data.RealData);
                    _vue.pageModel.profitData = Object.assign({}, _vue.pageModel.profitData, result.Data.ProfitData);
                    _vue.calculateProfit();
                    _vue.isLoading = false;
                    _vue.isReloading = false;

                    _vue.loadHighCharts();
                }
            });
        },
        'calculateProfit': function () {
            if (!this.pageModel.profitData.IsJoin) {
                this.pageModel.profitData.Percent = 0;
                this.pageModel.profitData.CurrentACEPrice = '0.00';
                return;
            }

            var aceCount = this.pageModel.profitData.BuyAmount / this.pageModel.profitData.BuyACEPrice * (this.pageModel.profitData.ACEMatchRate / 100);
            var capital = aceCount * this.pageModel.profitData.BuyACEPrice;

            if (this.currentUser.ACECount <= 0) {//已經離場
                var exitPercentSum = (this.pageModel.profitData.TotalSelledAce - capital) / capital * 100;
                this.pageModel.profitData.Percent = exitPercentSum.toFixed(0);
                this.pageModel.profitData.CurrentACEPrice = numberFormat(0, 3);
            } else {//未離場
                var currentStock = this.currentUser.ACECount * this.pageModel.currentStockPrice;
                var percentSum = (this.pageModel.profitData.TotalSelledAce + currentStock - capital) / capital * 100;

                this.pageModel.profitData.Percent = percentSum.toFixed(0);
                this.pageModel.profitData.CurrentACEPrice = numberFormat(currentStock, 3);
            }
        },
        'loadHighCharts': function () {
            this.isLoadChart = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'StockPriceTrend',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    var chartData = [];
                    for (var i = 0; i < result.Data.length; i++) {
                        chartData.push([result.Data[i].Key, result.Data[i].Value]);
                    }

                    _vue.isLoadChart = false;
                    _vue.$nextTick(function () {
                        _vue.createHighcharts(chartData);
                    });
                }
            });
        },
        'createHighcharts': function (chartData) {
            Highcharts.chart('container', {
                chart: { zoomType: 'x' },
                credits: { enabled: false },
                title: { text: '' },
                subtitle: { text: '' },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        second: '%H:%M:%S',
                        minute: '%H:%M',
                        hour: '%H:%M',
                        day: '%m-%d',
                        week: '%m-%d',
                        month: '%Y-%m',
                        year: '%Y'
                    }
                },
                tooltip: {
                    formatter: function () {
                        var d = new Date(this.x);
                        return '<p>' + (d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate()) + '</p>' +
                            '<br/><p>' + this.series.name + '：<b>' + numberFormat(this.y, 3) + '</b></p>';
                    }
                },
                yAxis: { title: { text: '' } },
                legend: { enabled: false },
                plotOptions: {
                    area: {
                        fillColor: {
                            linearGradient: {
                                x1: 0,
                                y1: 0,
                                x2: 0,
                                y2: 1
                            },
                            stops: [
                                [0, Highcharts.getOptions().colors[0]],
                                [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                            ]
                        },
                        marker: { radius: 2 },
                        lineWidth: 1,
                        states: {
                            hover: { lineWidth: 1 }
                        },
                        threshold: null
                    }
                },
                series: [{
                    type: 'area',
                    name: this.language.BLOCK_4_TEXT_2,
                    data: chartData
                }]
            });
        },
        'padLeft': function (s, len) {
            if (s < 10) return '0' + s.toString();
            return s;
        },
        'changeLanguage': function () {
            LSE.install('home', function (lang) {
                Vue.set(_vue, 'language', lang);
            });
        }
    },
    computed: {
        'updateTime': function () {
            var d = new Date();
            var h = this.padLeft(d.getHours());
            var m = this.padLeft(d.getMinutes());
            var s = this.padLeft(d.getSeconds());
            return h + ':' + m + ':' + s;
        },
        'joinCapital': function () {
            if (!this.pageModel.profitData.IsJoin)
                return numberFormat(this.pageModel.profitData.BuyAmount * (this.pageModel.profitData.ACEMatchRate / 100), 3);

            var aceCount = this.pageModel.profitData.BuyAmount / this.pageModel.profitData.BuyACEPrice * (this.pageModel.profitData.ACEMatchRate / 100);
            return numberFormat(aceCount * this.pageModel.profitData.BuyACEPrice, 3);
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

function closeNotice() {
    _vue.isNoticeShow = false;
}