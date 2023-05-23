import { PublicClientApplication } from './msal-browser-2.14.2.js';

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
        redirectUri: '/tools/sidekick/spauth.html',
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
    console.log("I am in connect");
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


export async function checkAndUpdateExcelFile() {
    console.log("in check and update");
    validateConnnection();

    const folderPath = '/ad3';
    const filename = 'match.xlsx';
    const docName = `sampledoc.docx`;

    const sheetName = 'defaultsheet';
    //const searchText = 'push notification';
    const entry = {
        id: 'abc2',
        notify: 'event2',
        sent: 'yes2'
    };
    const entries = [{
        id: 'abc3',
        notify: 'event3',
        sent: 'yes3'
    },
        {
            id: 'abc4',
            notify: 'event4',
            sent: 'yes4'
        },
    ];

    const fileId = await getFileId(folderPath,filename);
    const  entryUpdated = await addEntriesToExcel(fileId, sheetName, entries);
    if ("updated" === entryUpdated) {
        return "updated"
    } else {
        return  "not updated";
    }

}

async function addEntriesToExcel(fileId, sheetName, entries) {
    console.log("in add entries");

    const endpoint = `/drives/${driveId}/items/${fileId}/workbook/worksheets('${sheetName}')/range(address='A6:C7')`;

    // const requestBody = {
    //     values: [[entries.id, entries.notify, entries.sent]],
    // };

    const requestBody = {
        values: entries.map((entry) => [entry.id, entry.notify, entry.sent]),
    };

    validateConnnection();

    const options = getRequestOption();
    options.method='PATCH';
    options.headers.append('Content-Type', 'application/json');
    options.body = JSON.stringify(requestBody);


    const response = await fetch(`${graphURL}${endpoint}`, options);

    if (response.ok) {
        console.log("entries updated");
        return "updated";
    }

    throw new Error(`Could not add entries to Excel file. Status: ${response.status}`);
}

async function findText(fileId, sheetName, entries) {
    const endpoint = `/drives/${driveId}/items/${fileId}/workbook/worksheets('${sheetName}')/range(address='A1:C2')`;

    // const requestBody = {
    //     values: [[entries.id, entries.notify, entries.sent]],
    // };

    validateConnnection();

    const options = getRequestOption();
    options.method='GET';
    options.headers.append('Content-Type', 'application/json');
    //options.body = JSON.stringify(requestBody);


    const response = await fetch(`${graphURL}${endpoint}`, options);

    if (response.ok) {
        const searchResults = await response.json();

        // Find text in the 2D array
        const searchText = 'abc2';
        let found = false;
        let rowIndex, columnIndex;

        for (let row = 0; row < searchResults.values.length; row++) {
            //for (let col = 0; col < searchResults.values[row].length; col++) {
                if (searchResults.values[row][0] === searchText) {
                    rowIndex = row + 1; // Adding 1 to row and column indices since Excel starts from 1
                    columnIndex = 0 + 1;
                    found = true;
                    break;
                }
            //}
            if (found) {
                break;
            }
        }

        if (found) {
            console.log(`Text '${searchText}' found at Row: ${rowIndex}, Column: ${columnIndex}`);
        } else {
            console.log(`Text '${searchText}' not found in the array.`);
        }
        return;
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

async function getSiteId() {
    const endpoint = `${sp.api.directory.create.baseURI}`;

    validateConnnection();

    const options = getRequestOption();
    options.headers.append('Content-Type', 'application/json');
    options.method = 'GET';

    const response = await fetch(`${endpoint}`, options);

    if (response.ok) {
        const data  = await response.json();
        return data.parentReference.siteId;
    }

    throw new Error(`Could not retrieve file ID. Status: ${response.status}`);
}


async function getSheetId(workbookId, sheetName) {
//    const endpoint = `${sp.api.directory.create.baseURI}${folderPath}/${fileName}`;
    const endpoint =`/drives/${driveId}/items/${workbookId}/workbook/worksheets`;

    validateConnnection();

    const options = getRequestOption();
    options.headers.append('Content-Type', 'application/json');
    options.method = 'GET';

    const response = await fetch(`${graphURL}${endpoint}`, options);

    if (response.ok) {
        const worksheets = await response.json();
        const worksheet = worksheets.value.find(w => w.name === sheetName);
        if (!worksheet) {
            console.error(`Worksheet "${sheetName}" not found.`);
            return;
        }
        return worksheet.id;
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