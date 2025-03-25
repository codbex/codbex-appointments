angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-appointments.Appointment.Appointment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-appointments/gen/codbex-appointments/api/Appointment/AppointmentService.ts";
	}])
	.controller('PageController', ['$scope',  '$http', 'Extensions', 'messageHub', 'entityApi', function ($scope,  $http, Extensions, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "Appointment Details",
			create: "Create Appointment",
			update: "Update Appointment"
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-appointments-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "Appointment" && e.view === "Appointment" && e.type === "entity");
		});

		$scope.triggerEntityAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{
					id: $scope.entity.Id
				},
				null,
				true,
				action
			);
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsOperator = [];
				$scope.optionsAssigee = [];
				$scope.optionsStatus = [];
				$scope.optionsSalesOrder = [];
				$scope.optionsCustomer = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.IntakeDate) {
					msg.data.entity.IntakeDate = new Date(msg.data.entity.IntakeDate);
				}
				if (msg.data.entity.ReleaseDate) {
					msg.data.entity.ReleaseDate = new Date(msg.data.entity.ReleaseDate);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsOperator = msg.data.optionsOperator;
				$scope.optionsAssigee = msg.data.optionsAssigee;
				$scope.optionsStatus = msg.data.optionsStatus;
				$scope.optionsSalesOrder = msg.data.optionsSalesOrder;
				$scope.optionsCustomer = msg.data.optionsCustomer;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsOperator = msg.data.optionsOperator;
				$scope.optionsAssigee = msg.data.optionsAssigee;
				$scope.optionsStatus = msg.data.optionsStatus;
				$scope.optionsSalesOrder = msg.data.optionsSalesOrder;
				$scope.optionsCustomer = msg.data.optionsCustomer;
				$scope.action = 'create';
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.IntakeDate) {
					msg.data.entity.IntakeDate = new Date(msg.data.entity.IntakeDate);
				}
				if (msg.data.entity.ReleaseDate) {
					msg.data.entity.ReleaseDate = new Date(msg.data.entity.ReleaseDate);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsOperator = msg.data.optionsOperator;
				$scope.optionsAssigee = msg.data.optionsAssigee;
				$scope.optionsStatus = msg.data.optionsStatus;
				$scope.optionsSalesOrder = msg.data.optionsSalesOrder;
				$scope.optionsCustomer = msg.data.optionsCustomer;
				$scope.action = 'update';
			});
		});

		$scope.serviceOperator = "/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts";
		$scope.serviceAssigee = "/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts";
		$scope.serviceStatus = "/services/ts/codbex-appointments/gen/codbex-appointments/api/Settings/AppointmentStatusService.ts";
		$scope.serviceSalesOrder = "/services/ts/codbex-orders/gen/codbex-orders/api/SalesOrder/SalesOrderService.ts";
		$scope.serviceCustomer = "/services/ts/codbex-partners/gen/codbex-partners/api/Customers/CustomerService.ts";

		//-----------------Events-------------------//

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("Appointment", `Unable to create Appointment: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Appointment", "Appointment successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Appointment", `Unable to update Appointment: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Appointment", "Appointment successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};
		
		//-----------------Dialogs-------------------//
		
		$scope.createOperator = function () {
			messageHub.showDialogWindow("Employee-details", {
				action: "create",
				entity: {},
			}, null, false);
		};
		$scope.createAssigee = function () {
			messageHub.showDialogWindow("Employee-details", {
				action: "create",
				entity: {},
			}, null, false);
		};
		$scope.createStatus = function () {
			messageHub.showDialogWindow("AppointmentStatus-details", {
				action: "create",
				entity: {},
			}, null, false);
		};
		$scope.createSalesOrder = function () {
			messageHub.showDialogWindow("SalesOrder-details", {
				action: "create",
				entity: {},
			}, null, false);
		};
		$scope.createCustomer = function () {
			messageHub.showDialogWindow("Customer-details", {
				action: "create",
				entity: {},
			}, null, false);
		};

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshOperator = function () {
			$scope.optionsOperator = [];
			$http.get("/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts").then(function (response) {
				$scope.optionsOperator = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};
		$scope.refreshAssigee = function () {
			$scope.optionsAssigee = [];
			$http.get("/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts").then(function (response) {
				$scope.optionsAssigee = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};
		$scope.refreshStatus = function () {
			$scope.optionsStatus = [];
			$http.get("/services/ts/codbex-appointments/gen/codbex-appointments/api/Settings/AppointmentStatusService.ts").then(function (response) {
				$scope.optionsStatus = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};
		$scope.refreshSalesOrder = function () {
			$scope.optionsSalesOrder = [];
			$http.get("/services/ts/codbex-orders/gen/codbex-orders/api/SalesOrder/SalesOrderService.ts").then(function (response) {
				$scope.optionsSalesOrder = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};
		$scope.refreshCustomer = function () {
			$scope.optionsCustomer = [];
			$http.get("/services/ts/codbex-partners/gen/codbex-partners/api/Customers/CustomerService.ts").then(function (response) {
				$scope.optionsCustomer = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};

		//----------------Dropdowns-----------------//	
		

	}]);