const express = require('express');
const router = express.Router();
router.use(express.json());
const { Bot_User } = require('../models/botModel'); // Import the Bot_User model

const BOT_NAME = "jery";

const R_EATING = `I don't like eating anything because I'm a ${BOT_NAME} obviously!`;
const R_ADVICE = "Stay focused and constantly moving to make your dreams come true!";

const THINK_ANSWERS = {
    "what is the meaning of life?": "The meaning of life is a philosophical question concerning the significance of life or existence in general.",
    "what is the capital of France?": "The capital of France is Paris.",
    "how does the internet work?": "The internet is a global network of interconnected computers that communicate via standardized protocols.",
    // Add more question-answer pairs as needed
};

const messageProbability = (userMessage, recognisedWords, singleResponse = false, requiredWords = null) => {
    let messageCertainty = 0;

    userMessage.forEach(word => {
        if (recognisedWords.includes(word)) {
            messageCertainty += 1;
        }
    });

    const percentage = messageCertainty / recognisedWords.length;

    let hasRequiredWords = true;
    if (requiredWords) {
        if (Array.isArray(requiredWords)) {
            hasRequiredWords = requiredWords.every(word => userMessage.includes(word));
        } else {
            hasRequiredWords = false;
        }
    }

    if (hasRequiredWords || singleResponse) {
        return Math.floor(percentage * 100);
    } else {
        return 0;
    }
};

const checkAllMessages = (message) => {
    console.log('Input message:', message);
    const userInput = message.join(' ');
    console.log('Joined message:', userInput);
    const highestProbList = {};

    const response = (botResponse, listOfWords, singleResponse = false, requiredWords = null) => {
        highestProbList[botResponse] = messageProbability(message, listOfWords, singleResponse, requiredWords);
    };

    // Response for greetings
    response(`How can I help you, I'm ${BOT_NAME}!`, ['hello', 'hi', 'hey'], true);

    // Add other responses here...
    response('Jerry', ['name'], true);
    response('Check My Career Page', ['job', 'assignment'], true);
    response('Email:selvin472001@gmail.com', ['contact'], true);
    response("I'm doing fine, and you?", ['how', 'are', 'you', 'doing'], false, ['how']);
    response('Love you too!', ['i', 'love', 'you'], false, true);
    response('my name is jery', ['name'], true);
    response("I'm happy to chat with you too!", ['bye', 'thank', 'thanks', 'goodbye'], true);
    response(R_ADVICE, ['give', 'advice'], false, ['advice']);
    response('CHRISTAL', ['build', 'generate', 'design'], true);
    response(R_EATING, ['what', 'you', 'eat'], false, ['you', 'eat']);

    console.log('Probabilities:', highestProbList);

    const bestMatch = Object.keys(highestProbList).reduce((a, b) => highestProbList[a] > highestProbList[b] ? a : b);

    console.log('Best match:', bestMatch);
    return highestProbList[bestMatch] === 0 ? unknown() : bestMatch;
};

const unknown = () => {
    const responses = ["What does that mean?"];
    return responses[Math.floor(Math.random() * responses.length)];
};

const cleanInput = (input) => {
    const cleanedInput = {};
    for (const key in input) {
        const cleanKey = key.trim();
        const cleanValue = typeof input[key] === 'string' ? input[key].trim() : input[key];
        cleanedInput[cleanKey] = cleanValue;
    }
    return cleanedInput;
};

router.post('/', async (req, res) => {
    // Check if the request body contains the "message" field
    let getInput = req.body && req.body.message ? req.body.message : req.body;
    console.log('Received input:', JSON.stringify(getInput));

    // Ensure getInput is not empty
    if (!getInput) {
        return res.status(400).json({ error: 'Request field is missing' });
    }

    // Clean the input
    if (typeof getInput !== 'string') {
        getInput = cleanInput(getInput);
    }

    let userInput;
    try {
        if (typeof getInput === 'string') {
            userInput = getInput.trim().toLowerCase();
        } else if (getInput && getInput.message) {
            userInput = getInput.message.trim().toLowerCase();
        } else {
            throw new Error('Invalid input structure');
        }
    } catch (error) {
        console.error('Error processing input:', error.message);
        return res.status(400).json({ error: error.message });
    }

    // Ensure userInput is not empty
    if (!userInput) {
        return res.status(400).json({ error: 'Empty input' });
    }

    let botResponse;
    if (THINK_ANSWERS[userInput]) {
        botResponse = THINK_ANSWERS[userInput];
    } else {
        const splitMessage = userInput.split(/\s+|[,;?!.-]\s*/);
        console.log('Split message:', splitMessage);
        botResponse = checkAllMessages(splitMessage);
    }

    // Save the user message and bot response to the database
    try {
        const newBotUser = new Bot_User({ message: userInput, reply: botResponse });
        console.log('Bot response:', botResponse);
        await newBotUser.save();
    } catch (error) {
        console.error('Error saving user message:', error);
    }

    res.json({ response: botResponse });
});

module.exports = router;
