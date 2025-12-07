sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "trainingconnections/model/models",
    "sap/ui/core/Core",
  ],
  (UIComponent, models, Core) => {
    "use strict";

    return UIComponent.extend("trainingconnections.Component", {
      metadata: {
        manifest: "json",
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
      },

      init() {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        this.setModel(models.createUtilityModel(), "utility");

        // enable routing
        this.getRouter().initialize();


      },
    });
  }
);
