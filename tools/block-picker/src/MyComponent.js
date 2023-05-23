import React, { useEffect } from 'react';

const MyComponent = () => {
    useEffect(() => {
        // Run your JavaScript function here
        myFunction();
    }, []);

    const myFunction = () => {
        // Your JavaScript logic goes here
        console.log('My function is running!');
    };

    return <div>This is my component</div>;
};

export default MyComponent;