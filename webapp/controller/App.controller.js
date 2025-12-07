sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/Messaging",
  "sap/m/MessagePopover",
	"sap/m/MessageItem"
], function (Controller,
	Messaging,
	MessagePopover,
	MessageItem)  {
  "use strict";

  return Controller.extend("trainingconnections.controller.App", {
    /**@type  {sap.m.MessagePopover}*/  
    _messagePopOver : null, 
      onInit() {
        const oMessageModel = Messaging.getMessageModel()
        //  if(!this._messagePopOver) {
          // this._createMessagePopover();
        // }
        // this._messagePopOver.setModel(oMessageModel,"message")
      },
      /**
       * @param {sap.ui.base.Event} oEvent
       */
      onOverflowToolbarButtonPress(oEvent) {
       
        this._messagePopOver.toggle(oEvent.getSource())
      },
      _createMessagePopover() {
        this._messagePopOver = new MessagePopover({
          items : {
            path : "message>/",
            template : new MessageItem({
              title : "{message>/message}",
              description : "{message>/description}",
              type : "{message>/type}"
            })
          },
          groupItems : true
        })
        this.getView().byId("messagePopoverBtn").addDependent(this._messagePopOver)
      }
  });
});