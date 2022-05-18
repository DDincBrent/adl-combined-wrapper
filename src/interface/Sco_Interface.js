/**
* @description Creates a class for the SCORM API Object
* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
* @class SCORM
* @param {String} version Users prefered version of SCORM -- Defaults to 2004
*/

/*
	Run Order for old SCORM_API_wrapper.js
	Initialize and Terminate => API.getHandle()
		API.getHandle() => API.handle = Api.get()
			Api.get() => Api.find()
				Api.find() => returns API '1.2' || API_1484_11 '2004'
	
	data.Get() || data.Save() || data.set() => API.getHandle()
		API.getHandle() => API.handle = Api.get()
			Api.get() => Api.find()
				Api.find() => returns API '1.2' || API_1484_11 '2004'
*/

//TODO CREATE PROPER ERRORMSG OBJ AND USE THROW ERROR SO PROCESSES STOP.
//NOTE USE CONST ERR = NEW ERROR(MSG); -> THROW ERR; EXPRESSIONS CANT USE STATEMENTS WHICH THROW NEW ERROR() IS A STATEMENT
class SCORM
{
	constructor(version = 2004)
	{
		//NOTE: Using new Object() constructor and using dot notation for setting keys for easier readabiliy.
		this.scorm = new Object(); 
		this.scorm.version = version;
		this.scorm.handleCompletionStatus = true;
		this.scorm.handleExitMode = true;
		this.scorm.API = { handle: null, isFound: false, Get: null, Find: null };
		this.scorm.connection = { isActive: false, connected: null };
		this.scorm.data = { completionStatus: null, exitStatus: null };
		this.debug = { GetCode: null, GetInfo: null, GetDiagnosticInfo: null };
	}
	
	//NOTE: SEE IF ANY REFACTORING CAN BE DONE TO METHODOLOGY OF LOOPING THROUGH EACH WINDOW
	/**
	* @description Looks for object named API in the LMS, starts at current window and searches each parent till found
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent)
	* @method GetAPI async 
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
	
	#SetScoVersion(version,window)
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
	* @description Returns handle for the API
	* @author Brent Williams <brent.williams@ddincmail.org> (https://www.github.com/DDincBrent).
	* @method #GetHandle
	*/
	
	#GetHandle()
	{
		const API = this.scorm.API;
		let handle = API.handle;

		//If handle and isFound are false, get API else, API Already exists
		if(!API.handle && !API.isFound) handle = this.GetAPI();

		API.handle = handle; //?
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
		let success = false, status = scorm.data.completionStatus, connectionActive = scorm.connection.isActive;

		console.log('Attempting to connect...');

		if(!connectionActive)
		{
			let API = this.#GetHandle();

			if(API)
			{
				//Switches bool value of success if it connects to specified version of LMS
				switch(scorm.version)
				{
					case '1.2' : success = makeBool(API.LMSInitialize('')); break;
					case '2004' : success = makeBool(API.Initialize('')); break;
				}

				if(success)
				{
					//TASK[id=Fallback] Need to create Fall back to double check connection was successfull
					//TASK Encapsulate code below in if/else that throws errro on else and changes success back to false

					connectionActive = true;

					if(scorm.handleCompletionStatus)
					{
						//Sets new launch to incomplete
						completionStatus = scorm.status('get');

						if(completionStatus)
						{
							switch(completionStatus)
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
					//TASK[id=InitError1] ERROR CODE METHOD 
					throw new Error('API GET FAILED. NO API FOUND');
				}
			}
			else
			{
				//TASK[id=InitError2] ERROR CODE METHOD 
				throw new Error(`Attempting to connect... failed: API is null`);
			}
		}
		else
		{
			//TASK[id=InitError3] ERROR CODE METHOD 
			throw (`Attempting to connect... aborted: Connection already established`);
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
		const scorm = this.scorm, debug = scorm.debug, makeBool = this.#StringToBoolean;
		let success = false, status = scorm.data.completionStatus, exitStatus = scorm.data.exitStatus;

		if(scorm.connection.isActive)
		{
			let API = this.#GetHandle();

			if(API)
			{
				if(scorm.handleExitMode && !exitStatus)
				{
					if(completionStatus !== 'completed' && completionStatus !== 'passed')
					{
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
					switch(scorm.version)
					{
						case '1.2' : success = makeBoolean(API.LMSFinish('')); break;
						case '2004': success = makeBoolean(API.Terminate('')); break;
					}

					if(success)
						scorm.connection.isActive = false;

					if(!success)
					{
						//TASK[id=TermError1] CREATE ERROR MESSAGE HERE
						throw new Error('Failed');
					}
				}
			}
			else
			{
				//TASK[id=TermError2] CREATE ERROR MESSAGE HERE
				throw new Error('Failed: API is null');
			}
		}
		else
		{
			//TASK[id=TermError3] CREATE ERROR MESSAGE HERE
			throw new Error('Aborted: Connection already Terminated');
		}
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

const temp = new SCORM();
 //?
export { SCORM };