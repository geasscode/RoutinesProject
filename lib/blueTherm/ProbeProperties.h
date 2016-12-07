//
//  ProbeProperties.h
//  BlueThermIOS-SDK
//
//  Copyright (c) 2012 ETILtd.co.uk All rights reserved.
//

#import <UIKit/UIKit.h>
#import "EAController.h"

@interface ProbeProperties : NSObject

#pragma mark - probe readings and properties
//These are the methods for getting the readings from the probe
+(NSString*) batteryLevel;
+(NSString*) batteryTemperature;
+(NSString*) batteryVolts;
+(NSString*) calibration;
+(NSString*) firmware;
+(bool)input2Enabled; //sensor 2 enabled on a duo probe
+(bool) isBlueThermDuo; //duo or single probe connected
+(NSString*) serialNumber;

//sensor 1 readings
+(NSString*) sensor1HighLimit;
+(NSString*) sensor1LowLimit;
+(NSString*) sensor1Name;
+(NSString*) sensor1Reading;
+(NSString*) sensor1Trim;
+(NSString*) sensor1TrimDate;
+(NSString*) sensor1Type;
+(NSString*) sensor1Units;

//sensor 2 readings
+(NSString*) sensor2HighLimit;
+(NSString*) sensor2LowLimit;
+(NSString*) sensor2Name;
+(NSString*) sensor2Reading;
+(NSString*) sensor2Trim;
+(NSString*) sensor2TrimDate;
+(NSString*) sensor2Type;
+(NSString*) sensor2Units;


#pragma mark - inital set up of the probe
+(bool) degreesCorDegreesFProbeReturn; //Returns the °C or °F reading
+(bool) degreesCorDegreesFSingleProbeSetting;//Records the °C or °F reading for single probe
+(void) probeFirstReadingsDuo;//Duo probe first readings (what is displayed on the actual probe duo screen)


@end
