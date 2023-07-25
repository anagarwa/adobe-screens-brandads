import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 20%;
  height: 90vh;
  justify-content: flex-end;
  padding: 10px;
  overflow: hidden;
  border: 2px solid #ccc;
  border-radius: 8px;
`;

const ImageAndTextContainer = styled.div`
  width: 80%;
  height: 90vh;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-left: 20px;
  border: 2px solid #ccc;
  border-radius: 8px;
`;

const MessageArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
  border: 2px solid #ccc;
  border-radius: 8px;
`;

const MessageBubble = styled.div`
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 8px;
  margin: 5px;
  max-width: 100%;
  align-self: ${({ sender }) => (sender === 'You' ? 'flex-start' : 'flex-end')};
  ${({ sender }) =>
    sender === 'You'
      ? `
          background-color: #dcf8c6;
          align-self: flex-start;
        `
      : `
          background-color: #f0f0f0;
          align-self: flex-end;
        `}
  border: 2px solid #ccc;
  border-radius: 8px;
`;

const SenderLabel = styled.span`
  font-weight: bold;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
`;

const MessageInput = styled.input`
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  flex: 1;
  margin: 5px;
`;

const SendButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  margin-left: 10px;
  cursor: pointer;
`;

const Heading = styled.h1`
  font-size: 40px;
  font-weight: bold;
  margin: 20px;
  text-align: center;
`;

const ImageButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  margin-top: auto;
  cursor: pointer;
  margin-bottom: 10px;
`;

const Image = styled.img`
  object-fit: cover;
  margin: 10px;
`;

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messageAreaRef = useRef(null);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleSendMessage = () => {
    if (inputText.trim() !== '') {
      const newMessage = { text: inputText, sender: 'You' };
      setMessages([...messages, newMessage]);
      setInputText('');

      setTimeout(() => {
        const botReply = {
          text: "I'm a bot. I received your message.",
          sender: 'Bot',
        };
        setMessages((prevMessages) => [...prevMessages, botReply]);
      }, 800);
    }
  };

  // Handle the "Enter" key press to send messages
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div>
      <Heading>Smart Brands Campaign Ads</Heading>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
      <Container>
        <MessageArea ref={messageAreaRef}>
          {messages.map((message, index) => (
            <MessageBubble key={index} sender={message.sender}>
              <SenderLabel>{message.sender}: </SenderLabel>
              {message.text}
            </MessageBubble>
          ))}
        </MessageArea>
        <InputContainer>
          <MessageInput
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
          />
          <SendButton onClick={handleSendMessage}>Send</SendButton>
        </InputContainer>
      </Container>
      <ImageAndTextContainer>
        <Image src="https://www.gstatic.com/webp/gallery/1.jpg" alt="Image 1" />
        <p>Some text about the above image ...</p>
        <ImageButton>Open Express</ImageButton>
      </ImageAndTextContainer>
    </div>
    </div>
  );
}

export default App;