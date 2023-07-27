import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from "axios";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 90vh;
  justify-content: flex-end;
  padding: 10px;
  overflow: hidden;
  border: 2px solid #ccc;
  border-radius: 8px;
`;

const ImageAndTextContainer = styled.div`
  background-color: #f9f9f9;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-left: 10px;
  overflow-y: auto;
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 8px;
`;

const VerticalWrapper = styled.div`
  width: 80%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 8px;
  flex: 1;
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
  width: 100%;
  max-width: 100%;
  object-fit: cover;
  margin: 10px;
`;

const ImageContainer = styled.div`
  width: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const ImageText = styled.p`
  margin-top: 5px;
`;

const UrlContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const UrlText = styled.a`
  color: #007bff;
  text-decoration: none;
  cursor: pointer;
  margin-top: 5px;
`;

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messageAreaRef = useRef(null);
  const [dynamicComponents, setDynamicComponents] = useState([]);
  const lastDynamicComponentRef = useRef(null);

  const image1 = 'https://static.nike.com/a/images/t_PDP_864_v1/f_auto,b_rgb:f5f5f5/cf132716-ebc3-4bf0-897e-7e9c03490b1e/air-jordan-xxxvii-low-pf-basketball-shoes-7z7ltC.png';
  const text1 = 'Lace UpEnchane Game';
  const image2 = 'https://static.nike.com/a/images/t_PDP_864_v1/f_auto,b_rgb:f5f5f5/ba98ed6b-72f7-4ba8-81a1-bb336fad67f5/air-jordan-xxxvii-low-pf-basketball-shoes-7z7ltC.png'
  const text2 = 'Land Soft. Play hard';
  const image3 = 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/e4d6b204-6b05-4ec8-b3c1-649e3258f111/air-jordan-xxxvii-low-pf-basketball-shoes-7z7ltC.png';
  const text3 = 'Dominate the court';
  let jsonObject = {};

  jsonObject.urls = {type:'url', data: ['https://www.nike.com/in/t/air-zoom-pegasus-40-older-road-running-shoes-S0gQ5F/DX2498-600', 'https://www.nike.com/in/t/air-jordan-xxxvii-low-pf-basketball-shoes-7z7ltC', 'https://www.nike.com/in/t/lebron-witness-7-older-basketball-shoes-bV8fWg/DQ8650-100']};
  jsonObject.imageUrls = {type:'imageAndText', data: [{image:image1, text:text1}, {image:image2, text:text2}, {image:image3, text:text3}]};
  jsonObject.campaignImages = {type:'campaign_image', data: [{image:image1, text:''}, {image:image2, text:''}, {image:image3, text:''}]};
  jsonObject.finalImages = {type:'final_image', data: [{image:image1, text:''}, {image:image2, text:''}, {image:image3, text:''}]};
  jsonObject.modifiedImages = {type:'modified_image', data: []};
  jsonObject.changedImages = {type:'changed_image', data: []};

  const getPromptResponse = (prompt) => {

    if(prompt.includes('football')) {
      return jsonObject.urls;
    }
    if(prompt.includes('images')) {
      return jsonObject.imageUrls;
    }
    if(prompt.includes('campaign')) {
      return jsonObject.campaignImages;
    }
    if(prompt.includes('change')) {
      return jsonObject.changedImages;
    }
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleSendMessage = async () => {
    const inputStr = inputText.trim();
    if (inputStr !== '') {
      const newMessage = {text: inputText, sender: 'You'};
      setMessages([...messages, newMessage]);
      setInputText('');

      setTimeout(() => {
        promptHandle(inputStr);
        const botReply = {
          text: "I'm a bot. I received your message.",
          sender: 'Bot',
        };
        setMessages((prevMessages) => [...prevMessages, botReply]);
      }, 500);
    }
  };

  const promptHandle = async (inputStr) => {
    const response = getPromptResponse(inputStr);
    const type = response && response.type;
    if (type) {
      switch (type) {
        case 'url' :
          const urls = jsonObject.urls.data;
          addUrlComponent(urls);
          break;
        case 'imageAndText' :
          const imageAndTexts = jsonObject.imageUrls.data;
          addImageAndTextComponent(imageAndTexts);
          break;
        case 'campaign_image' :
          //const campaignImages = jsonObject.campaignImages.data;
          const dataArr = await addTextOnImages();
          jsonObject.modifiedImages.data = dataArr;
          addImageAndTextComponent(dataArr);
          break;
        case 'change_image' :
          const finalImages = jsonObject.finalImages.data;
          addImageAndTextComponent(finalImages);
          break;
        default:
      }
    }
  }

  const addImageAndTextComponent = (imageAndTexts) => {
    setDynamicComponents((prev) => [
      ...prev,
      <ImageAndTextContainer key={prev.length} ref={lastDynamicComponentRef}>
        {imageAndTexts.map(({ image, text }, index) => (
            <ImageContainer key={index} image={image}>
              <Image src={image} alt="Image" />
              <ImageText>{text}</ImageText>
            </ImageContainer>
        ))}
      </ImageAndTextContainer>,
    ]);
  };

  const addUrlComponent = (urls) => {
    setDynamicComponents((prev) => [
      ...prev,
      <UrlContainer key={prev.length} ref={lastDynamicComponentRef}>
        {urls.map((url, index) => (
            <UrlText key={index} href={url} target="_blank">
              {url}
            </UrlText>
        ))}
      </UrlContainer>,
    ]);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const addTextOnImages = async () => {
    const arr = [];
    for (const info of jsonObject.imageUrls.data) {
      const imageData = await handleImageDownload(info.image);
      const modifiedImage = await handleUpload(imageData, info.text);
      arr.push({image:modifiedImage, text:''});
    }
    return arr;
  };

  const handleImageDownload = async (imageUrl) => {
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";

    try {
      const response = await fetch(proxyUrl + imageUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }

      const blob = await response.blob();

      const dataUrl = await convertBlobToDataURL(blob);
      console.log('handleImageDownload dataUrl:', dataUrl);
      return dataUrl;
    } catch (error) {
      console.error("handleImageDownload Error fetching image:", error);
    }
  };

  const convertBlobToDataURL = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleUpload = async (imageData, text) => {
    try {
      if (!imageData) {
        console.error("handleUpload No image selected.");
        return;
      }
      const headers = {
        'Accept': '*/*',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'Pragma': 'no-cache',
      };

      const arr = [imageData, text];
      const payload = {
        fn_index: 0,
        data: arr,
        event_data: null,
        session_hash: '8zg3bb7uz3h',
      };

      const response = await axios.post('http://mdsr-panther:7910/run/predict', payload, { headers });

      const data = response.data.data;
      console.log('handleUpload response data', data[0]);
      return data[0];
    } catch (error) {
      console.error("handleUpload Error uploading image:", error);
    }
  };

  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
    if (lastDynamicComponentRef.current) {
      lastDynamicComponentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, dynamicComponents]);

  return (
      <div style={{ overflowX: 'hidden' }}>
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
          <VerticalWrapper>
            {dynamicComponents}
          </VerticalWrapper>
        </div>
      </div>
  );
}

export default App;