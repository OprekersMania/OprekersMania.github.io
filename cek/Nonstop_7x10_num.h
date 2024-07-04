// Font AdafruitGfx = Nonstop_7x10_num.h
// Font Height = 10 pixels
// Font Set = space !"#$%&'()*+,-./0123456789
// Script editor mod by DONY OPREKERS

const uint8_t Nonstop_7x10_numBitmaps[] PROGMEM = {
  0xF9, 0x9F, 0xFF, 0x06, 0x0C, 0x99, 0x32, 0x64, 0xC1, 0x83, 0xFC, 0x00, 
  0xFC, 0x63, 0x94, 0xA5, 0x29, 0x4B, 0xC0, 0xFF, 0x06, 0x0F, 0x98, 0x30, 
  0x67, 0xC1, 0x83, 0xFC, 0x00, 0xFF, 0x06, 0x0F, 0x98, 0x30, 0x7C, 0xC1, 
  0x83, 0xFC, 0x00, 0xFF, 0x26, 0x4C, 0x98, 0x30, 0x7C, 0x89, 0x12, 0x3C, 
  0x00, 0xFF, 0x06, 0x0C, 0xF8, 0x30, 0x7C, 0xC1, 0x83, 0xFC, 0x00, 0xFF, 
  0x06, 0x0C, 0xF8, 0x30, 0x64, 0xC1, 0x83, 0xFC, 0x00, 0xFF, 0x06, 0x0F, 
  0x91, 0x22, 0x44, 0x89, 0x12, 0x3C, 0x00, 0xFF, 0x06, 0x0C, 0x98, 0x30, 
  0x64, 0xC1, 0x83, 0xFC, 0x00, 0xFF, 0x06, 0x0C, 0x98, 0x30, 0x7C, 0xC1, 
  0x83, 0xFC, 0x00
};

const GFXglyph Nonstop_7x10_numGlyphs[] PROGMEM = {
//    Pos  Col  Row  Xadv  Xoff  Base    Ascii hex   Char    Hex Count
  {     0,   0,   0,   6,    0,    0 },   // 0x20     ' '     '0'
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
  {     0,   4,   4,   5,    0,    6 },   // 0x2E     '.'     '2'
  {     0,   0,   0,   0,    0,    0 },   // 0x2F     '/'     '0'
  {     2,   7,  10,   8,    0,    0 },   // 0x30     '0'     '10'
  {    12,   5,  10,   6,    0,    0 },   // 0x31     '1'     '7'
  {    19,   7,  10,   8,    0,    0 },   // 0x32     '2'     '10'
  {    29,   7,  10,   8,    0,    0 },   // 0x33     '3'     '10'
  {    39,   7,  10,   8,    0,    0 },   // 0x34     '4'     '10'
  {    49,   7,  10,   8,    0,    0 },   // 0x35     '5'     '10'
  {    59,   7,  10,   8,    0,    0 },   // 0x36     '6'     '10'
  {    69,   7,  10,   8,    0,    0 },   // 0x37     '7'     '10'
  {    79,   7,  10,   8,    0,    0 },   // 0x38     '8'     '10'
  {    89,   7,  10,   8,    0,    0 }    // 0x39     '9'     '10'
};

const GFXfont Nonstop_7x10_num PROGMEM = {
  (uint8_t *) Nonstop_7x10_numBitmaps,
  (GFXglyph *)Nonstop_7x10_numGlyphs,0x20,0x39,  10 };

// Approx. 1684 bytes
