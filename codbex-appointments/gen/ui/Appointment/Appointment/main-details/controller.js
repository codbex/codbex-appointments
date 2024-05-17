angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-appointments.Appointment.Appointment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-appointments/gen/api/Appointment/AppointmentService.ts";
	}])
	.controller('PageController', ['$scope', 'Extensions', 'messageHub', 'entityApi', function ($scope, Extensions, messageHub, entityApi) {

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

	}]);