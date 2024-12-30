import React, { useState } from 'react';
    import ReactMarkdown from 'react-markdown';
    import './App.css';

    const contacts = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' }
    ];

    const generateRandomName = () => {
      const adjectives = ['Happy', 'Sunny', 'Clever', 'Brave', 'Gentle'];
      const nouns = ['Cat', 'Dog', 'Lion', 'Tiger', 'Bear'];
      const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
      return `${randomAdjective} ${randomNoun}`;
    };

    function App() {
      const [messages, setMessages] = useState([]);
      const [inputValue, setInputValue] = useState('');
      const [selectedContact, setSelectedContact] = useState(null);
      const [currentUser, setCurrentUser] = useState(null);

      const handleRegister = () => {
        const newUser = { id: Date.now(), name: generateRandomName() };
        setCurrentUser(newUser);
      };

      const handleSend = async () => {
        if (inputValue.trim() && selectedContact && currentUser) {
          const newMessage = { text: inputValue, sender: 'user', contactId: selectedContact.id, userId: currentUser.id };
          setMessages([...messages, newMessage]);
          setInputValue('');

          try {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
              },
              body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: inputValue }]
              })
            });

            const data = await response.json();
            const botReply = data.choices[0].message.content;
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: botReply, sender: 'bot', contactId: selectedContact.id, userId: currentUser.id }
            ]);
          } catch (error) {
            console.error('Error fetching DeepSeek API:', error);
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: '抱歉，暂时无法回复。', sender: 'bot', contactId: selectedContact.id, userId: currentUser.id }
            ]);
          }
        }
      };

      const filteredMessages = messages.filter(msg => msg.contactId === selectedContact?.id && msg.userId === currentUser?.id);

      return (
        <div className="app-container">
          {!currentUser ? (
            <div className="registration">
              <h2>欢迎使用聊天应用</h2>
              <button onClick={handleRegister}>一键注册</button>
            </div>
          ) : (
            <>
              <div className="contact-list">
                <h3>通讯录</h3>
                <ul>
                  {contacts.map(contact => (
                    <li
                      key={contact.id}
                      className={selectedContact?.id === contact.id ? 'selected' : ''}
                      onClick={() => setSelectedContact(contact)}
                    >
                      {contact.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="chat-container">
                <div className="messages">
                  {filteredMessages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                      {msg.sender === 'bot' ? (
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      ) : (
                        msg.text
                      )}
                    </div>
                  ))}
                </div>
                <div className="input-area">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    disabled={!selectedContact}
                    placeholder={selectedContact ? `发送消息给 ${selectedContact.name}` : '请选择一个联系人'}
                  />
                  <button onClick={handleSend} disabled={!selectedContact}>发送</button>
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    export default App;
