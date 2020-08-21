import findEndOfEncapsulatedElement from './findEndOfEncapsulatedPixelData.js';
import findAndSetUNElementLength from './findAndSetUNElementLength.js';
import readSequenceItemsImplicit  from './readSequenceElementImplicit.js';
import readTag from './readTag.js';
import findItemDelimitationItemAndSetElementLength from './findItemDelimitationItem.js';
import readSequenceItemsExplicit from './readSequenceElementExplicit.js';

/**
 * Internal helper functions for for parsing DICOM elements
 */

const getDataLengthSizeInBytesForVR = (vr) => {
  if (vr === 'OB' ||
      vr === 'OD' ||
      vr === 'OL' ||
      vr === 'OW' ||
      vr === 'SQ' ||
      vr === 'OF' ||
      vr === 'UC' ||
      vr === 'UR' ||
      vr === 'UT' ||
      vr === 'UN') {
    return 4;
  }

  return 2;
};

export default function readDicomElementExplicit (byteStream, warnings, untilTag) {
  if (byteStream === undefined) {
    throw 'dicomParser.readDicomElementExplicit: missing required parameter \'byteStream\'';
  }

  const element = {
    tag: readTag(byteStream),
    vr: byteStream.readFixedString(2)
    // length set below based on VR
    // dataOffset set below based on VR and size of length
  };

  const dataLengthSizeBytes = getDataLengthSizeInBytesForVR(element.vr);

  if (dataLengthSizeBytes === 2) {
    element.length = byteStream.readUint16();
    element.dataOffset = byteStream.position;
  } else {
    byteStream.seek(2);
    element.length = byteStream.readUint32();
    element.dataOffset = byteStream.position;
  }

  if (element.length === 4294967295) {
    element.hadUndefinedLength = true;
  }

  if (element.tag === untilTag) {
    return element;
  }

  // if VR is SQ, parse the sequence items
  if (element.vr === 'SQ') {
    readSequenceItemsExplicit(byteStream, element, warnings);

    return element;
  }

  if (element.length === 4294967295) {
    if (element.tag === 'x7fe00010') {
      findEndOfEncapsulatedElement(byteStream, element, warnings);

      return element;
    } else if (element.vr === 'UN') {
      readSequenceItemsImplicit(byteStream, element);

      return element;
    }

    findItemDelimitationItemAndSetElementLength(byteStream, element);

    return element;
  }

  byteStream.seek(element.length);

  return element;
}
