#include <ESP8266WiFi.h>
#include <time.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#include "SdsDustSensor.h"
#include <PubSubClient.h>

#define DHTTYPE DHT11
#define DHTPIN D3
#define RX_PIN D1  // SDS011 TX           
#define TX_PIN D2  // SDS011 RX

// NTP
#define MY_NTP_SERVER "at.pool.ntp.org"
#define MY_TZ "<-04>4<-03>,M9.1.6/24,M4.1.6/24"
time_t now;
tm tm;

// WiFi
const char *ssid = "localhost";
const char *password = "a1b2c3d4e5";

// MQTT
const char* mqtt_server = "test.mosquitto.org";
const int mqtt_port = 1883;
const char topic1[] = "/lia/Aire/tt";
const char topic2[] = "/lia/Aire/hh";
const char topic3[] = "/lia/Aire/pm25";
const char topic4[] = "/lia/Aire/pm10";
const char topic5[] = "/lia/Aire/fecha";

// Objetos
DHT_Unified dht(DHTPIN, DHTTYPE);
SdsDustSensor sds(RX_PIN, TX_PIN);
WiFiClient espClient;
PubSubClient client(espClient);

// Reconexión WiFi
void checkWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado. Reintentando...");
    WiFi.disconnect();
    WiFi.begin(ssid, password);
    unsigned long startAttemptTime = millis();

    while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
      delay(500);
      Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\nReconectado a WiFi.");
    } else {
      Serial.println("\nNo se pudo reconectar a WiFi.");
    }
  }
}

// Reconexión MQTT
void reconnect() {
  while (!client.connected()) {
    Serial.print("Intentando conectar al servidor MQTT...");
    String clientId = "ESP8266Client-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str())) {
      Serial.println("Conectado");
    } else {
      Serial.print("Fallo, rc=");
      Serial.print(client.state());
      Serial.println(" intentando en 5 segundos");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);

  dht.begin();
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  configTime(MY_TZ, MY_NTP_SERVER);
  Serial.println("\nWiFi conectado. IP:");
  Serial.println(WiFi.localIP());

  client.setServer(mqtt_server, mqtt_port);

  sds.begin();
  Serial.println(sds.queryFirmwareVersion().toString());
  Serial.println(sds.setQueryReportingMode().toString());
  sds.sleep();
}

void loop() {
  checkWiFi();  // <-- Verifica conexión WiFi

  time(&now);
  localtime_r(&now, &tm);

  sensors_event_t event;
  float tt = NAN, hh = NAN;

  dht.temperature().getEvent(&event);
  if (!isnan(event.temperature)) {
    tt = event.temperature;
  }

  dht.humidity().getEvent(&event);
  if (!isnan(event.relative_humidity)) {
    hh = event.relative_humidity;
  }

  sds.wakeup();
  delay(30000); // 30 seg para que el SDS011 esté listo

  PmResult pm = sds.queryPm();

  char fecha[20];
  sprintf(fecha, "%.2d/%.2d/%.4d %.2d:%.2d:%.2d", tm.tm_mday, tm.tm_mon + 1, tm.tm_year + 1900, tm.tm_hour, tm.tm_min, tm.tm_sec);

  if (pm.isOk() && !isnan(pm.pm25) && !isnan(pm.pm10) && !isnan(tt) && !isnan(hh)) {
    Serial.printf("%s -> Temp: %.2f°C, Hum: %.2f%%, PM2.5 = %.2f, PM10 = %.2f\n", fecha, tt, hh, pm.pm25, pm.pm10);

    if (!client.connected()) {
      reconnect();
    }
    client.loop();

    client.publish(topic1, String(tt).c_str());
    delay(200);
    client.publish(topic2, String(hh).c_str());
    delay(200);
    client.publish(topic3, String(pm.pm25).c_str());
    delay(200);
    client.publish(topic4, String(pm.pm10).c_str());
    delay(200);
    client.publish(topic5, fecha);
    Serial.println("Datos enviados al broker MQTT.");
  } else {
    Serial.println("Error: No se obtuvo una medición válida. No se publicaron datos.");
  }

  sds.sleep();
  delay(300000); // espera 5 minutos
}
