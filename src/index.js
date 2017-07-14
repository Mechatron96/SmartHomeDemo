var deviceAction ={
    "Lights" : {
        "onAction" : "ok Matt, turning on lights",
        "offAction" : "ok Matt, turning off lights"
    },
    "Camera" : {
        "onAction" : "ok Matt, turning on camera",
        "offAction" : "ok Matt, turning off camera"
    },
    "DoorLock" : {
        "onAction" : "ok Matt, locking door", 
        "offAction" : "ok Matt, unlocking door"
    },
    "Sensor" : {
        "onAction": "ok Matt, arming sensor",
        "offAction" : "ok Matt, disarming sensor"
    }
}
// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

    // if (event.session.application.applicationId !== "") {
    //     context.fail("Invalid Application ID");
    //  }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    getWelcomeResponse(callback)
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

    var intent = intentRequest.intent
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here

    if (intentName == "DemoIntent"){
        handleDeviceResponse(intent, session, callback)
    }else if (intentName == "AMAZON.YesIntent"){
        handleYesResponse(intent, session, callback)
    }else if (intentName == "AMAZON.NoIntent"){
        handleNoResponse(intent, session, callback)
    }else if (intentName == "AMAZON.HelpIntent"){
        handleGetHelpRequest(intent, session, callback)
    }else if (intentName == "AMAZON.CancelIntent"){
        handleFinishSessionRequest(intent, session, callback)
    }else if (intentName == "AMAZON.StopIntent"){
        handleFinishSessionRequest(intent, session, callback)
    }else{
        throw "Invalid intent"
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {

}

// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
    var speechOutput = "Welcome to Smart Home Demo, I can control lights, cameras, doorlocks and sensors." +
    "I can only control one at a time, give me a command"

    var reprompt = "Give me a command?"

    var header = "Smart Home Demo"

    var shouldEndSession = false

    var sessionAttributes = {
        "speechOutput" : speechOutput,
        "repromptText"  : reprompt
    }

    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))

}

function handleDeviceResponse(intent, session, callback){
    var device = intent.slots.Device.value.toLowerCase()

    if (!deviceAction[device]){
        var speechOutput = "Sorry, unable to find device. Try using the device names of lights, camera, doorLock or sensor"
        var repromptText = "Try asking about an another device"
        var header = "Unable to Find Device"
    } else {
        var speechOutput = deviceAction[device].onAction + "Do you want to control more device?"
        var repromptText = "Do you want to control more devices"
        var header = device
    }
    var shouldEndSession = false

    callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

function handleYesResponse(intent, session, callback){
    var speechOutput = "Great! Which device? Lights, Camera, DoorLock, or Sensor"
    var repromptText = "Try asking about an another device"
    var shouldEndSession = false

    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession))
}

function handleNoResponse(intent, session, callback){
    handleFinishSessionRequest(intent, session, callback)
}

function handleGetHelpRequest(intent, session, callback) {
    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};
    }
    var speechOutput = "I am Smart Home Demo that controls lights, cameras, doorlocks, and sensors. Give me a command?"
    var repromptText = speechOutput 
    var shouldEndSession = false
    callback(session.attributes,buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession))
}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}


// ------- Helper functions to build responses for Alexa -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text : repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}