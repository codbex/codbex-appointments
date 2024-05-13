angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-appointments.Appointment.Appointment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-appointments/gen/api/Appointment/AppointmentService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', 'Extensions', function ($scope, $http, messageHub, entityApi, Extensions) {

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataLimit = 20;

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-appointments-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "Appointment" && e.view === "Appointment" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.filter(e => e.perspective === "Appointment" && e.view === "Appointment" && e.type === "entity");
		});

		$scope.triggerPageAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{},
				null,
				true,
				action
			);
		};

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

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entitySearch", function (msg) {
			resetPagination();
			$scope.filter = msg.data.filter;
			$scope.filterEntity = msg.data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber, filter) {
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			$scope.dataPage = pageNumber;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Appointment", `Unable to count Appointment: '${response.message}'`);
					return;
				}
				if (response.data) {
					$scope.dataCount = response.data;
				}
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				let request;
				if (filter) {
					filter.$offset = offset;
					filter.$limit = limit;
					request = entityApi.search(filter);
				} else {
					request = entityApi.list(offset, limit);
				}
				request.then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Appointment", `Unable to list/filter Appointment: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.IntakeDate) {
							e.IntakeDate = new Date(e.IntakeDate);
						}
						if (e.ReleaseDate) {
							e.ReleaseDate = new Date(e.ReleaseDate);
						}
					});

					$scope.data = response.data;
				});
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("Appointment-details", {
				action: "select",
				entity: entity,
				optionsOperator: $scope.optionsOperator,
				optionsAssigee: $scope.optionsAssigee,
				optionsStatus: $scope.optionsStatus,
				optionsSalesOrder: $scope.optionsSalesOrder,
				optionsCustomer: $scope.optionsCustomer,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("Appointment-filter", {
				entity: $scope.filterEntity,
				optionsOperator: $scope.optionsOperator,
				optionsAssigee: $scope.optionsAssigee,
				optionsStatus: $scope.optionsStatus,
				optionsSalesOrder: $scope.optionsSalesOrder,
				optionsCustomer: $scope.optionsCustomer,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Appointment-details", {
				action: "create",
				entity: {},
				optionsOperator: $scope.optionsOperator,
				optionsAssigee: $scope.optionsAssigee,
				optionsStatus: $scope.optionsStatus,
				optionsSalesOrder: $scope.optionsSalesOrder,
				optionsCustomer: $scope.optionsCustomer,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Appointment-details", {
				action: "update",
				entity: entity,
				optionsOperator: $scope.optionsOperator,
				optionsAssigee: $scope.optionsAssigee,
				optionsStatus: $scope.optionsStatus,
				optionsSalesOrder: $scope.optionsSalesOrder,
				optionsCustomer: $scope.optionsCustomer,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete Appointment?',
				`Are you sure you want to delete Appointment? This action cannot be undone.`,
				[{
					id: "delete-btn-yes",
					type: "emphasized",
					label: "Yes",
				},
				{
					id: "delete-btn-no",
					type: "normal",
					label: "No",
				}],
			).then(function (msg) {
				if (msg.data === "delete-btn-yes") {
					entityApi.delete(id).then(function (response) {
						if (response.status != 204) {
							messageHub.showAlertError("Appointment", `Unable to delete Appointment: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsOperator = [];
		$scope.optionsAssigee = [];
		$scope.optionsStatus = [];
		$scope.optionsSalesOrder = [];
		$scope.optionsCustomer = [];


		$http.get("/services/ts/codbex-employees/gen/api/Employees/EmployeeService.ts").then(function (response) {
			$scope.optionsOperator = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-employees/gen/api/Employees/EmployeeService.ts").then(function (response) {
			$scope.optionsAssigee = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-appointments/gen/api/entities/AppointmentStatusService.ts").then(function (response) {
			$scope.optionsStatus = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-orders/gen/api/SalesOrder/SalesOrderService.ts").then(function (response) {
			$scope.optionsSalesOrder = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-partners/gen/api/Customers/CustomerService.ts").then(function (response) {
			$scope.optionsCustomer = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$scope.optionsOperatorValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsOperator.length; i++) {
				if ($scope.optionsOperator[i].value === optionKey) {
					return $scope.optionsOperator[i].text;
				}
			}
			return null;
		};
		$scope.optionsAssigeeValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsAssigee.length; i++) {
				if ($scope.optionsAssigee[i].value === optionKey) {
					return $scope.optionsAssigee[i].text;
				}
			}
			return null;
		};
		$scope.optionsStatusValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsStatus.length; i++) {
				if ($scope.optionsStatus[i].value === optionKey) {
					return $scope.optionsStatus[i].text;
				}
			}
			return null;
		};
		$scope.optionsSalesOrderValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsSalesOrder.length; i++) {
				if ($scope.optionsSalesOrder[i].value === optionKey) {
					return $scope.optionsSalesOrder[i].text;
				}
			}
			return null;
		};
		$scope.optionsCustomerValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsCustomer.length; i++) {
				if ($scope.optionsCustomer[i].value === optionKey) {
					return $scope.optionsCustomer[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
