import { PublicClientApplication } from './msal-browser-2.14.2.js';

const graphURL = 'https://graph.microsoft.com/v1.0';
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
        redirectUri: 'https://main--fcbayern--hlxsites.hlx.page/tools/sidekick/spauth.html',
    },
};

export async function connect(callback) {
    console.log("in connect method1");
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


export async function PublishAndNotify() {
    console.log("in publish and notify");
    validateConnnection();

    const entries = [{
        id: 'uniqueid1',
        notify: 'changes',
        sent: 'yes'
    },
    {
        id: 'uniqueid2',
        notify: 'goal',
        sent: 'yes'
    },
    ];

    const  entryUpdated = await addEntriesToExcel(entries);
    const quickPublish = await quickpublish();
    if ("updated" === entryUpdated && quickPublish === "published") {
        return "updated";
    } else {
        return  "not updated";
    }

}

async function quickpublish() {
    console.log("in quick publish1");
    validateConnnection();

    const options = getRequestOption();
    options.method='POST';
    const response = await fetch(`https://admin.hlx.page/preview/hlxsites/fcbayern/main/de/spiele/profis/bundesliga/2022-2023/sv-werder-bremen-fc-bayern-muenchen-06-05-2023/liveticker`, options);
    if (response.ok) {
        console.log("published");
        return "published";
    }
}



async function addEntriesToExcel(entries) {
    try {
        const siteUrl = "https://fcbayernmuenchen.sharepoint.com/sites/AdobeFranklinPOC";
        const folderName = "/website/de/spiele/profis/bundesliga/2022-2023/sv-werder-bremen-fc-bayern-muenchen-06-05-2023";
        const fileName = "match.xlsx";
        const sheetName = "pushnotifications";

        const siteResponse = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteUrl}`);
        const siteData = await siteResponse.json();
        const siteId = siteData.id;

        const folderResponse = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/drive/root:/${folderName}`);
        const folderData = await folderResponse.json();
        const folderId = folderData.id;

        const fileResponse = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/drive/items/${folderId}:/${fileName}`);
        const fileData = await fileResponse.json();
        const fileId = fileData.id;

        const endpoint = `/drives/${siteId}/items/${fileId}/workbook/worksheets('${sheetName}')/range(address='A1:C2')`;

        const requestBody = {
            values: entries.map((entry) => [entry.id, entry.notify, entry.sent]),
        };

        validateConnnection();

        const options = getRequestOption();
        options.method = 'PATCH';
        options.headers.append('Content-Type', 'application/json');
        options.body = JSON.stringify(requestBody);

        const response = await fetch(`${graphURL}${endpoint}`, options);

        if (response.ok) {
            console.log("entries updated");
            return "updated";
        }

        throw new Error(`Could not add entries to Excel file. Status: ${response.status}`);
    } catch (error) {
        console.log('Error:', error);
        throw error;
    }
}
