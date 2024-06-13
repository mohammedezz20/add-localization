
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

                    const jsonDirPath = path.join(vscode.workspace.rootPath, 'lib', 'add_localization');
                    const jsonFilePath = path.join(jsonDirPath, 'extracted_texts.json');

                    // Ensure the directory exists or create it
                    if (!fs.existsSync(jsonDirPath)) {
                        fs.mkdirSync(jsonDirPath, { recursive: true });
                    }

                    fs.writeFileSync(jsonFilePath, JSON.stringify(allTexts, null, 2), 'utf8');
                }
            });
        });

        vscode.window.showInformationMessage(`Text extraction complete! Extracted texts are saved to lib/add_localization/extracted_texts.json`);
    });
}

function containsStatefulOrStatelessWidget(text) {
    const statefulWidgetRegex = /class\s+\w+\s+extends\s+StatefulWidget/g;
    const statelessWidgetRegex = /class\s+\w+\s+extends\s+StatelessWidget/g;

    return statefulWidgetRegex.test(text) || statelessWidgetRegex.test(text);
}


//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// function extractTextsFromText(text) {
//     const regexes = {
//         Text: /Text\(["']([^"']+)["']/g,
//         TextFieldHint: /TextField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?hintText\s*:\s*["']([^"']+)["']/g,
//         TextFieldLabel: /TextField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?labelText\s*:\s*["']([^"']+)["']/g,
//         TextFieldHelper: /TextField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?helperText\s*:\s*["']([^"']+)["']/g,
//         TextFormFieldHint: /TextFormField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?hintText\s*:\s*["']([^"']+)["']/g,
//         TextFormFieldLabel: /TextFormField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?labelText\s*:\s*["']([^"']+)["']/g,
//         TextFormFieldHelper: /TextFormField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?helperText\s*:\s*["']([^"']+)["']/g,
//         RichText: /RichText\([\s\S]*?text\s*:\s*TextSpan\([\s\S]*?text\s*:\s*["']([^"']+)["']/g,
//         TextSpan: /TextSpan\([\s\S]*?text\s*:\s*["']([^"']+)["']/g,
//         TextButton: /TextButton\([\s\S]*?child\s*:\s*Text\(["']([^"']+)["']/g,
//         ListTile: /ListTile\([\s\S]*?title\s*:\s*Text\(["']([^"']+)["']/g,
//         Tooltip: /Tooltip\([\s\S]*?message\s*:\s*["']([^"']+)["']/g,
//         SnackBar: /SnackBar\([\s\S]*?content\s*:\s*Text\(["']([^"']+)["']/g,
//         General: /(\w+)\s*:\s*["']([^"']+)["']/g,
//     };

//     const extractedTexts = {};
//     const capturedRanges = [];

//     // Extract texts from specific widget patterns first
//     for (const [key, regex] of Object.entries(regexes)) {
//         if (key === "General") continue;

//         let match;
//         while ((match = regex.exec(text)) !== null) {
//             const value = match[1];
//             const start = match.index;
//             const end = regex.lastIndex;

//             // Track the range of this match
//             capturedRanges.push([start, end]);

//             // Sanitize the value
//             const sanitizedValue = value.replace(/\$\{[^}]+\}/g, '').replace(/\$\w+/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
//             const uniqueKey = `${key}_${sanitizedValue}`;
//             extractedTexts[uniqueKey] = value;
//         }
//     }

//     // Now extract texts with the General pattern, excluding ranges already captured
//     const generalRegex = regexes.General;
//     let match;
//     while ((match = generalRegex.exec(text)) !== null) {
//         const attrName = match[1];
//         const value = match[2];
//         const start = match.index;
//         const end = generalRegex.lastIndex;

