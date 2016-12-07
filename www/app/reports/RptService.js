/**
 * Created by Jim on 4/10/15.
 */

angular.module('app.services')

.factory('ReportsService', ['MockupService',
function(MockupService) {


 	var rptOpportunities = [
 		{desc0: "Day", desc1: "Monday", gapAvg: "33%", tendency: "rise", change: "2%", displayOrder: 1, status: "", style: ""},
 		{desc0: "Time", desc1: "12:00 PM", gapAvg: "35%", tendency: "decline", change: "8%", displayOrder: 2, status: "", style: ""},
 		{desc0: "Temperature", desc1: "Beef Patty", gapAvg: "22%", tendency: "rise", change: "4%", displayOrder: 3, status: "", style: ""},
 		{desc0: "Food Safety", desc1: "Hand Washing", gapAvg: "15%", tendency: "rise", change: "10%", displayOrder: 4, status: "", style: ""},
 		{desc0: "User", desc1: "Tim", gapAvg: "37%", tendency: "decline", change: "5%", displayOrder: 5, status: "", style: ""}
 	];


 	var rptOppsDetails = [
 		{time: "6:30 AM", details: [
 			{date: "3/9", status: "standard", icon: "", color: ""},
 			{date: "3/8", status: "standard", icon: "", color: ""},
 			{date: "3/7", status: "standard", icon: "", color: ""}
 		], status: "D", displayOrder: 1, style: ""},
 		{time: "7:30 AM", details: [
 			{date: "3/9", status: "underPerformReturn", icon: "", color: ""},
 			{date: "3/8", status: "underPerformReturn", icon: "", color: ""},
 			{date: "3/7", status: "underPerform", icon: "", color: ""}
 		], status: "P", displayOrder: 2, style: ""},
 		{time: "9:30 AM", details: [
 			{date: "3/9", status: "underPerform", icon: "", color: ""},
 			{date: "3/8", status: "underPerform", icon: "", color: ""},
 			{date: "3/7", status: "underPerform", icon: "", color: ""}
 		], status: "C", displayOrder: 3, style: ""},
 		{time: "12:00 PM", details: [
 			{date: "3/9", status: "", icon: "", color: ""},
 			{date: "3/8", status: "standard", icon: "", color: ""},
 			{date: "3/7", status: "underPerformReturn", icon: "", color: ""}
 		], status: "P", displayOrder: 4, style: ""},
 		{time: "5:30 PM", details: [
 			{date: "3/9", status: "", icon: "", color: ""},
 			{date: "3/8", status: "standard", icon: "", color: ""},
 			{date: "3/7", status: "underPerformReturn", icon: "", color: ""}
 		], status: "P", displayOrder: 5, style: ""},
 		{time: "1:00 AM", details: [
 			{date: "3/9", status: "", icon: "", color: ""},
 			{date: "3/8", status: "standard", icon: "", color: ""},
 			{date: "3/7", status: "underPerform", icon: "", color: ""}
 		], status: "P", displayOrder: 6, style: ""},
 		{time: "2:30 AM", details: [
 			{date: "3/9", status: "", icon: "", color: ""},
 			{date: "3/8", status: "underPerformReturn", icon: "", color: ""},
 			{date: "3/7", status: "underPerform", icon: "", color: ""}
 		], status: "P", displayOrder: 7, style: ""},
 		{time: "4:30 AM", details: [
 			{date: "3/9", status: "", icon: "", color: ""},
 			{date: "3/8", status: "standard", icon: "", color: ""},
 			{date: "3/7", status: "standard", icon: "", color: ""}
 		], status: "P", displayOrder: 8, style: ""}
 	];

 	var badges = [
 		{description: 'best', performance: 'best'},
 		{description: 'good', performance: 'good'},
 		{description: 'soso', performance: 'soso'},
 		{description: 'worst', performance: 'worst'}
 	];

 	var competitiveList = [
 		{grade: '1st', accountName: 'Restaurant 442', percent: '81%', YestGrade: '3rd', YestPercent: '85%', style: '', displayOrder: 1},
 		{grade: '2nd', accountName: 'Restaurant 123', percent: '67%', YestGrade: '4th', YestPercent: '82%', style: '', displayOrder: 2},
 		{grade: '3rd', accountName: 'Restaurant 64', percent: '63%', YestGrade: '2nd', YestPercent: '90%', style: '', displayOrder: 3},
 		{grade: '4th', accountName: 'Restaurant 54', percent: '54%', YestGrade: '1st', YestPercent: '93%', style: '', displayOrder: 4},
 		{grade: '5th', accountName: 'Restaurant 423', percent: '33%', YestGrade: '6th', YestPercent: '75%', style: '', displayOrder: 5},
 		{grade: '6th', accountName: 'Restaurant 411', percent: '31%', YestGrade: '5th', YestPercent: '80%', style: '', displayOrder: 6}
 	];

 	return {
 		initOpportunities: function() {
	 		for (var i = rptOpportunities.length - 1; i >= 0; i--) {
	 			if(rptOpportunities[i].displayOrder % 2 == 1)
		 			rptOpportunities[i].style = "#f8f8f8";
		 		if(rptOpportunities[i].tendency == "rise")
		 			rptOpportunities[i].status = "up";
		 		else if(rptOpportunities[i].tendency == "decline")
		 			rptOpportunities[i].status = "down";
	 		};
	 		return MockupService.makePromise(rptOpportunities, null, true);
 		},

 		initOppsDates: function() {
 			for (var i = rptOppsDetails.length - 1; i >= 0; i--) {
 				if(rptOppsDetails[i].displayOrder % 2 == 1)
 					rptOppsDetails[i].style = "#f8f8f8";
 				for (var j = rptOppsDetails[i].details.length - 1; j >= 0; j--) {
 					if(rptOppsDetails[i].details[j].status == "standard") {
 						rptOppsDetails[i].details[j].icon = "ion-record";
 						rptOppsDetails[i].details[j].color = "red";
 					} else if(rptOppsDetails[i].details[j].status == "underPerform") {
 						rptOppsDetails[i].details[j].icon = "ion-record";
 						rptOppsDetails[i].details[j].color = "green";
 					} else if(rptOppsDetails[i].details[j].status == "underPerformReturn") {
 						rptOppsDetails[i].details[j].icon = "ion-android-alert";
 						rptOppsDetails[i].details[j].color = "green";
 					}
 				};
 			};
 			return MockupService.makePromise(rptOppsDetails, null, true);
 		},

 		getCompetitiveList: function() {
 			for (var i = competitiveList.length - 1; i >= 0; i--) {
 				if(competitiveList[i].displayOrder == 1) {
 					competitiveList[i].style = "#F0F086";
 				} else if(competitiveList[i].displayOrder == 2) {
 					competitiveList[i].style = "#A3A3A3";
 				} else if(competitiveList[i].displayOrder == 3) {
 					competitiveList[i].style = "#BA8E80";
 				} else {
 					competitiveList[i].style = "#FFFFFF";
 				}
 			};
 			console.log(competitiveList);
 			return MockupService.makePromise(competitiveList, null, true);
 		},

 		getRptOpportunities: function() {
 			return rptOpportunities;
 		},

 		getRptOppsDetails: function() {
 			return rptOppsDetails;
 		},

 		getBadges: function() {
 			return badges;
 		}
 	};
 }])

 