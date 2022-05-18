/*eslint-disable no-unused-vars*/
/**
* @description Creates a class for the SCORM API Object
* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
* @class SCORM
*
* @param {String} version Users prefered version of SCORM -- Defaults to 2004
*/

//TODO CREATE PROPER ERRORMSG OBJ AND USE THROW ERROR SO PROCESSES STOP.
//NOTE USE CONST ERR = NEW ERROR(MSG); -> THROW ERR; EXPRESSIONS CANT USE STATEMENTS WHICH THROW NEW ERROR() IS A STATEMENT
class SCORM
{
	constructor(version = 2004)
	{
		//NOTE: Using new Object() constructor and using dot notation for setting keys for easier readabiliy.
		//NOTE: Any Null value is a return value from a function call. It is added here purely for new eyes to understand.
		this.scorm = new Object(); 
		this.scorm.version = version;
		this.scorm.handleCompletionStatus = true;
		this.scorm.handleExitMode = true;
		this.scorm.API = { handle: null, isFound: false, Get: null, Find: null };
		this.scorm.connection = { isActive: false, connected: null, terminated: null };
		this.scorm.data = { completionStatus: null, exitStatus: null, get: null, set: null, save: null, status: null };
		console.log(this.scorm); //?
	}

	//NOTE: SEE IF ANY REFACTORING CAN BE DONE TO METHODOLOGY OF LOOPING THROUGH EACH WINDOW
	/**
	* @description Looks for object named API in the LMS, starts at current window and searches each parent till found
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent)
	* @method GetAPI async 
	*
	* @return {Object} Object is API is found, else returns null
	*/
	async GetAPI()
	{
		const win = window;
		const scorm = this.scorm; //?
		const find = await this.#FindAPI();
			
		let API = null;

		API = find(win);

		if(!API && win.parent && win.parent != win)
			API = find(win.parent);

		if(!API && win.top && win.top.opener)
			API = find(win.top.opener);

		if(!API && win.top && win.top.opener && win.top.opener.document)
			API = find(win.top.opener.document);

		API ? scorm.API.isFound = true : console.error('API.get failed: Can\'t find the API!');

		scorm.API.Get = API;
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
		return new Promise((resolve, reject) => 
		{
			let attempts = 0;
			const scorm = this.scorm;
			const maxAttempts = 500;
			
			for (const win in window)
			{
				const apiFound = (!window.API && !window.API_1484_11);
				const currentWin = (window.parent);
				const topWindow = (currentWin != window);
				const canAttempt = (attempts <= maxAttempts);

				if(apiFound && currentWin && topWindow && canAttempt)
				{
					attempts++;
					window = win.parent;
				}
				else
				{
					break;
				}

				if(!canAttempt)
					reject(new Error(`Maximum attempts reached without successfully finding the API: Attempts: ${attempts} MaxAttempts: ${maxAttempts}`));
			}

			resolve(this.#SetScoVersion(scorm.version, window));
		});
	}

	/**
	* @description Sets the version of scorm set by the user, if no version is specified defaults to 2004
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	* @method #SetScoVersion
	* 
	* @param {String} version A string containing the version number of SCORM desired.
	* @param {OBject} window Current Browser window object.
	* 
	*/
	
	#SetScoVersion(version, window)
	{
		let API = null;
		const scorm = this.scorm;

		//TASK[id=CreateErrorMsgs] EDIT SO NO ERROR IS THROWN AND IT AUTO SWITCHES TO AVAILABLE VERSION BUT JUST WARNS THE USER

		version == '2004' ? 
			window.API_1484_11 ? 
				API = window.API_1484_11 : console.error('API_1484_11 NOT FOUND') 
			: window.API ? 
				API = window.API : console.error('API NOT FOUND');

		window.API_1484_11 ? 
			scorm.version = '2004' : window.API ? 
				scorm.version = '1.2' : console.error('Error find API');

		scorm.API.Find = API;
	}

	/**
	* @description Sets handle to API if it doesn't exists, or just sets itself to itself
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	* @method #GetHandle
	*/
	
	#GetHandle()
	{
		const API = this.scorm.API;
		
		//Returns this.scorm.API.handle if it already exists
		if(API.handle && API.isFound)
			return API.handle;

		API.handle = this.GetAPI();
	}

	/**
	* @description Tells LMS to Initialize the connection
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	* @method Initialize 
	*/
	
	//REVIEW FOR USE OF TRY/CATCH & ASYNC/AWAIT
	Initialize()
	{
		const scorm = this.scorm, debug = scorm.debug, makeBool = this.#StringToBoolean;
		const msgPrefix = 'SCORM.connection.initialize';
		let success = false, status = scorm.data.completionStatus, connectionActive = scorm.connection.isActive;
	
		console.log('Attempting to connect...');

		if(!connectionActive)
		{
			const API = scorm.API.handle;
			let errorCode = 0;

			if(API)
			{
				//Switches bool value of success if it connects to specified version of LMS
				//REVIEW MAKE TERNARY
				switch(scorm.version)
				{
					case '1.2' : success = makeBool(API.LMSInitialize('')); break;
					case '2004' : success = makeBool(API.Initialize('')); break;
				}

				if(success)
				{
					errorCode = this.#DebugErrorCode();
					
					if(errorCode !== null && errorCode  === 0)
					{
						connectionActive = true;

						if(scorm.handleCompletionStatus)
						{
							//Sets new launch to incomplete
							status = scorm.status('get');

							if(status)
							{
								//REVIEW MAKE TERNARY
								switch(status)
								{
									case 'not attempted': scorm.status('set', 'incomplete'); break;
									case 'unknown': scorm.status('set', 'incompelte'); break;
								}

								scorm.save();
							}
						}
					}
					else
					{
						throw new Error(`${msgPrefix} failed. \nError code: ${errorCode} \nError info: ${this.#DebugGetInfo(errorCode)}`);
					}
						
				}
				else
				{
					errorCode = this.#DebugErrorCode();

					if(errorCode !== null & errorCode == 0)
						throw new Error(`${msgPrefix} failed. \nError code: ${errorCode} \nError info: ${this.#DebugGetInfo(errorCode)}`);
					else
						throw new Error(`${msgPrefix} failed: No response from server.`);
				}
			}
			else
			{
				throw new Error(`${msgPrefix} failed: API is null.`);
			}
		}
		else
		{
			throw (`${msgPrefix} aborted: Connection already established.`);
		}
		scorm.connection.connected = success;
	}

	/**
	* @description  Close LMS communication
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	* @method Terminate
	*/

	Terminate()
	{
		const status = scorm.data.completionStatus, scorm = this.scorm, debug = scorm.debug, makeBool = this.#StringToBoolean, exitStatus = scorm.data.exitStatus;
		const msgPrefix = 'SCORM.connection.terminate';
		let success = false;

		if(scorm.connection.isActive)
		{
			const API = scorm.API.handle;
			let errorCode = 0;

			if(API)
			{
				if(scorm.handleExitMode && !exitStatus)
				{
					if(status !== 'completed' && status !== 'passed')
					{
						//REVIEW MAKE TERNARY
						switch(scorm.version)
						{
							case '1.2': success = scorm.set('cmi.core.exit', 'logout'); break;
							case '2004': success = scorm.set('cmi.exit', 'normal'); break;
						}
					}
				}
				
				success = scorm.save();

				if(success)
				{
					//REVIEW MAKE TERNARY all three conditionals ternaries
					switch(scorm.version)
					{
						case '1.2' : success = makeBool(API.LMSFinish('')); break;
						case '2004': success = makeBool(API.Terminate('')); break;
					}

					if(success)
						scorm.connection.isActive = false;

					if(!success)
					{
						errorCode = this.#DebugErrorCode();
						throw new Error(`${msgPrefix} failed. \nError code: ${errorCode} \nError info: ${this.#DebugGetInfo(errorCode)}`);
					}
				}
			}
			else
			{
				throw new Error(`${msgPrefix} failed: API is null.`);
			}
		}
		else
		{
			throw new Error(`${msgPrefix} aborted: Connection already terminated.`);
		}

		scorm.connection.terminated = success;
		scorm.connection.connected = success;
	}

	/**
	* @description Requests information from the LMS
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	* @method GetData
	* 
	* @param {String} str Name of SCORM data model as a string
	* @return {String} value of the specified model
	*/
	
	GetData(str)
	{
		let value = null;
		const scorm = this.scorm;
		const msgPrefix = `SCORM.data.get(${str})`;

		if(scorm.connection.isActive)
		{
			const API = scorm.API.handle;
			let errorCode = 0;

			if(API)
			{
				//REVIEW MAKE TERNARY
				switch(scorm.version)
				{
					case '1.2': value = API.LMSGetValue(str); break;
					case '2004': value = API.GetValue(str); break;
				}

				errorCode = this.#DebugErrorCode();

				if(value !== '' || errorCode === 0)
				{
					//REVIEW MAKE TERNARY
					switch(str)
					{
						case 'cmi.core.lesson_status':
						case 'cmi.completion_status': scorm.data.completionStatus = value; break;

						case 'cmi.core.exit':
						case 'cmi.exit': scorm.data.exitStatus = value; break;
					}
				}
				else
				{
					throw new Error(`${msgPrefix} failed. \nError code: ${errorCode} \nError info: ${this.#DebugGetInfo(errorCode)}`);
				}
			}
			else
			{
				throw new Error(`${msgPrefix} failed: API is null.`);
			}
		}
		else
		{
			throw new Error(`${msgPrefix} failed: API connection is inactive`);
		}

		scorm.data.get = String(str);
	}

	/**
	* @description Tells lms to pass the value to the named data model
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	* @method SetData
	* 
	* @param {String} str Name of SCORM data model as a string
	* @param {String} value string containing the value of the specified element to be updated.
	* @return {Boolean} Successful or not
	*/
	
	SetData(str, value)
	{
		let success = false;
		const scorm = this.scorm, makeBool = this.#StringToBoolean;
		const msgPrefix = `SCORM.data.set(${str})`;

		if(scorm.connection.isActive)
		{
			const API = scorm.API.handle;
			let errorCode = 0;

			if(API)
			{
				//REVIEW MAKE TERNARY
				switch(scorm.version)
				{
					case '1.2': success = makeBool(API.LMSSetValue(str, value)); break;
					case '2004': success = makeBool(API.SetValue(str, value)); break;
				}

				if(success)
				{
					//Check if course is complete
					if(str === 'cmi.core.lesson_status' || str === 'cmi.completion_status')
						scorm.data.completionStatus = value;
				}
				else
				{
					//NOTE AQUIRE ERROR CODE FOR FALLBACK
					errorCode = this.#DebugErrorCode();
					throw new Error(`${msgPrefix} failed. \nError code: ${errorCode} \nError info: ${this.#DebugGetInfo(errorCode)}`);
				}
			}
			else
			{
				throw new Error(`${msgPrefix} failed: API is null.`);
			}
		}
		else
		{
			//TASK[id=SetDataErr1] CREATE ERROR MESSAGE HERE
			throw new Error(`${msgPrefix} failed: API connection is inactive.`);
		}

		scorm.data.set = success;
	}

	/**
	* @description Tells LMS to save all data up to this point in the session
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	*
	* @method SaveData
	* @return {Boolean}
	*/
	
	SaveData()
	{
		let success = false;
		const scorm = this.scorm, makeBool = this.#StringToBoolean;
		const msgPrefix = `SCORM.data.save failed`;

		if(scorm.connection.isActive)
		{
			const API = scorm.API.handle;

			if(API)
				success = scorm.version == '1.2' ? makeBool(API.LMSCommit('')) : makeBool(API.Commit(''));
			else
				throw new Error(`${msgPrefix}: API is null.`);
		}
		else
		{
			throw new Error(`${msgPrefix}: API Connection is inactive.`);
		}
		scorm.data.save = success;
	}

	/**
	* @description Gets the status of an item
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	* @method Status
	* 
	* @param {String} action Status to retrieve from the LMS  (GET|SET)
	* @param {String} status value to set data to
	*/
	
	Status(action, status)
	{
		const scorm = this.scorm;
		const msgPrefix = `SCORM.Status failed:`;
		let success = false;
		let cmi = '';

		if(action !== null)
		{
			cmi = scorm.version === '1.2' ? 'cmi.core.lesson_status' : 'cmi.completion_status';

			switch(action)
			{
				case 'get': success = this.GetData(cmi); break;

				case 'set': 
					if(status !== null)
					{
						success = this.SetData(cmi, status);
					}
					else
					{
						success = false;
						throw new Error(`${msgPrefix} status was not specified.`);
					}
					break;
				
				default:
					success = false;
					throw new Error(`${msgPrefix} No valid action was specified.`);

			}
		}
		else
		{
			throw new Error(`${msgPrefix} No action was given.`);
		}

		scorm.data.status = success;
	}

	/**
	* @description Request the error code for the current error in the LMS
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	*
	* @method #DebugErrorCode 
	* @return {Number} LMS error code
	*/
	
	#DebugErrorCode()
	{
		const scorm = this.scorm, API = scorm.API.handle;
		const err = () => { throw new Error('SCORM.debug.DebugErrorCode failed: API is null.'); };
		let code = 0;
		

		API ?
			scorm.version == '1.2' ? 
				code = parseInt(API.LMSGetLastError(), 10) : code = parseInt(API.GetLastError(), 10)
			: err();

		return code;
	}

	/**
	* @description Request string value of ErrorCode
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	* @method #DebugGetInfo
	* 
	* @param {Number} errorCode LMS Error code to get more information on
	* @return {String} Textual description of the Error.
	*/
	
	#DebugGetInfo(errorCode)
	{
		const scorm = this.scorm, API = scorm.API.handle;
		const err = () => { throw new Error('SCORM.debug.DebuggGetInfo failed: API is null.'); };
		let result = '';

		API ? 
			scorm.version == '1.2' ?
				result = API.LMSGetErrorString(errorCode) : result = API.GetErrorString(errorCode)
			: err();
			
		return String(result);
	}

	/**
	* @description LMS Specific use- Lets LMS define additional diagnostic information through the API instance.
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	* @method #DebugDiagnosticInfo
	* 
	* @param {Number} errorCode Error code given by the LMS
	* @return {String} Extra diagnostic information
	*/
	
	#DebugDiagnosticInfo(errorCode)
	{
		const scorm = this.scorm, API = scorm.API.handle;
		const err = () => { throw new Error('SCORM.debug.DebuggGetInfo failed: API is null.'); };
		let result = '';

		API ? 
			scorm.version == '1.2' ? 
				result = API.LMSGetDiagnostic(errorCode) : result = API.GetDiagnostic(errorCode)
			: err();

		return String(result);
	}

	/**
	* @description Coverts string booleans into actual booleans
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	* @method #StringToBoolean
	* 
	* @param {String} value Most values returned from LMS are strings
	* 
	*/
	
	#StringToBoolean(value)
	{
		const type = typeof value;
		switch(type)
		{
			case 'object':  
			case 'string': return (/(true|1)/i).test(value);
			case 'number': return !!value;
			case 'boolean': return value;
			case 'undefined': return null;
			default: return false;
		}
	}
}

export { SCORM };