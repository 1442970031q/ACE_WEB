var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'searchKey': '',
        'isLoading': true,
        'isFirst': true,
        'isShowTip': false,
        'isFocus': false,
        'showAgainCheckValue': false,
        'isEmptyParent': false,
        'layer': {
            'FirstLayer': {},
            'SecondLayer': [{
                'Id': 0
            }, {
                'Id': 0
            }],
            'ThirdLayer': []
        },
        'historyList': [],
        'currentFlowNumber': '',
        'currentNFlow': '',
        'language': {},
        'statusbarHeight': 0
    },
    methods: {
        'gotoUpLayer': function () {
            this.currentFlowNumber = this.currentNFlow;
            this.loadPageData();
        },
        'gotoBack': function () {
            var index = this.historyList.length - 1;
            var flowNumber = this.historyList[index];
            this.historyList.splice(index, 1);
            this.currentFlowNumber = flowNumber;

            this.loadPageData();
        },
        'reportByNew': function (item) {
            APP.GLOBAL.toastLoading({ 'message': this.language.READY_DATA }); //'正在準備數據'

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'GetNodalPerson',
                data: {
                    'nId': item.NodalPersonId
                },
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.gotoNewWindow('new.reportPage', 'new.report', {
                        param: 'rId=' + item.NodalPersonId +
                            '&display=' + result.Data.FlowNumber +
                            '&parentDisplay=' + encodeURIComponent(result.Data.NickName + '(' + result.Data.FlowNumber + ')') +
                            '&fromTree=true' +
                            '&pos=' + item.Position,
                        openCallback: function () {
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        },
        'reportBySub': function (item) {
            APP.GLOBAL.toastLoading({ 'message': this.language.AUDIT_RULES }); //'正在檢查規則'

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'IsCanSonDeclarationForm',
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (!result.CanCreate) {
                        _vue.$dialog.alert({
                            'message': _vue.language.AUDIT_FAIL_MESSAGE_1 + result.CanCreateDate + _vue.language.AUDIT_FAIL_MESSAGE_2,
                            'title': _vue.language.AUDIT_FAIL
                        });
                        return;
                    }

                    var parentNode = _vue.getDisplay(item.NodalPersonId);
                    APP.GLOBAL.gotoNewWindow('new.subaccountPage', 'new.subaccount', {
                        param: 'fromTree=true' +
                            '&parentId=' + item.NodalPersonId +
                            '&display=' + parentNode.FlowNumber +
                            '&parentDisplay=' + encodeURIComponent(parentNode.NickName + '(' + parentNode.FlowNumber + ')') +
                            '&pos=' + item.Position,
                        openCallback: function () {
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        },
        'getDisplay': function (pId) {
            if (this.layer.FirstLayer.Id === pId)
                return {
                    'NickName': this.layer.FirstLayer.NickName,
                    'FlowNumber': this.layer.FirstLayer.FlowNumber
                };

            for (var i = 0; i < this.layer.SecondLayer.length; i++) {
                if (this.layer.SecondLayer[i].Id === pId) {
                    return {
                        'NickName': this.layer.SecondLayer[i].NickName,
                        'FlowNumber': this.layer.SecondLayer[i].FlowNumber
                    };
                }
            }

            return null;
        },
        'loadList': function (item) {
            this.historyList.push(this.currentFlowNumber);
            this.currentFlowNumber = item.FlowNumber;

            this.loadPageData();
        },
        'myLeftDown': function () {
            APP.GLOBAL.toastLoading({ 'message': this.language.SEARCHING }); //'正在搜索'

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'GetLowerLeft',
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (_vue.currentFlowNumber !== result.FlowNumber) {
                        _vue.historyList.push(_vue.currentFlowNumber);
                        _vue.currentFlowNumber = result.FlowNumber;
                        _vue.loadPageData();
                    }
                }
            });
        },
        'onSearch': function () {
            if (!this.searchKey) {
                APP.GLOBAL.toastMsg(this.language.INPUT_PLAYER_ID);// '請輸入玩家ID'
            } else if (!/^\d+$/.test(this.searchKey) || this.searchKey.length < 5) {
                APP.GLOBAL.toastMsg(this.language.PLAYER_ID_RULES); //'玩家ID只能是整數且最少5位'
            } else {
                this.historyList.push(this.currentFlowNumber);
                this.currentFlowNumber = this.searchKey;

                this.loadPageData();
            }
        },
        'loadPageData': function () {
            this.isLoading = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'RelationList',
                data: {
                    'id': this.currentFlowNumber
                },
                success: function (result) {
                    if (result.Error) {
                        var index = _vue.historyList.length - 1;
                        _vue.historyList.splice(index, 1);
                        _vue.isLoading = false;

                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.currentNFlow = result.Data.nFlow;
                    _vue.layer = Object.assign(_vue.layer, result.Data);
                    _vue.isEmptyParent = _vue.isThirdLayerNotEmpty();
                    _vue.isLoading = false;

                    if (_vue.isFirst && _vue.isShowAgain) {
                        _vue.isFirst = false;
                        _vue.isShowTip = true;
                    }
                }
            });
        },
        'isThirdLayerNotEmpty': function () {
            for (var i = 0; i < _vue.layer.ThirdLayer.length; i++) {
                if (_vue.layer.ThirdLayer[i].NodalPersonId !== 0) return true;
            }

            return false;
        },
        'changeLanguage': function () {
            LSE.install('my.fans.list', function (lang) {
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
        this.currentFlowNumber = this.currentUser.FlowNumber;
        this.loadPageData();
    }
});