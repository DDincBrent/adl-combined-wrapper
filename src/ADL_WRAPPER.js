/* eslint-disable no-inline-comments */

/**
* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
* @class ADL_Wrapper creating new instance of ADL_Wrapper. 
* @description Class to specify whether to create a scorm or xAPI  instance for reporting.
*/

//TODO: REFACTOR CLASS CONSTRUCTORS AND INCLUDE SCORM.GET, SCORM.FIND AND ALL OTHER NAME SPACE PROPERTY FUNCTIONS AS CLASS METHODS

// eslint-disable-next-line no-unused-vars
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
	* @description Looks for object named API, starts at current window and searches each parent till found
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent)
	* @method GetAPI async 
	* @return {Object} Object is API is found, else returns null
	*/
	async GetAPI()
	{
		const win = window, 
			scorm = this.ADL, 
			find = await this.#FindAPI(), 
			trace = this.#Trace();
			
		let API = null;

		API = find(win);

		if(!API && win.parent && win.parent != win)
			API = find(win.parent);

		if(!API && win.top && win.top.opener)
			API = find(win.top.opener);

		if(!API && win.top && win.top.opener && win.top.opener.document)
			API = find(win.top.opener.document);

		API ? scorm.API.isFound = true : trace(this.msg.failed);

		scorm.API.get = API;

		return API;
	}

	/**
	* @description Looks for an object named API
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	* @method FindAPI
	* 
	* @param {Object} window The browser window
	* @return {Object} Object of API if found, else returns null
	*/
	
	#FindAPI(window)
	{
		return new Promise(resolve => 
		{
			const scorm = this.ADL;
			const apiNotFound = (!win.API && !win.API_1484_11), winHasParent = (win.parent), winIsntParent = (win.parent != win), canAttempt = (this.attempts <= this.maxAttempts);
			
			let win = window;
			
			while(apiNotFound && winHasParent && winIsntParent && canAttempt)
			{
				this.attempts++;
				win = win.parent;
			}

			resolve(this.#SetScoVersion(scorm.version));
		});
	}

	/**
	* @description Sets the version of scorm set by the user, if no version is specified defaults to 2004
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	* @method #SetScoVersion
	* 
	* @param {String} version A string containing the version number of SCORM desired.
	* 
	*/
	
	#SetScoVersion(version)
	{
		let API = null;
		const scorm = this.ADL;

		if(version)
			version == '2004' ? API = window.API_1484_11 : API = window.API;

		if(API)
		{
			this.#Trace(`${this.msg.findMsg}: API FOUND: VERSION -- ${scorm.version}`);
			this.#Trace(`API: ${API}`);
		}
		else
		{
			this.#Trace(`${this.msg.findMsg}: Error finding API. \nAttempts to find API: ${this.attempts} \nMax Attempts Allowed: ${this.maxAttempts}`);
		}

		scorm.API.find = API;
		return API;
	}

	/**
	* @description Returns handle for the API
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	* @method #GetHandle
	*/
	
	#GetHandle()
	{
		const API = this.ADL.API;

		if(!API.handle && !API.isFound)  API.handle = this.GetAPI();

		return API.handle;
	}

	/**
	* @description Tells LMS to Initialize the connection
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	* @method Initialize 
	*/
	
	Initialize()
	{
		const scorm = this.ADL, debug = scorm.debug;
		let success = false, completionStatus = scorm.data.completionStatus;
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

const adl_wrapper = new ADL_Wrapper({ ADL_TYPE: 'SCORM', ADL_VER: '2004' });
export { ADL_Wrapper };