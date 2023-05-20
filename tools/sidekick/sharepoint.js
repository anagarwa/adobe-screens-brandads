import { PublicClientApplication } from './msal-browser-2.14.2.js';

// const graphURL = 'https://graph.microsoft.com/v1.0';
// const baseURI = 'https://graph.microsoft.com/v1.0/sites/adobe.sharepoint.com,7be4993e-8502-4600-834d-2eac96f9558e,1f8af71f-8465-4c46-8185-b0a6ce9b3c85/drive/root:/theblog';

const graphURL = 'https://graph.microsoft.com/v1.0';
const baseURI = `https://graph.microsoft.com/v1.0/drives/b!9IXcorzxfUm_iSmlbQUd2rvx8XA-4zBAvR2Geq4Y2sZTr_1zgLOtRKRA81cvIhG1/root:/brandads`;
const driveId = 'b!9IXcorzxfUm_iSmlbQUd2rvx8XA-4zBAvR2Geq4Y2sZTr_1zgLOtRKRA81cvIhG1';

let connectAttempts = 0;
let accessToken;

const sp = {
    clientApp: {
        auth: {
            clientId: '2b4aa217-ddcd-4fe0-b09c-5a472764f552',
            authority: 'https://login.microsoftonline.com/fa7b1b5a-7b34-4387-94ae-d2c178decee1',
        },
    },
    login: {
        redirectUri: '/content/screens/ads/ad1',
    },
    api: {
        url: graphURL,
        file: {
            get: {
                baseURI,
            },
            download: {
                baseURI,
            },
            upload: {
                baseURI,
                method: 'PUT',
            },
            createUploadSession: {
                baseURI,
                method: 'POST',
                payload: {
                    '@microsoft.graph.conflictBehavior': 'replace',
                },
            },
        },
        directory: {
            create: {
                baseURI,
                method: 'PATCH',
                payload: {
                    folder: {},
                },
            },
        },
        driveUrl:baseURI,
        batch: {
            uri: `${graphURL}/$batch`,
        },
    },
};

export async function connect(callback) {
    const publicClientApplication = new PublicClientApplication(sp.clientApp);

    await publicClientApplication.loginPopup(sp.login);

    const account = publicClientApplication.getAllAccounts()[0];

    const accessTokenRequest = {
        scopes: ['files.readwrite', 'sites.readwrite.all'],
        account,
    };

    try {
        const res = await publicClientApplication.acquireTokenSilent(accessTokenRequest);
        accessToken = res.accessToken;
        if (callback) await callback();
    } catch (error) {
        // Acquire token silent failure, and send an interactive request
        if (error.name === 'InteractionRequiredAuthError') {
            try {
                const res = await publicClientApplication.acquireTokenPopup(accessTokenRequest);
                // Acquire token interactive success
                accessToken = res.accessToken;
                if (callback) await callback();
            } catch (err) {
                connectAttempts += 1;
                if (connectAttempts === 1) {
                    // Retry to connect once
                    connect(callback);
                }
                // Give up
                throw new Error(`Cannot connect to Sharepoint: ${err.message}`);
            }
        }
    }
}

function validateConnnection() {
    if (!accessToken) {
        throw new Error('You need to sign-in first');
    }
}

function getRequestOption() {
    validateConnnection();

    const bearer = `Bearer ${accessToken}`;
    const headers = new Headers();
    headers.append('Authorization', bearer);

    return {
        method: 'GET',
        headers,
    };
}

// async function createFolder(folder) {
//     validateConnnection();
//
//     const options = getRequestOption();
//     options.headers.append('Accept', 'application/json');
//     options.headers.append('Content-Type', 'application/json');
//     options.method = sp.api.directory.create.method;
//     options.body = JSON.stringify(sp.api.directory.create.payload);
//
//     const res = await fetch(`${sp.api.directory.create.baseURI}${folder}`, options);
//     if (res.ok) {
//         return res.json();
//     }
//     throw new Error(`Could not create folder: ${folder}`);
// }


