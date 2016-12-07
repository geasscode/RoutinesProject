//
//  EAController.h
//  BlueThermIOS-SDK
//
//  Copyright (c) 2012 ETILtd.co.uk All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>
#import <ExternalAccessory/ExternalAccessory.h>

#import "ControllerReturn.h"
#import "BlueThermObject.h"

#import "ETIPassingData.h"
#import "AlertMessages.h"
#import "AlertMessageDelegate.h"

@interface EAController : NSObject <EAAccessoryDelegate, NSStreamDelegate, UIAlertViewDelegate>{
    
    NSMutableArray *_accessoryList; //How many probes did the bluetooth find
    EAAccessory *_selectedAccessory;
    EASession *_session;
    NSMutableArray * pa;
    int32_t diff;
    UInt8 holdOff;
}

@property (nonatomic, retain, readonly) ControllerReturn *selectedAccessory;

@property (nonatomic, copy) NSString *protocolString;
@property (strong) NSMutableData *writeDataBuffer;
@property (strong) NSMutableData *incomingBuffer;
@property (nonatomic,retain) id <ETIPassingData> callBack;
@property (nonatomic,retain) id<AlertMessageDelegate> setUpAlerts;

+ (void) setAlertMessagesDelegate: (id <AlertMessageDelegate>) del; //Pass the alertMessage delegate
+ (id <AlertMessageDelegate>) alertMessagesDelegate;

+(NSData*)passingData; //passing probe data through the classes

+(EAController*) sharedController;

-(void) writeData:(NSData* )data;
-(void) writeDataSkipHoldOff:(NSData*) data;

+(void)doSend;

-(BOOL)openSession;
-(BOOL)isAccessoryConnected;
-(void)setupControllerForAccessory:(EAAccessory *)accessory withProtocolString:(NSString *)protocolString;

@end
