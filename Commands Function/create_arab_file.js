const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

exports.createArabFile = createArabFile;

function createArabFile() {
    const jsonFilePath = path.join(vscode.workspace.rootPath, 'extracted_texts.json');
    if (fs.existsSync(jsonFilePath)) {
        const extractedTexts = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        const arbData = {};

        extractedTexts.forEach(fileData => {
            for (const [fileName, texts] of Object.entries(fileData)) {
                if (typeof texts === 'object' && !Array.isArray(texts)) {
                    for (var [originalKey, originalText] of Object.entries(texts)) {
                        let modifiedKey = originalText.trim();
                        // Remove variables like ${var}
                        modifiedKey = modifiedKey.replace(/\$\{[^}]+\}/g, '');
                        // Remove leading non-word characters and ensure key starts with a letter
                        modifiedKey = modifiedKey.replace(/^[^a-zA-Z]+/, '');
                        // Replace non-word characters with underscores
                        modifiedKey = modifiedKey.replace(/\W+/g, '_');
                        // Ensure the key does not end with a non-alphanumeric character
                        modifiedKey = modifiedKey.replace(/_+$/, '');
                        // Edit the  all ( + , / , * , - ) characters with removing space befor and after char if founded   with (plus,slash,asterisk,minus)
                         originalText = originalText.replace(/\+/g, '_plus_').replace(/\//g, '_slash_').replace(/\*/g, '_asterisk_').replace(/-/g, '_minus_').replace(/\./g, '_dot_');
                         originalText= removeSpacesBetweenBraces(originalText);
                       
                        // If the key becomes empty or does not start with a letter, skip this entry
                        if (!/^[a-zA-Z]/.test(modifiedKey) || modifiedKey === '') {
                            console.warn(`Skipping invalid key for text: ${originalText}`);
                            continue;
                        }

                        arbData[modifiedKey] = originalText;
                    }
                } else {
                    console.error(`Expected texts to be an object, but got: ${typeof texts}`);
                }
            }
        });

        const arbFilePath = path.join(vscode.workspace.rootPath, 'intl_en.arb');
        fs.writeFileSync(arbFilePath, JSON.stringify(arbData, null, 2), 'utf8');

        vscode.window.showInformationMessage(`.arb file created successfully at ${arbFilePath}`);
    } else {
        vscode.window.showErrorMessage('No extracted_texts.json file found. Please run the extractTexts command first.');
    }
}


  function removeSpacesBetweenBraces(text) {
    // Regular expression to find content within braces and remove spaces
    return text.replace(/\{([^}]+)\}/g, function(match, p1) {
        // Remove all spaces within the braces content
        let content = p1.replace(/\s+/g, '');
        // If content starts with a digit, prepend 'DigitClassObject_'
        if (/^\d/.test(content)) {
            content = 'DigitClassObject_' + content;
        }
        return '{' + content + '}';
    });
}