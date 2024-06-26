angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-appointments.Appointment.Appointment';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.IntakeDateFrom) {
				params.entity.IntakeDateFrom = new Date(params.entity.IntakeDateFrom);
			}
			if (params?.entity?.IntakeDateTo) {
				params.entity.IntakeDateTo = new Date(params.entity.IntakeDateTo);
			}
			if (params?.entity?.ReleaseDateFrom) {
				params.entity.ReleaseDateFrom = new Date(params.entity.ReleaseDateFrom);
			}
			if (params?.entity?.ReleaseDateTo) {
				params.entity.ReleaseDateTo = new Date(params.entity.ReleaseDateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsOperator = params.optionsOperator;
			$scope.optionsAssigee = params.optionsAssigee;
			$scope.optionsStatus = params.optionsStatus;
			$scope.optionsSalesOrder = params.optionsSalesOrder;
			$scope.optionsCustomer = params.optionsCustomer;
		}

		$scope.filter = function () {
			let entity = $scope.entity;
			const filter = {
				$filter: {
					equals: {
					},
					notEquals: {
					},
					contains: {
					},
					greaterThan: {
					},
					greaterThanOrEqual: {
					},
					lessThan: {
					},
					lessThanOrEqual: {
					}
				},
			};
			if (entity.Id !== undefined) {
				filter.$filter.equals.Id = entity.Id;
			}
			if (entity.Operator !== undefined) {
				filter.$filter.equals.Operator = entity.Operator;
			}
			if (entity.Assigee !== undefined) {
				filter.$filter.equals.Assigee = entity.Assigee;
			}
			if (entity.Status !== undefined) {
				filter.$filter.equals.Status = entity.Status;
			}
			if (entity.SalesOrder !== undefined) {
				filter.$filter.equals.SalesOrder = entity.SalesOrder;
			}
			if (entity.IntakeDateFrom) {
				filter.$filter.greaterThanOrEqual.IntakeDate = entity.IntakeDateFrom;
			}
			if (entity.IntakeDateTo) {
				filter.$filter.lessThanOrEqual.IntakeDate = entity.IntakeDateTo;
			}
			if (entity.ReleaseDateFrom) {
				filter.$filter.greaterThanOrEqual.ReleaseDate = entity.ReleaseDateFrom;
			}
			if (entity.ReleaseDateTo) {
				filter.$filter.lessThanOrEqual.ReleaseDate = entity.ReleaseDateTo;
			}
			if (entity.Issue) {
				filter.$filter.contains.Issue = entity.Issue;
			}
			if (entity.Customer !== undefined) {
				filter.$filter.equals.Customer = entity.Customer;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			messageHub.postMessage("clearDetails");
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("Appointment-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);