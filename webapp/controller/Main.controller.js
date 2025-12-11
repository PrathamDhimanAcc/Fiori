sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Core",
    "sap/ui/core/Messaging",
  ],
  (
    Controller,
    JSONModel,
    Fragment,
    MessageBox,
    UIComponent,
    Core,
    Messaging
  ) => {
    "use strict";

    return Controller.extend("trainingconnections.controller.Main", {
      _connectionCreationDialog: null,
      inputIds: [],
      onInit() {
        var oDefaultData = {
          CarrierID: "INR", // 3 chars max
          ConnectionID: "", // 4 chars max
          AirportFromID: "", // Airport From ID
          AirportToID: "", // Airport To ID
          CountryFrom: "", // Country To
          CountryTo: "", // City From
          CityTo: "", // Country From (label says Country From but bound to cityTo)
          CityFrom: "",
          Price: "0.00", // Price
          CurrencyCode: "USD", // Default currency
        };

        const oModel = new JSONModel(oDefaultData);
        this.getView().setModel(oModel, "newConn");
      },

      /**
       * @returns {Promise<void>}
       */
      async openConnectionCreationDialog() {
        /**@type {sap.ui.core.routing.Router} */
        const router = this.getRouter();
        router.navTo("NewConnection");
        // if (!this._connectionCreationDialog) {
        //   this._connectionCreationDialog = await Fragment.load({
        //     id: "addConnectionDialog",
        //     name: "trainingconnections.view.fragments.CreateConnectionFragment",
        //     controller: this,
        //   });

        //   // To register the dialog as a dependent of this controller's view
        //   this.getView().addDependent(this._connectionCreationDialog);
        // }
        // this._connectionCreationDialog.open();
        // this.inputIds = [
        //   "carrierInput",
        //   "airportToInput",
        //   "countryToInput",
        //   "countryFromInput",
        //   "cityFromInput",
        //   "cityToInput",
        //   "idPriceInput",
        //   "idCurrencyCodeInput",
        // ];
      },

      closeConnectionCreationDialog() {
        if (this._connectionCreationDialog) {
          this._connectionCreationDialog.close();
        }
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
          let input = Fragment.byId("addConnectionDialog", id);
          debugger;
          if (input) {
            try {
              /**@type {sap.ui.model.StaticBinding} */
              debugger;
              const oBinding = input.getBinding("value");
              // @ts-ignore
              const oType = oBinding.getType();
            } catch (error) {
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

      /**
       * @returns {Promise<void>}
       */
      async onSubmitFragmentHandler() {
        if (!this.validateInputs()) {
          return;
        }

        /**@type {sap.ui.model.odata.v4.ODataModel} */
        const oBackendModel = this.getView().getModel();

        /**@type {sap.ui.model.json.JSONModel} */
        const oJsonModel = this.getView().getModel("newConn");

        /**@type {object} */
        const oData = oJsonModel.getData();
        /**@type {sap.ui.model.odata.v4.ODataListBinding} */
        const oBinding = this.byId("idZRConnectionsTable").getBinding("items");
        /**@type {sap.ui.model.odata.v4.Context} */

        const oContext = oBinding.create(oData);

        try {
          await oBackendModel.submitBatch("Connections");

          // Check if still transient after batch
          if (oContext.isTransient()) {
            // Backend rejected → rollback
            oContext.delete("Connections");
            MessageBox.error("Create failed. Please check your input.");
            return;
          }

          await oContext.created(); // Now safe to confirm success
          MessageBox.success("Successfully created a connection.");
        } catch (err) {
          MessageBox.error("Unexpected error: " + err.message);
        }
      },

      /**
       * @params {sap.ui.base.Event} oEvent
       * @returns {void}
       */
      onZRConnectionsTableSelectionChange(oEvent) {
        /**@type {sap.m.Table} */
        var oTable = oEvent.getSource();
        var aSelectedItems = oTable.getSelectedItems();
        var oUtilityModel = this.getView().getModel("utility");
        var oTableHasSelection = aSelectedItems.length > 0;

        oUtilityModel.setProperty(
          "/connectionTable/deletionEnabled",
          oTableHasSelection
        );
        oUtilityModel.setProperty(
          "/connectionTable/hasSelection",
          oTableHasSelection
        );
      },

      /**
       * @returns {sap.ui.core.routing.Router}
       */
      getRouter() {
        return UIComponent.getRouterFor(this);
      },
      /**
       *
       * @param {sap.ui.base.Event} oEvent
       */
      onZRConnectionsTableItemPress(oEvent) {
        /** @type {{ listItem: sap.m.ListItemBase }} */
        const { listItem } = /** @type {{ listItem: sap.m.ListItemBase }} */ (
          oEvent.getParameters()
        );

        const oContext = listItem.getBindingContext();

        const uuid = oContext.getProperty("UUID");

        /**@type {sap.ui.core.routing.Router} */
        const oRouter = this.getRouter();
        oRouter.navTo("ConnDetail", {
          id: uuid,
        });
      },
      handleDeleteRecord() {
        /**@type {sap.m.Table} */
        const oTable = this.byId("idZRConnectionsTable");
        const items = oTable.getSelectedContexts();

        items.forEach((context) => {
          if (context instanceof sap.ui.model.odata.v4.Context) {
            context.delete("Connections");
          }
        });

        /**@type {sap.ui.model.odata.v4.ODataModel} */
        const oBackendModel = this.getView().getModel();

        oBackendModel.submitBatch("Connections").finally(() => {
          //
        });
      },
      onApproveButtonPress() {
        /**@type {sap.ui.model.odata.v4.ODataModel} */
        const oBackendModel = this.getView().getModel();

        /**@type {sap.m.Table} */
        const oTable = this.byId("idZRConnectionsTable");

        const items = oTable.getSelectedItems();

        const contexts = items.map((item) => item.getBindingContext());

        const aPromises = contexts.map((context) => {
          if (context instanceof sap.ui.model.odata.v4.Context) {
            const oAction = oBackendModel.bindContext(
              "com.sap.gateway.srvd_a2x.zconnections.v0001.ApproveConnection(...)",
              context
            );
            return oAction.execute();
          }
          return Promise.reject();
        });
        const oView = this.getView();
        oView.setBusy(true);
        Promise.all(aPromises)
          .then((results) => {
            // refresh the table
            const oBinding = oTable.getBinding("items");
            if (oBinding) {
              oBinding.refresh();
            }
          })
          .catch((errors) => {
            // handle rejected promises
            console.error(errors);
            MessageBox.error("Some approvals failed");
          })
          .finally(() => {
            oView.setBusy(false);
          });
      },
      /**
       * @param {string} amount
       * @param {string} currencyCode
       */
      formatPrice(amount, currencyCode) {
        if (amount && currencyCode) {
          return amount + " " + currencyCode;
        }
        return "";
      },
      /**
       * @param {string} status
       */
      formatApproveStatusText(status) {
        switch (status) {
          case "P":
            return "Pending";
          case "X":
            return "Rejected";
          case "A":
            return "Approved";
          default:
            return "Unknown";
        }
      },
      /**
       * @param {string} status
       */
      formatApproveStatusIcon(status) {
        switch (status) {
          case "P":
            return "sap-icon://pending";
          case "X":
            return "sap-icon://decline";
          case "A":
            return "sap-icon://verified";
          default:
            return "sap-icon://badge";
        }
      },
      formatApproveStatusState(status) {
        switch (status) {
          case "P":
            return "Information";
          case "X":
            return "Error";
          case "A":
            return "Success";
          default:
            return "None";
        }
      },
      /**
       * @param {sap.ui.base.Event} oEvent
       */
      onRejectButtonPress(oEvent) {
         /**@type {sap.ui.model.odata.v4.ODataModel} */
        const oBackendModel = this.getView().getModel();

        /**@type {sap.m.Table} */
        const oTable = this.byId("idZRConnectionsTable");

        const contexts = oTable.getSelectedContexts()

        const Promises = contexts.map((context) => {
          if(context instanceof sap.ui.model.odata.v4.Context){
            const oAction = oBackendModel.bindContext('com.sap.gateway.srvd_a2x.zconnections.v0001.RejectConnection(...)',context)
            
            return oAction.execute('Connections')
          }
        })
        const oView = this.getView();
        oView.setBusy(true);
        Promise.all(Promises).then(() => {

        }).finally(
          oView.setBusy(false)
        ) 
      } 
    });
  }
);
