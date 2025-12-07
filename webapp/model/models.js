sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
function (JSONModel, Device) {
    "use strict";

    return {
        /**
         * Provides runtime information for the device the UI5 app is running on as a JSONModel.
         * @returns {sap.ui.model.json.JSONModel} The device model.
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },
        /**
         * @returns {sap.ui.model.json.JSONModel} The utility model.
         */
        createUtilityModel:  function () {
            /**@type {sap.ui.model.json.JSONModel} */
            var oUtilityModel = new JSONModel();
            oUtilityModel.loadData(sap.ui.require.toUrl("trainingconnections/model/utility.json"))
            return oUtilityModel;
        }
    };

});