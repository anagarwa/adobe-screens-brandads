import React, { useEffect, useState } from 'react';
import {connect, checkAndUpdateExcelFile, quickpublish} from './sharepoint.js';

const QuickPublish = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await connect(async () => {
                    try {
                        const response  = await checkAndUpdateExcelFile();
                        console.log(response);
                        setData(response);
                    } catch (e) {
                        console.error(e);
                    }
                });
                await connect(async () => {
                    try {
                        const response  = await quickpublish();
                        console.log(response);
                        setData(response);
                    } catch (e) {
                        console.error(e);
                    }
                });
            } catch (error) {
                console.error('Error in async function:', error);
            }
        };

        fetchData();
    }, []);

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

export default QuickPublish;