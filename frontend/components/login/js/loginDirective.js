/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("login", login);

	function login() {
		return {
			restrict: "EA",
			templateUrl: "login.html",
			scope: {},
			controller: LoginCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	LoginCtrl.$inject = ["$scope", "$location", "Auth", "EventService", "serverConfig", "UtilsService"];

	function LoginCtrl($scope, $location, Auth, EventService, serverConfig, UtilsService) {
		var vm = this,
			enterKey = 13;

		/*
		 * Init
		 */
		vm.$onInit = function() {
			vm.version = serverConfig.apiVersion;

			vm.unityLoaded = false;
			vm.unityLoading = UnityUtil.onReady();
			vm.unityLoading.then(function(resolved){
				console.log("Loaded", resolved);
				vm.unityLoaded = true;
			})

			Auth.isLoggedIn().then(function(response){
				StateManager.setStateVar("loggedIn", true);
				EventService.send(EventService.EVENT.UPDATE_STATE);
			});
		}

		/**
		 * Attempt to login
		 *
		 * @param {Object} event
		 */
		vm.login = function(event) {
			if (angular.isDefined(event)) {
				if (event.which === enterKey) {
					Auth.login(vm.user.username, vm.user.password);
				}
			}
			else {
				if (vm.user && vm.user.username && vm.user.password) {
					vm.errorMessage = "";
					Auth.login(vm.user.username, vm.user.password).then(function(response){
						//console.log(response);
					});
				} else {

					vm.errorMessage = "Username and/or password not provided";
					if (vm.user && vm.user.password && !vm.user.username) {
						vm.errorMessage = "Username not provided";
					} else if (vm.user && vm.user.username && !vm.user.password) {
						vm.errorMessage = "Password not provided";
					}
					
				}

					
			}
		};

		/*
		 * Event watch
		 */
		$scope.$watch(EventService.currentEvent, function(event) {

			if (event.type === EventService.EVENT.USER_LOGGED_IN) {
				// Show an error message for incorrect login
				if (!event.value.initialiser && event.value.hasOwnProperty("error")) {
					if (event.value.error.status === 500) {
						vm.errorMessage = "There is currently a problem with the system. Please try again later.";
					}
					else {
						vm.errorMessage = UtilsService.getErrorMessage(event.value.error);
					}
				}
			}
		});

		$scope.$watch("vm.unityLoading", function(event) {

			console.log(vm.unityLoading);

		});
	}
}());
