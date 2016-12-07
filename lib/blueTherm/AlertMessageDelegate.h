//
//  AlertMessageDelegate.h
//  BlueThermIOS-SDK
//
//  Copyright (c) 2012 ETILtd.co.uk All rights reserved.
//
//

#import <Foundation/Foundation.h>

@protocol AlertMessageDelegate <NSObject>

-(void)alertMessagesplayAlarm;
-(void)alertMessagesCreateAlertViewNoConnectionFound;
-(void)alertMessagesCreateAlertViewNoConnectionFoundSHOW;
-(void)alertMessagesCreateAlertViewNoConnectionFoundDISMISS;
-(void)alertViewConnectionHasBeenLost;
-(void)alertViewConnectionHasBeenLostSHOW;
-(void)alertViewConnectionHasBeenLostDISMISS;

@end
