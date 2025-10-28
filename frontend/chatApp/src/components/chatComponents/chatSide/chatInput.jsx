// components/chatSide/ChatInput.jsx
import React, { useState, useRef } from "react";

const ChatInput = ({
  text,
  setText,
  onSend,
  onTyping,
  stopTyping,
  currentConversation,
  currentUserId,
}) => {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendClick();
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const base64Images = await Promise.all(files.map((file) => toBase64(file)));
    setImages((prev) => [...prev, ...base64Images]);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  const handleSendClick = () => {
    if (text.trim() || images.length > 0) {
      onSend(text, images);
      const receiver = currentConversation?.participants?.find(
        (p) => p._id !== currentUserId
      );
      if (receiver) stopTyping({ to: receiver._id, from: currentUserId });
      setText("");
      setImages([]);
    }
  };

  const handleImageIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };
  const handleBlur = () => {
    const receiver = currentConversation?.participants?.find(
      (p) => p._id !== currentUserId
    );
    if (receiver) stopTyping({ to: receiver._id, from: currentUserId });
  };

  return (
    <div className="chat-input-wrapper-container">
      <div className="chat-input-wrapper">
        <div className="input-container">
          <input
            id="chat-input"
            type="text"
            placeholder="Type a message..."
            value={text}
            onBlur={handleBlur}
            onChange={(e) => {
              setText(e.target.value);
              onTyping();
            }}
            onKeyDown={handleKeyDown}
          />

          {/* Hidden file input */}
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="file-input-hidden"
          />

          {/* Upload icon */}
          <button
            type="button"
            onClick={handleImageIconClick}
            className="icon-button"
            title="Attach image"
          >
            📎
          </button>
        </div>

        <button onClick={handleSendClick} className="send-button">
          Send
        </button>
      </div>

      {/* Image preview section */}
      {images.length > 0 && (
        <div className="image-preview">
          {images.map((img, index) => (
            <div key={index} className="preview-item">
              <img src={img} alt={`upload-${index}`} />
              <button
                className="remove-image"
                onClick={() => handleRemoveImage(index)}
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatInput;
