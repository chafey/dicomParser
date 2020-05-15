import readTag from './readTag';
import { IByteStream } from './types';

/**
 * Internal helper functions for parsing DICOM elements
 */

/**
 * Reads the tag and length of a sequence item and returns them as an object with the following properties
 *  tag : string for the tag of this element in the format xggggeeee
 *  length: the number of bytes in this item or 4294967295 if undefined
 *  dataOffset: the offset into the byteStream of the data for this item
 * @param byteStream the byte
 * @returns
 */
const readSequenceItem = (byteStream: IByteStream): any => {
	if (byteStream === undefined) {
		throw new Error("dicomParser.readSequenceItem: missing required parameter 'byteStream'");
	}

	const element = {
		tag: readTag(byteStream),
		length: byteStream.readUint32(),
		dataOffset: byteStream.position,
	};

	if (element.tag !== 'xfffee000') {
		throw new Error(`dicomParser.readSequenceItem: item tag (FFFE,E000) not found at offset ${byteStream.position}`);
	}

	return element;
};

export default readSequenceItem;
