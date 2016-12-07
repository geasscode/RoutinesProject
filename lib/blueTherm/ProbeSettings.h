//
//  ProbeSettings.h
//  BlueThermIOS-SDK
//
//  Copyright (c) 2012 ETILtd.co.uk All rights reserved.
//

#import <Foundation/Foundation.h>
#import "BlueThermObject.h"
#import "EAController.h"
#import "ProbeProperties.h"

@interface ProbeSettings : NSObject

//Changes the reading from °C and °F.  Also changes Probe reading Two on/off
+(void) setChangePacket:(BOOL)degreesC :(BOOL)input2Enabled requestPacket:(char *) requestPacket;


//Changing the sensor names - 
+ (void)setValueToProbe: (NSString*) sensorOne sensorTwo:(NSString*)sensorTwo;


//setting the high/low limits of the probe //(not implemented into the storyboard)
+(void)setLimit:(double) d input:(int) inputNo isHigh:(bool)isHighLimit;

@end


