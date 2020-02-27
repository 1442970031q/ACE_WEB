var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isShowConfirmPayPassword': false,
        'isComplaintShow': false,
        'isProofShow': false,
        'tabActive': 0,
        'form': {
            'sId': '',
            'password': '',
            'remark': ''
        },
        'flag': {
            'jpg': 'data:image/jpeg;base64,',
            'png': 'data:image/png;base64,'
        },
        'tabControl': [{
            'isLoadMore': false,
            'isLoadComplete': false,
            'isLoading': true,
            'isLoaded': true,
            'list': [],
            'pageIndex': 1,
            'pageSize': 15,
            'loadAction': 'loadBuyData'
        }, {
            'isLoadMore': false,
            'isLoadComplete': false,
            'isLoading': true,
            'isLoaded': false,
            'list': [],
            'pageIndex': 1,
            'pageSize': 15,
            'loadAction': 'loadSellData'
        }],
        'proofObject': {
            'imageUrl': '',
            'entry': null,
            'remark': ''
        },
        'language': {},
        'statusbarHeight': 0
    },
    methods: {
        'checkProofData': function () {
            if (!this.proofObject.imageUrl) {
                APP.GLOBAL.toastMsg(this.language.ERROR_4);
            } else if (!this.proofObject.remark) {
                APP.GLOBAL.toastMsg(this.language.ERROR_5);
            } else {
                this.isProofShow = false;
                this.doProofDataAjax();
            }
        },
        'doProofDataAjax': function () {
            APP.GLOBAL.toastLoading(this.language.PROOF_TOAST);

            var reader = new FileReader();
            reader.onloadend = this.proofFileLoaded;
            reader.onerror = function (e) {
                APP.GLOBAL.closeToastLoading();
                APP.GLOBAL.toastMsg(e.message);
            };

            reader.readAsDataURL(this.proofObject.entry);
        },
        'proofFileLoaded': function (e) {
            var result = e.target.result.toString();
            var base64 = '';
            if (result.startWith(this.flag.png)) {
                base64 = result.replace(this.flag.png, '');
            } else {
                base64 = result.replace(this.flag.jpg, '');
            }

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + (this.tabActive === 0 ? 'UploadPaymentRecord' : 'UploadReceiveRecord'),
                data: {
                    'base64AvatarImage': encodeURIComponent(base64),
                    'sId': this.form.sId,
                    'remark': this.proofObject.remark
                },
                timeout: 120000,
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.proofObject.imageUrl = '';
                    _vue.proofObject.entry = null;
                    _vue.proofObject.remark = '';

                    var tab = _vue.tabControl[_vue.tabActive];
                    _vue[tab.loadAction]();
                    _vue.$toast.success(_vue.language.PROOF_SUCCESS);
                }
            });
        },
        'closeProof': function () {
            this.isProofShow = false;
            this.proofObject.imageUrl = '';
            this.proofObject.entry = null;
            this.proofObject.remark = '';
            this.form.sId = 0;
        },
        'fileChanged': function (e) {
            if (e.target.files.length === 0) return;

            var file = e.target.files[0];
            var index = file.name.lastIndexOf('.');
            if (index === -1) {
                APP.GLOBAL.toastMsg(this.language.ERROR_7);
                return;
            }

            var ext = file.name.substring(index + 1);
            if (ext.toLowerCase() !== 'png' && ext.toLowerCase() !== 'jpg') {
                APP.GLOBAL.toastMsg(this.language.ERROR_7);
                return;
            }

            if (file.size > 5 * (1024 * 1024)) {
                APP.GLOBAL.toastMsg(this.language.ERROR_6);
                return;
            }

            var reader = new FileReader();
            reader.onloadend = function (events) {
                _vue.proofObject.imageUrl = events.target.result;
            };

            reader.readAsDataURL(file);
            this.proofObject.entry = file;
        },
        'showProof': function (item) {
            this.form.sId = item.Id;
            this.isProofShow = true;
        },
        'showComplaint': function (item) {
            this.form.sId = item.Id;
            this.form.remark = '';
            this.isComplaintShow = true;
        },
        'checkComplaintData': function () {
            if (!this.form.remark) {
                APP.GLOBAL.toastMsg(this.language.ERROR_3);
            } else {
                this.isComplaintShow = false;
                this.doComplaintAjax();
            }
        },
        'doComplaintAjax': function () {
            APP.GLOBAL.toastLoading(this.language.COMPLAINT_TOAST_TEXT);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'TransferFailed',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    var tab = _vue.tabControl[_vue.tabActive];
                    _vue[tab.loadAction]();
                    _vue.$toast.success(_vue.language.COMPLAINT_SUCCESS);
                }
            });
        },
        'cancelSell': function (item) {
            APP.GLOBAL.confirmMsg({
                'title': this.language.CANCEL_SELL_TITLE,
                'message': this.language.CANCEL_SELL_MESSAGE,
                'confirmCallback': function () {
                    APP.GLOBAL.toastLoading(_vue.language.CANCEL_SELL_TOAST_TEXT);

                    APP.GLOBAL.ajax({
                        url: APP.CONFIG.BASE_URL + 'CancelSell',
                        data: {
                            'sId': item.Id
                        },
                        success: function (result) {
                            if (result.Error) {
                                APP.GLOBAL.closeToastLoading();
                                APP.GLOBAL.toastMsg(result.Msg);
                                return;
                            }

                            _vue.loadSellData();
                            _vue.$toast.success(_vue.language.CANCEL_SELL_SUCCESS);
                        }
                    });
                }
            });
        },
        'cancelBuy': function (item) {
            APP.GLOBAL.confirmMsg({
                'title': this.language.CANCEL_CONFIRM_TITLE,
                'message': this.language.CANCEL_CONFIRM_MESSAGE,
                'confirmCallback': function () {
                    APP.GLOBAL.toastLoading(_vue.language.CANCEL_TOAST_TEXT);

                    APP.GLOBAL.ajax({
                        url: APP.CONFIG.BASE_URL + 'CancelBuy',
                        data: {
                            'sId': item.Id
                        },
                        success: function (result) {
                            APP.GLOBAL.closeToastLoading();
                            if (result.Error) {
                                APP.GLOBAL.toastMsg(result.Msg);
                                return;
                            }

                            _vue.loadBuyData();
                            _vue.$toast.success(_vue.language.CANCEL_SUCCESS);
                        }
                    });
                }
            });
        },
        'confirmPay': function (item) {
            this.form.sId = item.Id;
            this.form.password = '';
            this.isShowConfirmPayPassword = true;

            setTimeout(function () {
                _vue.$refs['passwordBox'].focus();
            }, 300);
        },
        'checkConfirmPayPassword': function (action, done) {
            if (action !== 'confirm') {
                done();
                return;
            }

            if (!this.form.password) {
                done(false);
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else if (this.form.password.length < 6) {
                done(false);
                APP.GLOBAL.toastMsg(this.language.ERROR_2);
            } else {
                done();

                this.doConfirmSubmitAjax();
            }
        },
        'doConfirmSubmitAjax': function () {
            APP.GLOBAL.toastLoading(this.language.CONFIRM_PAY_TOAST);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ConfirmPayment',
                data: this.form,
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.loadBuyData();
                    _vue.$toast.success(_vue.language.CONFIRM_PAY_SUCCESS);
                }
            });
        },
        'confirmReceive': function (item) {
            APP.GLOBAL.confirmMsg({
                'title': this.language.CONFIRM_RECEIVE_TITLE,
                'message': this.language.CONFIRM_RECEIVE_MESSAGE,
                'confirmCallback': function () {
                    _vue.form.sId = item.Id;
                    _vue.doConfirmReceiveAjax();
                }
            });
        },
        'doConfirmReceiveAjax': function () {
            APP.GLOBAL.toastLoading(this.language.RECEIVE_TOAST_TEXT);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ConfirmReceive',
                data: this.form,
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.loadSellData();
                    _vue.$toast.success(_vue.language.CONFIRM_RECEIVE_SUCCESS);
                }
            });
        },
        'getBuyTime': function (item) {
            var reg = new RegExp('/', 'g');
            var s = item.BuyTime.replace(reg, '');
            var buyTime = eval('(new ' + s + ')');

            return buyTime.getHours() + ':' + buyTime.getMinutes();
        },
        'getTimeout': function (item) {
            var reg = new RegExp('/', 'g');
            var s = item.BuyTime.replace(reg, '');
            var buyTime = eval('(new ' + s + ')');
            buyTime.setMinutes(buyTime.getMinutes() + item.LimitPayment);

            return buyTime.getMonth() + 1 + '/' + buyTime.getDate() + ' ' + buyTime.getHours() + ':' + buyTime.getMinutes();
        },
        'getPaymentTime': function (item) {
            if (item.PayTime) {
                var reg = new RegExp('/', 'g');
                var s = item.PayTime.replace(reg, '');
                var payTime = eval('(new ' + s + ')');

                return payTime.getMonth() + 1 + '/' + payTime.getDate() + ' ' + payTime.getHours() + ':' + payTime.getMinutes();
            } else {
                return '未付款';
            }
        },
        'isTimeout': function (item) {
            var reg = new RegExp('/', 'g');
            var s = item.BuyTime.replace(reg, '');
            var buyTime = eval('(new ' + s + ')');
            buyTime.setMinutes(buyTime.getMinutes() + item.LimitPayment);

            return new Date() > buyTime;
        },
        'gotoSellInfo': function (item) {
            APP.GLOBAL.gotoNewWindow('seller.infoPage', 'child/seller.info', {
                'param': 'sId=' + item.Id
            });
        },
        'tabChange': function (index) {
            var tab = this.tabControl[index];
            if (!tab.isLoaded) {
                tab.isLoaded = true;
                this[tab.loadAction]();
            }
        },
        'loadBuyData': function () {
            this.tabControl[0].pageIndex = 1;
            this.tabControl[0].isLoading = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyEPBuyRecords',
                data: {
                    'p': this.tabControl[0].pageIndex,
                    'pageSize': this.tabControl[0].pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.tabControl[0].pageIndex++;
                    _vue.tabControl[0].list = result.Data.List;
                    _vue.tabControl[0].isLoading = false;
                }
            });
        },
        'loadSellData': function () {
            this.tabControl[1].pageIndex = 1;
            this.tabControl[1].isLoading = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'MyEPSellRecords',
                data: {
                    'p': this.tabControl[1].pageIndex,
                    'pageSize': this.tabControl[1].pageSize
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.tabControl[1].pageIndex++;
                    _vue.tabControl[1].list = result.Data.List;
                    _vue.tabControl[1].isLoading = false;
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('business.center', function (lang) {
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
        this.loadBuyData();
    }
});