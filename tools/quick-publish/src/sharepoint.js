import { PublicClientApplication } from './msal-browser-2.14.2.js';

const graphURL = 'https://graph.microsoft.com/v1.0';
const baseURI = 'https://graph.microsoft.com/v1.0/drives/b!9IXcorzxfUm_iSmlbQUd2rvx8XA-4zBAvR2Geq4Y2sZTr_1zgLOtRKRA81cvIhG1/root:/fcbayern';
const driveIDGlobal = 'b!9IXcorzxfUm_iSmlbQUd2rvx8XA-4zBAvR2Geq4Y2sZTr_1zgLOtRKRA81cvIhG1';
let connectAttempts = 0;
let accessToken;

const orgName = 'hlxsites';
const repoName = 'fcbayern';
const ref = 'main';
const path = 'de/spiele/profis/bundesliga/2022-2023/sv-werder-bremen-fc-bayern-muenchen-06-05-2023/liveticker';
const mockNotificationService = 'https://288650-257ambermackerel.adobeio-static.net/api/v1/web/brandads/getads';

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
};

export async function connect(callback) {
    const publicClientApplication = new PublicClientApplication(sp.clientApp);

    const accounts = publicClientApplication.getAllAccounts();

    if (accounts.length === 0) {
        // User is not logged in, show the login popup
        await publicClientApplication.loginPopup(sp.login);
    }

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

export async function PublishAndNotify() {
    // const quickPublish = await quickpublish();
    // if (quickPublish === 'published') {
    //     return 'updated';
    // }
    await getFolderID();
}


async function getFolderID() {
    try {
        validateConnnection();
        const options = getRequestOption();
        const parentFolderPath = 'brandads/content/screens/dummyads';
        const searchUrl = `https://graph.microsoft.com/v1.0/drives/${driveIDGlobal}/root/search(q='brandads/content')`;
        const driveResponse = await fetch(searchUrl, options);
        const response = await driveResponse.json();
        const folderid = response.data.value[0].id;
        console.log("folder id is " + folderid);
        return driveId;
    } catch (error) {
        throw new Error('Failed to retrieve folder ID');
    }
}
async function quickpublish() {
    console.log('in quick publish8');
    console.log(`Quick Publish Started ${new Date().toLocaleString()}`);

    let response;
    const options = {
        method: 'POST',
    };

    response = await fetch(`https://admin.hlx.page/preview/${orgName}/${repoName}/${ref}/${path}`, options);

    if (response.ok) {
        console.log(`Document Previewed at ${new Date().toLocaleString()}`);
    } else {
        throw new Error(`Could not previewed. Status: ${response.status}`);
    }

    response = await fetch(`https://admin.hlx.page/live/${orgName}/${repoName}/${ref}/${path}`, options);

    if (response.ok) {
        console.log(`Document Published at ${new Date().toLocaleString()}`);
    } else {
        throw new Error(`Could not published. Status: ${response.status}`);
    }

    response = await fetch(`https://admin.hlx.page/cache/${orgName}/${repoName}/${ref}/${path}`, options);

    if (response.ok) {
        console.log(`Purge cache ${new Date().toLocaleString()}`);
    } else {
        throw new Error(`Could not purge cache. Status: ${response.status}`);
    }

    let fileId = localStorage.getItem('fileId');
    if (!fileId) {
        fileId = await getFileId();
        localStorage.setItem('fileId', fileId);
    }

    const driveId = driveIDGlobal;

    const sheetName = 'notifications';
    const lastRow = 0;
    let entryRowExcel = -1;
    const excelData = await getExcelData(driveId, fileId, sheetName);

    const livetickerurl = `https://${ref}--${repoName}--${orgName}.hlx.page/${path}`;

    const liveTickerResponse = await fetch(livetickerurl);
    const liveTickerHtml = await liveTickerResponse.text();
    console.log(liveTickerHtml);
    const parser = new DOMParser();
    const doc = parser.parseFromString(liveTickerHtml, 'text/html');

    const jsonArray = [];
    const eventElements = doc.querySelectorAll('.goal, .whistle');
    for (let j = 0; j < eventElements.length; j++) {
        const eventElement = eventElements[j];
        const jsonObject = {};
        jsonObject.eventType = eventElement.classList;
        const divElements = eventElement.querySelectorAll(':scope > div');
        for (let i = 0; i < divElements.length; i++) {
            const keyValueDiv = divElements[i].querySelectorAll('div');
            const key = keyValueDiv[0].textContent.trim().toLowerCase().replace(' ', '_');
            const value = keyValueDiv[1].textContent.trim();
            jsonObject[key] = value;
        }
        if (jsonObject.push === 'yes' || jsonObject.push === 'true') {
            // todo code to confirm if it has been updated in excel if not send notification and update excel

            for (let row = 0; row < excelData.values.length; row++) {
                if (excelData.values[row][0].toString().trim() === jsonObject.id.toString().trim()) {
                    // event already exists in Excel
                    break;
                }
                if (!excelData.values[row][0]) {
                    entryRowExcel = row + 2;

                    // sending notification data to notification service
                    const notificationResponse = await fetch(mockNotificationService, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(jsonObject),
                    });

                    if (notificationResponse.ok) {
                        console.log(`Notification of ${jsonObject.id}  sent at ${new Date().toLocaleString()}`);
                        jsonArray.push(
                            {
                                id: jsonObject.id,
                                notificationData: JSON.stringify(jsonObject),
                            },
                        );
                    }
                    break;
                }
            }
        }
    }

    if (jsonArray.length > 0) {
        const addEntriesResponse = await addEntriesToExcel(driveId, fileId, sheetName, entryRowExcel, jsonArray);
    }
    return 'published';
}

async function getExcelData(driveId, fileId, sheetName) {
    const endpoint = `/drives/${driveId}/items/${fileId}/workbook/worksheets('${sheetName}')/range(address='A2:A100')`;

    validateConnnection();

    const options = getRequestOption();
    options.method = 'GET';
    options.headers.append('Content-Type', 'application/json');

    const response = await fetch(`${graphURL}${endpoint}`, options);

    if (response.ok) {
        const searchResults = await response.json();
        return searchResults;
    }

    throw new Error(`Could not add entries to Excel file. Status: ${response.status}`);
}

async function getDriveId() {
    try {
        validateConnnection();
        const options = getRequestOption();

        const driveResponse = await fetch('https://graph.microsoft.com/v1.0/me/drive', options);
        const driveData = await driveResponse.json();
        const driveId = driveData.id;

        return driveId;
    } catch (error) {
        throw new Error('Failed to retrieve drive ID');
    }
}

async function getFileId() {
    const endpoint = `${baseURI}/matchdata/pushnotifications.xlsx`;

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

async function addEntriesToExcel(driveId, fileId, sheetName, entryRow, entries) {
    const lastRow = entryRow + (entries.length - 1);
    const endpoint = `/drives/${driveId}/items/${fileId}/workbook/worksheets('${sheetName}')/range(address='A${entryRow}:B${lastRow}')`;

    const requestBody = {
        values: entries.map((entry) => [entry.id, entry.notificationData]),
    };

    validateConnnection();

    const options = getRequestOption();
    options.method = 'PATCH';
    options.headers.append('Content-Type', 'application/json');
    options.body = JSON.stringify(requestBody);

    const response = await fetch(`${graphURL}${endpoint}`, options);

    if (response.ok) {
        return response.json();
    }

    throw new Error(`Could not add entries to Excel file. Status: ${response.status}`);
}
