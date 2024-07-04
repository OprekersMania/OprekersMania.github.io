// Font AdafruitGfx = Nonstop_7x11_num_inv.h
// Font Height = 11 pixels
// Font Set = space !"#$%&'()*+,-./0123456789
// Script editor mod by DONY OPREKERS

const uint8_t Nonstop_7x11_num_invBitmaps[] PROGMEM = {
  0xFF, 0x80, 0xFF, 0xFF, 0xFF, 0x7E, 0xFD, 0xFB, 0xF7, 0xFF, 0xFF, 0xF8, 
  0x00, 0xFF, 0xF7, 0x77, 0x77, 0x77, 0x70, 0xFF, 0xFF, 0xF8, 0x7F, 0xFF, 
  0xFF, 0xF0, 0xFF, 0xFF, 0xF8, 0x00, 0xFF, 0xFF, 0xF8, 0x7F, 0xFF, 0xFF, 
  0x87, 0xFF, 0xFF, 0xF8, 0x00, 0xEF, 0xDF, 0xBF, 0x7F, 0xFF, 0xFF, 0x87, 
  0x0E, 0x1C, 0x38, 0x00, 0xFF, 0xFF, 0xFF, 0x0F, 0xFF, 0xFF, 0x87, 0xFF, 
  0xFF, 0xF8, 0x00, 0xFF, 0xFF, 0xFF, 0x0F, 0xFF, 0xFF, 0xF7, 0xFF, 0xFF, 
  0xF8, 0x00, 0xFF, 0xFF, 0xF8, 0x70, 0xE1, 0xC3, 0x87, 0x0E, 0x1C, 0x38, 
  0x00, 0xFF, 0xFF, 0xFF, 0x7F, 0xFF, 0xFF, 0xF7, 0xFF, 0xFF, 0xF8, 0x00, 
  0xFF, 0xFF, 0xFF, 0x7F, 0xFF, 0xFF, 0x87, 0xFF, 0xFF, 0xF8, 0x00
};

const GFXglyph Nonstop_7x11_num_invGlyphs[] PROGMEM = {
//    Pos  Col  Row  Xadv  Xoff  Base    Ascii hex   Char    Hex Count
  {     0,   0,   0,   5,    0,    0 },   // 0x20     ' '     '0'
  {     0,   0,   0,   0,    0,    0 },   // 0x21     '!'     '0'
  {     0,   0,   0,   0,    0,    0 },   // 0x22     '"'     '0'
  {     0,   0,   0,   0,    0,    0 },   // 0x23     '#'     '0'
  {     0,   0,   0,   0,    0,    0 },   // 0x24     '$'     '0'
  {     0,   0,   0,   0,    0,    0 },   // 0x25     '%'     '0'
  {     0,   0,   0,   0,    0,    0 },   // 0x26     '&'     '0'
  {     0,   0,   0,   0,    0,    0 },   // 0x27     '''     '0'
  {     0,   0,   0,   0,    0,    0 },   // 0x28     '('     '0'
  {     0,   0,   0,   0,    0,    0 },   // 0x29     ')'     '0'
  {     0,   0,   0,   0,    0,    0 },   // 0x2A     '*'     '0'
  {     0,   0,   0,   0,    0,    0 },   // 0x2B     '+'     '0'
  {     0,   0,   0,   0,    0,    0 },   // 0x2C     ','     '0'
  {     0,   0,   0,   0,    0,    0 },   // 0x2D     '-'     '0'
  {     0,   3,   3,   4,    0,    8 },   // 0x2E     '.'     '2'
  {     0,   0,   0,   0,    0,    0 },   // 0x2F     '/'     '0'
  {     2,   7,  11,   8,    0,    0 },   // 0x30     '0'     '11'
  {    13,   4,  11,   5,    0,    0 },   // 0x31     '1'     '6'
  {    19,   7,  11,   8,    0,    0 },   // 0x32     '2'     '11'
  {    30,   7,  11,   8,    0,    0 },   // 0x33     '3'     '11'
  {    41,   7,  11,   8,    0,    0 },   // 0x34     '4'     '11'
  {    52,   7,  11,   8,    0,    0 },   // 0x35     '5'     '11'
  {    63,   7,  11,   8,    0,    0 },   // 0x36     '6'     '11'
  {    74,   7,  11,   8,    0,    0 },   // 0x37     '7'     '11'
  {    85,   7,  11,   8,    0,    0 },   // 0x38     '8'     '11'
  {    96,   7,  11,   8,    0,    0 }    // 0x39     '9'     '11'
};

const GFXfont Nonstop_7x11_num_inv PROGMEM = {
  (uint8_t *) Nonstop_7x11_num_invBitmaps, 
  (GFXglyph *)Nonstop_7x11_num_invGlyphs, 0x20, 0x39,   11};

// File size approx : 2.82kb