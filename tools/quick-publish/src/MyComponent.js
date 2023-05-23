import React, { useEffect, useState } from 'react';
import {connect, checkAndUpdateExcelFile} from './sharepoint.js';

const MyComponent = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await connect(async () => {
                    try {
                        const folderResponse  = await checkAndUpdateExcelFile();
                        console.log(folderResponse);
                        setData(folderResponse);
                    } catch (e) {
                        console.error(e);
                    }
                });
//                const result = await myAsyncFunction();

            } catch (error) {
                console.error('Error in async function:', error);
            }
        };

        fetchData();
    }, []);

    const myAsyncFunction = async () => {
        // Your async logic goes here
        try {
            const response = await fetch('https://example.com/api/data');
            const data = await response.json();
            return data; // Return the value you want to use in useEffect
        } catch (error) {
            return "ABCD"
        }
    };

    return (
        <div>
            {data ? (
                <div>Data: {data}</div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};

export default MyComponent;