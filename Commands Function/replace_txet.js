const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

async function getClassName() {
    const className = await vscode.window.showInputBox({
        placeHolder: 'Enter the localization class name',
    });
    return className;
}

function replaceTextWithLocalization(className, jsonData) {
    vscode.workspace.findFiles('**/*.dart').then(files => {
        console.log(`data : ${jsonData }`);
        files.forEach(file => {
            vscode.workspace.openTextDocument(file).then(document => {
                const fileName = path.basename(file.fsPath);
               
                const fileData = jsonData[fileName];
                console.log(`Processing file basename : ${fileName}`);

                if (!fileData) {
                    console.log(`No localization data for file: ${fileName}`);
                    return;
                }

                let text = document.getText();
                console.log(`Processing file: ${file.fsPath}`);
                let updated = false;

                Object.entries(fileData).forEach(([key, value]) => {
                    const regex = new RegExp(`(["'])${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1`, 'g');

                    if (regex.test(text)) {
                        var underscore_index = key.indexOf("_");
                        let new_key = key.substring(underscore_index + 1);
                        text = text.replace(regex, `${className}.of(context).${new_key}`);
                        updated = true;
                    }
                });

                if (updated) {
                    fs.writeFileSync(file.fsPath, text, 'utf8');
                    console.log(`Updated file: ${file.fsPath}`);
                }
            });
        });

        vscode.window.showInformationMessage(`Text replacement complete!`);
    });
}
async function replaceText() {
    const className = await getClassName();
    if (!className) {
        vscode.window.showErrorMessage('Localization class name is required!');
        return;
    }

    const jsonDirPath = path.join(vscode.workspace.rootPath, 'lib', 'add_localization');
    const jsonFilePath = path.join(jsonDirPath, 'extracted_texts.json');

    if (!fs.existsSync(jsonFilePath)) {
        vscode.window.showErrorMessage('extracted_texts.json not found!');
        return;
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'))[0];
    replaceTextWithLocalization(className, jsonData);
}


exports.replaceText = replaceText;
