
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WebSocketsClient.h>
#include <Hash.h>
#include <Wire.h>

ESP8266WiFiMulti WiFiMulti;
WebSocketsClient webSocket;

// iphone ip 172.20.10.2
// Wifi_home ip 192.168.0.104
// M116  192.168.0.171

// ssid = "modelime&simulime";
// password = "modelimesimulime";
// ssid = "Wifi_home";
// password = "domi1211";

const char* ssid = "Wifi_home";
const char* password = "domi1211";

String ipAddress = "192.168.0.105";
int port = 8080;

bool isSocketConnected = false;
#define blueLedPin 2
double heartBeatTimeRef = 0;
double timeRef = 0;

String textReceived = "";

#define addr 0x0D
int16_t series[3] = {0, 0, 0}; // x,y,z
int seriesIndex = 2;

int interval = 10;

int fromHere,toHere;

/* the proper pinmap def 
    #define D0 16 
    #define D1 5 
    #define D2 4 
    #define D3 0 
    #define D4 2 - ledBuiltIn is inverted HIGH<->LOW
    #define D5 14 
    #define D6 12 
    #define D7 13 
    #define D8 15 
    #define D9 3 
    #define D10 1   
*/
String socketMessage = "42[\"sensorData\",{\"pt\":[";

void setup()
{
    // wire communication
    Wire.begin();

    Wire.beginTransmission(addr);
    Wire.write(0x0B);
    Wire.write(0x01);
    Wire.endTransmission();
    
    Wire.beginTransmission(addr);
    Wire.write(0x09);
    Wire.write(0x1D);
    Wire.endTransmission();
    // wire communication


    WiFiMulti.addAP(ssid, password);

    //WiFi.disconnect();
    while(WiFiMulti.run() != WL_CONNECTED)
    {
        delay(100);
    }

    webSocket.beginSocketIO(ipAddress, port);
    webSocket.onEvent(webSocketEvent);
    
    webSocket.sendTXT("2");
    heartBeatTimeRef = millis() + 5000;

    pinMode(blueLedPin,OUTPUT);
    digitalWrite(blueLedPin,HIGH);

    timeRef = millis();
}

void loop()
{
    webSocket.loop();

    if(millis() > heartBeatTimeRef) 
    {// Send message to keep socket opened
        if(isSocketConnected) { digitalWrite(blueLedPin,LOW); }
        heartBeatTimeRef = millis() + 5000;
        webSocket.sendTXT("2");
        digitalWrite(blueLedPin,HIGH);
    }

    sendNewPoints();
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length)
{
    switch(type)
    {
        case WStype_DISCONNECTED:
        {
            isSocketConnected = false;
            break;
        }
        case WStype_CONNECTED:
        {
            isSocketConnected = true;
			// send message to server when Connected
            // socket.io upgrade confirmation message (required)
		    webSocket.sendTXT("5");
            break;
        }
        case WStype_TEXT:
        {
		    // send message to server
		    // webSocket.sendTXT("message here");
            textReceived = (char*) payload;
            parseMessage(textReceived);
            textReceived = "";
            break;
        }
        case WStype_BIN:
        {
            // send data to server
            // webSocket.sendBIN(payload, length);
            break;
        }
    }
}

void sendNewPoints()
{
    if(millis() > timeRef)
    {
        timeRef = millis() + interval;
        
        Wire.beginTransmission(addr);
        Wire.write(0x00);
        Wire.endTransmission();

        Wire.requestFrom(addr, 6);

        if(6 <= Wire.available())
        {
            series[1] = Wire.read();
            series[1] |= Wire.read() << 8;

            series[2] = Wire.read();
            series[2] |= Wire.read() << 8;

            series[0] = Wire.read();
            series[0] |= Wire.read() << 8;
            //socketMessage = "42[\"sensorData\",{\"pt\":["
            webSocket.sendTXT(socketMessage + String(millis()) + "," + String(series[seriesIndex]) + "]}]");
        }
    }
}

void parseMessage(String msg)
{
    if(msg.indexOf("setInterval(") != -1)
    {
        fromHere = msg.indexOf("(") + 1;
        toHere = msg.indexOf(")");
        interval = msg.substring(fromHere,toHere).toInt();
    }
    else if(msg.indexOf("getSeries(") != -1)
    {
        fromHere = msg.indexOf("(") + 1;
        toHere = msg.indexOf(")");
        seriesIndex = msg.substring(fromHere,toHere).toInt();
    }
}
