const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const  { extractText}   =require('./Commands Function/extract_text.js') ;
const { createArabFile} =require('./Commands Function/create_arab_file.js') ;

let arbFilePath = '';
function activate(context) {
    console.log('Your extension "add-localization" is now active!');
    vscode.window.showInformationMessage('Your extension "add-localization" is now active!');

    let disposable = vscode.commands.registerCommand('add-localization.extractTexts', extractText);

    let createArbCommand = vscode.commands.registerCommand('add-localization.createArb', createArabFile );

    let replaceTextCommand = vscode.commands.registerCommand('add-localization.replaceText', function () {
        vscode.window.showInputBox({ prompt: 'Enter the class name:' }).then(className => {
            if (!className) {
                vscode.window.showErrorMessage('Class name is required.');
                return;
            }
            // vscode.window.showInputBox({ prompt: 'Enter the .arb file path:' }).then(arbFilePath => {
            if (!arbFilePath) {
                vscode.window.showErrorMessage('.arb file path not found. ');
                return;
            }
            // })


            // Read the content of the .arb file
            const arbContent = fs.readFileSync(arbFilePath, 'utf8');
            const arbData = JSON.parse(arbContent);

            // Traverse through all Dart files in the project
            vscode.workspace.findFiles('**/*.dart').then(files => {
                files.forEach(file => {
                    vscode.workspace.openTextDocument(file).then(document => {
                        let text = document.getText();
                        console.log(`Processing file: ${file.fsPath}`);

                        // Check and replace each value in the text
                        Object.keys(arbData).forEach(key => {
                            const value = arbData[key];
                            const regexes = [
                                new RegExp(`Text\\(["']${value}["']\\)`, 'g'),

                                new RegExp(`hintText\\s*:\\s*["']([^"']+)["']`, 'g'),
                                new RegExp(`labelText\\s*:\\s*["']([^"']+)["']`, 'g'),
                                new RegExp(`helperText\\s*:\\s*["']([^"']+)["']`, 'g'),
                                // new RegExp(`TextFormField\\([\\s\\S]*?decoration\\s*:\\s*const\\s*InputDecoration\\([\\s\\S]*?hintText\\s*:\\s*["']([^"']+)["']`, 'g'),
                                // new RegExp(`TextFormField\\([\\s\\S]*?decoration\\s*:\\s*const\\s*InputDecoration\\([\\s\\S]*?labelText\\s*:\\s*["']([^"']+)["']`, 'g'),
                                // new RegExp(`TextFormField\\([\\s\\S]*?decoration\\s*:\\s*const\\s*InputDecoration\\([\\s\\S]*?helperText\\s*:\\s*["']([^"']+)["']`, 'g'),
                                new RegExp(`RichText\\([\\s\\S]*?text\\s*:\\s*TextSpan\\([\\s\\S]*?text\\s*:\\s*["']${value}["']`, 'g'),
                                new RegExp(`TextSpan\\([\\s\\S]*?text\\s*:\\s*["']${value}["']`, 'g'),
                                new RegExp(`TextButton\\([\\s\\S]*?child\\s*:\\s*Text\\(["']${value}["']\\)`, 'g'),
                                new RegExp(`ListTile\\([\\s\\S]*?title\\s*:\\s*Text\\(["']${value}["']\\)`, 'g'),
                                new RegExp(`Tooltip\\([\\s\\S]*?message\\s*:\\s*["']${value}["']`, 'g'),
                                new RegExp(`SnackBar\\([\\s\\S]*?content\\s*:\\s*Text\\(["']${value}["']\\)`, 'g'),
                                new RegExp(`(\\w+)\\s*:\\s*["']${value}["']`, 'g'),
                            ];
                            if (regexes[0].test(text)) {
                                text = text.replace(regexes[0], `Text(${className}.of(context).${key})`);
                            }
                            else if (regexes[1].test(text)) {
                                text = text.replace(regexes[1], `hintText: ${className}.of(context).${key}`);
                            }
                            else if (regexes[2].test(text)) {
                                text = text.replace(regexes[2], `labelText: ${className}.of(context).${key}`);
                            }
                            else if (regexes[3].test(text)) {
                                text = text.replace(regexes[3], `helperText: ${className}.of(context).${key}`);
                            }
                        }
                            // regexes.forEach(regex => {
                            //     if (regex.test(text)) {
                            //         console.log(`Replacing "${value}" with "${className}.of(context).${key}" in file: ${file.fsPath}`);
                            //         text = text.replace(regex, `${className}.of(context).${key}`);
                            //     }
                            // });
                        );

                        // Save the modified file if changes were made
                        fs.writeFileSync(file.fsPath, text, 'utf8');
                    });
                });

                vscode.window.showInformationMessage('Text replacement complete!');
            });
        });
    });

    context.subscriptions.push(createArbCommand);
    context.subscriptions.push(replaceTextCommand);
}



function deactivate() { }

module.exports = {
    activate,
    deactivate
};
