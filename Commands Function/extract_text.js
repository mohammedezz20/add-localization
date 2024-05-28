const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
exports.extractText = extractText;

function extractText() {
    vscode.workspace.findFiles('**/*.dart').then(files => {
        const allTexts = [];

        files.forEach(file => {
            vscode.workspace.openTextDocument(file).then(document => {
                const text = document.getText();
                const fileName = path.basename(file.fsPath);

                if (containsStatefulOrStatelessWidget(text)) {
                    const extractedTexts = extractTextsFromText(text);
                    allTexts.push({ [fileName]: extractedTexts });

                    const jsonFilePath = path.join(vscode.workspace.rootPath, 'extracted_texts.json');
                    fs.writeFileSync(jsonFilePath, JSON.stringify(allTexts, null, 2), 'utf8');
                }
            });
        });

        vscode.window.showInformationMessage(`Text extraction complete! Extracted texts are saved to extracted_texts.json`);
    });
}

function containsStatefulOrStatelessWidget(text) {
    const statefulWidgetRegex = /class\s+\w+\s+extends\s+StatefulWidget/g;
    const statelessWidgetRegex = /class\s+\w+\s+extends\s+StatelessWidget/g;

    return statefulWidgetRegex.test(text) || statelessWidgetRegex.test(text);
}

function extractTextsFromText(text) {
    const regexes = {
        Text: /Text\(["']([^"']+)["']/g,
        Text_Field_Hint: /TextField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?hintText\s*:\s*["']([^"']+)["']/g,
        Text_Field_Label: /TextField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?labelText\s*:\s*["']([^"']+)["']/g,
        Text_Field_Helper: /TextField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?helperText\s*:\s*["']([^"']+)["']/g,
        Text_Form_Field_Hint: /TextFormField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?hintText\s*:\s*["']([^"']+)["']/g,
        Text_Form_Field_Label: /TextFormField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?labelText\s*:\s*["']([^"']+)["']/g,
        Text_Form_Field_Helper: /TextFormField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?helperText\s*:\s*["']([^"']+)["']/g,
        RichText: /RichText\([\s\S]*?text\s*:\s*TextSpan\([\s\S]*?text\s*:\s*["']([^"']+)["']/g,
        TextSpan: /TextSpan\([\s\S]*?text\s*:\s*["']([^"']+)["']/g,
        TextButton: /TextButton\([\s\S]*?child\s*:\s*Text\(["']([^"']+)["']/g,
        ListTile: /ListTile\([\s\S]*?title\s*:\s*Text\(["']([^"']+)["']/g,
        Tooltip: /Tooltip\([\s\S]*?message\s*:\s*["']([^"']+)["']/g,
        SnackBar: /SnackBar\([\s\S]*?content\s*:\s*Text\(["']([^"']+)["']/g,
        // General: /(\w+)\s*:\s*["']([^"']+)["']/g,
    };

    const extractedTexts = {};

    for (const [key, regex] of Object.entries(regexes)) {
        let match;
        while ((match = regex.exec(text)) !== null) {
            const value = match[1];
            // const sanitizedValue = value.replace(/[^a-zA-Z0-9]+/g, '_');
            const sanitizedValue = value.replace(/\$\{[^}]+\}/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
            const uniqueKey = `${key}_${sanitizedValue}`;
            extractedTexts[uniqueKey] = value;
        }
    }

    return extractedTexts;
}
