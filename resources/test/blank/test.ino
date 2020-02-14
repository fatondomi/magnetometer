
#include <Wire.h>

#define addr 0x0D
int16_t x, y, z;

void setup()
{
  Serial.begin(115200);
  Wire.begin();

  Wire.beginTransmission(addr);
  Wire.write(0x0B);
  Wire.write(0x01);
  Wire.endTransmission();
  
  Wire.beginTransmission(addr);
  Wire.write(0x09);
  Wire.write(0x1D);
  Wire.endTransmission();
}

void loop()
{  
  Wire.beginTransmission(addr);
  Wire.write(0x00);
  Wire.endTransmission();

  Wire.requestFrom(addr, 6);

  if(6 <= Wire.available())
  {
    x = Wire.read();
    x |= Wire.read() << 8;

    z = Wire.read();
    z |= Wire.read() << 8;
    
    y = Wire.read();
    y |= Wire.read() << 8;

    Serial.println(y);
  }
  
  delay(10);
}
