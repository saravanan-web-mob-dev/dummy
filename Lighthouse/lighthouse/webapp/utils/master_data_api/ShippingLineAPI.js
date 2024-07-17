sap.ui.define([
    "com/lighthouse/init/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/integration/library",
    "sap/ui/core/Core",
    "com/lighthouse/utils/Formatter",
    "com/lighthouse/utils/ErrorMessage",
    "com/lighthouse/utils/URLConstants",
    "sap/ui/core/routing/History",
    "com/lighthouse/Component"
], function (BaseController, JSONModel, DateFormat, MessageToast, MessageBox, library, Core, Formatter, ErrorMessage, URLConstants, History, Component) {
    "use strict";
    return {
        baseControllerFunctions: function (masterData, pageId) {
            this.masterData = masterData;
            this.pageId = pageId;
        },

        loadIds: function (isCreate, tableId, noDataId,formId, eMdl, pageId) {
            if (isCreate) {
                this._tableId = tableId;
                this._shippingLine_noData = noDataId;
            }
            else {
                this._shippingLine_formId = formId;
                this.eMdl = eMdl;
                this.pageId = pageId;
            }
        },
        onAfterRendering: function (oModel) {
            let recordCount = oModel.getData().masterScreenTable.items[0].recordCount;
            let count = oModel.getData().masterScreenTable.items.length >= recordCount;//oModel.getData().advancedFilter.pageSize > recordCount;
            //oModel.getData().advancedFilter.pageSize += URLConstants.Paging.page_size;
            if (!count) {
                oModel.getData().advancedFilter.pageNumber += 1;
                oModel.refresh(true);
                // that.fetchShippingLine(oModel);
                // You've reached the bottom or are very close to it
                console.log("Reached the bottom of the scroll container.");
                return true;
            }
            else{
                return false;
            }
        },

        fetchShippingLine: async function (oModel) {
            try {
                if (oModel.getData().selections.isSortSelected) { /*If sorting is selected on pagination need to fetch new data*/
                    oModel.getData().advancedFilter.pageNumber = 1;
                    oModel.getData().masterScreenTable.items = [];
                }
                this._tableId.setBusy(true);
                this._tableId.setBusyIndicatorDelay(10);
                let request = oModel.getData().advancedFilter;
                request.statuses = request.statusColl?.toString();
                let path = URLConstants.URL.shipping_line_all;
                let shippingLineRes = await BaseController.prototype.restMethodPost(path, request);
                if (shippingLineRes.length > 0) {
                    shippingLineRes.map(e => {
                        e.status = this.masterData.status.find(ele => e.status === ele.value)?.description;
                    });
                }
                if (!(shippingLineRes.length > 0)) {
                    this._shippingLine_noData.setText(
                        "No data found. Try adjusting the search or filter criteria."
                    );
                } else {
                    this._shippingLine_noData.setText(
                        'To start, set the relevant filters and choose "Go".'
                    );
                }
                oModel.getData().selections.isSortSelected = false;
                this._tableId.setBusy(false);
                return shippingLineRes;
            } catch (error) {
                this._tableId.setBusy(false);
                BaseController.prototype.errorHandling(error);
            }
        },
        postVessel: async function (oModel) {
            let oModelData = oModel.getData();
            if (this.tableValidation(oModel)) {
                oModelData.vesselDetails.items.map(e => { if (!e.id) e.status = 2; });
                let mergeVesselDetails = [...oModelData.vesselDetails.items, ...oModelData.vesselDetails.removedData]; //Merge active and inactive records.
                let postData = { ...oModelData.vesselGeneral, vesselDetails: mergeVesselDetails };
                let path = URLConstants.URL.vessel_add;
                let postRes = await BaseController.prototype.restMethodPost(path, Array.of(postData));
                return true;
            }
        },
        showMasterScreenMessage: function () {
            let that = this;
            let msg = BaseController.prototype.getResourceProperty("veSavedSuccessfully");
            MessageBox.information(msg, {
                actions: [MessageBox.Action.OK],
                onClose: function (sAction) {
                    let oModel = that.getView().getModel();
                    let modelData = that.emptyModelData();
                    oModel.getData().vesselGeneral = modelData.vesselGeneral;
                    oModel.getData().vesselDetails = modelData.vesselDetails;
                    oModel.refresh(true);
                },
            });
        },
        sheetDetails: function () {
            let obj = {
                fileName: "Shipping Line.xlsx",
                sheets: {
                    sheetName: ["Shipping Line"]
                },
                columns: [
                    {
                        label: 'ID',
                        property: 'cardCode',
                        visible: true
                    },
                    {
                        label: 'Name',
                        property: 'cardName',
                        visible: true
                    },
                    {
                        label: 'Code',
                        property: 'code',
                        visible: true
                    },
                    {
                        label: 'Status',
                        property: 'valid',
                        visible: true
                    },
                    {
                        label: 'Created By',
                        property: 'createdBy',
                        visible: false
                    },
                    {
                        label: 'Created On',
                        property: 'createDate',
                        visible: false
                    },
                    {
                        label: 'Updated By',
                        property: 'updatedBy',
                        visible: false
                    },
                    {
                        label: 'Updated On',
                        property: 'updateDate',
                        visible: false
                    }
                ]
            }
            return obj;
        },
    };
});