import readEncapsulatedPixelDataFromFragments from './readEncapsulatedPixelDataFromFragments';
import { IFragment, IDataSet, IDataSetElement } from './types';

/**
 * Functionality for extracting encapsulated pixel data
 */

const findFragmentIndexWithOffset = (fragments: IFragment[], offset: number): number | undefined => {
	for (let i = 0; i < fragments.length; i++) {
		if (fragments[i].offset === offset) {
			return i;
		}
	}
	return undefined;
};

// tslint:disable-next-line: max-line-length
const calculateNumberOfFragmentsForFrame = (frameIndex: number, basicOffsetTable: number[], fragments: IFragment[], startFragmentIndex: number): number => {
	// special case for last frame
	if (frameIndex === basicOffsetTable.length - 1) {
		return fragments.length - startFragmentIndex;
	}
	// iterate through each fragment looking for the one matching the offset for the next frame
	const nextFrameOffset = basicOffsetTable[frameIndex + 1];
	for (let i = startFragmentIndex + 1; i < fragments.length; i++) {
		if (fragments[i].offset === nextFrameOffset) {
			return i - startFragmentIndex;
		}
	}

	throw new Error('dicomParser.calculateNumberOfFragmentsForFrame: could not find fragment with offset matching basic offset table');
};

/**
 * Returns the pixel data for the specified frame in an encapsulated pixel data element that has a non
 * empty basic offset table.  Note that this function will fail if the basic offset table is empty - in that
 * case you need to determine which fragments map to which frames and read them using
 * readEncapsulatedPixelDataFromFragments().  Also see the function createJEPGBasicOffsetTable() to see
 * how a basic offset table can be created for JPEG images
 *
 * @param dataSet - the dataSet containing the encapsulated pixel data
 * @param pixelDataElement - the pixel data element (x7fe00010) to extract the frame from
 * @param frameIndex - the zero based frame index
 * @param [basicOffsetTable] - optional array of starting offsets for frames
 * @param [fragments] - optional array of objects describing each fragment (offset, position, length)
 * @returns {object} with the encapsulated pixel data
 */
// tslint:disable-next-line: max-line-length
const readEncapsulatedImageFrame = (dataSet: IDataSet, pixelDataElement: IDataSetElement, frameIndex: number, basicOffsetTable?: number[], fragments?: IFragment[]) => {
	// default parameters
	basicOffsetTable = basicOffsetTable || pixelDataElement.basicOffsetTable;
	fragments = fragments || pixelDataElement.fragments;
	// Validate parameters
	if (dataSet === undefined) {
		throw new Error("dicomParser.readEncapsulatedImageFrame: missing required parameter 'dataSet'");
	}
	if (pixelDataElement === undefined) {
		throw new Error("dicomParser.readEncapsulatedImageFrame: missing required parameter 'pixelDataElement'");
	}
	if (frameIndex === undefined) {
		throw new Error("dicomParser.readEncapsulatedImageFrame: missing required parameter 'frameIndex'");
	}
	if (basicOffsetTable === undefined) {
		throw new Error("dicomParser.readEncapsulatedImageFrame: parameter 'pixelDataElement' does not have basicOffsetTable");
	}
	if (pixelDataElement.tag !== 'x7fe00010') {
		throw new Error("dicomParser.readEncapsulatedImageFrame: parameter 'pixelDataElement' refers to non pixel data tag (expected tag = x7fe00010)");
	}
	if (pixelDataElement.encapsulatedPixelData !== true) {
		throw new Error("dicomParser.readEncapsulatedImageFrame: parameter 'pixelDataElement' refers to pixel data element that does not have encapsulated pixel data");
	}
	if (pixelDataElement.hadUndefinedLength !== true) {
		throw new Error("dicomParser.readEncapsulatedImageFrame: parameter 'pixelDataElement' refers to pixel data element that does not have undefined length");
	}
	if (pixelDataElement.fragments === undefined) {
		// tslint:disable-next-line: max-line-length
		throw new Error("dicomParser.readEncapsulatedImageFrame: parameter 'pixelDataElement' refers to pixel data element that does not have fragments");
	}
	if (basicOffsetTable.length === 0) {
		throw new Error('dicomParser.readEncapsulatedImageFrame: basicOffsetTable has zero entries');
	}
	if (frameIndex < 0) {
		throw new Error("dicomParser.readEncapsulatedImageFrame: parameter 'frameIndex' must be >= 0");
	}
	if (frameIndex >= basicOffsetTable.length) {
		throw new Error("dicomParser.readEncapsulatedImageFrame: parameter 'frameIndex' must be < basicOffsetTable.length");
	}

	// find starting fragment based on the offset for the frame in the basic offset table
	const offset = basicOffsetTable[frameIndex];
	const startFragmentIndex = findFragmentIndexWithOffset(fragments, offset);

	if (startFragmentIndex === undefined) {
		throw new Error('dicomParser.readEncapsulatedImageFrame: unable to find fragment that matches basic offset table entry');
	}

	// calculate the number of fragments for this frame
	const numFragments = calculateNumberOfFragmentsForFrame(frameIndex, basicOffsetTable, fragments, startFragmentIndex);

	// now extract the frame from the fragments
	return readEncapsulatedPixelDataFromFragments(dataSet, pixelDataElement, startFragmentIndex, numFragments, fragments);
};

export default readEncapsulatedImageFrame;
