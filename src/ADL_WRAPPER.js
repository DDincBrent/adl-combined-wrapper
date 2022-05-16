/**
* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
* @class ADL_Wrapper creating new instance of ADL_Wrapper. 
* @description Class to specify whether to create a scorm or xAPI  instance for reporting.
*/

class ADL_Wrapper
{
/**
* @constructor API object with API properties
* @param {Object} obj
* @param {String} obj.ADL_TYPE ADL type of reporting. I.E: "SCORM"/"xAPI"
* @param {Number} obj.ADL_VER Defaults to "2004" ADL version of reporting: ONLY NEEDED FOR SCORM I.E: "2004"/"1.2"
*/
	constructor(obj)
	{
		this.isSCORM = obj.ADL_TYPE.toUpperCase('SCORM') ? true: false;

		//Forcing SCORM Version to 2004 if it is specified
		if(obj.ADL_VER == undefined);
			obj.ADL_VER = "2004";

		this.UTILS = {};
		this.DEBUG = { isActive: true };
		this.ADL_TYPE = obj.ADL_TYPE;
		this.ADL_VER = obj.ADL_VER;
		this.ADL = this.SetADLType(this.isSCORM);
	}

	/**
	* @description Sets the ADL.
	* @author Brent Williams <brent.williams@ddincmail.org>.
	* @method
	*
	* @param {Boolean} bool Boolean defining if ADL is SCORM
	* @return {Object} ADL Object.
	*/
	
	SetADLType(bool)
	{
		const isScorm = bool;

		const SCORM = {
			version: null, //Store SCORM version
			handleCompletionStatus: true, //Should wrapper handle initial completion status
			handleExitMode: true, //Should wrapper handle exit mode
			API: { handle: null, isFound: false }, //Create API child object
			connection: { isActive: false }, //Create connection child object
			data: { completionStatus: null, exitStatus: null }, //Create data child object
			debug: {} //Create debug child object
		}

		//TODO: ADD XAPI OBJECT MODEL ^

		return isScorm ? new Object.assign({}, SCORM): alert(`INVALID ADL TYPE: ${this.API.ADL_TYPE} doesn't exist. Please use a vaild ADL Type.`);
	}

	/**
	* @description Finds the SCORM API
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent)
	* @method FindApi
	*s
	* @param {Object} window The browser window object
	* @return {Object} Object if the API is found, null if no API is found
	*/
	FindApi(window)
	{

	}
}