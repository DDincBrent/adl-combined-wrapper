/* eslint-disable no-inline-comments, no-unused-vars */
import { SCORM } from './interface/Sco_Interface';

//REGION
	//LINK ./interface/Sco_Interface.js#PromiseUndefinedConstructor
//!REGION

/**
* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
* @class ADL_Wrapper creating new instance of ADL_Wrapper. 
* @description Class to specify whether to create a scorm or xAPI  instance for reporting.
*/

//TODO: Create Seperate Interface Files for SCORM and xAPI. That way this file isn't bloated with multiple API functions
//NOTE: This CLASS will specificly handle calling the creation/fetch of the API from either Sco_Interface or xAPI_Interface 

// eslint-disable-next-line no-unused-vars
class ADL_Wrapper
{
/**
* @constructor API object with API properties
* @param {Object} obj
* @param {String} obj.ADL_TYPE ADL type of reporting. I.E: "SCORM"/"xAPI"
* @param {Number} obj.ADL_VER Defaults to "2004" ADL version of reporting: ONLY NEEDED FOR SCORM I.E: "2004"/"1.2"
*/
	//
	constructor(obj)
	{
		this.obj = obj;
	}
}

//const adl_wrapper = new ADL_Wrapper({ ADL_TYPE: 'SCORM', ADL_VER: '2004' });
export { ADL_Wrapper };