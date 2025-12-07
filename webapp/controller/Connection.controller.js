sap.ui.define(
  [
    "trainingconnections/controller/Main.controller",
    "sap/ui/core/Messaging",
    "sap/m/MessagePopover",
    "sap/m/MessageItem",
  ],
  function (MainController, Messaging, MessagePopover, MessageItem) {
    "use strict";

    return MainController.extend("trainingconnections.controller.Connection", {
      /**
       * @override
       */
      onInit: function () {
        MainController.prototype.onInit.apply(this, arguments);
        /**@type {sap.ui.core.routing.Router} */
        var oRouter = this.getRouter();
        oRouter
          .getRoute("ConnDetail")
          .attachPatternMatched(this._onRouteMatched, this);
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
        this._oMessagePopover.attachAfterClose(this._removeMessages)
        this.getView().setModel(oMessageModel, "message2");
      },
      _removeMessages : function () {
        Messaging.removeAllMessages()
      },
      _onRouteMatched: function (oEvent) {
        var connID = oEvent.getParameter("arguments").id;
        let sPath = `/Z_R_CONNECTIONS(UUID=${connID})`;
        /**@type sap.ui.core.mvc.View */
        var oView = this.getView();
        oView.bindElement({
          path: sPath,
          events: {
            dataRequested: function (oEvent) {
              oView.setBusy(true);
            },
            dataReceived: function (oEvent) {
              oView.setBusy(false);
            },
          },
          parameters: {
            $$updateGroupId: "updateConnection",
          },
        });
      },

      onUpdateButtonPress: function () {
        sap.m.MessageBox.warning("Do you want to submit your changes?", {
          actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
          emphasizedAction: sap.m.MessageBox.Action.OK,
          onClose: async (sAction) => {
            if (sAction === sap.m.MessageBox.Action.OK) {
              await this._doPatchUpdate();
            }
          },
        });
      },

      _doPatchUpdate: async function () {
        const oView = this.getView();

        /**@type {sap.ui.model.odata.v4.ODataModel} */
        const oModel = oView.getModel(); // OData V4 model
        /**@type {sap.ui.model.odata.v4.Context} */
        const oCtx = oView.getBindingContext(); // bound entity context

        if (!oCtx) {
          sap.m.MessageBox.error("No entity context found.");
          return;
        }
        oView.setBusy(true);
        // Submit PATCH request
        oModel.submitBatch("updateConnection").then(() => {
          oView.setBusy(false);
        });
      },
      onOpenMessagePopover: function (oEvent) {
        this._oMessagePopover.openBy(oEvent.getSource());
      },
      buttonTypeFormatter: function (oData) {
        let sType;
        oData.forEach(element => {
          switch(element.getType()) {
            case "Error":
            sType = "Negative"
            break
            case "Information":
            sType = "Attention"
            break
            default:
            sType = "Default"
          }
        });
        return sType
      },
      hasMessages: function (oData) {
        if (!oData) return false;

        return Object.keys(oData).length > 0;
      }
    });
  }
);
