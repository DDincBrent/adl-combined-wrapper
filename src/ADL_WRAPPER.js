/* eslint-disable no-inline-comments */

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
		this.isSCORM = obj.ADL_TYPE.toUpperCase('SCORM') ? true: false;
		this.attempts = 0;
		this.maxAttempts = 500;

		//Forcing SCORM Version to 2004 if it is specified
		if((obj.ADL_VER == undefined) || (obj.ADL_VER != '1.2'))
			obj.ADL_VER = '2004';

		this.DEBUG = { isActive: true, devMode: false };
		this.ADL_TYPE = obj.ADL_TYPE;
		this.ADL_VER = obj.ADL_VER;
		this.ADL = this.#SetADLType(this.isSCORM);

		this.msg = { 
			inv: `INVALID ADL TYPE: ${obj.ADL_TYPE} doesn't exist. Please use a vaild ADL Type.`,
			failed: 'API.get failed: Can\'t find the API!',
			findMsg: 'SCORM.API.find',
			err2004: 'SCORM version 2004 was specified by the user, but API_1484_11 cannot be found.',
			err1_2: 'SCORM version 1.2 was specified by the user, but API cannot be found.',
		};
	}

	/**
	* @description Sets the ADL.
	* @author Brent Williams <brent.williams@ddincmail.org>.
	* @method #SetADLType <Private>
	*
	* @param {Boolean} bool Boolean defining if ADL is SCORM
	* @return {Object} ADL Object.
	*/
	
	#SetADLType(bool)
	{
		const isScorm = bool;

		const SCORM = {
			version: null, // Store SCORM version
			handleCompletionStatus: true, // Should wrapper handle initial completion status
			handleExitMode: true, // Should wrapper handle exit mode
			API: { handle: null, isFound: false, get: null, find: null }, // Create API child object
			connection: { isActive: false }, // Create connection child object
			data: { completionStatus: null, exitStatus: null }, // Create data child object
			debug: {}, // Create debug child object
		};

		// TODO ADD XAPI OBJECT ^

		return isScorm ? Object.assign({}, SCORM): alert(this.msg.inv);
	}

	/**
	* @description Sends a message or alert based on debug prefs 
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent)
	* @method #Trace <PRIVATE>
	*
	* @param {String} msg Message to send to the console or alert prompt
	*/
	#Trace(msg)
	{
		if(this.DEBUG.isActive && !(this.DEBUG.devMode))
			console.log(msg);

		if(this.DEBUG.isActive && this.DEBUG.devMode)
			alert(msg);
	}
}

//const adl_wrapper = new ADL_Wrapper({ ADL_TYPE: 'SCORM', ADL_VER: '2004' });
export { ADL_Wrapper };