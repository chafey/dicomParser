import { expect } from 'chai';
import ByteStream from '../src/byteStream';
import readDicomElementExplicit from '../src/readDicomElementExplicit';
import littleEndianByteArrayParser from '../src/littleEndianByteArrayParser';

function testFourByteLength(vr) {
    // Arrange
    const byteArray = new Uint8Array(16909060 + 12);

    byteArray[0] = 0x11;
    byteArray[1] = 0x22;
    byteArray[2] = 0x33;
    byteArray[3] = 0x44;
    byteArray[4] = vr.charCodeAt(0);
    byteArray[5] = vr.charCodeAt(1);
    byteArray[6] = 0x00;
    byteArray[7] = 0x00;
    byteArray[8] = 0x04; // 4    overall length = 16909060 = (16777216 + 131072 + 768 + 4)
    byteArray[9] = 0x03; // 768
    byteArray[10] = 0x02; // 131072
    byteArray[11] = 0x01; // 16777216

    const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

    // Act
    const element = readDicomElementExplicit(byteStream);

    // Assert
    expect(element.length).to.equal(16909060);
}

describe('readDicomElementExplicit', () => {

  it('should return an element', () => {
    // Arrange
    const byteArray = new Uint8Array(32);
    const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

    // Act
    const element = readDicomElementExplicit(byteStream);

    // Assert
    expect(element).to.be.ok;
  });

  it('should parse the tag correctly', () => {
    // Arrange
    const byteArray = new Uint8Array(32);

    byteArray[0] = 0x11;
    byteArray[1] = 0x22;
    byteArray[2] = 0x33;
    byteArray[3] = 0x44;
    
    const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

    // Act
    const element = readDicomElementExplicit(byteStream);

    // Assert
    expect(element.tag).to.equal('x22114433');
  });

  it('should parse vr correctly', () => {
    // Arrange
    const byteArray = new Uint8Array(32);

    byteArray[0] = 0x11;
    byteArray[1] = 0x22;
    byteArray[2] = 0x33;
    byteArray[3] = 0x44;
    byteArray[4] = 0x53; // ST
    byteArray[5] = 0x54;

    const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

    // Act
    const element = readDicomElementExplicit(byteStream);

    // Assert
    expect(element.vr).to.equal('ST');
  });

  it('should parse element for 2 bytes length correctly', () => {
    // Arrange
    const byteArray = new Uint8Array(1024);

    byteArray[0] = 0x11;
    byteArray[1] = 0x22;
    byteArray[2] = 0x33;
    byteArray[3] = 0x44;
    byteArray[4] = 0x53; // ST
    byteArray[5] = 0x54;
    byteArray[6] = 0x01; // length of 513
    byteArray[7] = 0x02;

    const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

    // Act
    const element = readDicomElementExplicit(byteStream);

    // Assert
    expect(element.length).to.equal(513);
  });

  it('should parse element for 4 bytes length correctly (OB)', () => {
    testFourByteLength('OB');
  });

  it('should parse element for 4 bytes length correctly (OD)', () => {
    testFourByteLength('OD');
  });

  it('should parse element for 4 bytes length correctly (OF)', () => {
    testFourByteLength('OF');
  });

  it('should parse element for 4 bytes length correctly (OL)', () => {
    testFourByteLength('OL');
  });

  it('should parse element for 4 bytes length correctly (OW)', () => {
    testFourByteLength('OW');
  });

  it('should parse element for 4 bytes length correctly (SQ)', () => {
    // Arrange
    const byteArray = new Uint8Array(16909060 + 12);

    byteArray[0] = 0x11;
    byteArray[1] = 0x22;
    byteArray[2] = 0x33;
    byteArray[3] = 0x44;
    byteArray[4] = 0x53; // SQ
    byteArray[5] = 0x51;
    byteArray[6] = 0x00;
    byteArray[7] = 0x00;
    byteArray[8] = 0x08; // Length = 8
    byteArray[9] = 0x00;
    byteArray[10] = 0x00;
    byteArray[11] = 0x00;
    byteArray[12] = 0xFE; // Begin item of zero length
    byteArray[13] = 0xFF;
    byteArray[14] = 0x00;
    byteArray[15] = 0xE0;
    byteArray[16] = 0x00;
    byteArray[17] = 0x00;
    byteArray[18] = 0x00;
    byteArray[19] = 0x00;

    const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

    // Act
    const element = readDicomElementExplicit(byteStream);

    // Assert
    expect(element.length).to.equal(8);
  });

  it('should parse element for 4 bytes length correctly (UC)', () => {
    testFourByteLength('UC');
  });

  it('should parse element for 4 bytes length correctly (UR)', () => {
    testFourByteLength('UR');
  });

  it('should parse element for 4 bytes length correctly (UT)', () => {
    testFourByteLength('UT');
  });

  it('should parse element for 4 bytes length correctly (UN)', () => {
    testFourByteLength('UN');
  });

  it('should parse element and return the right data offset', () => {
    // Arrange
    const byteArray = new Uint8Array(16909060 + 12);
  
    byteArray[0] = 0x11;
    byteArray[1] = 0x22;
    byteArray[2] = 0x33;
    byteArray[3] = 0x44;
    byteArray[4] = 0x4F; // OB
    byteArray[5] = 0x42;
    byteArray[6] = 0x00;
    byteArray[7] = 0x00;
    byteArray[8] = 0x04; // 4    overall length = 16909060 = (16777216 + 131072 + 768 + 4)
    byteArray[9] = 0x03; // 768
    byteArray[10] = 0x02; // 131072
    byteArray[11] = 0x01; // 16777216
  
    const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

    // Act
    const element = readDicomElementExplicit(byteStream);

    // Assert
    expect(element.dataOffset).to.equal(12);
  });

  it('should parse UN element of implicit length containing an embedded sequence', () => {
    // Arrange
    const byteArray = new Uint8Array([  
      0x01, 0x10, 0x00, 0x20, // (1001,2000)
      0x55, 0x4E, // UN
      0x00, 0x00, // Reserved bytes
      0xFF, 0xFF, 0xFF, 0xFF, // Undefined length

      // Empty item
      0xFE, 0xFF, 0x00, 0xE0,
      0xFF, 0xFF, 0xFF, 0xFF,

      // Nested empty sequence
      0x01, 0x10, 0x02, 0x20, // (1001,2002)
      0x53, 0x51, // SQ
      0x00, 0x00, // Reserved bytes
      0xFF, 0xFF, 0xFF, 0xFF, // Undefined length
      0xFE, 0xFF, 0xDD, 0xE0, // End of sequence
      0x00, 0x00, 0x00, 0x00,

      0xFE, 0xFF, 0x0D, 0xE0, // End of item
      0x00, 0x00, 0x00, 0x00,

      0xFE, 0xFF, 0xDD, 0xE0, // End of sequence
      0x00, 0x00, 0x00, 0x00,
    ]);

    const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

    // Act
    const element = readDicomElementExplicit(byteStream);

    // Assert
    expect(element.dataOffset).to.equal(12);
    expect(element.tag).to.equal('x10012000');
    expect(element.vr).to.equal('UN');
    expect(element.length).to.equal(44);
    expect(element.items.length).to.equal(1);
    expect(element.items[0].tag).to.equal('xfffee000');
    expect(element.items[0].dataSet.elements).to.have.all.keys(['x10012002']);
  });

});
