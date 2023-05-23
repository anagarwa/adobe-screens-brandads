import React, { useEffect } from 'react';

const MyComponent = () => {
    useEffect(() => {
        // Run your JavaScript function here
        myFunction();
    }, []);



    return <div>This is my component</div>;
};

const myFunction = async () => {
    // Your JavaScript logic goes here
    console.log('My function is running1234!');
    try {
        // Perform async operations
        const result = await fetch('https://example.com/api/data');
        const data = await result.json();
        console.log('Async function completed:', data);
    } catch (error) {
        console.error('Error in async function:', error);
    }
};

export default MyComponent;