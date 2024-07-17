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

        loadIds: function (isCreate, tableId, noDataId, formId, eMdl, pageId) {
            if (isCreate) {
                this._tableId = tableId;
                this._container_noData = noDataId;
            }
            else {
                this._container_formId = formId;
                this.eMdl = eMdl;
                this.pageId = pageId;
            }
        },
        onAfterRendering: function (oModel) {
            let recordCount = oModel.getData().masterScreenTable.items[0].recordCount;
            let count = oModel.getData().masterScreenTable.items.length >= recordCount;
            if (!count) {
                oModel.getData().advancedFilter.pageNumber += 1;
                oModel.refresh(true);
                console.log("Reached the bottom of the scroll container.");
                return true;
            }
            else{
                return false;
            }
        },

        fetchContainer: async function (oModel) {
            try {
                if (oModel.getData().selections.isSortSelected) { /*If sorting is selected on pagination need to fetch new data*/
                    oModel.getData().advancedFilter.pageNumber = 1;
                    oModel.getData().masterScreenTable.items = [];
                }
                let exItems = oModel.getData().masterScreenTable.items;
                this._tableId.setBusy(true);
                this._tableId.setBusyIndicatorDelay(10);
                let request = oModel.getData().advancedFilter;
                request.containerTypeIdCollection = request.containerTypeColl?.toString();
                request.socCollection = request.socColl?.toString();
                request.sizeCollection = request.sizeColl?.toString();
                request.typeIdCollection = request.typeIdColl?.toString();
                request.statuses = request.statusColl?.toString();
                let path = URLConstants.URL.containers_all;
                let containerRes = await BaseController.prototype.restMethodPost(path, request);
                if (containerRes.length > 0) {
                    containerRes.map(e => {
                        e.status = this.masterData.status.find(ele => e.status === ele.value)?.description;
                        e.soc = this.masterData.yes_or_no.find(ele => e.soc === ele.value)?.description;
                        e.size = this.masterData.container_size.find(ele => e.size === ele.value)?.description;
                        e.containerType = e.type;
                        e.type = 'Inactive';
                    });
                }
                if (!(containerRes.length > 0)) {
                    this._container_noData.setText(
                        "No data found. Try adjusting the search or filter criteria."
                    );
                } else {
                    this._container_noData.setText(
                        'To start, set the relevant filters and choose "Go".'
                    );
                }
                if (exItems.length > 0) {
                    oModel.getData().masterScreenTable.items = [...exItems, ...containerRes];
                } else {
                    oModel.getData().masterScreenTable.items = containerRes;
                }
                oModel.getData().selections.isSortSelected = false;
                this._tableId.setBusy(false);
                return containerRes;
            } catch (error) {
                this._tableId.setBusy(false);
                BaseController.prototype.errorHandling(error);
            }
        },

        /* fetchContainerType */
        fetchContainerType: async function () {
            try {
                let path = URLConstants.URL.min_container_type;
                let containerType = await BaseController.prototype.restMethodGet(path);
                return containerType;
            } catch (error) {
                BaseController.prototype.errorHandling(error);
            }
        },

        postContainer: async function (oModel) {
                let postData = oModel.getData().MasterScreenGeneral;
                let path = URLConstants.URL.containers_add;
                let postRes = await BaseController.prototype.restMethodPost(path, Array.of(postData));
                return true;
        },
        showMessage: function (oModel,modelData) {
            let msg = BaseController.prototype.getResourceProperty("coSavedSuccessfully");
            MessageBox.information(msg, {
                actions: [MessageBox.Action.OK],
                onClose: function (sAction) {
                    oModel.getData().MasterScreenGeneral = modelData.MasterScreenGeneral;
                    oModel.refresh(true)
                },
            });
        },
        sheetDetails: function () {
            let obj = {
                columns: [
                    {
                        label: 'ID',
                        property: 'id',
                        visible: true,
                    }, 
                    {
                        label: 'Container No',
                        property: 'containerNo',
                        visible: true,
                    },
                    {
                        label: 'Type',
                        property: 'containerTypeName',
                        visible: true,
                    },
                    {
                        label: "SOC",
                        property: 'soc',
                        visible: true,
                    },
                    {
                        label: "Owned By",
                        property: 'ownedBy',
                        visible: true,
                    },
                    {
                        label: "Size",
                        property: 'size',
                        visible: true,
                    },
                    {
                        label: 'Status',
                        property: 'status',
                        visible: true,
                    },
                    {
                        label: 'Created By',
                        property: 'createdBy',
                        visible: false
                    },
                    {
                        label: 'Created On',
                        property: 'createdOn',
                        visible: false
                    },
                    {
                        label: 'Updated By',
                        property: 'updatedBy',
                        visible: false
                    },
                    {
                        label: 'Updated On',
                        property: 'updatedOn',
                        visible: false
                    }]
            };
            return obj;
        },
    };
});