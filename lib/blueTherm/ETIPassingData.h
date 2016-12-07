//
//  ETIPassingData.h
//  BlueThermIOS-SDK
//
//  Copyright (c) 2012 ETILtd.co.uk All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol ETIPassingData <NSObject>

-(void)readingAndDisplaying;//reading probe values
-(void)settingTheProbe;//setting probe values
-(void)probeButtonHasBeenPressed; //probe button has been pressed

-(void)soundtheAlarmInBackground;

@end