//         // Ensure the text is not captured by another regex
//         if (capturedRanges.every(([s, e]) => end <= s || start >= e)) {
//             const sanitizedValue = value.replace(/\$\{[^}]+\}/g, '').replace(/\$\w+/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
//             const uniqueKey = `${attrName}_${sanitizedValue}`;
//             extractedTexts[uniqueKey] = value;
//         }
//     }

//     return extractedTexts;
// }



function extractTextsFromText(text) {
    const regexes = {
        Text: /Text\(["']([^"']+)["']/g,
        TextFieldHint: /TextField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?hintText\s*:\s*["']([^"']+)["']/g,
        TextFieldLabel: /TextField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?labelText\s*:\s*["']([^"']+)["']/g,
        TextFieldHelper: /TextField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?helperText\s*:\s*["']([^"']+)["']/g,
        TextFormFieldHint: /TextFormField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?hintText\s*:\s*["']([^"']+)["']/g,
        TextFormFieldLabel: /TextFormField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?labelText\s*:\s*["']([^"']+)["']/g,
        TextFormFieldHelper: /TextFormField\([\s\S]*?decoration\s*:\s*InputDecoration\([\s\S]*?helperText\s*:\s*["']([^"']+)["']/g,
        RichText: /RichText\([\s\S]*?text\s*:\s*TextSpan\([\s\S]*?text\s*:\s*["']([^"']+)["']/g,
        TextSpan: /TextSpan\([\s\S]*?text\s*:\s*["']([^"']+)["']/g,
        TextButton: /TextButton\([\s\S]*?child\s*:\s*Text\(["']([^"']+)["']/g,
        ListTile: /ListTile\([\s\S]*?title\s*:\s*Text\(["']([^"']+)["']/g,
        Tooltip: /Tooltip\([\s\S]*?message\s*:\s*["']([^"']+)["']/g,
        SnackBar: /SnackBar\([\s\S]*?content\s*:\s*Text\(["']([^"']+)["']/g,
        General: /(\w+)\s*:\s*["']([^"']+)["']/g,
    };

    const extractedTexts = {};
    const capturedRanges = [];

    // Helper function to check if a value is a variable placeholder
    function isVariablePlaceholder(value) {
        return /^\$\w+$/.test(value) || /^\$\{[^}]+\}$/.test(value);
    }

    // Helper function to check if a value is a path or URL
    function isPathOrUrl(value) {
        return /[\/:\\]/.test(value);
    }

    // Helper function to sanitize and generate a unique key
    function generateUniqueKey(prefix, value) {
        const sanitizedValue = value.replace(/\$\{[^}]+\}/g, '').replace(/\$\w+/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
        return `${prefix}_${sanitizedValue}`;
    }

    // Extract texts from specific widget patterns first
    for (const [key, regex] of Object.entries(regexes)) {
        if (key === "General") continue;

        let specificMatch;
        while ((specificMatch = regex.exec(text)) !== null) {
            const value = specificMatch[1];
            if (isVariablePlaceholder(value) || isPathOrUrl(value)) continue;

            const start = specificMatch.index;
            const end = regex.lastIndex;

            // Track the range of this match
            capturedRanges.push([start, end]);

            const uniqueKey = generateUniqueKey(key, value);
            extractedTexts[uniqueKey] = value;
        }
    }

    // Now extract texts with the General pattern, excluding ranges already captured
    const generalRegex = regexes.General;
    let generalMatch;
    while ((generalMatch = generalRegex.exec(text)) !== null) {
        const attrName = generalMatch[1];
        const value = generalMatch[2];

        // Skip variable placeholders and paths/URLs
        if (isVariablePlaceholder(value) || isPathOrUrl(value)) continue;

        const start = generalMatch.index;
        const end = generalRegex.lastIndex;

        // Ensure the text is not captured by another regex
        if (capturedRanges.every(([s, e]) => end <= s || start >= e)) {
            const uniqueKey = generateUniqueKey(attrName, value);
            extractedTexts[uniqueKey] = value;
        }
    }

    return extractedTexts;
}
