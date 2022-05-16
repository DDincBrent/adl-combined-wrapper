// JavaScript Document
var scorm = pipwerks.SCORM;

var lmsConnected = false;
var suspend_data = "";
var complete = "";
var score = 0;
var bookmark = "";
var time = 0;
var initialDate;

function initializeSCORM(){	
	lmsConnected = scorm.init();

	if(lmsConnected){
		console.log("Connected to LMS.");
		
		initialDate = new Date();
		
		if(scorm.version == "2004"){
			complete = scorm.get("cmi.completion_status");
			
			bookmark = scorm.get("cmi.location");
			suspend_data = scorm.get("cmi.suspend_data");
			score = scorm.get("cmi.score.raw");	
		}
		else{
			complete = scorm.get("cmi.core.lesson_status");
			
			bookmark = scorm.get("cmi.core.lesson_location");
			suspend_data = scorm.get("cmi.suspend_data");
			score = scorm.get("cmi.core.score.raw");	
		}
		
		//if(checkComplete())
		// 	scorm.quit();	
	}
	else {
		alert('Could not connect to the LMS or connection to the LMS has been lost. Please close this window and re-launch the course.');
		console.log("Could not connect to LMS.");
	}
	console.log('Has the course started: ' + exportRoot.CourseStarted);
	if(exportRoot.CourseStarted == 'undefined')
		exportRoot.ActivateModule();

	setTimeout(function(){
		console.log('Has the course started: ' + exportRoot.CourseStarted);
	},1000)
}

function closeCourse(){
	if(lmsConnected)
		var sessionTime = Math.round(((new Date()) - initialDate)/1000);
		if(scorm.version == "2004"){
			sessionTime += scorm.get("cmi.total_time");
			scorm.set("cmi.total_time",sessionTime);
		}
		else{
			sessionTime += scorm.get("cmi.core.total_time");
			scorm.set("cmi.core.total_time",sessionTime);
		}
		
	scorm.save(); //save all data that has already been sent
	scorm.quit(); //close the SCORM API connection properly
}

function saveBookmarking(data){
	if(lmsConnected){
		bookmark = data;
		if(scorm.version == "2004")
			scorm.set("cmi.location", bookmark);
		else
			scorm.set("cmi.core.lesson_location", bookmark);
		scorm.save();
	}
}

function saveSuspendData(data) {
	if(lmsConnected){
		suspend_data = data;
		scorm.set("cmi.suspend_data", suspend_data);			
		scorm.save();
	}
}

function saveScore(data){
	if(lmsConnected){
		score = data;
		if(scorm.version == "2004")
			scorm.set("cmi.score.raw", score);
		else
			scorm.set("cmi.core.score.raw", score);
		scorm.save();
	}
}

function saveQuestion(num,type,ans){
	var baseString = "cmi.interactions." + num;
	var date = new Date();
	var time = returnTimeFormat(date.getHours(),date.getMinutes(),date.getSeconds(),date.getMilliseconds());
	var id = num+1;

	if(id < 10)
		id = "0" + id;

	if(lmsConnected){
		if(scorm.version == "2004"){
			scorm.set(baseString + ".id", "Q" + id);
			scorm.set(baseString + ".type", type);
			scorm.set(baseString + ".timestamp", time);
			//scorm.set(baseString + ".correct_responses", ans);
			//scorm.set(baseString + ".weighting ", "1");
		}
		else{
			scorm.set(baseString + ".id", "Q" + id);
			scorm.set(baseString + ".type", type);
			scorm.set(baseString + ".time", time);
			scorm.set(baseString + ".correct_responses.0.pattern", ans);
			//scorm.set(baseString + ".weighting ", "1");
		}
		console.log("SAVE: " + ans);
		scorm.save();
	}
}

function saveResponse(num,ans,result,time){
	var baseString = "cmi.interactions." + num;
	
	if(lmsConnected){
		if(scorm.version == "2004"){
			scorm.set(baseString + ".learner_response", ans);
			scorm.set(baseString + ".result", result);
			scorm.set(baseString + ".latency",convertMStoTimeformat(time));
		}
		else{
			scorm.set(baseString + ".student_response", ans);
			scorm.set(baseString + ".result", result);
			scorm.set(baseString + ".latency",convertMStoTimeformat(time));
		}
		console.log("SAVE: " + ans);
		console.log("SAVE: " + result);
		scorm.save();
	}
}

function saveComplete(data){
	if(lmsConnected){
		complete = data;
		if(scorm.version == "2004")
			scorm.set("cmi.completion_status",complete);
		else
			scorm.set("cmi.core.lesson_status",complete);
		scorm.save();
	}
}

function returnTimeFormat(h,m,s,ms){	
	return formatTimeDigit(h,2) + ":" + formatTimeDigit(m,2) + ":" + formatTimeDigit(s,2) + "." + formatTimeDigit(Math.floor(ms/10),2);
}
function returnTimeSpanFormat(h,m,s,ms){	
	return formatTimeDigit(h,4) + ":" + formatTimeDigit(m,2) + ":" + formatTimeDigit(s,2) + "." + formatTimeDigit(Math.floor(ms/10),2);
}

function formatTimeDigit(v,d){
	while((v+"").length < d)
		v = "0" + v;
		
	return v;
}

function convertMStoTimeformat(time){
	var ms = time;
	var s;
	var m;
	var h;
	
	s = Math.floor(ms/1000);
	ms = Math.floor(ms % 1000);
	
	m = Math.floor(s/60);
	s = Math.floor(s % 60);
	
	h = Math.floor(m/60);
	m = Math.floor(m % 60);	
	
	return returnTimeSpanFormat(h,m,s,ms);
}

function checkComplete(){
	return (complete == "complete" || complete == "completed")
}