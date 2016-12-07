//
//  AlertViewPlugin.m
//  ionicTask
//
//  Created by Summer Wu on 15-1-22.
//
//

#import "BlueThermPlugin.h"

@implementation BlueThermPlugin

-(void)stopTakeTemp:(CDVInvokedUrlCommand *)command
{
    _isThermPressedToRead = NO;
}

-(void)takeTemp:(CDVInvokedUrlCommand *)command
{
    [EAController setAlertMessagesDelegate:self];
    //    UIAlertView *test001 = [[UIAlertView alloc]initWithTitle:@"测试" message:@"这里是alertView插件测试" delegate:nil cancelButtonTitle:@"OK" otherButtonTitles: nil];
    //    [test001 show];
    _command = command;
    
    
    [self doSend];
    
    
    
    
}

bool duoProbeConnected;// is a single or duo probe connected


-(void)readingAndDisplaying{
    
    [self setupThermFirstReading];
    if (_isThermPressedToRead) {
        NSString *str = [ProbeProperties sensor1Reading];
        CDVPluginResult* pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:str];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_command.callbackId];
    }else{
        NSString *str = @"C";
        CDVPluginResult* pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:str];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_command.callbackId];
    }
}

-(void)setupThermFirstReading
{
    if(!_isFirstReadingInit)
    {
        //is the probe a duo or single
        BOOL duoProbeConnected = [ProbeProperties isBlueThermDuo];
        
        //getting the inital setup for the probe reading
        if (duoProbeConnected){
            //duo probe set up
            [ProbeProperties probeFirstReadingsDuo];
        }
        else {
            //single probe set up
        }
        _isFirstReadingInit = YES;
    }
}


-(void)settingTheProbe{
    
    //Probe information has been set to the probe
    NSLog(@"..................Set reply.....................");
}

-(void)probeButtonHasBeenPressed{
    
    //the probe button has been pressed
    NSLog(@"..............Probe button has been pressed...............");
    _isThermPressedToRead = !_isThermPressedToRead;
}

-(void)soundtheAlarmInBackground{
    
    //if connection lost and phone in backgroundmode = display alarm
}

-(void) doSend{
    
    if ([EAController sharedController].callBack == nil){
        EAController *eac = [EAController sharedController];
        if (!
            ([[eac selectedAccessory] isAwaitingUI] || [[eac selectedAccessory] isNoneAvailable])){
            if ([eac selectedAccessory] == nil || ![eac openSession]){
                NSLog(@"No BlueTherm is connected");
                //                NSString *str = @"NC";
                //                CDVPluginResult* pluginResult = nil;
                //                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:str];
                //                [self.commandDelegate sendPluginResult:pluginResult callbackId:_command.callbackId];
            }
            else{
                eac.callBack = self;
            }
        }
        else{
            NSString *str = @"NC";
            CDVPluginResult* pluginResult = nil;
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:str];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:_command.callbackId];
            return;
        }
    }
    [EAController doSend];
}


#pragma mark - alert message
- (void) alertMessagesplayAlarm{
    NSLog(@"MyAlertMessages - music");
}


- (void) alertMessagesCreateAlertViewNoConnectionFound{
    //[EAController sharedController].callBack = nil;
    NSLog(@"MyAlertMessages - no connection found");
}


- (void) alertMessagesCreateAlertViewNoConnectionFoundSHOW{
    NSLog(@"MyAlertMessages - no connection found");
}


- (void) alertMessagesCreateAlertViewNoConnectionFoundDISMISS {
    NSLog(@"MyAlertMessages - no connection found");
}


- (void) alertViewConnectionHasBeenLost {
    NSLog(@"MyAlertMessages - ThermService connection lost");
}


- (void) alertViewConnectionHasBeenLostSHOW {
    NSLog(@"MyAlertMessages - no connection found");
}


- (void) alertViewConnectionHasBeenLostDISMISS {
    NSLog(@"MyAlertMessages - no connection found");
}


@end
