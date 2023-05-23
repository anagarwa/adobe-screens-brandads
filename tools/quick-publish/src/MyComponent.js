import React, { useEffect, useState } from 'react';

const MyComponent = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await myAsyncFunction();
                setData(result);
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
            throw new Error('Error fetching data');
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