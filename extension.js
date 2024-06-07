const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const  { extractText}   =require('./Commands Function/extract_text.js') ;
const { createArabFile} =require('./Commands Function/create_arab_file.js') ;
const {  replaceText} =require('./Commands Function/replace_txet.js') ;

let arbFilePath = '';
function activate(context) {
    console.log('Your extension "add-localization" is now active!');
    vscode.window.showInformationMessage('Your extension "add-localization" is now active!');
    let initialize_command = vscode.commands.registerCommand('extension.initialize', async () => {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Gemmini API key',
            ignoreFocusOut: true,
            password: true // Hides the input for security
        });

        if (apiKey) {
            await context.globalState.update('gemminiApiKey', apiKey);
            vscode.window.showInformationMessage('Gemmini API key has been saved.');
        } else {
            vscode.window.showWarningMessage('API key input was canceled or empty.');
        }
    });


    let disposable = vscode.commands.registerCommand('add-localization.extractTexts', extractText);

    let createArbCommand = vscode.commands.registerCommand('add-localization.createArb', createArabFile );


    let replaceTextCommand = vscode.commands.registerCommand('add-localization.replaceText', replaceText);
    
    context.subscriptions.push(initialize_command);
    context.subscriptions.push(disposable);
    context.subscriptions.push(createArbCommand);
    context.subscriptions.push(replaceTextCommand);
}



function deactivate() { }

module.exports = {
    activate,
    deactivate
};