async function createFolder(folderPath) {
    validateConnnection();

    const options = getRequestOption();
    options.headers.append('Accept', 'application/json');
    options.headers.append('Content-Type', 'application/json');
    options.method = sp.api.directory.create.method;
    options.body = JSON.stringify(sp.api.directory.create.payload);

    const res = await fetch(`${sp.api.directory.create.baseURI}/${folderPath}`, options);

    if (res.ok) {
        return res.json();
    } else if (res.status === 409) {
        // Folder already exists, return the existing folder
        return getFolder(folderPath);
    }

    throw new Error(`Could not create or get folder: ${folderPath}`);
}

async function getFolder(folderPath) {
    validateConnnection();

    const options = getRequestOption();
    options.method = 'GET';

    const res = await fetch(`${sp.api.driveUrl}/${folderPath}`, options);
    if (res.ok) {
        return res.json();
    }

    throw new Error(`Could not get folder: ${folderPath}`);
}


// async function createExcelFile(filePath) {
//     validateConnection();
//
//     const options = getRequestOption();
//     options.method = 'GET';
//
//     const res = await fetch(`${sp.api.url}/drives/${driveId}/root:${filePath}`, options);
//
//     if (res.ok) {
//         // File already exists, return the existing file
//         return res.json();
//     } else if (res.status === 404) {
//         // File not found, create a new Excel file
//         return createNewExcelFile(filePath);
//     }
//
//     throw new Error(`Could not check or create Excel file: ${filePath}`);
// }
//
async function createNewExcelFile() {
    validateConnnection();
    const folderPath = '/ad3';
    const filename = 'match.xlsx';

    const options = getRequestOption();
    options.headers.append('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    options.method = 'PUT';
    options.body = JSON.stringify({
        '@microsoft.graph.conflictBehavior': 'replace',
        name: filename,
        file: {},
    });

    const res = await fetch(`${baseURI}${folderPath}/${filename}:/content`, options);

    if (res.ok) {
        return res.json();
    }

    throw new Error(`Could not create Excel file: ${filePath}`);
}

async function createExcelFile(folderPath, fileName) {
    validateConnnection();

    const options = getRequestOption();
    options.headers.append('Content-Type', 'application/json');
    options.method = 'PUT';
    options.body = JSON.stringify({});

    const res = await fetch(`${baseURI}${folderPath}/${fileName}:/workbook`, options);
    if (res.ok) {
        return true;
    } else {
        throw new Error(`Could not create Excel file ${fileName} in folder ${folderPath}`);
    }
}


export async function checkAndUpdateExcelFile() {
    validateConnnection();

    const folderPath = '/ad3';
    const filename = 'match.xlsx';

    const sheetName = 'defaultsheet';
    const searchText = 'push notification';
    const entry = {
        id: 'abc',
        notify: 'event',
        sent: 'yes'
    };

    await getFileId(folderPath,filename)
     //await createFolder(folderPath);
     //await createNewExcelFile();
    //
    // // Check if the sheet exists
    //const sheetExists = await doesSheetExist(folderPath, filename, sheetName);
    // if (!sheetExists) {
    //     // Create the sheet if it does not exist
    //     await createSheet(folderPath, filename, sheetName);
    // }
    //
    // // Find the row index containing the search text
    // const rowIndex = await findRowIndex(`${folderPath}/${filename}`, sheetName, searchText);
    //
    // // Add the new entry below the found row or at the end
    // await addNotificationEntry(`${folderPath}/${filename}`, sheetName, searchText, entry);
}

async function addEntriesToExcel(fileId, sheetName, entries) {
    const endpoint = `/drives/${driveId}/items/${fileId}/workbook/worksheets('${sheetName}')/range(address='A1:C1')`;

    const requestBody = {
        values: [[entries.id, entries.notify, entries.sent]],
    };

    const options = {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    };

    const response = await fetch(`${graphURL}${endpoint}`, options);

    if (response.ok) {
        return response.json();
    }

    throw new Error(`Could not add entries to Excel file. Status: ${response.status}`);
}

async function getFileId(folderPath, fileName) {
    const endpoint = `${sp.api.directory.create.baseURI}${folderPath}/${fileName}`;

    validateConnnection();

    const options = getRequestOption();
    options.headers.append('Content-Type', 'application/json');
    options.method = 'GET';
    
    const response = await fetch(`${endpoint}`, options);

    if (response.ok) {
        const file = await response.json();
        return file.id;
    }

    throw new Error(`Could not retrieve file ID. Status: ${response.status}`);
}

export async function getDriveId() {
    const publicClientApplication = new PublicClientApplication(sp.clientApp);

    await publicClientApplication.loginPopup();

    const account = publicClientApplication.getAllAccounts()[0];

    const accessTokenRequest = {
        scopes: ['files.readwrite', 'sites.readwrite.all'],
        account,
    };

    try {
        const res = await publicClientApplication.acquireTokenSilent(accessTokenRequest);
        const accessToken = res.accessToken;

        const options = {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        };

        const driveResponse = await fetch('https://graph.microsoft.com/v1.0/me/drive', options);
        const driveData = await driveResponse.json();
        const driveId = driveData.id;

        return driveId;
    } catch (error) {
        throw new Error('Failed to retrieve drive ID');
    }
}



export async function saveFile(file, dest) {
    validateConnnection();

    const folder = dest.substring(0, dest.lastIndexOf('/'));
    const filename = dest.split('/').pop().split('/').pop();

    await createFolder(folder);

    // start upload session

    const payload = {
        ...sp.api.file.createUploadSession.payload,
        description: 'Preview file',
        fileSize: file.size,
        name: filename,
    };

    let options = getRequestOption();
    options.headers.append('Accept', 'application/json');
    options.headers.append('Content-Type', 'application/json');
    options.method = sp.api.file.createUploadSession.method;
    options.body = JSON.stringify(payload);

    let res = await fetch(`${sp.api.file.createUploadSession.baseURI}${dest}:/createUploadSession`, options);
    if (res.ok) {
        const json = await res.json();

        options = getRequestOption();
        // TODO API is limited to 60Mb, for more, we need to batch the upload.
        options.headers.append('Content-Length', file.size);
        options.headers.append('Content-Range', `bytes 0-${file.size - 1}/${file.size}`);
        options.method = sp.api.file.upload.method;
        options.body = file;

        res = await fetch(`${json.uploadUrl}`, options);
        if (res.ok) {
            return res.json();
        }
    }
    throw new Error(`Could not upload file ${dest}`);
}

async function findRowIndex(sheetName, searchText) {
    validateConnnection();

    const options = getRequestOption();
    options.method = 'GET';

    const res = await fetch(`${sp.api.file.get.baseURI}${sheetName}:/workbook/tables/Table1/rows`, options);
    if (res.ok) {
        const json = await res.json();
        const rows = json.value;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cellValues = row.values.map(cell => cell.text);

            if (cellValues.includes(searchText)) {
                return i + 1; // Add 1 to convert from zero-based index to one-based index (Excel row index starts from 1)
            }
        }
    }
    return -1; // Return -1 if the search text is not found in any row
}

async function addNotificationEntry(sheetName, searchText, entry) {
    validateConnnection();

    const rowIndex = await findRowIndex(sheetName, searchText);
    const insertRowIndex = rowIndex !== -1 ? rowIndex + 1 : -1; // Insert row below the found row or at the end

    const options = getRequestOption();
    options.headers.append('Accept', 'application/json');
    options.headers.append('Content-Type', 'application/json');
    options.method = 'POST';
    options.body = JSON.stringify({
        index: insertRowIndex,
        values: [
            [entry.id, entry.notify, entry.sent]
        ]
    });

    const res = await fetch(`${sp.api.file.get.baseURI}${sheetName}:/workbook/tables/Table1/rows/add`, options);
    if (res.ok) {
        return res.json();
    }
    throw new Error(`Could not add notification entry to the sheet: ${sheetName}`);
}

export async function test() {
    validateConnnection();

    const options = getRequestOption();
    options.headers.append('Accept', 'application/json');
    options.headers.append('Content-Type', 'application/json');
    options.method = 'GET';
    // options.body = JSON.stringify(payload);

    await fetch(`${sp.api.file.createUploadSession.baseURI}`, options);
    throw new Error('Could not upload file');
}