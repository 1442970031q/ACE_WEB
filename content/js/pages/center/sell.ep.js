var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'tabIndex': 0,
        'isConfirmAmountShow': false,
        //'isPaymentTimeShow': false,
        //'isConfirmTimeShow': false,
        'isConfirmDialogShow': false,
        'isTipShow': false,
        'isLoadingBank': true,
        'isBankNameShow': false,
        'statusbarHeight': 0,
        'display': {
            'amountText': '',
            //'payTimeText': '',
            //'confirmTimeText': '',
            'bankNumberFormat': '---- ---- ---- ---- ---',
            'convertAmountDisplay': 0,
            'questionText': ''
        },
        'bankNameList': [],
        'epList': [],
        //'paymentTimeList': [],
        //'confirmTimeList': [],
        'form': {
            'epAmount': 0,
            //'limitConfirm': 0,
            //'limitPayment': 0,
            'qId': 0,
            'answer': '',
            'idcard': '',
            'password': '',
            'bankNumber': '',
            'phone': '',
            'bankName': '',
            'bankBranchName': '',
            'usdtAddress': '',
            'receiveType': 1,
            'gCode': ''
        },
        'language': {}
    },
    methods: {
        'selectedBankItem': function (item) {
            this.form.bankName = item.Name;
            this.isBankNameShow = false;
        },
        'tabChanged': function (index) {
            this.form.receiveType = index + 1;
        },
        'checkData': function () {
            if (!this.form.epAmount) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
                return;
            }

            if (this.form.epAmount * 1 > this.currentUser.EP * 1) {
                APP.GLOBAL.toastMsg(this.language.ERROR_2);
                return;
            }

            //if (this.form.limitPayment <= 0) {
            //    APP.GLOBAL.toastMsg(this.language.ERROR_3);
            //    return;
            //}

            //if (this.form.limitConfirm <= 0) {
            //    APP.GLOBAL.toastMsg(this.language.ERROR_4);
            //    return;
            //}

            if (!this.form.phone || this.form.phone.length !== 11) {
                APP.GLOBAL.toastMsg(this.language.ERROR_9);
                return;
            }

            if (this.form.receiveType === 1) {
                if (!this.form.bankName) {
                    APP.GLOBAL.toastMsg(this.language.ERROR_11);
                    return;
                }

                //if (!this.form.bankBranchName) {
                //    APP.GLOBAL.toastMsg(this.language.ERROR_12);
                //    return;
                //}

                if (!this.form.bankNumber) {
                    APP.GLOBAL.toastMsg(this.language.ERROR_10);
                    return;
                }
            } else if (this.form.receiveType === 2) {
                if (!this.form.usdtAddress) {
                    APP.GLOBAL.toastMsg(this.language.ERROR_13);
                    return;
                } else if (this.form.usdtAddress.length < 20) {
                    APP.GLOBAL.toastMsg(this.language.ERROR_14);
                    return;
                }
            }

            if (!this.form.answer) {
                APP.GLOBAL.toastMsg(this.language.ERROR_7);
                return;
            }

            if (!this.form.idcard) {
                APP.GLOBAL.toastMsg(this.language.ERROR_8);
                return;
            }

            if (!this.form.password) {
                APP.GLOBAL.toastMsg(this.language.ERROR_5);
                return;
            }

            if (this.form.password.length < 6) {
                APP.GLOBAL.toastMsg(this.language.ERROR_6);
                return;
            }

            if (!this.form.gCode) {
                APP.GLOBAL.toastMsg(this.language.ERROR_15);
                return;
            }

            if (this.form.gCode.length < 6) {
                APP.GLOBAL.toastMsg(this.language.ERROR_16);
                return;
            }

            this.form.bankBranchName = this.form.bankName;
            this.isConfirmDialogShow = true;
        },
        'doSubmitAjax': function () {
            this.isConfirmDialogShow = false;
            APP.GLOBAL.toastLoading(this.language.TOAST_TEXT);
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'EPSell',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.updateUserModel({
                        'EP': _vue.currentUser.EP - _vue.form.epAmount
                    });

                    APP.GLOBAL.gotoNewWindow('change.successPage', 'security/change.success', {
                        param: 'title=' + encodeURIComponent(_vue.language.SELL_SUCCESS_TITLE) +
                            '&text=' + encodeURIComponent(_vue.language.SELL_SUCCESS_TEXT),
                        openCallback: function () {
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        },
        //'selectedPaymentTimeItem': function (item) {
        //    this.isPaymentTimeShow = false;
        //    this.display.payTimeText = item.text;
        //    this.form.limitPayment = item.value;
        //},
        //'selectedConfirmTimeItem': function (item) {
        //    this.isConfirmTimeShow = false;
        //    this.display.confirmTimeText = item.text;
        //    this.form.limitConfirm = item.value;
        //},
        'confirmAmount': function (item) {
            this.isConfirmAmountShow = false;
            this.display.amountText = item.text;
            this.form.epAmount = item.value;
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'GetAnswerTitle',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.display.questionText = result.QTitle;
                    _vue.form.qId = result.Qid;
                    _vue.isLoading = false;
                }
            });
        },
        'loadBankName': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'SupportBanks',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.bankNameList = result.Data;
                    _vue.isLoadingBank = false;
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('sell.ep', function (lang) {
                Vue.set(_vue, 'language', lang);

                //var times = [15, 30, 60, 120];
                //for (var i = 0; i < times.length; i++) {
                //    var timeItem = {
                //        'text': times[i] < 60 ? times[i] + _vue.language.TIME_M : times[i] / 60 + _vue.language.TIME_H,
                //        'value': times[i]
                //    };
                //    _vue.paymentTimeList.push(timeItem);
                //    _vue.confirmTimeList.push(timeItem);
                //}

                _vue.display.amountText = _vue.language.INPUT_PLACEHOLDER_1;
                //_vue.display.payTimeText = _vue.language.INPUT_PLACEHOLDER_2;
                //_vue.display.confirmTimeText = _vue.language.INPUT_PLACEHOLDER_3;
            });
        }
    },
    watch: {
        'form.epAmount': function (value) {
            this.display.convertAmountDisplay = this.currentUser.WithdrawExchangeRate * value;
        },
        'form.bankNumber': function (v) {
            if (!v) {
                this.display.bankNumberFormat = '---- ---- ---- ---- ---';
                return;
            }

            var len = v.length / 4 + 1;
            var display = '';
            for (var i = 0; i < len; i++) {
                display += v.substring(i * 4, i * 4 + 4) + ' ';
            }

            this.display.bankNumberFormat = display;
        }
    },
    created: function () {
        this.changeLanguage();

        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }

        for (var i = 150; i <= 1000; i += 50) {
            this.epList.push({
                'text': i + 'EP',
                'value': i
            });
        }
    },
    mounted: function () {
        this.loadPageData();
        this.loadBankName();
    }
});