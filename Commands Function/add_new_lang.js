const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");


async function addNewLanguage(context, targetLang) {
    const apiKey = context.globalState.get('gemminiApiKey');

    if (!apiKey) {
        vscode.window.showErrorMessage('No API key found in global state. Please set the API key first.');
        return;
    }

    const arbFilePath = path.join(vscode.workspace.rootPath, 'lib', 'add_localization', 'intl_en.arb');
    if (!fs.existsSync(arbFilePath)) {
        vscode.window.showErrorMessage('English .arb file not found. Please create the English .arb file first.');
        return;
    }

    const arbData = JSON.parse(fs.readFileSync(arbFilePath, 'utf8'));
    const translatedData = {};

    try {
        for (const [key, value] of Object.entries(arbData)) {
            const translatedText = await translateText(value, targetLang, apiKey);
            translatedData[key] = translatedText;
        }

        const newArbFilePath = path.join(vscode.workspace.rootPath, 'lib', 'add_localization', `intl_${targetLang.code}.arb`);
        fs.writeFileSync(newArbFilePath, JSON.stringify(translatedData, null, 2), 'utf8');

        vscode.window.showInformationMessage(`.arb file created successfully at ${newArbFilePath}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Error translating texts: ${error.message}`);
    }
}

async function translateText(text, targetLang, apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = text + "=> translate only value from English to " + targetLang;

    const result = await model.generateContent(prompt);
    return result.response.text();

}



exports.addNewLanguage = addNewLanguage;
