//
//  AlertViewPlugin.h
//  ionicTask
//
//  Created by Summer Wu on 15-1-22.
//
//

#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>
#import "EAController.h"
#import "ProbeProperties.h"
#import "AlertMessageDelegate.h"

@interface BlueThermPlugin : CDVPlugin<ETIPassingData,AlertMessageDelegate>

@property (nonatomic,retain) id<ETIPassingData> callBack;
@property (nonatomic,retain) CDVInvokedUrlCommand * command;
@property (nonatomic) BOOL  isThermPressedToRead;
@property (nonatomic) BOOL  isFirstReadingInit;

-(void) stopTakeTemp:(CDVInvokedUrlCommand*)command;
-(void) takeTemp: (CDVInvokedUrlCommand*)command;

@end
