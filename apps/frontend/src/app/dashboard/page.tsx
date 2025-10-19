'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import toast from 'react-hot-toast';
import { Users, MessageCircle, UserPlus, Bell } from 'lucide-react';

interface Friend {
  id: string;
  username: string;
  isOnline: boolean;
}

interface FriendRequest {
  id: string;
  sender: { username: string };
}

export default function Dashboard() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [showRequests, setShowRequests] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  const router = useRouter();
  const { messages: wsMessages, sendMessage, clearMessages } = useWebSocket();

  useEffect(() => {
    const user = auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }
    
    loadFriends();
    loadRequests();
  }, []);

  useEffect(() => {
    wsMessages.forEach(msg => {
      if (msg.type === 'FRIEND_REQUEST') {
        toast.success('New friend request received!');
        loadRequests();
      } else if (msg.type === 'FRIEND_RESPONSE') {
        toast.success('Friend request accepted!');
        loadFriends();
      } else if (msg.type === 'NEW_MESSAGE') {
        if (selectedFriend?.id === msg.data.senderId) {
          setMessages(prev => [...prev, msg.data]);
        } else {
          toast.success(`New message from ${msg.data.sender.username}`);
        }
      } else if (msg.type === 'MESSAGE_REACTION') {
        setMessages(prev => prev.map(m => 
          m.id === msg.data.messageId 
            ? { ...m, reactions: [...(m.reactions || []), { emoji: msg.data.emoji, user: { id: msg.data.userId } }] }
            : m
        ));
      } else if (msg.type === 'TYPING') {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (msg.isTyping) {
            newSet.add(msg.senderId);
          } else {
            newSet.delete(msg.senderId);
          }
          return newSet;
        });
        setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(msg.senderId);
            return newSet;
          });
        }, 3000);
      }
    });
    clearMessages();
  }, [wsMessages, selectedFriend]);

  const loadFriends = async () => {
    try {
      const data = await api.getFriends();
      setFriends(data);
    } catch (error) {
      toast.error('Failed to load friends');
    }
  };

  const loadRequests = async () => {
    try {
      const data = await api.getFriendRequests();
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load requests');
    }
  };

  const loadMessages = async (friendId: string) => {
    try {
      const data = await api.getMessages(friendId);
      setMessages(data);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const sendFriendRequest = async () => {
    try {
      await api.sendFriendRequest(newFriendUsername);
      toast.success('Friend request sent!');
      setNewFriendUsername('');
      setShowAddFriend(false);
    } catch (error) {
      toast.error('Failed to send request');
    }
  };

  const respondToRequest = async (requestId: string, action: 'ACCEPTED' | 'REJECTED') => {
    try {
      await api.respondToFriendRequest(requestId, action);
      toast.success(`Request ${action.toLowerCase()}!`);
      loadRequests();
      loadFriends();
    } catch (error) {
      toast.error('Failed to respond to request');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedFriend || !newMessage.trim()) return;
    
    try {
      const message = await api.sendMessage(selectedFriend.id, newMessage);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (selectedFriend) {
      sendMessage({
        type: 'TYPING',
        receiverId: selectedFriend.id,
        isTyping
      });
    }
  };

  const reactToMessage = async (messageId: string, emoji: string) => {
    try {
      await api.reactToMessage(messageId, emoji);
    } catch (error) {
      toast.error('Failed to add reaction');
    }
  };

  const logout = () => {
    auth.removeToken();
    auth.removeUser();
    router.push('/');
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-bold">ChatApp</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRequests(!showRequests)}
              className="p-2 hover:bg-gray-100 rounded relative"
            >
              <Bell size={20} />
              {requests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {requests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowAddFriend(!showAddFriend)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <UserPlus size={20} />
            </button>
            <button onClick={logout} className="text-red-500 hover:bg-red-50 p-2 rounded">
              Logout
            </button>
          </div>
        </div>

        {showRequests && (
          <div className="p-4 border-b bg-yellow-50">
            <h3 className="font-semibold mb-2">Friend Requests</h3>
            {requests.map(req => (
              <div key={req.id} className="flex justify-between items-center mb-2">
                <span>{req.sender.username}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => respondToRequest(req.id, 'ACCEPTED')}
                    className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondToRequest(req.id, 'REJECTED')}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddFriend && (
          <div className="p-4 border-b bg-blue-50">
            <h3 className="font-semibold mb-2">Add Friend</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Username"
                value={newFriendUsername}
                onChange={(e) => setNewFriendUsername(e.target.value)}
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={sendFriendRequest}
                className="bg-blue-500 text-white px-3 py-2 rounded"
              >
                Send
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {friends.map(friend => (
            <div
              key={friend.id}
              onClick={() => {
                setSelectedFriend(friend);
                loadMessages(friend.id);
              }}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedFriend?.id === friend.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="font-medium">{friend.username}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedFriend ? (
          <>
            <div className="p-4 border-b bg-white">
              <h2 className="font-semibold">{selectedFriend.username}</h2>
              {typingUsers.has(selectedFriend.id) && (
                <p className="text-sm text-gray-500">Typing...</p>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === auth.getUser()?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs p-3 rounded-lg ${
                    msg.senderId === auth.getUser()?.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200'
                  }`}>
                    <p>{msg.content}</p>
                    {msg.reactions?.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {msg.reactions.map((reaction: any, idx: number) => (
                          <span key={idx} className="text-sm">
                            {reaction.emoji}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1 mt-1">
                      {['👍', '❤️', '😂', '😮'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => reactToMessage(msg.id, emoji)}
                          className="text-xs hover:bg-black hover:bg-opacity-10 rounded px-1"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onFocus={() => handleTyping(true)}
                  onBlur={() => handleTyping(false)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle size={64} className="mx-auto mb-4" />
              <p>Select a friend to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}