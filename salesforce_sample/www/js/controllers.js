angular.module('starter.controllers', ['forceng'])

    .controller('AppCtrl', function ($scope, force, $cordovaCamera, $q, $timeout, $cordovaSms, $rootScope, $cordovaBarcodeScanner) {

        $scope.logout = function() {
           	force.logout();
     //        console.log("inside logout");
			  // const oauthPlugin = window.cordova.require("com.salesforce.plugin.oauth");
			  // oauthPlugin.logout();
        };
        $scope.liveChatOption1 = function(){
            var loginWindow = window.open('https://c.cs17.visual.force.com/apex/LiveChatDemoVF', '_self', 'location=yes, clearsessioncache=yes');

        };

        $scope.liveChatOption2 = function(){
            var loginWindow = window.open('https://c.cs17.visual.force.com/apex/LiveChatDemoVF', '_system', 'location=yes, clearsessioncache=yes');

        };

        $scope.getUserInfobySession = function(){
            force.apexrest('/services/apexrest/v1/GetUserInfobySession/').then(
        //force.retrieve('PatientInformation','PA2200971', null).then(

            function (response) {
                console.log("getUserInfobySession"+response);
                console.log(response);
            },
            function (error){
                console.log("apexrest getUserInfobySession" +error);
            });
        };

        $scope.barcodeScan = function(){

        $cordovaBarcodeScanner
              .scan()
              .then(function(barcodeData) {
                alert("Success! Barcode data is " +barcodeData.text );
                console.log(barcodeData);
              }, function(error) {
                // An error occurred
                console.log("error "+error);
              });
      
        };

        $scope.capture = function(){
            console.log("captured!!!!!");
            var language = "english";
                var deferred = $q.defer();
                //*download language
                TesseractPlugin.loadLanguage('eng', function(response) {
                    console.log("1"+response);
                  deferred.resolve(response);
                }, function(reason) {
                  deferred.reject('Error on loading OCR file for your language. ' + reason);
                });

            //*capture camera
            var options = {
              quality: 50,
              destinationType: Camera.DestinationType.DATA_URL,
              sourceType: Camera.PictureSourceType.CAMERA,
              allowEdit: true,
              encodingType: Camera.EncodingType.JPEG,
              targetWidth: 100,
              targetHeight: 100,
              popoverOptions: CameraPopoverOptions,
              saveToPhotoAlbum: false,
              correctOrientation:true
            };

            $cordovaCamera.getPicture(options).then(function(imageData) {
                console.log("22");
              $scope.image = "data:image/jpeg;base64," + imageData;
              $scope.texttext = "Sorry! Can't recognize the text";
              //var rec;

              $timeout(function() {
                // DOM has finished rendering
                // insert here the call to TesseractPlugin.recognizeText function to recognize the text
                console.log("donee " +imageData );
                console.log("language "+language);
                
                //*recognize
                    TesseractPlugin.recognizeText(imageData, 'eng', function(recognizedText) {
                        console.log("Here is the recoginzed text:  "+recognizedText);
                        $scope.texttext = recognizedText;
                        //$scope.passValueToInApp(recognizedText);

                        $scope.$apply();
                        deferred.resolve(recognizedText);
                      }, function(reason) {
                        deferred.reject('Error on recognizing text from image. ' + reason);
                      });
                    
              });
            }, function(err) {
              // error
              console.log('ERROR with camera plugin. Error: ' + err);
            });
        };

        $scope.passValueToInApp = function(){
            //alert("scope value: "+$scope.texttext);
            //alert("username "+username);
             var username = $scope.texttext;
            //     var password = 'Harvey';
                //'location=yes');
                var loginWindow = window.open('https://html5doctor.com/demos/forms/forms-example.html ', '_blank', 'location=yes, clearsessioncache=yes');
                // $rootScope.$on('$cordovaInAppBrowser:loadstop', function(e, event){
                //     console.log(password + "??????r u there? "+username);
                //     code : "document.getElementById('given-name').value = '" + password + "'"
                // });

                loginWindow.addEventListener('loadstop', function() {
                    console.log($scope.texttext+ "r u there? "+ username);
                    loginWindow.executeScript({
                            code : "document.getElementById('given-name').value = '" + username + "'"
                            //code: "jQuery('input#username').val('" + username + "'), jQuery('input#password').val('" + password + "')"
                        }
                    );
                    
                });
        };

        $scope.sendSMS = function(){
        	console.log("composing sms here!");

        	var options = {
			    replaceLineBreaks: false, // true to replace \n by a new line, false by default
			    android: {
			      intent: 'INTENT' // send SMS with the native android SMS messaging
			        //intent: '' // send SMS without open any other app
			        //intent: 'INTENT' // send SMS inside a default SMS app
			    }
			  };
        	$cordovaSms.send('', '',options)
      			.then(function() {
        		// Success! SMS was sent
        		console.log("successfully sent sms");
      			}, function(error) {
        		// An error occurred
        		console.log("error occured:( "+error);
      			});
        };

    })

    .controller('ContactListCtrl', function ($scope, force) {

        force.query('select id, name, title from contact limit 50').then(
            function (data) {
                $scope.contacts = data.records;
            },
            function (error) {
                alert("Error Retrieving Contacts");
                console.log(error);
            });

    })

    .controller('ContactCtrl', function ($scope, $stateParams, force) {

        force.retrieve('contact', $stateParams.contactId, 'id,name,title,phone,mobilephone,email').then(
            function (contact) {
                $scope.contact = contact;
            });


    })

    .controller('EditContactCtrl', function ($scope, $stateParams, $ionicNavBarDelegate, force) {

        force.retrieve('contact', $stateParams.contactId, 'id,firstname,lastname,title,phone,mobilephone,email').then(
            function (contact) {
                $scope.contact = contact;
            });

        $scope.save = function () {
            force.update('contact', $scope.contact).then(
                function (response) {
                    $ionicNavBarDelegate.back();
                },
                function() {
                    alert("An error has occurred.");
                });
        };

    })

    .controller('CreateContactCtrl', function ($scope, $stateParams, $ionicNavBarDelegate, force) {

        $scope.contact = {};

        $scope.save = function () {
            force.create('contact', $scope.contact).then(
                function (response) {
                    $ionicNavBarDelegate.back();
                },
                function() {
                    alert("An error has occurred.");
                });
        };

    })

    .controller('AccountListCtrl', function ($scope, force) {

        force.query('select id, name from account limit 50').then(
            function (data) {
                $scope.accounts = data.records;
            });

    })

    .controller('AccountCtrl', function ($scope, $stateParams, force) {

        force.retrieve('account', $stateParams.accountId, 'id,name,phone,billingaddress').then(
            function (account) {
                $scope.account = account;
            });

    })

	.controller('ContactProfileCtrl', function ($scope, $stateParams, force) {
		console.log('ContactProfileCtrl' + $stateParams);

		force.apexrest('services/apexrest/v1/PatientInformation/PA2201018').then(
		//force.retrieve('PatientInformation','PA2200971', null).then(

			function (contact) {
				console.log('ContactProfileCtrl1111');
				$scope.contact = contact;
				$scope.shireId = contact.US_PM_Shire_Id__c;
				$scope.contact.message = 'Yes';
				console.log(contact);
				console.log($scope.contact + " "+contact.LastName + " " +contact.US_PM_Shire_Id__c);
			},
			function (error){
				console.log("apexrest" +error);
			});
		//$state.go('app.contactProfile',{profileId: contact.profileId});

		$scope.updateRecord = function(){
			//var showThis = angular.element('#updatedText').val();
			// alert(angular.element( document.querySelector( '#updatedText' ) ));
			 //alert( $scope.contact+ "showThis" + $scope.contact.message);
			//$scope.levmessagemobile = change;
			//alert("1"+ message.text);
			//var updatedString;
			// if(!updatedString){
			// 	var updatedString = 'Yes';
			// } else {
			// 	updatedString = 'No';
			// }

			var paramsObj = {
				method: 'POST',
        		path: 'services/apexrest/v2/InformationUpdateRequest',
        		data: {'id': '001g000001Pv8sY',
        				'levmessage': 'No',
        				'levmessagemobile': $scope.contact.message,
        				'Status': 'Open',
        				'levmessagehome': 'No',
        				'caseId': '500g000000F0ZdM',
        				'RecordTypeId': '012g00000000vlf'
        			  }
			};

			force.apexrest(paramsObj).then(
		//force.retrieve('PatientInformation','PA2200971', null).then(

			function (response) {
				console.log('succeessssssssss');
				alert("Successfully updated the leave message on mobile as '" + $scope.contact.message+" '");
				
			},
			function (error){
				console.log("apexrest" +error);
			});
		}
	})

	.controller('captureImageCtrl', function ($scope, $stateParams, force) {
        $scope.captureImage= function(){
            var ref = cordova.InAppBrowser.open('https://mobilehtml5.org/ts/?id=23','_system','location=yes');
        }

        $scope.passValue = function(){
//             localStorage.setItem("lastname", "Specter");
//             cordova.InAppBrowser.open('../www/templates/sample.html');
//             console.log(localStorage.getItem("lastname"));

                var username = 'Specter';
                var password = 'Harvey';
                //'location=yes');
                var loginWindow = window.open('https://html5doctor.com/demos/forms/forms-example.html ', '_blank', 'location=yes, clearsessioncache=yes');
                // $rootScope.$on('$cordovaInAppBrowser:loadstop', function(e, event){
                //     console.log(password + "??????r u there? "+username);
                //     code : "document.getElementById('given-name').value = '" + password + "'"
                // });

                loginWindow.addEventListener('loadstop', function() {
                    console.log("r u there? "+ username);
                    loginWindow.executeScript({
                            code : "document.getElementById('given-name').value = '" + username + "', document.getElementById('family-name').value = '" + password + "'"
                            //code: "jQuery('input#username').val('" + username + "'), jQuery('input#password').val('" + password + "')"
                        }
                    );
                    
                });
        }

        $scope.clearData = function(){
            window.localStorage.removeItem("lastname");
            console.log("after clear "+localStorage.getItem("lastname"));
        }
     })

    .controller('liveChatCtrl', function ($scope, $stateParams, force) {
        $scope.startSession = function(){
            console.log("startSession");
        }
     });

