#define F_CPU 16000000UL
#include <avr/io.h>

#include <stdio.h>

// delay alternative
void timer1_init() {
    // CTC mode, prescaler 64
    TCCR1A = 0;                  // Normal port operation
    TCCR1B = (1 << WGM12) | (1 << CS11) | (1 << CS10); // CTC + prescaler 64

    OCR1A = 249; // 16MHz / 64 / 1000 - 1 = 249 for 1ms
    TCNT1 = 0;   // Start counting from 0
}
void delay_ms(uint16_t ms) {
    while(ms--) {
        TCNT1 = 0;          // Reset counter
        TIFR1 |= (1 << OCF1A); // Clear compare match flag
        while (!(TIFR1 & (1 << OCF1A))); // Wait for 1ms
    }
}



//////
void uart_print_hex(uint8_t val) {
    char c;
    uint8_t nibble;

    nibble = (val >> 4) & 0x0F;
    c = nibble < 10 ? '0' + nibble : 'A' + nibble - 10;
    while (!(UCSR0A & (1 << UDRE0)));
    UDR0 = c;

    nibble = val & 0x0F;
    c = nibble < 10 ? '0' + nibble : 'A' + nibble - 10;
    while (!(UCSR0A & (1 << UDRE0)));
    UDR0 = c;
}


/* --- Pin Definitions --- */
#define SS_PIN   PB2
#define RST_PIN  PB1
#define SS_LOW()   (PORTB &= ~(1 << SS_PIN))
#define SS_HIGH()  (PORTB |=  (1 << SS_PIN))
#define RST_LOW()  (PORTB &= ~(1 << RST_PIN))
#define RST_HIGH() (PORTB |=  (1 << RST_PIN))

/* --- RC522 Registers & Commands --- */
#define FIFODataReg   0x09
#define FIFOLevelReg  0x0A
#define ControlReg    0x0C
#define BitFramingReg 0x0D
#define CollReg       0x0E
#define CommIEnReg    0x02
#define CommIrqReg    0x04
#define ErrorReg      0x06
#define CommandReg    0x01

#define PCD_IDLE       0x00
#define PCD_TRANSCEIVE 0x0C
#define PICC_REQALL    0x26
#define PICC_ANTICOLL  0x93

/* --- SPI & UART --- */
void spi_init() {
    DDRB |= (1 << PB3) | (1 << PB5) | (1 << SS_PIN) | (1 << RST_PIN);
    SPCR = (1 << SPE) | (1 << MSTR) | (1 << SPR0); // 1MHz for stability
}

uint8_t spi_transfer(uint8_t data) {
    SPDR = data;
    while (!(SPSR & (1 << SPIF)));
    return SPDR;
}

void uart_init() {
    UBRR0L = 103; // 9600 baud @ 16MHz
    UCSR0B = (1 << TXEN0);
    UCSR0C = (1 << UCSZ01) | (1 << UCSZ00);
}

void uart_print(const char* s) { while(*s) { while(!(UCSR0A & (1<<UDRE0))); UDR0 = *s++; } }

void rc522_write(uint8_t reg, uint8_t val) {
    SS_LOW();
    spi_transfer((reg << 1) & 0x7E);
    spi_transfer(val);
    SS_HIGH();
}

uint8_t rc522_read(uint8_t reg) {
    SS_LOW();
    spi_transfer(((reg << 1) & 0x7E) | 0x80);
    uint8_t val = spi_transfer(0x00);
    SS_HIGH();
    return val;
}

/* --- Core Logic: The Ghost Buster --- */
uint8_t rc522_to_card(uint8_t cmd, uint8_t *send_data, uint8_t send_len, uint8_t *back_data, uint16_t *back_len) {
    uint8_t status = 0;
    uint8_t irqEn = 0x77;
    uint8_t waitIRq = 0x30; // RxIRQ and IdleIRQ

    rc522_write(CommIEnReg, irqEn | 0x80);
    rc522_write(CommIrqReg, 0x7F);        // Clear IRQs
    rc522_write(FIFOLevelReg, 0x80);      // Flush FIFO
    rc522_write(CommandReg, PCD_IDLE);    // Stop current action

    // Write data to FIFO
    for (uint8_t i = 0; i < send_len; i++) {
        rc522_write(FIFODataReg, send_data[i]);
    }

    rc522_write(CommandReg, cmd);
    if (cmd == PCD_TRANSCEIVE) {
        rc522_write(BitFramingReg, rc522_read(BitFramingReg) | 0x80); // StartSend
    }

    // Wait for response
    uint16_t i = 2000; 
    while (i--) {
        uint8_t n = rc522_read(CommIrqReg);
        if (n & waitIRq) { status = 1; break; }
        if (n & 0x01) { return 0; } // Timeout IRQ
    }

    if (status) {
        uint8_t error = rc522_read(ErrorReg);
        if (error & 0x1B) return 0; // BufferOvfl, CollErr, ParityErr, ProtErr

        uint8_t n = rc522_read(FIFOLevelReg);
        if (back_data && back_len) {
            if (n < *back_len) *back_len = n;
            for (i = 0; i < *back_len; i++) {
                back_data[i] = rc522_read(FIFODataReg);
            }
        }
        return 1;
    }
    return 0;
}

uint8_t rc522_request(uint8_t *type) {
    uint16_t len = 2;
    rc522_write(BitFramingReg, 0x07); // 7 bits in last byte
    uint8_t cmd = PICC_REQALL;
    return rc522_to_card(PCD_TRANSCEIVE, &cmd, 1, type, &len);
}

uint8_t rc522_get_uid(uint8_t *uid) {
    uint16_t len = 5;
    rc522_write(BitFramingReg, 0x00); 
    uint8_t cmd[2] = { PICC_ANTICOLL, 0x20 };
    if (rc522_to_card(PCD_TRANSCEIVE, cmd, 2, uid, &len)) {
        // Simple BCC check: uid[0]^uid[1]^uid[2]^uid[3] == uid[4]
        if ((uid[0] ^ uid[1] ^ uid[2] ^ uid[3]) == uid[4]) return 1;
    }
    return 0;
}

void rc522_init() {
    RST_LOW();
    delay_ms(50);
    RST_HIGH();
    delay_ms(50);

    rc522_write(0x2A, 0x8D); // TModeReg
    rc522_write(0x2B, 0x3E); // TPrescalerReg
    rc522_write(0x2D, 30);   // TReloadRegL
    rc522_write(0x2C, 0);    // TReloadRegH
    rc522_write(0x15, 0x40); // WaterLevel
    rc522_write(0x11, 0x3D); // ModeReg
    rc522_write(0x26, 0x70); // RxGain to 48dB (MAX) - helps with ghosts!
    rc522_write(0x14, rc522_read(0x14) | 0x03); // Antenna ON
}
/////

int main() {
    timer1_init();
    spi_init();
    uart_init();
    rc522_init();

    uint8_t buffer[5];
    char hex[20];

    while(1) {
        if (rc522_request(buffer)) {
            if (rc522_get_uid(buffer)) {
                uart_print("CARD ID: ");
                for(int i=0; i<4; i++) {
    uart_print_hex(buffer[i]);
    while (!(UCSR0A & (1 << UDRE0)));
    UDR0 = ' '; // optional space
}

                uart_print("\r\n");
            }
        }
        delay_ms(500);  
    }
}