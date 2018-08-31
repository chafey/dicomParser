import { expect } from 'chai';
import DataSet from '../src/dataSet';
import ByteStream from '../src/byteStream';
import littleEndianByteArrayParser from '../src/littleEndianByteArrayParser';
import * as dicomDataSetParsers from '../src/parseDicomDataSet';

describe('parseDicomDataSet', () => {

  describe('#parseDicomDataSetExplicit', () => {

    function makeTestData() {
      const byteArray = new Uint8Array(26);

      byteArray[0] = 0x11;
      byteArray[1] = 0x22;
      byteArray[2] = 0x33;
      byteArray[3] = 0x44;
      byteArray[4] = 0x4F; // OB
      byteArray[5] = 0x42;
      byteArray[6] = 0x00;
      byteArray[7] = 0x00;
      byteArray[8] = 0x00; // length = 0
      byteArray[9] = 0x00;
      byteArray[10] = 0x00;
      byteArray[11] = 0x00;
      byteArray[12] = 0x10;
      byteArray[13] = 0x22;
      byteArray[14] = 0x33;
      byteArray[15] = 0x44;
      byteArray[16] = 0x4F; // OB
      byteArray[17] = 0x42;
      byteArray[18] = 0x00; // OB
      byteArray[19] = 0x00;
      byteArray[20] = 0x02; // length = 2
      byteArray[21] = 0x00;
      byteArray[22] = 0x00;
      byteArray[23] = 0x00;
      byteArray[24] = 0x00;
      byteArray[25] = 0x00;

      return byteArray;
    }

    it('should create and return a dataset', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

      // Act
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});
      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Assert
      expect(dataSet).to.be.ok;
    });

    it('should return a dataset with two elements', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

      // Act
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Assert
      expect(dataSet.elements.x22104433).to.be.ok;
      expect(dataSet.elements.x22114433).to.be.ok;
    });

  });

  describe('#parseDicomDataSetImplicit', () => {

    function convertToByteArray(bytes) {
      const byteArray = new Uint8Array(bytes.length);
      let i = 0;

      bytes.forEach((byte) => { byteArray[i++] = byte; });

      return byteArray;
    }

    it('bytes resembling an item tag are not treated like an SQ item when using a callback', () => {
      // Arrange
      // (7fe0,0010)                               8
      const bytes = [0xe0, 0x7f, 0x10, 0x00, 0x08, 0x00, 0x00, 0x00,
        // Looks like an item tag, but isn't since it's within pixel data
        0xfe, 0xff, 0x00, 0xe0, 0x0A, 0x00, 0x00, 0x00,
      ];
      const callback = (tag) => {
        return (tag === 'x7fe00010') ? false : undefined;
      };
      const byteArray = convertToByteArray(bytes);
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      // Act
      dicomDataSetParsers.parseDicomDataSetImplicit(dataSet, byteStream, byteStream.byteArray.length, {vrCallback: callback});

      // Assert
      const element = dataSet.elements['x7fe00010'];
 
      expect(element).to.be.ok;
      expect(element.items).to.be.undefined;
      expect(element.length).to.equal(8);
    });

  });

});