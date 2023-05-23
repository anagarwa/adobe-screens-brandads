import React, { useEffect } from 'react';

const MyComponent = () => {
    useEffect(() => {
        // Run your JavaScript function here
        myFunction();
    }, []);



    return <div>This is my component</div>;
};

const myFunction = () => {
    // Your JavaScript logic goes here
    console.log('My function is running1234!');
};

export default MyComponent;