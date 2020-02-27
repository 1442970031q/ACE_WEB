var sysName = APP.CONFIG.SYSTEM_NAME;

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'searchKey': '',
        'isFocus': false,
        'ajaxURLs': {},
        'isLoading': true,
        'historyList': [],
        'currentFlowNumber': '',
        'currentNFlow': 0,
        'isShow': false,
        'radioType': '1',
        'currentReport': {
            'pId': 0,
            'pos': 0
        },
        'request': {
            'parentId': APP.GLOBAL.queryString('pi')
        },
        'language': {},
        'statusbarHeight': 0
    },
    methods: {
        'myLeftDown': function () {
            APP.GLOBAL.toastLoading({ 'message': this.language.LOADING_TEXT });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'GetLowerLeft',
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (_vue.currentFlowNumber !== result.FlowNumber) {
                        _vue.loadNextLayer(result.FlowNumber);
                    }
                }
            });
        },
        'gotoBack': function () {
            var index = this.historyList.length - 1;
            var flowNumber = this.historyList[index];
            this.historyList.splice(index, 1);
            this.currentFlowNumber = flowNumber;

            this.loadPageData();
        },
        'gotoUpLayer': function () {
            this.currentFlowNumber = this.currentNFlow;
            this.loadPageData();
        },
        'onSearch': function () {
            if (!this.searchKey) {
                APP.GLOBAL.toastMsg(this.language.INPUT_PLAYER_ID);//'請輸入玩家ID'
            } else {
                this.historyList.push(this.currentFlowNumber);
                this.currentFlowNumber = this.searchKey;

                this.loadPageData();
            }
        },
        'onCancel': function () {
            if (this.searchKey) {
                this.historyList = [];
                this.currentFlowNumber = this.currentUser.FlowNumber;
                this.loadPageData();
            }
        },
        'newReport': function (pId, pos) {
            this.currentReport.pId = pId;
            this.currentReport.pos = pos;
            this.isShow = true;
        },
        'typeConfirm': function () {
            if (this.radioType === '1') {
                this.reportByNew();
            } else {
                this.reportBySub();
            }
        },
        'reportByNew': function () {
            APP.GLOBAL.toastLoading({ 'message': this.language.READY_DATA }); 

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'GetNodalPerson',
                data: {
                    'nId': this.currentReport.pId
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.gotoNewWindow('new.reportPage', 'new.report', {
                        param: 'rId=' + _vue.currentReport.pId +
                            '&display=' + result.Data.FlowNumber +
                            '&parentDisplay=' + encodeURIComponent(result.Data.NickName + '(' + result.Data.FlowNumber + ')') +
                            '&pos=' + _vue.currentReport.pos +
                            '&fromTree=true',
                        openCallback: function () {
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        },
        'reportBySub': function () {
            APP.GLOBAL.toastLoading(this.language.AUDIT_RULES);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'IsCanSonDeclarationForm',
                data: {
                    'pId': this.currentReport.pId
                },
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (!result.CanCreate) {
                        _vue.$dialog.alert({
                            'message': _vue.language.AUDIT_FAIL_MESSAGE_1 + result.CanCreateDate + _vue.language.AUDIT_FAIL_MESSAGE_2,
                            'title': _vue.language.AUDIT_FAIL//'不符合規則'
                        });
                        return;
                    }

                    try {
                        var displayText = result.Data.NickName + '(' + result.Data.FlowNumber + ')';
                        APP.GLOBAL.gotoNewWindow('new.subaccountPage', 'new.subaccount', {
                            param: 'fromTree=true' +
                                '&parentId=' + _vue.currentReport.pId +
                                '&display=' + result.Data.FlowNumber +
                                '&parentDisplay=' + encodeURIComponent(displayText) +
                                '&pos=' + _vue.currentReport.pos,
                            openCallback: function () {
                                APP.GLOBAL.closeWindow('none');
                            }
                        });
                    } catch (e) {
                        APP.GLOBAL.toastMsg(e.message);
                    }
                }
            });
        },
        'loadNextLayer': function (id) {
            this.historyList.push(this.currentFlowNumber);
            this.currentFlowNumber = id;

            this.loadPageData();
        },
        'loadPageData': function () {
            this.isLoading = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'RelationDiagram',
                data: {
                    'id': this.currentFlowNumber
                },
                success: function (result) {
                    _vue.isLoading = false;

                    if (result.Error) {
                        var index = _vue.historyList.length - 1;
                        _vue.historyList.splice(index, 1);

                        APP.GLOBAL.toastMsg(result.Msg);
                    } else {
                        _vue.currentNFlow = result.Source.nFlow;
                        $('#chart-container').html('');
                        _vue.$nextTick(function () {
                            $('#chart-container').orgchart({
                                'data': result.Source,
                                'ajaxURL': _vue.ajaxURLs,
                                'nodeContent': 'title',
                                'nodeId': 'id'
                            });
                        });
                    }
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('my.fans.tree', function (lang) {
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
        if (this.request.parentId) {
            this.currentFlowNumber = this.request.parentId;
        } else {
            this.currentFlowNumber = this.currentUser.FlowNumber;
        }
        
        this.loadPageData();
    }
});