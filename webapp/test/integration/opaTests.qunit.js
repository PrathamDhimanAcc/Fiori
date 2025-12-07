/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["trainingconnections/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
