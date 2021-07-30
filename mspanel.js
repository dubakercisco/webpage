// find icons at https://fontawesome.com/icons?m=free


const hostname = "10.0.11.144";
const username = "remotesupport";
const password = "ytxFjTZMCl";

var xapi;

var ngApp = angular.module('ngApp', []);

ngApp.controller('ctrl', function ($scope) {
    jsxapi.connect(`wss://${hostname}`, { username, password })
    .on('error', (message) => {
        document.body.classList.add("error");
        console.error(message);
    })
    .on('ready',  (api) => {
        xapi = api;

        $scope.date = new Date();
        setInterval(function() {
            $scope.date = new Date();
        }, 60000);
        
        
        document.body.classList.remove("connecting");
        xapi.status.get('*').then((status) => {
            $scope.status = status;
            $scope.$digest();
            console.log($scope);
        });
        getCurrentCall($scope);
        getCurrentBooking($scope);
        getParticipants($scope);

        $scope.dial = function() {
            xapi.command("Dial", {Number: $scope.number}).then(function() {
                console.log("Dialed: " + $scope.number);
                $scope.number = null;
            }).catch(function(error) {
                console.log("Error dialling number: " + error.message);
            })
        };

        $scope.command = function(command,  data) {
            xapi.command(command, data).then(function() {
                xapi.status.get('*').then((status) => { 
                    $scope.$apply( function() {
                        $scope.status = status;
                        getParticipants($scope);
                        
                                          
                    });
                }).catch(function(error) {
                    console.log("Error executing command (" + command + "): " + error.message);
                });
            });
        };

        //feedback handlers
        xapi.status.on('Conference', () => {
            xapi.status.get('*').then((status) => {
                $scope.$apply( function() {
                    $scope.status = status;

                    getParticipants($scope);
                    getCurrentBooking($scope);
                    getCurrentCall($scope);
                });  
            });
        });

        xapi.status.on('Call', () => {
            xapi.status.get('*').then((status) => {
                $scope.$apply( function() {
                    $scope.status = status;
                    getParticipants($scope);
                    getCurrentBooking($scope);
                    getCurrentCall($scope);
                });
            });
        });

        xapi.status.on('Audio', () => {
            xapi.status.get('*').then((status) => {
                $scope.$apply( function() {
                    $scope.status = status;
                    getParticipants($scope);
                    getCurrentBooking($scope);
                    getCurrentCall($scope);
                });
            });
        });

        xapi.status.on('Video', () => {   
            xapi.status.get('*').then((status) => {
                $scope.$apply( function() {
                    $scope.status = status;

                    getParticipants($scope);
                    getCurrentBooking($scope);
                    getCurrentCall($scope);
                });
            });
        });
    });
});

function getCurrentCall($scope) {
    xapi.status.get("Call").then((calls) => {
        var current;
        for (var i = 0; i < calls.length; i++) {
            if(calls[i].Status === "Connected") {
                current = calls[i];
            }
        }

        $scope.call = current;
        $scope.$digest();
    });
}

function getCurrentBooking($scope) {
    var nullbooking;
    xapi.status.get("Conference Call BookingId").then((booking) => {
        xapi.command("Bookings Get", {Id: booking}).then(function(booking) {
            $scope.booking = booking.Booking;
            $scope.$digest();
        }).catch(function(error) {
            $scope.booking = nullbooking;
            $scope.$digest();
        });
    }).catch(function(error) {
        $scope.booking = nullbooking;
        $scope.$digest();
    });
}

function getParticipants($scope) {
    xapi.command("Conference ParticipantList Search").then(function(participants) {
        var self = participants.ParticipantSelf;
        var otherParticipants = [];

        for( var i = 0; i < participants.Participant.length; i++) {
            var participant = participants.Participant[i];
            if (participant.Status === "connected") {
                otherParticipants.push(participant);
            }
        }
        $scope.participants = otherParticipants;
        $scope.me = self;
    }).catch(function(error) {
        $scope.participants = [];
    });
}