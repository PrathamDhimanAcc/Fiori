sap.ui.define(
  [
    "trainingconnections/controller/Main.controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Messaging",
    "sap/m/MessageBox",
    "sap/m/MessageItem",
    "sap/m/MessagePopover",
  ],
  function (
    Controller,
    JSONModel,
    Messaging,
    MessageBox,
    MessageItem,
    MessagePopover
  ) {
    "use strict";

    return Controller.extend(
      "trainingconnections.controller.CreateConnection",
      {
        inputIds: [],
        /**
         * @override
         */
        onInit: function () {
          Controller.prototype.onInit.apply(this, arguments);
          var oDefaultData = {
            CarrierID: "URN", // 3 chars max
            ConnectionID: "123", // 4 chars max
            AirportFromID: "URN", // Airport From ID
            AirportToID: "URN", // Airport To ID
            CountryFrom: "URN", // Country To
            CountryTo: "URN", // City From
            CityTo: "URN", // Country From (label says Country From but bound to cityTo)
            CityFrom: "URN",
            Price: "99.00", // Price
            CurrencyCode: "INR", // Default currency
          };

          const oModel = new JSONModel(oDefaultData);
          this.getView().setModel(oModel, "newConn");
          this.inputIds = [
            "carrierInput",
            "airportToInput",
            "countryToInput",
            "countryFromInput",
            "cityFromInput",
            "cityToInput",
            "idPriceInput",
            "idCurrencyCodeInput",
          ];
          const oMessageModel = Messaging.getMessageModel();
          // Create MessagePopover
          this._oMessagePopover = new MessagePopover({
            items: {
              path: "message>/",
              template: new MessageItem({
                title: "{message>message}",
                type: "{message>type}",
              }),
            },
            groupItems: true,
          });
          this._oMessagePopover.setModel(oMessageModel, "message");
          this.getView().setModel(oMessageModel, "message");
          this._oMessagePopover.attachAfterClose(this._removeMessages);
        },
        /**
         * @override
         * @returns {void|undefined}
         */
        onBeforeRendering: function () {
          /**@type {sap.ui.model.odata.v4.ODataListBinding} */
          this._oConnBinding = this.getView()
            .getModel()
            .bindList("/Z_R_CONNECTIONS", null, null, null, {
              $$updateGroupId: "Connections",
            });
        },
        _removeMessages: function () {
          Messaging.removeAllMessages();
        },
        onOpenMessagePopover: function (oEvent) {
          this._oMessagePopover.openBy(oEvent.getSource());
        },

        /**
         * @params {void}
         * @returns {boolean}
         */
        validateInputs() {
          let isValid = true;
          this.inputIds.forEach((id) => {
            let subValid = true;
            /**@type {sap.m.Input} */
            let input = this.byId(id);
            if (input) {
              try {
                const oBinding = input.getBinding("value"); // dynamic, no cast needed
                // @ts-ignore
                const oType = oBinding.getType();

                if (oType && typeof oType.validateValue === "function") {
                  oType.validateValue(input.getValue());
                }
              } catch (error) {
                console.log("validation error ", error, id);
                isValid = false;
                subValid = false;
              } finally {
                if (!subValid) {
                  input.setValueState(sap.ui.core.ValueState.Error);
                  this.setErrorValueText(input, id);
                } else {
                  input.setValueState(sap.ui.core.ValueState.None);
                  input.setValueStateText("");
                }
              }
            }
          });
          return isValid;
        },

        /**
         * @param {sap.m.Input} oInput
         * @param {string} inputID
         * @returns {void}
         */
        setErrorValueText(oInput, inputID) {
          switch (inputID) {
            case "idPriceInput":
              oInput.setValueStateText("Please enter a valid price");
              break;
            case "idCurrencyCodeInput":
              oInput.setValueStateText("Please enter a valid currency code");
              break;
            case "carrierInput":
              oInput.setValueStateText(
                "Carrier must be atmost 3 characters long"
              );
              break;
            case "airportToInput":
              oInput.setValueStateText(
                "Airport code must be exactly 3 characters long"
              );
              break;
            case "countryToInput":
              oInput.setValueStateText(
                "Country name must be atmost 3 characters long"
              );
              break;
            case "cityFromInput":
              oInput.setValueStateText(
                "City name must be atmost 40 characters long"
              );
              break;
            case "cityToInput":
              oInput.setValueStateText(
                "City name must be atmost 40 characters long"
              );
              break;
            case "connectionInput":
              oInput.setValueStateText(
                "Connection name must be atmost 4 characters long"
              );
              break;
            default:
              break;
          }
        },
        buttonTypeFormatter: function (oData) {
          let sType;
          oData.forEach((element) => {
            switch (element.getType()) {
              case "Error":
                sType = "Negative";
                break;
              case "Information":
                sType = "Attention";
                break;
              default:
                sType = "Default";
            }
          });
          return sType;
        },
        hasMessages: function (oData) {
          if (!oData) return false;

          return Object.keys(oData).length > 0;
        },
        /**
         * @returns {void}
         */
        onSubmitHandler() {
          if (!this.validateInputs()) {
            return;
          }
          Messaging.removeAllMessages();

          /**@type {sap.ui.model.odata.v4.ODataModel} */
          const oBackendModel = this.getView().getModel();

          /**resetting the previous unsuccessfull batch request made to the backend */
          oBackendModel.resetChanges("Connections")

          /**@type {sap.ui.model.json.JSONModel} */
          const oJsonModel = this.getView().getModel("newConn");

          /**@type {object<any>} */
          const oData = oJsonModel.getData();

          /**@type {sap.ui.model.odata.v4.Context} */
          const oContext = this._oConnBinding.create(oData);

          oBackendModel.submitBatch("Connections").finally(() => {
            oContext
              .created()
              .then(() => {
                MessageBox.success("Successfully created the connection");
              })
              .catch(() => {
                MessageBox.error("The connection was not created");
                oContext.delete();
              });
          });
        },
      }
    );
  }
);
