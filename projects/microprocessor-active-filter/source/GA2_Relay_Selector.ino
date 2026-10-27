/*
  Active low-pass filter, five-WaveGen relay selector

  Surname: Teise
  Portfolio demonstration 
  R = 100 kOhm, C = 10 nF, Profile C
  fc = 1 / (2*pi*R*C) = 159.15 Hz

  The five sine waves come from SimulIDE Wave Generators.
  This program only selects ONE source at a time through relays.

  Pin mapping (NPN driver: HIGH = relay ON, LOW = relay OFF):
    F1 -> D2   F2 -> D3   F3 -> D4   F4 -> D5   F5 -> D6
*/

const uint8_t NUM_SOURCES = 5;

// 1. Relay control pins stored in an array
const uint8_t relayPins[NUM_SOURCES] = {2, 3, 4, 5, 6};

// Calculated test frequencies (multiplier x fc) for Profile C
const char* sourceNames[NUM_SOURCES] = {"F1", "F2", "F3", "F4", "F5"};
const float multipliers[NUM_SOURCES] = {0.25, 0.50, 1.00, 1.50, 2.50};
const float freqHz[NUM_SOURCES]      = {39.7887, 79.5775, 159.1549, 238.7324, 397.8874};

// Active / inactive levels for the NPN transistor driver circuit
const uint8_t RELAY_ON  = HIGH;
const uint8_t RELAY_OFF = LOW;

// Timing (milliseconds)
const unsigned long DWELL_MS = 10000; // time each source stays connected (10 s)
const unsigned long GAP_MS   = 300;   // all-off interval (break-before-make)

enum State { STATE_GAP, STATE_DWELL };
State state = STATE_GAP;
uint8_t current = 0;                  // source currently selected
int8_t  nextSource = 0;               // source to connect after the gap
unsigned long stateStart = 0;

// Disconnect every source channel
void allOff() {
  for (uint8_t i = 0; i < NUM_SOURCES; i++) {
    digitalWrite(relayPins[i], RELAY_OFF);
  }
}

// Connect exactly one source (all others are switched off first)
void selectSource(uint8_t index) {
  allOff();
  digitalWrite(relayPins[index], RELAY_ON);
  current = index;

  Serial.print("Selected ");
  Serial.print(sourceNames[index]);
  Serial.print(" | pin D");
  Serial.print(relayPins[index]);
  Serial.print(" | multiplier ");
  Serial.print(multipliers[index], 2);
  Serial.print(" x fc | frequency ");
  Serial.print(freqHz[index], 2);
  Serial.println(" Hz");
}

void setup() {
  Serial.begin(9600);

  // 2. Safe initialisation: set pins as outputs and disconnect all sources
  for (uint8_t i = 0; i < NUM_SOURCES; i++) {
    pinMode(relayPins[i], OUTPUT);
  }
  allOff();

  Serial.println("GA2 relay selector started");
  Serial.println("Surname: Teise");
  Serial.println("R = 100 kOhm | C = 10 nF | Profile C | fc = 159.15 Hz");
  Serial.print("Dwell time ");
  Serial.print(DWELL_MS);
  Serial.print(" ms, all-off gap ");
  Serial.print(GAP_MS);
  Serial.println(" ms");

  state = STATE_GAP;
  nextSource = 0;
  stateStart = millis();
  Serial.println("All sources disconnected");
}

void loop() {
  unsigned long now = millis();

  // 6. millis()-based timing, no long blocking delay
  if (state == STATE_GAP) {
    // 4. Break-before-make: all relays stay OFF during the gap
    if (now - stateStart >= GAP_MS) {
      selectSource(nextSource);
      state = STATE_DWELL;
      stateStart = now;
    }
  } else {
    if (now - stateStart >= DWELL_MS) {
      allOff();
      Serial.println("All sources disconnected (switching interval)");
      nextSource = (current + 1) % NUM_SOURCES;  // 5. cycle F1..F5, then repeat
      state = STATE_GAP;
      stateStart = now;
    }
  }
}
